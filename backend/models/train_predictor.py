import argparse
import json
import os
from typing import List, Tuple

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_percentage_error
import joblib

import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset


def load_monthly_expenses(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df['date'] = pd.to_datetime(df['date'])
    # Consider expenses as negative amounts; convert to positive spend
    df['expense'] = df['amount'].apply(lambda x: -x if x < 0 else 0.0)
    monthly = (
        df.groupby(pd.Grouper(key='date', freq='MS'))['expense']
        .sum()
        .reset_index()
        .sort_values('date')
    )
    # If months missing at boundaries, ensure continuous monthly index
    if not monthly.empty:
        full_idx = pd.date_range(start=monthly['date'].min(), end=monthly['date'].max(), freq='MS')
        monthly = monthly.set_index('date').reindex(full_idx).fillna(0.0).rename_axis('date').reset_index()
    monthly.rename(columns={'expense': 'spend'}, inplace=True)
    return monthly


def generate_synthetic_series(monthly: pd.DataFrame, total_months: int = 36, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    if monthly.empty:
        # start arbitrary series
        start_date = pd.Timestamp('2023-01-01')
        base = 1500.0
        dates = pd.date_range(start=start_date, periods=total_months, freq='MS')
        season = 1.0 + 0.15 * np.sin(2 * np.pi * (np.arange(total_months) % 12) / 12.0)
        noise = rng.normal(0, 100.0, size=total_months)
        spend = np.maximum(0.0, base * season + noise)
        return pd.DataFrame({'date': dates, 'spend': spend})

    # extend from last date
    base_series = monthly['spend'].to_numpy().astype(float)
    base_mean = float(np.maximum(300.0, np.mean(base_series)))
    base_std = float(np.maximum(50.0, np.std(base_series)))

    start_date = monthly['date'].min()
    start_idx = 0
    dates = pd.date_range(start=start_date, periods=total_months, freq='MS')
    t = np.arange(total_months)
    season = 1.0 + 0.12 * np.sin(2 * np.pi * (t % 12) / 12.0)
    trend = 1.0 + 0.004 * t
    # stitch in first len(base_series) points, then continue synthetic
    spend = np.zeros(total_months, dtype=float)
    n_base = min(len(base_series), total_months)
    spend[:n_base] = base_series[:n_base]
    if n_base < total_months:
        noise = rng.normal(0, base_std * 0.6, size=total_months - n_base)
        synth = base_mean * season[n_base:] * trend[n_base:] + noise
        # smooth join
        if n_base > 0:
            synth = 0.7 * synth + 0.3 * spend[n_base - 1]
        spend[n_base:] = np.maximum(0.0, synth)
    return pd.DataFrame({'date': dates, 'spend': spend})


def train_test_split_series(series: np.ndarray, holdout: int = 3) -> Tuple[np.ndarray, np.ndarray]:
    if len(series) <= holdout + 1:
        return series[:-1], series[-1:]
    return series[:-holdout], series[-holdout:]


class SequenceDataset(Dataset):
    def __init__(self, series: np.ndarray, window: int = 6):
        self.series = series.astype(np.float32)
        self.window = window
        self.X: List[np.ndarray] = []
        self.y: List[float] = []
        for i in range(len(series) - window):
            self.X.append(self.series[i:i+window])
            self.y.append(self.series[i+window])
        self.X = np.stack(self.X) if self.X else np.zeros((0, window), dtype=np.float32)
        self.y = np.array(self.y, dtype=np.float32)

    def __len__(self) -> int:
        return len(self.y)

    def __getitem__(self, idx: int):
        x = self.X[idx][..., None]  # (window, 1)
        y = self.y[idx]
        return x, y


class LSTMPredictor(nn.Module):
    def __init__(self, input_size: int = 1, hidden_size: int = 32, num_layers: int = 1):
        super().__init__()
        self.lstm = nn.LSTM(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        last = out[:, -1, :]
        y = self.fc(last)
        return y.squeeze(-1)


def train_lstm(series: np.ndarray, window: int = 6, epochs: int = 100, lr: float = 1e-3, device: str = 'cpu') -> Tuple[LSTMPredictor, float]:
    series = series.astype(np.float32)
    # normalize
    mean = float(series.mean()) if series.size else 0.0
    std = float(series.std()) if series.size else 1.0
    std = std if std > 1e-6 else 1.0
    norm_series = (series - mean) / std

    ds = SequenceDataset(norm_series, window)
    if len(ds) == 0:
        model = LSTMPredictor()
        return model, 0.0
    dl = DataLoader(ds, batch_size=16, shuffle=True)
    model = LSTMPredictor().to(device)
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    loss_fn = nn.MSELoss()

    model.train()
    for _ in range(epochs):
        for xb, yb in dl:
            xb = xb.to(device)
            yb = yb.to(device)
            pred = model(xb)
            loss = loss_fn(pred, yb)
            opt.zero_grad()
            loss.backward()
            opt.step()

    # quick one-step-ahead validation MAPE on tail windows within train
    model.eval()
    with torch.no_grad():
        preds = []
        trues = []
        for i in range(len(norm_series) - window):
            x = torch.tensor(norm_series[i:i+window][None, :, None], dtype=torch.float32).to(device)
            y_true = series[i+window]
            y_pred = model(x).cpu().numpy().ravel()[0]
            y_pred = y_pred * std + mean
            preds.append(max(0.0, float(y_pred)))
            trues.append(float(y_true))
        mape = mean_absolute_percentage_error(trues, preds) if trues else 0.0
    # attach normalization stats to model for later
    model.mean_ = mean
    model.std_ = std
    model.window_ = window
    return model, float(mape)


def rolling_forecast_lstm(model: LSTMPredictor, history: np.ndarray, steps: int) -> List[float]:
    mean = getattr(model, 'mean_', float(history.mean()))
    std = getattr(model, 'std_', float(history.std() if history.std() > 1e-6 else 1.0))
    window = getattr(model, 'window_', 6)
    hist = history.astype(np.float32)
    preds: List[float] = []
    series = hist.copy()
    for _ in range(steps):
        x = (series[-window:] - mean) / std
        x = torch.tensor(x[None, :, None], dtype=torch.float32)
        with torch.no_grad():
            y = model(x).cpu().numpy().ravel()[0]
        y = y * std + mean
        y = max(0.0, float(y))
        preds.append(y)
        series = np.append(series, y)
    return preds


def build_baseline_pipeline() -> Pipeline:
    # features: time index and month-of-year one-hot
    return Pipeline(steps=[
        ('pre', ColumnTransformer([
            ('passthrough', 'passthrough', ['t']),
            ('onehot', OneHotEncoder(handle_unknown='ignore'), ['month'])
        ])),
        ('reg', LinearRegression())
    ])


def main():
    parser = argparse.ArgumentParser(description='Train predictor models (baseline + LSTM).')
    parser.add_argument('--data', type=str, required=True, help='Path to CSV data (e.g., data/sample_user.csv)')
    parser.add_argument('--epochs', type=int, default=120)
    parser.add_argument('--outdir', type=str, default='backend/models')
    parser.add_argument('--total_months', type=int, default=36)
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)

    monthly = load_monthly_expenses(args.data)
    synth = generate_synthetic_series(monthly, total_months=args.total_months)

    # prepare features for baseline
    df = synth.copy()
    df['t'] = np.arange(len(df))
    df['month'] = df['date'].dt.month.astype(int)
    y = df['spend'].to_numpy().astype(float)
    X = df[['t', 'month']]

    # split
    holdout = 3
    X_train, X_test = X.iloc[:-holdout, :], X.iloc[-holdout:, :]
    y_train, y_test = y[:-holdout], y[-holdout:]

    # baseline
    baseline = build_baseline_pipeline()
    baseline.fit(X_train, y_train)
    y_pred_base = baseline.predict(X_test)
    mape_base = float(mean_absolute_percentage_error(y_test, np.maximum(0.0, y_pred_base)))

    # LSTM
    series = y
    train_series, test_series = train_test_split_series(series, holdout=holdout)
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    lstm_model, lstm_mape_est = train_lstm(train_series, window=6, epochs=args.epochs, lr=1e-3, device=device)

    # Evaluate LSTM on holdout by rolling forecast
    lstm_forecast = rolling_forecast_lstm(lstm_model, history=train_series, steps=len(test_series))
    mape_lstm = float(mean_absolute_percentage_error(test_series, lstm_forecast)) if len(test_series) else lstm_mape_est

    # Save models
    baseline_path = os.path.join(args.outdir, 'baseline.pkl')
    joblib.dump(baseline, baseline_path)

    predictor_path = os.path.join(args.outdir, 'predictor.pt')
    torch.save({
        'state_dict': lstm_model.state_dict(),
        'mean': lstm_model.mean_,
        'std': lstm_model.std_,
        'window': lstm_model.window_,
    }, predictor_path)

    # Save simple metadata
    meta = {
        'baseline_mape': mape_base,
        'lstm_mape': mape_lstm,
        'holdout_months': holdout,
        'total_points': int(len(series)),
    }
    with open(os.path.join(args.outdir, 'predictor_meta.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=2)

    print(json.dumps({'baseline_mape': mape_base, 'lstm_mape': mape_lstm, 'saved': {'baseline': baseline_path, 'lstm': predictor_path}}, indent=2))


if __name__ == '__main__':
    main()


