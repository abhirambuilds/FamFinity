from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from routes.auth import get_current_user

# Optional: ML models require PyTorch
try:
    from models.utils import forecast_with_models
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    forecast_with_models = None


router = APIRouter()


class AdvisorRequest(BaseModel):
    user_id: str
    query: str = Field("", description="User question or goal statement")


class AdviceItem(BaseModel):
    action: str
    rationale: str
    estimated_impact: float = Field(0.0, description="Monthly estimated savings or benefit")


class AdvisorResponse(BaseModel):
    user_id: str
    route: str
    rule: Optional[str]
    query: str
    forecast: Dict[str, List[float]]
    explanations: List[str]
    suggested_actions: List[AdviceItem]


def _load_user_profile(user_id: str) -> Dict[str, Any]:
    """Load user profile from database with real data"""
    try:
        from supabase_client import get_server_client
        supabase = get_server_client()
        
        # Get user data
        user_result = supabase.table("users").select("*").eq("id", user_id).execute()
        if not user_result.data:
            return _get_default_profile(user_id)
        
        user_data = user_result.data[0]
        
        # Get user questions for financial profile
        questions_result = supabase.table("user_questions").select("*").eq("user_id", user_id).execute()
        questions = {q["q_id"]: q["answer"] for q in questions_result.data} if questions_result.data else {}
        
        # Extract financial data from questions
        income = float(questions.get("income", 5000.0))
        savings_rate = float(questions.get("savings_rate", 0.12))
        risk_level = int(questions.get("risk_tolerance", 3))
        
        return {
            "user_id": user_id,
            "income": income,
            "savings_rate": savings_rate,
            "risk_level": risk_level,
            "name": user_data.get("name", "User"),
            "email": user_data.get("email", ""),
        }
    except Exception as e:
        print(f"Error loading user profile: {e}")
        return _get_default_profile(user_id)


def _get_default_profile(user_id: str) -> Dict[str, Any]:
    """Fallback profile when database fetch fails"""
    return {
        "user_id": user_id,
        "income": 5000.0,
        "savings_rate": 0.12,
        "risk_level": 3,
        "name": "User",
        "email": "",
    }


def _load_latest_summary(user_id: str) -> Dict[str, Any]:
    """Load real transaction summary from database"""
    try:
        from supabase_client import get_server_client
        from datetime import datetime, timedelta
        import pandas as pd
        
        supabase = get_server_client()
        
        # Get transactions from last 3 months
        three_months_ago = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
        
        transactions_result = supabase.table("transactions").select("*").eq("user_id", user_id).gte("date", three_months_ago).execute()
        
        if not transactions_result.data:
            return _get_default_summary()
        
        # Process transactions
        df = pd.DataFrame(transactions_result.data)
        df['date'] = pd.to_datetime(df['date'])
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
        
        # Calculate last month spending
        last_month = datetime.now().replace(day=1) - timedelta(days=1)
        last_month_start = last_month.replace(day=1)
        last_month_end = last_month
        
        last_month_transactions = df[
            (df['date'] >= last_month_start) & 
            (df['date'] <= last_month_end)
        ]
        
        last_month_spend = abs(last_month_transactions['amount'].sum()) if not last_month_transactions.empty else 0.0
        
        # Calculate top categories from all transactions
        df['amount'] = df['amount'].abs()  # Make all amounts positive for spending analysis
        category_totals = df.groupby('category')['amount'].sum().sort_values(ascending=False)
        
        top_categories = [
            {"category": cat, "total": float(total)} 
            for cat, total in category_totals.head(5).items()
        ]
        
        return {
            "last_month_spend": float(last_month_spend),
            "top_categories": top_categories,
            "total_transactions": len(df),
            "avg_monthly_spend": float(df.groupby(df['date'].dt.to_period('M'))['amount'].sum().mean()) if not df.empty else 0.0,
        }
    except Exception as e:
        print(f"Error loading transaction summary: {e}")
        return _get_default_summary()


def _get_default_summary() -> Dict[str, Any]:
    """Fallback summary when database fetch fails"""
    return {
        "last_month_spend": 2200.0,
        "top_categories": [
            {"category": "groceries", "total": 520.0},
            {"category": "dining", "total": 310.0},
            {"category": "utilities", "total": 260.0},
        ],
        "total_transactions": 0,
        "avg_monthly_spend": 2200.0,
    }


