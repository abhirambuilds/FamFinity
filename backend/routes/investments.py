from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime
import uuid

from routes.auth import get_current_user
from supabase_client import get_server_client

router = APIRouter()

class InvestmentPlanRequest(BaseModel):
    amount: float

# Indian investment recommendations by risk level
INVESTMENT_PLANS = {
    1: {  # No Risk
        "level": 1,
        "label": "Conservative - No Risk",
        "short_term": [
            {"name": "Savings Account", "returns": "3-4% p.a.", "description": "Bank savings with instant liquidity"},
            {"name": "Fixed Deposit (3-6 months)", "returns": "5-7% p.a.", "description": "Safe bank FD with guaranteed returns"}
        ],
        "medium_term": [
            {"name": "Fixed Deposit (1-3 years)", "returns": "6-8% p.a.", "description": "Higher returns with locked period"},
            {"name": "Post Office Schemes", "returns": "7-8% p.a.", "description": "Government-backed safe investments"}
        ],
        "long_term": [
            {"name": "PPF (Public Provident Fund)", "returns": "7-8% p.a.", "description": "15-year govt scheme with tax benefits"},
            {"name": "NSC (National Savings Certificate)", "returns": "7-8% p.a.", "description": "5-year govt savings scheme"}
        ]
    },
    2: {  # Low Risk
        "level": 2,
        "label": "Low Risk",
        "short_term": [
            {"name": "Liquid Funds", "returns": "4-6% p.a.", "description": "Mutual fund with high liquidity"},
            {"name": "Ultra Short Duration Funds", "returns": "5-7% p.a.", "description": "Low-risk debt mutual funds"}
        ],
        "medium_term": [
            {"name": "Short Duration Debt Funds", "returns": "6-8% p.a.", "description": "Moderate returns with low risk"},
            {"name": "Corporate FDs", "returns": "7-9% p.a.", "description": "Higher returns than bank FDs"}
        ],
        "long_term": [
            {"name": "Debt Mutual Funds", "returns": "8-10% p.a.", "description": "Long-term debt investments"},
            {"name": "RD (Recurring Deposit)", "returns": "6-7% p.a.", "description": "Regular monthly savings"}
        ]
    },
    3: {  # Moderate Risk
        "level": 3,
        "label": "Balanced - Moderate Risk",
        "short_term": [
            {"name": "Arbitrage Funds", "returns": "6-8% p.a.", "description": "Lower risk equity funds"},
            {"name": "Balanced Advantage Funds", "returns": "8-10% p.a.", "description": "Dynamic asset allocation"}
        ],
        "medium_term": [
            {"name": "Hybrid Funds (Balanced)", "returns": "10-12% p.a.", "description": "Mix of equity and debt"},
            {"name": "Index Funds", "returns": "10-14% p.a.", "description": "Track market indices like Nifty 50"},
            {"name": "Gold Bonds/ETFs", "returns": "8-10% p.a.", "description": "Investment in digital gold"}
        ],
        "long_term": [
            {"name": "Balanced Mutual Funds", "returns": "11-13% p.a.", "description": "Long-term balanced portfolio"},
            {"name": "ELSS (Tax Saving Funds)", "returns": "12-15% p.a.", "description": "3-year lock with tax benefits"},
            {"name": "NPS (National Pension System)", "returns": "10-12% p.a.", "description": "Retirement planning with tax benefits"}
        ]
    },
    4: {  # Moderate-High Risk
        "level": 4,
        "label": "Growth - Moderate-High Risk",
        "short_term": [
            {"name": "Large Cap Equity Funds", "returns": "10-12% p.a.", "description": "Investment in top companies"},
            {"name": "Sectoral Funds", "returns": "10-15% p.a.", "description": "Focused on specific sectors"}
        ],
        "medium_term": [
            {"name": "Multi Cap Funds", "returns": "12-16% p.a.", "description": "Diversified across market caps"},
            {"name": "Focused Equity Funds", "returns": "13-17% p.a.", "description": "Concentrated portfolio of stocks"},
            {"name": "Blue Chip Stocks", "returns": "12-18% p.a.", "description": "Direct investment in top companies"}
        ],
        "long_term": [
            {"name": "Diversified Equity Funds", "returns": "14-18% p.a.", "description": "Long-term wealth creation"},
            {"name": "Flexi Cap Funds", "returns": "14-18% p.a.", "description": "Flexible market cap allocation"},
            {"name": "SIP in Equity Funds", "returns": "15-20% p.a.", "description": "Systematic investment for long term"}
        ]
    },
    5: {  # High Risk
        "level": 5,
        "label": "Aggressive - High Risk",
        "short_term": [
            {"name": "Mid & Small Cap Funds", "returns": "12-20% p.a.", "description": "Higher volatility and returns"},
            {"name": "Thematic Funds", "returns": "10-25% p.a.", "description": "Sector-specific high-risk funds"}
        ],
        "medium_term": [
            {"name": "Small Cap Funds", "returns": "15-25% p.a.", "description": "High growth potential with risk"},
            {"name": "Emerging Markets Equity", "returns": "15-30% p.a.", "description": "Investment in growth markets"},
            {"name": "Individual Stocks (Growth)", "returns": "Varies", "description": "Direct stock investment"}
        ],
        "long_term": [
            {"name": "Small Cap Equity Funds", "returns": "18-30% p.a.", "description": "Maximum growth potential"},
            {"name": "International Equity Funds", "returns": "15-25% p.a.", "description": "Global market exposure"},
            {"name": "Crypto/Alternative Assets", "returns": "Highly variable", "description": "High risk, high reward"},
            {"name": "Startup Investments", "returns": "Varies", "description": "Early-stage company investments"}
        ]
    }
}

