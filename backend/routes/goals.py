from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
import uuid

from routes.auth import get_current_user
from supabase_client import get_server_client

router = APIRouter()

class GoalCreate(BaseModel):
    title: str
    price: float
    deadline: Optional[str] = None  # YYYY-MM-DD

class GoalResponse(BaseModel):
    id: str
    user_id: str
    title: str
    price: float
    deadline: Optional[str]
    suggestions: List[str]
    predicted_time_months: Optional[int]

@router.post("/create")
async def create_goal(
    goal: GoalCreate,
    current_user = Depends(get_current_user)
):
    """Create a new financial goal with AI suggestions"""
    try:
        user_id = str(current_user.id)
        sb = get_server_client()
        
        # Calculate suggestions based on user's financial data
        # Get user's average monthly savings
        transactions_resp = sb.table('transactions').select('amount').eq('user_id', user_id).execute()
        transactions = transactions_resp.data or []
        
        # Simple heuristic: calculate average positive transactions (income)
        positive_amounts = [float(t['amount']) for t in transactions if float(t['amount']) > 0]
        avg_income = sum(positive_amounts) / len(positive_amounts) if positive_amounts else 5000
        
        # Generate suggestions
        suggestions = []
        monthly_save_20 = avg_income * 0.2
        monthly_save_30 = avg_income * 0.3
        monthly_save_40 = avg_income * 0.4
        
        time_20 = int(goal.price / monthly_save_20) if monthly_save_20 > 0 else 999
        time_30 = int(goal.price / monthly_save_30) if monthly_save_30 > 0 else 999
        time_40 = int(goal.price / monthly_save_40) if monthly_save_40 > 0 else 999
        
        suggestions.append(f"Save ₹{monthly_save_20:,.0f}/month (20% of income) - achieve in {time_20} months")
        suggestions.append(f"Save ₹{monthly_save_30:,.0f}/month (30% of income) - achieve in {time_30} months")
        suggestions.append(f"Save ₹{monthly_save_40:,.0f}/month (40% of income) - achieve in {time_40} months")
        suggestions.append("Consider reducing dining out and entertainment expenses")
        suggestions.append("Look for side income opportunities to accelerate savings")
        
        # Store goal
        goal_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": goal.title,
            "price": goal.price,
            "deadline": goal.deadline,
            "created_at": datetime.utcnow().isoformat()
        }
        
        resp = sb.table('goals').insert([goal_data]).execute()
        
        return {
            "success": True,
            "goal_id": goal_data['id'],
            "suggestions": suggestions,
            "predicted_time_months": time_30,  # Using 30% savings rate as default
            "message": "Goal created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def get_goals(
    current_user = Depends(get_current_user)
):
    """Get all goals for the user"""
    try:
        user_id = str(current_user.id)
        sb = get_server_client()
        
        resp = sb.table('goals').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        
        goals = resp.data or []
        
        return {
            "goals": goals
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: str,
    current_user = Depends(get_current_user)
):
    """Delete a goal"""
    try:
        user_id = str(current_user.id)
        sb = get_server_client()
        
        # Verify ownership
        resp = sb.table('goals').select('id').eq('id', goal_id).eq('user_id', user_id).execute()
        
        if not resp.data:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        sb.table('goals').delete().eq('id', goal_id).execute()
        
        return {"success": True, "message": "Goal deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