async def _forward_to_gemini_for_advisor(prompt: str) -> str:
    """Forward query to Gemini API with financial context for advisor"""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None  # Return None if API key is not set (will fall back to rule-based)
    
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    params = {"key": api_key}
    
    system_instruction = (
        "You are a professional financial advisor. Analyze the user's financial situation and provide "
        "clear, actionable advice with EXACTLY 2-3 actionable recommendations. "
        "Format your response as: 'EXPLANATION: [your analysis in 1-2 sentences]' "
        "followed by 2-3 actions, each on a new line as: "
        "'ACTION: [action title] - RATIONALE: [explanation] - IMPACT: ₹[amount]/month' "
        "Use Indian Rupees (₹) for currency. Make sure to provide 2-3 distinct recommendations."
    )
    
    payload: Dict[str, Any] = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": 600,
            "temperature": 0.7,
            "topP": 0.8,
            "topK": 20
        },
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        }
    }
    
    timeout = httpx.Timeout(15.0)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(url, params=params, json=payload)
            if resp.status_code != 200:
                return None  # Fall back to rule-based if API fails
            
            data = resp.json()
            try:
                response_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return response_text
            except (KeyError, IndexError):
                return None
    except Exception:
        return None  # Fall back to rule-based on any error


def advisor_generator(query: str, profile: Dict[str, Any], summary: Dict[str, Any]) -> Dict[str, Any]:
    """Generate personalized financial advice based on user query and data"""
    query_lower = query.lower()
    
    # Generate forecast based on real spending data (only if ML is available)
    preds: Dict[str, Any] = {}
    best: List[float] = []
    if ML_AVAILABLE and forecast_with_models is not None:
        try:
            history = [max(0.0, float(summary.get("last_month_spend", 2000.0)) * (0.95 + 0.1 * i)) for i in range(6)]
            preds = forecast_with_models(history, months=3)
            best = preds.get("lstm") or preds.get("baseline") or []
        except Exception as e:
            print(f"Error generating forecast: {e}")
            preds = {}

    explanations: List[str] = []
    actions: List[AdviceItem] = []
    
    income = float(profile.get("income", 0))
    last_spend = float(summary.get("last_month_spend", 0))
    savings_rate = float(profile.get("savings_rate", 0.1))
    total_transactions = int(summary.get("total_transactions", 0))
    avg_monthly_spend = float(summary.get("avg_monthly_spend", last_spend))
    
    # Query-specific analysis
    if "save" in query_lower or "saving" in query_lower:
        explanations.append(f"Based on your current spending of ₹{last_spend:.0f}/month and income of ₹{income:.0f}, you're saving {(income - last_spend)/income*100:.1f}% of your income.")
        
        target_savings = 0.20  # aim for 20%
        if savings_rate < target_savings:
            needed = max(0.0, target_savings - savings_rate)
            est = round(income * needed, 2)
            actions.append(AdviceItem(
                action="Automate savings transfers on payday", 
                rationale=f"Transfer ₹{est:.0f} monthly to reach 20% savings rate", 
                estimated_impact=est
            ))
            
            # Add more savings recommendations
            actions.append(AdviceItem(
                action="Review and cancel unused subscriptions", 
                rationale="Identify recurring charges you don't actively use", 
                estimated_impact=round(last_spend * 0.05, 2)
            ))
            
            actions.append(AdviceItem(
                action="Create a dedicated emergency fund account", 
                rationale="Separate savings account prevents accidental spending", 
                estimated_impact=est * 6  # 6 months emergency fund
            ))
    
    elif "budget" in query_lower or "budgeting" in query_lower:
        explanations.append(f"Your current monthly spending is ₹{last_spend:.0f}. A good budget allocates 50% to needs, 30% to wants, and 20% to savings.")
        
        needs_budget = income * 0.5
        wants_budget = income * 0.3
        savings_budget = income * 0.2
        
        if last_spend > needs_budget:
            actions.append(AdviceItem(
                action="Implement 50/30/20 budget rule", 
                rationale=f"Allocate ₹{needs_budget:.0f} to needs, ₹{wants_budget:.0f} to wants, ₹{savings_budget:.0f} to savings", 
                estimated_impact=round(last_spend - needs_budget, 2)
            ))
        
        # Add additional budgeting recommendations
        actions.append(AdviceItem(
            action="Use envelope budgeting method", 
            rationale="Allocate cash for each category to prevent overspending", 
            estimated_impact=round(last_spend * 0.1, 2)
        ))
        
        actions.append(AdviceItem(
            action="Set up budget alerts and reminders", 
            rationale="Notifications help you stay within category limits", 
            estimated_impact=round(last_spend * 0.05, 2)
        ))
    
    elif "expense" in query_lower or "reduce" in query_lower or "cut" in query_lower:
        explanations.append(f"Your top spending categories are: {', '.join([cat['category'] for cat in summary.get('top_categories', [])[:3]])}")
        
        # Category-specific reduction tips - generate at least 3 recommendations
        expense_actions_added = 0
        for cat in summary.get("top_categories", [])[:3]:
            cat_name = cat.get("category", "other")
            cat_total = float(cat.get("total", 0))
            
            if cat_name == "dining" and cat_total > 200:
                actions.append(AdviceItem(
                    action="Reduce dining out by 50%", 
                    rationale="Cook at home more often and limit restaurant visits to weekends", 
                    estimated_impact=round(0.5 * cat_total, 2)
                ))
                expense_actions_added += 1
            elif cat_name == "groceries" and cat_total > 300:
                actions.append(AdviceItem(
                    action="Optimize grocery shopping", 
                    rationale="Plan meals weekly, use store brands, and avoid impulse purchases", 
                    estimated_impact=round(0.15 * cat_total, 2)
                ))
                expense_actions_added += 1
            elif cat_name == "utilities" and cat_total > 100:
                actions.append(AdviceItem(
                    action="Reduce utility costs", 
                    rationale="Use energy-efficient appliances and optimize usage patterns", 
                    estimated_impact=round(0.1 * cat_total, 2)
                ))
                expense_actions_added += 1
        
        # Add general expense reduction tips if we don't have enough category-specific ones
        if expense_actions_added < 2:
            actions.append(AdviceItem(
                action="Negotiate bills and subscriptions", 
                rationale="Contact service providers to negotiate lower rates or switch plans", 
                estimated_impact=round(last_spend * 0.08, 2)
            ))
            expense_actions_added += 1
        
        if expense_actions_added < 3:
            actions.append(AdviceItem(
                action="Implement the 24-hour rule for non-essential purchases", 
                rationale="Wait 24 hours before buying items over ₹500 to avoid impulse spending", 
                estimated_impact=round(last_spend * 0.06, 2)
            ))
    
    elif "pattern" in query_lower or "analyze" in query_lower or "spending" in query_lower:
        explanations.append(f"You have {total_transactions} transactions with an average monthly spend of ₹{avg_monthly_spend:.0f}")
        
        if best and len(best) > 0:
            history = [max(0.0, float(summary.get("last_month_spend", 2000.0)) * (0.95 + 0.1 * i)) for i in range(6)]
            if len(history) > 0:
                delta = (best[-1] - history[-1]) if len(best) > 0 else 0.0
                trend = "increasing" if delta > 0 else "decreasing"
                explanations.append(f"Spending trend shows {trend} pattern: projected change of ₹{abs(delta):.0f} next quarter")
        
        # Add analysis-based recommendations
        if last_spend > income * 0.8:
            actions.append(AdviceItem(
                action="Reduce spending to below 80% of income", 
                rationale="Maintaining 20% savings rate is crucial for financial health", 
                estimated_impact=round(last_spend - income * 0.8, 2)
            ))
        
        actions.append(AdviceItem(
            action="Use spending analytics to identify trends", 
            rationale="Monthly pattern analysis helps predict and control future spending", 
            estimated_impact=round(last_spend * 0.08, 2)
        ))
        
        actions.append(AdviceItem(
            action="Compare spending month-over-month", 
            rationale="Tracking changes helps identify areas where spending is growing unexpectedly", 
            estimated_impact=round(last_spend * 0.05, 2)
        ))
    
    elif "goal" in query_lower or "target" in query_lower:
        explanations.append(f"With your current savings rate of {savings_rate*100:.1f}%, you're on track for financial goals")
        
        monthly_savings = income * savings_rate
        actions.append(AdviceItem(
            action="Set specific financial goals", 
            rationale=f"With ₹{monthly_savings:.0f}/month savings, you can achieve goals faster with clear targets", 
            estimated_impact=monthly_savings
        ))
        
        # Add goal-setting recommendations
        actions.append(AdviceItem(
            action="Use SMART goal framework (Specific, Measurable, Achievable, Relevant, Time-bound)", 
            rationale="Clear goals with deadlines increase success rate by 30%", 
            estimated_impact=monthly_savings * 1.3
        ))
        
        actions.append(AdviceItem(
            action="Break large goals into smaller milestones", 
            rationale="Achieving small wins boosts motivation and momentum", 
            estimated_impact=monthly_savings * 0.5
        ))
    
    else:
        # General advice
        explanations.append(f"Based on your financial profile: ₹{income:.0f} income, ₹{last_spend:.0f} monthly spending, {savings_rate*100:.1f}% savings rate")
        
        if savings_rate < 0.15:
            actions.append(AdviceItem(
                action="Increase emergency fund", 
                rationale="Build 3-6 months of expenses as emergency savings", 
                estimated_impact=round(last_spend * 3, 2)
            ))
        
        # Always add general recommendations
        actions.append(AdviceItem(
            action="Review and optimize your spending categories", 
            rationale="Regular review of top spending categories helps identify savings opportunities", 
            estimated_impact=round(last_spend * 0.1, 2)
        ))
        
        actions.append(AdviceItem(
            action="Track expenses daily for better awareness", 
            rationale="Daily tracking increases financial awareness and reduces unnecessary spending", 
            estimated_impact=round(last_spend * 0.07, 2)
        ))

    # Always add category-specific tips from actual spending (limit to avoid duplicates)
    if len(actions) < 3:
        for cat in summary.get("top_categories", [])[:3]:
            cat_name = cat.get("category", "other")
            cat_total = float(cat.get("total", 0))
            
            # Check if we already have similar advice
            existing_categories = [a.action.lower() for a in actions]
            if cat_name == "dining" and cat_total > 150 and not any("dining" in c or "meal" in c for c in existing_categories):
                actions.append(AdviceItem(
                    action="Meal prep on weekends", 
                    rationale="Prepare 3-4 meals in advance to reduce dining costs", 
                    estimated_impact=round(0.2 * cat_total, 2)
                ))
            elif cat_name == "groceries" and cat_total > 200 and not any("grocery" in c for c in existing_categories):
                actions.append(AdviceItem(
                    action="Use grocery store apps for deals", 
                    rationale="Digital coupons and loyalty programs can save 10-15%", 
                    estimated_impact=round(0.1 * cat_total, 2)
                ))
            if len(actions) >= 3:
                break

    # Ensure we provide at least 2-3 actions
    if len(actions) < 2:
        actions.append(AdviceItem(
            action="Track expenses daily for one week", 
            rationale="Understanding spending patterns is the first step to improvement", 
            estimated_impact=round(0.05 * last_spend, 2)
        ))
        
    if len(actions) < 3:
        actions.append(AdviceItem(
            action="Set up automatic bill payments", 
            rationale="Prevents late fees and helps with budgeting consistency", 
            estimated_impact=round(last_spend * 0.02, 2)
        ))

    return {
        "forecast": {
            k: [float(x) for x in v] if isinstance(v, list) else v  # type: ignore
            for k, v in preds.items()
            if isinstance(v, list)
        },
        "explanations": explanations or ["Analyzing your financial data to provide personalized advice."],
        "suggested_actions": [a.model_dump() for a in actions],
    }