def calculate_risk_level_from_questions(questions: List[Dict]) -> int:
    """
    Calculate risk level (1-5) based on user's 15 onboarding questions.
    Returns an integer between 1 and 5.
    """
    # Convert questions list to dictionary for easy access
    questions_dict = {q.get('q_id'): q.get('answer', '') for q in questions}
    
    # Initialize base risk level from Question 5 (Risk Tolerance)
    # This is the primary indicator
    risk_level = 3  # Default moderate risk
    
    q5_answer = str(questions_dict.get(5, '')).lower()
    if 'very conservative' in q5_answer or 'fd, ppf only' in q5_answer:
        risk_level = 1
    elif 'conservative' in q5_answer and 'very' not in q5_answer:
        risk_level = 2
    elif 'moderate' in q5_answer or 'balanced' in q5_answer:
        risk_level = 3
    elif 'aggressive' in q5_answer and 'very' not in q5_answer:
        risk_level = 4
    elif 'very aggressive' in q5_answer or 'high risk-high return' in q5_answer:
        risk_level = 5
    
    # Adjust based on investment experience (Q11)
    q11_answer = str(questions_dict.get(11, '')).lower()
    if 'no experience' in q11_answer or 'only savings account' in q11_answer:
        risk_level = max(1, risk_level - 1)  # Reduce risk for no experience
    elif 'beginner' in q11_answer:
        risk_level = max(1, risk_level - 0.5)  # Slight reduction
    elif 'intermediate' in q11_answer or 'mutual funds' in q11_answer or 'sip' in q11_answer:
        risk_level = risk_level  # No change
    elif 'advanced' in q11_answer or 'direct stocks' in q11_answer:
        risk_level = min(5, risk_level + 0.5)  # Slight increase
    elif 'expert' in q11_answer or 'options' in q11_answer or 'derivatives' in q11_answer:
        risk_level = min(5, risk_level + 1)  # Increase for experts
    
    # Adjust based on monthly savings (Q2) - higher savings = can take more risk
    try:
        monthly_savings = float(questions_dict.get(2, 0))
        if monthly_savings > 50000:
            risk_level = min(5, risk_level + 0.5)
        elif monthly_savings > 25000:
            risk_level = min(5, risk_level + 0.25)
        elif monthly_savings < 10000:
            risk_level = max(1, risk_level - 0.5)
        elif monthly_savings < 5000:
            risk_level = max(1, risk_level - 1)
    except (ValueError, TypeError):
        pass
    
    # Adjust based on annual income (Q4) - higher income = can take more risk
    try:
        annual_income_lakhs = float(questions_dict.get(4, 0))
        annual_income = annual_income_lakhs * 100000  # Convert to rupees
        if annual_income > 2500000:  # > 25 lakhs
            risk_level = min(5, risk_level + 0.25)
        elif annual_income > 1500000:  # > 15 lakhs
            risk_level = min(5, risk_level + 0.25)
        elif annual_income < 500000:  # < 5 lakhs
            risk_level = max(1, risk_level - 0.5)
    except (ValueError, TypeError):
        pass
    
    # Adjust based on total debt (Q6) - higher debt = should take less risk
    try:
        total_debt = float(questions_dict.get(6, 0))
        if total_debt > 2000000:  # > 20 lakhs debt
            risk_level = max(1, risk_level - 1)
        elif total_debt > 1000000:  # > 10 lakhs debt
            risk_level = max(1, risk_level - 0.5)
        elif total_debt < 100000:  # < 1 lakh debt (minimal)
            risk_level = min(5, risk_level + 0.25)
    except (ValueError, TypeError):
        pass
    
    # Adjust based on emergency fund (Q8) - more months = can take more risk
    try:
        emergency_months = float(questions_dict.get(8, 0))
        if emergency_months >= 6:
            risk_level = min(5, risk_level + 0.5)
        elif emergency_months >= 3:
            risk_level = min(5, risk_level + 0.25)
        elif emergency_months < 1:
            risk_level = max(1, risk_level - 1)  # No emergency fund = very conservative
        elif emergency_months < 3:
            risk_level = max(1, risk_level - 0.5)
    except (ValueError, TypeError):
        pass
    
    # Adjust based on years until retirement (Q14) - more years = can take more risk
    try:
        years_to_retirement = float(questions_dict.get(14, 0))
        if years_to_retirement > 30:
            risk_level = min(5, risk_level + 0.5)
        elif years_to_retirement > 20:
            risk_level = min(5, risk_level + 0.25)
        elif years_to_retirement < 10:
            risk_level = max(1, risk_level - 0.5)
        elif years_to_retirement < 5:
            risk_level = max(1, risk_level - 1)  # Close to retirement = conservative
    except (ValueError, TypeError):
        pass
    
    # Adjust based on financial concern (Q7) - debt concerns = reduce risk
    q7_answer = str(questions_dict.get(7, '')).lower()
    if 'debt' in q7_answer or 'emi' in q7_answer:
        risk_level = max(1, risk_level - 0.5)
    elif 'job security' in q7_answer or 'income stability' in q7_answer:
        risk_level = max(1, risk_level - 0.5)
    
    # Adjust based on employment status (Q3) - stable employment = can take more risk
    q3_answer = str(questions_dict.get(3, '')).lower()
    if 'government employee' in q3_answer or 'salaried' in q3_answer:
        risk_level = min(5, risk_level + 0.25)  # Stable income
    elif 'self-employed' in q3_answer or 'business owner' in q3_answer:
        risk_level = risk_level  # Variable income, no change
    elif 'freelancer' in q3_answer or 'consultant' in q3_answer:
        risk_level = max(1, risk_level - 0.25)  # Less stable
    elif 'student' in q3_answer or 'homemaker' in q3_answer:
        risk_level = max(1, risk_level - 0.5)  # Lower risk
    
    # Adjust based on savings percentage (Q10) - higher savings rate = can take more risk
    try:
        savings_percentage = float(questions_dict.get(10, 0))
        if savings_percentage >= 30:
            risk_level = min(5, risk_level + 0.25)
        elif savings_percentage >= 20:
            risk_level = min(5, risk_level + 0.25)
        elif savings_percentage < 10:
            risk_level = max(1, risk_level - 0.5)
    except (ValueError, TypeError):
        pass
    
    # Ensure risk level is between 1 and 5
    risk_level = max(1, min(5, round(risk_level)))
    
    return int(risk_level)

