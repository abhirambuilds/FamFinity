import os
import json
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_percentage_error

from backend.models.train_predictor import load_monthly_expenses, generate_synthetic_series
from backend.models.utils import forecast_with_models


def main():
    root = os.path.dirname(os.path.dirname(__file__))
    data_path = os.path.normpath(os.path.join(root, '..', 'data', 'sample_user.csv'))
    monthly = load_monthly_expenses(data_path)
    synth = generate_synthetic_series(monthly, total_months=max(18, len(monthly) + 6))
    series = synth['spend'].to_numpy().astype(float)

    holdout = 3
    history, test = series[:-holdout], series[-holdout:]
    preds = forecast_with_models(history.tolist(), months=holdout)
    best = preds.get('lstm') or preds.get('baseline') or []
    mape = float(mean_absolute_percentage_error(test, best[:len(test)])) if best else float('nan')

    print(json.dumps({'mape': mape, 'holdout': holdout, 'history_len': len(history)}, indent=2))


if __name__ == '__main__':
    main()


