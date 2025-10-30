from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from routes.auth import get_current_user
from services.insights import get_total_expenses, get_total_income, get_expense_by_category, get_monthly_trend


router = APIRouter()


@router.get("/summary")
async def finance_summary(
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    current_user = Depends(get_current_user),
):
    """Return totals and category breakdown for the current user.

    month: optional 'YYYY-MM'. If omitted, aggregates over all time.
    """
    try:
        user_id = str(current_user.id)
        total_expenses = get_total_expenses(user_id, month)
        total_income = get_total_income(user_id, month)
        by_category = get_expense_by_category(user_id, month)
        return {
            "user_id": user_id,
            "month": month,
            "total_expenses": total_expenses,
            "total_income": total_income,
            "month_saving": total_income - total_expenses,
            "categories": by_category,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trend")
async def finance_trend(
    months: int = Query(3, ge=1, le=24, description="Number of recent months"),
    current_user = Depends(get_current_user),
):
    """Return monthly expense trend for last N months for the current user."""
    try:
        user_id = str(current_user.id)
        series = get_monthly_trend(user_id, months)
        return {
            "user_id": user_id,
            "months": months,
            "series": series,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