@router.post("/recommend")
async def get_investment_recommendations(
    request: InvestmentPlanRequest,
    current_user = Depends(get_current_user)
):
    """Get personalized investment recommendations based on user data and risk profile"""
    try:
        user_id = str(current_user.id)
        sb = get_server_client()
        
        # Get user onboarding answers
        questions_resp = sb.table('user_questions').select('*').eq('user_id', user_id).execute()
        questions = questions_resp.data or []
        
        # Calculate risk level from all 15 questions
        if not questions or len(questions) < 15:
            # Fallback if questions not answered
            risk_level = 3  # Default moderate risk
        else:
            risk_level = calculate_risk_level_from_questions(questions)
        
        # Slight adjustment based on investment amount (optional)
        # Higher amounts might indicate more conservative approach needed
        if request.amount > 1000000:  # > 10 lakhs
            risk_level = max(1, risk_level - 1)
        elif request.amount > 500000:  # > 5 lakhs
            risk_level = max(1, risk_level - 0.5)
        elif request.amount < 50000:  # < 50k can be slightly more aggressive
            risk_level = min(5, risk_level + 0.5)
        
        # Ensure risk level is still between 1 and 5 after amount adjustment
        risk_level = max(1, min(5, round(risk_level)))
        
        # Get recommendations for the calculated risk level
        recommendations = INVESTMENT_PLANS.get(risk_level, INVESTMENT_PLANS[3])
        
        # Store investment plan
        plan_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "risk_level": risk_level,
            "amount": request.amount,
            "recommendations": recommendations,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # You can optionally store this
        # sb.table('investment_plans').insert([plan_data]).execute()
        
        return {
            "risk_level": risk_level,
            "risk_label": recommendations["label"],
            "amount": request.amount,
            "recommendations": recommendations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all-plans")
async def get_all_investment_plans():
    """Get all investment plans for all risk levels"""
    return {"plans": INVESTMENT_PLANS}

