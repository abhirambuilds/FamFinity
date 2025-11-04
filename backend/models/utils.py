import os
import json
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np

# Optional torch import - gracefully handle if not available
try:
    import torch
    from .train_predictor import LSTMPredictor, rolling_forecast_lstm
    TORCH_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    # If torch or train_predictor fails to import, set to None
    torch = None
    LSTMPredictor = None
    rolling_forecast_lstm = None
    TORCH_AVAILABLE = False


MODELS_DIR = os.path.dirname(__file__)


def get_models_dir() -> str:
    return MODELS_DIR


def load_baseline_model(path: str | None = None):
    path = path or os.path.join(get_models_dir(), 'baseline.pkl')
    if not os.path.exists(path):
        raise FileNotFoundError(f"Baseline model not found at {path}")
    return joblib.load(path)


def load_lstm_predictor(path: str | None = None) -> Any:
    if not TORCH_AVAILABLE:
        raise ImportError("PyTorch is not installed. Install torch to use LSTM predictor.")
    if LSTMPredictor is None:
        raise ImportError("LSTMPredictor is not available. Install torch to use LSTM predictor.")
    path = path or os.path.join(get_models_dir(), 'predictor.pt')
    if not os.path.exists(path):
        raise FileNotFoundError(f"Predictor not found at {path}")
    checkpoint = torch.load(path, map_location='cpu')
    model = LSTMPredictor()
    model.load_state_dict(checkpoint['state_dict'])
    model.mean_ = float(checkpoint.get('mean', 0.0))
    model.std_ = float(checkpoint.get('std', 1.0))
    model.window_ = int(checkpoint.get('window', 6))
    model.eval()
    return model


def forecast_with_models(history: List[float], months: int = 3) -> Dict[str, Any]:
    series = np.array(history, dtype=float)
    result: Dict[str, Any] = {'months': months}
    try:
        baseline = load_baseline_model()
        t0 = len(series)
        Xf = []
        for i in range(months):
            Xf.append({'t': t0 + i, 'month': ((t0 + i) % 12) + 1})
        import pandas as pd
        Xf = pd.DataFrame(Xf)[['t', 'month']]
        base_pred = baseline.predict(Xf)
        result['baseline'] = [max(0.0, float(v)) for v in base_pred]
    except FileNotFoundError:
        result['baseline'] = []

    try:
        lstm = load_lstm_predictor()
        if rolling_forecast_lstm is not None:
            lstm_pred = rolling_forecast_lstm(lstm, series, months)
            result['lstm'] = lstm_pred
        else:
            result['lstm'] = []
    except (FileNotFoundError, ImportError):
        result['lstm'] = []

    return result


def load_recommender(path: str | None = None):
    path = path or os.path.join(get_models_dir(), 'recommender.pkl')
    if not os.path.exists(path):
        raise FileNotFoundError(f"Recommender not found at {path}")
    return joblib.load(path)


def recommend_actions(category_scores: Dict[str, float], goal: str | None = None) -> List[str]:
    # simple rule-based mapping from categories to actions; sort by score desc
    actions_map = {
        'groceries': ["Plan weekly meals", "Switch to store brands", "Use a shopping list"],
        'dining': ["Cut dine-out to weekends", "Cook 2 extra meals/week", "Set dining cap"],
        'entertainment': ["Swap subscriptions for free options", "Stack discounts", "Pause trials"],
        'utilities': ["Enable thermostat schedule", "Replace bulbs with LEDs", "Audit phantom loads"],
        'transportation': ["Carpool twice/week", "Public transit card", "Plan errands efficiently"],
        'rent': ["Negotiate lease renewal", "Find roommate", "Explore relocation incentives"],
        'other': ["Set weekly allowance", "Use envelope budgeting", "Delay non-essentials 48h"],
    }

    items = sorted(category_scores.items(), key=lambda kv: kv[1], reverse=True)
    top = [k for k, _ in items[:3]]
    recs: List[str] = []
    for cat in top:
        options = actions_map.get(cat, actions_map['other'])
        recs.append(f"{cat}: {options[0]}")
    # include goal hint
    if goal:
        recs.append(f"Goal focus: {goal} — allocate windfalls to sinking fund")
    return recs


