from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import json
import pandas as pd
import numpy as np

from routes.auth import get_current_user
from models.utils import load_lstm_predictor, load_baseline_model, forecast_with_models, load_recommender, recommend_actions
from models.train_predictor import load_monthly_expenses, generate_synthetic_series
from sklearn.metrics import mean_absolute_percentage_error


router = APIRouter()


class ForecastRequest(BaseModel):
    user_id: str
    months: int = Field(3, ge=1, le=24)


class ForecastResponse(BaseModel):
    user_id: str
    months: int
    forecast: Dict[str, List[float]]
    mape: float


@router.post("/predict/forecast", response_model=ForecastResponse)
async def predict_forecast(req: ForecastRequest, current_user = Depends(get_current_user)):
    try:
        # Load data from sample CSV (local mode) and synthesize; use holdout for MAPE
        data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'data', 'sample_user.csv')
        data_path = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'sample_user.csv'))
        monthly = load_monthly_expenses(data_path)
        synth = generate_synthetic_series(monthly, total_months=max(12, len(monthly) + 6))
        series = synth['spend'].to_numpy().astype(float)
        holdout = min(3, max(1, req.months))
        if len(series) <= holdout + 1:
            raise HTTPException(status_code=400, detail="Insufficient data for forecast")
        history, test = series[:-holdout], series[-holdout:]

        preds = forecast_with_models(history.tolist(), months=holdout)
        # choose best available series for MAPE
        best = preds['lstm'] if preds.get('lstm') else preds.get('baseline', [])
        if not best:
            raise HTTPException(status_code=500, detail="Models not available; train first")
        mape = float(mean_absolute_percentage_error(test, best[:len(test)]))

        # Now produce req.months forecast from full history
        forward = forecast_with_models(series.tolist(), months=req.months)
        return ForecastResponse(
            user_id=req.user_id,
            months=req.months,
            forecast={k: [float(x) for x in v] for k, v in forward.items() if isinstance(v, list)},
            mape=mape,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class RecommendRequest(BaseModel):
    user_id: str
    goal: Optional[str] = None


class RecommendResponse(BaseModel):
    user_id: str
    actions: List[str]


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest, current_user = Depends(get_current_user)):
    try:
        # derive simple category scores from latest month vs mean to date
        data_path = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'sample_user.csv'))
        df = pd.read_csv(data_path)
        df['date'] = pd.to_datetime(df['date'])
        df = df[df['amount'] < 0].copy()
        df['spend'] = -df['amount']
        df['month'] = df['date'].values.astype('datetime64[M]')
        if df.empty:
            raise HTTPException(status_code=400, detail="No expense data available")
        last_month = df['month'].max()
        hist = df[df['month'] < last_month]
        cur = df[df['month'] == last_month]
        means = hist.groupby('category')['spend'].mean() if not hist.empty else pd.Series(1.0, index=cur['category'].unique())
        sums = cur.groupby('category')['spend'].sum()
        cats = sorted(set(means.index).union(set(sums.index)))
        scores = {}
        for c in cats:
            m = float(means.get(c, 1.0))
            s = float(sums.get(c, 0.0))
            m = m if m > 1.0 else 1.0
            scores[c] = s / m

        # If recommender exists, use it to rank categories via simple feature vector (ratios)
        try:
            rec = load_recommender()
            categories = rec['categories']
            # map scores into aligned order
            model_scores = {c: scores.get(c, 0.0) for c in categories}
        except FileNotFoundError:
            model_scores = scores

        actions = recommend_actions(model_scores, goal=req.goal)
        return RecommendResponse(user_id=req.user_id, actions=actions)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


