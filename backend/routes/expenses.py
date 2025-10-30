from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
import uuid

from routes.auth import get_current_user
from supabase_client import get_server_client

router = APIRouter()

class ExpenseCreate(BaseModel):
    date: str  # YYYY-MM-DD
    amount: float
    category: str
    description: Optional[str] = None
    expense_type: str = 'one-time'  # 'daily', 'monthly', 'one-time'

class ExpenseResponse(BaseModel):
    id: str
    user_id: str
    date: str
    amount: float
    category: str
    description: Optional[str]
    expense_type: str
    created_at: str

@router.post("/add")
async def add_expense(
    expense: ExpenseCreate,
    current_user = Depends(get_current_user)
):
    """Add a manual expense"""
    try:
        user_id = str(current_user.id)
        sb = get_server_client()
        
        expense_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "date": expense.date,
            "amount": expense.amount,
            "category": expense.category,
            "description": expense.description,
            "expense_type": expense.expense_type
            # Note: created_at is handled by database DEFAULT NOW()
        }
        
        resp = sb.table('manual_expenses').insert([expense_data]).execute()
        
        # Check for errors in response
        if hasattr(resp, 'error') and resp.error:
            raise HTTPException(status_code=500, detail=f"Failed to add expense: {resp.error}")
        
        # Verify the data was inserted
        if not resp.data or len(resp.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to add expense: No data returned from database")
        
        return {
            "success": True,
            "expense_id": expense_data['id'],
            "message": "Expense added successfully",
            "data": resp.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=f"Failed to add expense: {error_detail}")

@router.get("/list")
async def get_expenses(
    month: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_user = Depends(get_current_user)
):
    """Get user's manual expenses with optional month filter"""
    try:
        user_id = str(current_user.id)
        sb = get_server_client()
        
        query = sb.table('manual_expenses').select('*').eq('user_id', user_id)
        
        if month:
            # Filter by month (YYYY-MM)
            start_date = f"{month}-01"
            # Get last day of month
            year, mon = month.split('-')
            if mon == '12':
                end_date = f"{int(year)+1}-01-01"
            else:
                end_date = f"{year}-{int(mon)+1:02d}-01"
            
            query = query.gte('date', start_date).lt('date', end_date)
        
        query = query.order('date', desc=True).range(offset, offset + limit - 1)
        resp = query.execute()
        
        expenses = resp.data or []
        
        return {
            "expenses": expenses,
            "total": len(expenses),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary")
async def get_expense_summary(
    month: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Get expense summary by category"""
    try:
        user_id = str(current_user.id)
        sb = get_server_client()
        
        query = sb.table('manual_expenses').select('category, amount').eq('user_id', user_id)
        
        if month:
            start_date = f"{month}-01"
            year, mon = month.split('-')
            if mon == '12':
                end_date = f"{int(year)+1}-01-01"
            else:
                end_date = f"{year}-{int(mon)+1:02d}-01"
            query = query.gte('date', start_date).lt('date', end_date)
        
        resp = query.execute()
        expenses = resp.data or []
        
        # Aggregate by category
        summary = {}
        total = 0
        for exp in expenses:
            category = exp['category']
            amount = float(exp['amount'])
            summary[category] = summary.get(category, 0) + amount
            total += amount
        
        categories = [
            {"category": cat, "amount": amt}
            for cat, amt in summary.items()
        ]
        
        return {
            "total": total,
            "categories": categories,
            "month": month
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: str,
    current_user = Depends(get_current_user)
):
    """Delete an expense"""
    try:
        user_id = str(current_user.id)
        sb = get_server_client()
        
        # Verify ownership
        resp = sb.table('manual_expenses').select('id').eq('id', expense_id).eq('user_id', user_id).execute()
        
        if not resp.data:
            raise HTTPException(status_code=404, detail="Expense not found")
        
        sb.table('manual_expenses').delete().eq('id', expense_id).execute()
        
        return {"success": True, "message": "Expense deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