@router.post("/advisor", response_model=AdvisorResponse)
async def advisor_endpoint(req: AdvisorRequest, current_user = Depends(get_current_user)):
    try:
        profile = _load_user_profile(req.user_id)
        summary = _load_latest_summary(req.user_id)

        from utils.router import router as query_router
        route, rule = query_router.route_with_reason(req.query)

        # Try to use Gemini API for enhanced AI-powered advice
        use_gemini = os.getenv("USE_GEMINI_ADVISOR", "true").lower() == "true"
        gemini_response = None
        
        if use_gemini:
            # Build comprehensive context for Gemini
            income = float(profile.get("income", 0))
            last_spend = float(summary.get("last_month_spend", 0))
            savings_rate = float(profile.get("savings_rate", 0.1))
            top_categories = summary.get("top_categories", [])
            
            context = f"""User Financial Profile:
- Monthly Income: ₹{income:.2f}
- Last Month Spending: ₹{last_spend:.2f}
- Current Savings Rate: {savings_rate*100:.1f}%
- Top Spending Categories: {', '.join([f"{cat['category']} (₹{cat['total']:.2f})" for cat in top_categories[:3]])}

User Question: {req.query}

Please provide personalized financial advice with EXACTLY 2-3 actionable recommendations based on this information. 
Format each recommendation as: ACTION: [title] - RATIONALE: [explanation] - IMPACT: ₹[amount]/month"""

            gemini_response = await _forward_to_gemini_for_advisor(context)

        # Generate rule-based advice as baseline or fallback
        generated = advisor_generator(req.query, profile, summary)
        
        # If Gemini provided a response, try to parse and enhance it
        if gemini_response:
            try:
                # Try to parse Gemini response and add to explanations
                lines = gemini_response.split('\n')
                gemini_explanations = []
                gemini_actions = []
                
                current_action = None
                current_rationale = None
                current_impact = 0.0
                
                for line in lines:
                    line = line.strip()
                    if line.startswith('EXPLANATION:'):
                        gemini_explanations.append(line.replace('EXPLANATION:', '').strip())
                    elif line.startswith('ACTION:'):
                        if current_action:
                            gemini_actions.append({
                                'action': current_action,
                                'rationale': current_rationale or 'AI-generated recommendation',
                                'estimated_impact': current_impact
                            })
                        parts = line.replace('ACTION:', '').split('-')
                        current_action = parts[0].strip()
                        current_rationale = None
                        current_impact = 0.0
                        
                        # Parse rationale and impact if present
                        for part in parts[1:]:
                            part = part.strip()
                            if part.startswith('RATIONALE:'):
                                current_rationale = part.replace('RATIONALE:', '').strip()
                            elif part.startswith('IMPACT:'):
                                impact_str = part.replace('IMPACT:', '').replace('₹', '').replace('/month', '').strip()
                                try:
                                    current_impact = float(impact_str)
                                except:
                                    current_impact = 0.0
                
                # Add last action
                if current_action:
                    gemini_actions.append({
                        'action': current_action,
                        'rationale': current_rationale or 'AI-generated recommendation',
                        'estimated_impact': current_impact
                    })
                
                # Merge Gemini insights with rule-based advice
                if gemini_explanations:
                    generated["explanations"] = gemini_explanations + generated.get("explanations", [])
                
                if gemini_actions:
                    # Add Gemini actions, converting to AdviceItem format
                    existing_actions = generated.get("suggested_actions", [])
                    gemini_advice_items = [
                        AdviceItem(**action).model_dump() 
                        for action in gemini_actions
                        if isinstance(action, dict)
                    ]
                    
                    # Combine Gemini and rule-based actions, prioritizing Gemini but ensuring 2-3 total
                    combined_actions = gemini_advice_items[:3] if gemini_advice_items else existing_actions
                    
                    # If Gemini gave less than 2-3, supplement with rule-based
                    if len(combined_actions) < 2:
                        combined_actions.extend(existing_actions[:2 - len(combined_actions)])
                    elif len(combined_actions) < 3 and existing_actions:
                        # Prefer Gemini but add best rule-based if needed
                        combined_actions.extend(existing_actions[:1])
                    
                    generated["suggested_actions"] = combined_actions[:3]  # Ensure max 3
                    
            except Exception as e:
                # If parsing fails, just add the raw response as an explanation
                print(f"Error parsing Gemini response: {e}")
                generated["explanations"].insert(0, f"AI Insight: {gemini_response[:200]}...")

        # Ensure we always return 2-3 suggested actions
        suggested_actions = generated.get("suggested_actions", [])
        
        # Get last_spend from summary for fallback actions
        last_spend_fallback = float(summary.get("last_month_spend", 0))
        
        if len(suggested_actions) < 2:
            # Fallback: add generic advice if needed
            suggested_actions.append({
                "action": "Review your monthly financial statements",
                "rationale": "Regular review helps identify spending patterns and opportunities",
                "estimated_impact": round(last_spend_fallback * 0.05, 2)
            })
        if len(suggested_actions) < 3:
            suggested_actions.append({
                "action": "Consult with a financial advisor for personalized guidance",
                "rationale": "Professional advice can optimize your financial strategy",
                "estimated_impact": 0.0
            })
        
        # Limit to 3 actions maximum
        suggested_actions = suggested_actions[:3]
        
        return AdvisorResponse(
            user_id=req.user_id,
            route=str(route.value),
            rule=rule,
            query=req.query,
            forecast=generated.get("forecast", {}),
            explanations=generated.get("explanations", []),
            suggested_actions=[AdviceItem(**a) for a in suggested_actions],
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        print(f"Advisor endpoint error: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Advisor error: {error_msg}")


