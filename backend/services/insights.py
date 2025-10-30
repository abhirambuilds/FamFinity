from datetime import date, datetime
from typing import Dict, List, Any

from supabase_client import get_server_client


def get_total_expenses(user_id: str, month: str | None) -> float:
    """Return total expenses for user. If month provided as 'YYYY-MM', filter to that month."""
    sb = get_server_client()
    
    query = sb.table("transactions").select("amount").eq("user_id", user_id)
    
    if month:
        # Filter by month prefix (YYYY-MM) - use proper date range
        from datetime import datetime
        year, month_num = month.split('-')
        year, month_num = int(year), int(month_num)
        
        # Get the first day of the month
        start_date = f"{year}-{month_num:02d}-01"
        
        # Get the first day of the next month
        if month_num == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month_num + 1:02d}-01"
        
        query = query.gte("date", start_date).lt("date", end_date)
    
    result = query.execute()
    
    if not result.data:
        return 0.0
    
    # Sum up negative amounts (expenses)
    total = sum(abs(float(row["amount"])) for row in result.data if float(row["amount"]) < 0)
    return total


def get_total_income(user_id: str, month: str | None) -> float:
    """Return total income for user. If month provided as 'YYYY-MM', filter to that month."""
    sb = get_server_client()
    
    query = sb.table("transactions").select("amount").eq("user_id", user_id)
    
    if month:
        # Filter by month prefix (YYYY-MM) - use proper date range
        from datetime import datetime
        year, month_num = month.split('-')
        year, month_num = int(year), int(month_num)
        
        # Get the first day of the month
        start_date = f"{year}-{month_num:02d}-01"
        
        # Get the first day of the next month
        if month_num == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month_num + 1:02d}-01"
        
        query = query.gte("date", start_date).lt("date", end_date)
    
    result = query.execute()
    
    if not result.data:
        return 0.0
    
    # Sum up positive amounts (income)
    total = sum(float(row["amount"]) for row in result.data if float(row["amount"]) > 0)
    return total


def get_expense_by_category(user_id: str, month: str | None) -> List[Dict[str, Any]]:
    """Return expense totals by category. If month provided as 'YYYY-MM', filter to that month."""
    sb = get_server_client()
    
    query = sb.table("transactions").select("category, amount").eq("user_id", user_id)
    
    if month:
        # Filter by month prefix (YYYY-MM) - use proper date range
        from datetime import datetime
        year, month_num = month.split('-')
        year, month_num = int(year), int(month_num)
        
        # Get the first day of the month
        start_date = f"{year}-{month_num:02d}-01"
        
        # Get the first day of the next month
        if month_num == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month_num + 1:02d}-01"
        
        query = query.gte("date", start_date).lt("date", end_date)
    
    result = query.execute()
    
    if not result.data:
        return []
    
    # Aggregate by category
    category_totals: Dict[str, float] = {}
    for row in result.data:
        amount = float(row["amount"])
        if amount < 0:  # Only expenses
            category = row["category"]
            category_totals[category] = category_totals.get(category, 0.0) + abs(amount)
    
    # Convert to list and sort by total
    categories = [
        {"category": cat, "total": total}
        for cat, total in category_totals.items()
        if total > 0
    ]
    categories.sort(key=lambda x: x["total"], reverse=True)
    
    return categories


def get_monthly_trend(user_id: str, last_n_months: int) -> List[Dict[str, Any]]:
    """Return a list of {month: 'YYYY-MM', total: float} for the last N months (inclusive)."""
    sb = get_server_client()
    
    # Get all transactions for user
    result = sb.table("transactions").select("date, amount").eq("user_id", user_id).order("date", desc=True).execute()
    
    if not result.data:
        return []
    
    # Aggregate by month
    monthly_totals: Dict[str, float] = {}
    for row in result.data:
        amount = float(row["amount"])
        if amount < 0:  # Only expenses
            # Extract YYYY-MM from date
            date_str = row["date"]
            month = date_str[:7]  # Get YYYY-MM
            monthly_totals[month] = monthly_totals.get(month, 0.0) + abs(amount)
    
    # Sort months and take last N
    sorted_months = sorted(monthly_totals.keys(), reverse=True)[:last_n_months]
    
    # Reverse to chronological order
    trend = [
        {"month": month, "total": monthly_totals[month]}
        for month in reversed(sorted_months)
    ]
    
    return trend
