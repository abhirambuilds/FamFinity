from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

from routes.auth import get_current_user
from supabase_client import get_server_client

router = APIRouter()

class BudgetCreate(BaseModel):
    month: str  # YYYY-MM
    income: float
    savings_goal: float
    bills_utilities: float = 0
    housing: float = 0
    food: float = 0
    transportation: float = 0
    healthcare: float = 0
    entertainment: float = 0
    shopping: float = 0
    education: float = 0
    other: float = 0

class BudgetResponse(BaseModel):
    id: str
    user_id: str
    month: str
    income: float
    savings_goal: float
    bills_utilities: float
    housing: float
    food: float
    transportation: float
    healthcare: float
    entertainment: float
    shopping: float
    education: float
    other: float
    total_expenses: float
    left_to_budget: float

@router.post("/create")
async def create_budget(
    budget: BudgetCreate,
    current_user = Depends(get_current_user)
):
    """Create or update monthly budget"""
    try:
        user_id = str(current_user.id)
        sb = get_server_client()
        
        total_expenses = (
            budget.bills_utilities + budget.housing + budget.food +
            budget.transportation + budget.healthcare + budget.entertainment +
            budget.shopping + budget.education + budget.other
        )
        
        # Check if budget exists for this month
        existing = sb.table('budgets').select('id').eq('user_id', user_id).eq('month', budget.month).execute()
        
        budget_data = {
            "user_id": user_id,
            "month": budget.month,
            "income": budget.income,
            "savings_goal": budget.savings_goal,
            "bills_utilities": budget.bills_utilities,
            "housing": budget.housing,
            "food": budget.food,
            "transportation": budget.transportation,
            "healthcare": budget.healthcare,
            "entertainment": budget.entertainment,
            "shopping": budget.shopping,
            "education": budget.education,
            "other": budget.other,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if existing.data:
            # Update existing budget
            resp = sb.table('budgets').update(budget_data).eq('id', existing.data[0]['id']).execute()
            budget_id = existing.data[0]['id']
        else:
            # Create new budget
            budget_data['id'] = str(uuid.uuid4())
            resp = sb.table('budgets').insert([budget_data]).execute()
            budget_id = budget_data['id']
        
        return {
            "success": True,
            "budget_id": budget_id,
            "message": "Budget saved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/current")
async def get_current_budget(
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    current_user = Depends(get_current_user)
):
    """Get budget for specific month or current month"""
    try:
        user_id = str(current_user.id)
        
        if not month:
            month = datetime.now().strftime('%Y-%m')
        
        sb = get_server_client()
        resp = sb.table('budgets').select('*').eq('user_id', user_id).eq('month', month).execute()
        
        if not resp.data:
            return {"budget": None, "month": month}
        
        budget = resp.data[0]
        total_expenses = (
            float(budget.get('bills_utilities', 0)) +
            float(budget.get('housing', 0)) +
            float(budget.get('food', 0)) +
            float(budget.get('transportation', 0)) +
            float(budget.get('healthcare', 0)) +
            float(budget.get('entertainment', 0)) +
            float(budget.get('shopping', 0)) +
            float(budget.get('education', 0)) +
            float(budget.get('other', 0))
        )
        
        income = float(budget.get('income', 0))
        savings_goal = float(budget.get('savings_goal', 0))
        left_to_budget = income - savings_goal - total_expenses
        
        return {
            "budget": {
                **budget,
                "total_expenses": total_expenses,
                "left_to_budget": left_to_budget
            },
            "month": month
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

