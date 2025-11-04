import os
from typing import Any, Dict, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from routes.auth import get_current_user
from utils.router import router as query_router, RouteTarget


router = APIRouter()


class ChatRequest(BaseModel):
    user_id: str
    query: str
    include_context: bool = Field(False, description="If true, include short anonymized finance summary")


class ChatResponse(BaseModel):
    user_id: str
    route: str
    rule: Optional[str]
    provider: str
    reply: str


def _build_context_summary(user_id: str) -> str:
    # Lightweight anonymized summary placeholder
    return (
        "User has typical monthly expenses across groceries, dining, and utilities; "
        "focus on budgeting and savings improvements."
    )


async def _forward_to_gemini(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        # Return a helpful message instead of raising an exception
        return "I apologize, but the AI service is currently unavailable. Please configure GEMINI_API_KEY in your environment to enable chat functionality."

    # Optimized Gemini proxy for faster, shorter responses
    # Use gemini-pro with v1 API (stable model and API version)
    url = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent"
    params = {"key": api_key}
    
    # Prepend system instruction to the prompt (v1beta doesn't support systemInstruction field)
    system_instruction = "You are a helpful financial assistant. Provide clear, concise answers in 2-3 sentences maximum. Focus on key points only."
    enhanced_prompt = f"{system_instruction}\n\nUser question: {prompt}"
    
    payload: Dict[str, Any] = {
        "contents": [{"parts": [{"text": enhanced_prompt}]}],
        "generationConfig": {
            "maxOutputTokens": 150,  # Limit response length
            "temperature": 0.7,       # Balanced creativity/speed
            "topP": 0.8,             # Focus on most likely tokens
            "topK": 20               # Limit token selection for speed
        }
    }
    timeout = httpx.Timeout(15.0)  # Reduced timeout for faster responses
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(url, params=params, json=payload)
            if resp.status_code != 200:
                # Truncate error message to avoid issues with very long responses
                error_detail = resp.text[:500] if len(resp.text) > 500 else resp.text
                try:
                    error_json = resp.json()
                    if "error" in error_json:
                        error_detail = error_json.get("error", {}).get("message", error_detail)
                except:
                    pass
                raise HTTPException(status_code=resp.status_code, detail=f"Gemini API error: {error_detail}")
            
            data = resp.json()
            try:
                # Check if response has candidates
                if "candidates" not in data or not data.get("candidates"):
                    error_msg = data.get("error", {}).get("message", "No response generated")
                    raise HTTPException(status_code=500, detail=f"Gemini API returned no candidates: {error_msg}")
                
                response_text = data["candidates"][0]["content"]["parts"][0]["text"]
                # Truncate response if it's still too long (fallback safety)
                if len(response_text) > 500:
                    response_text = response_text[:500] + "..."
                return response_text
            except (KeyError, IndexError) as e:
                # Better error handling for response parsing
                import traceback
                print(f"Error parsing Gemini response: {traceback.format_exc()}")
                print(f"Response data: {data}")
                error_msg = str(e) if str(e) else f"KeyError/IndexError: {type(e).__name__}"
                raise HTTPException(status_code=500, detail=f"Failed to parse Gemini response: {error_msg}")
    except HTTPException:
        # Re-raise HTTPException as-is
        raise
    except httpx.TimeoutException:
        raise HTTPException(status_code=500, detail="Gemini API request timed out after 15 seconds")
    except httpx.RequestError as e:
        error_msg = str(e) if str(e) else "Network connection error"
        raise HTTPException(status_code=500, detail=f"Network error connecting to Gemini API: {error_msg}")
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Unexpected error in _forward_to_gemini: {error_trace}")
        error_msg = str(e) if str(e) else f"{type(e).__name__} occurred"
        raise HTTPException(status_code=500, detail=f"Unexpected error calling Gemini API: {error_msg}")


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest, current_user = Depends(get_current_user)):
    try:
        route, rule = query_router.route_with_reason(req.query)
        if route != RouteTarget.CHAT:
            # If router says finance, we should not proxy to Gemini here
            raise HTTPException(status_code=400, detail="Query routed to Finance Assistant; use finance endpoints")

        prompt = req.query
        if req.include_context:
            ctx = _build_context_summary(req.user_id)
            prompt = f"Context: {ctx}\n\nQuestion: {req.query}"

        reply = await _forward_to_gemini(prompt)
        
        if not reply:
            reply = "I apologize, but I couldn't generate a response at this moment. Please try again."
        
        return ChatResponse(
            user_id=req.user_id,
            route=str(route.value),
            rule=rule,
            provider="gemini",
            reply=reply,
        )
    except HTTPException:
        # Re-raise HTTPException as-is (don't wrap it)
        raise
    except Exception as e:
        # Log the full error for debugging
        import traceback
        error_trace = traceback.format_exc()
        print(f"Chat endpoint error: {error_trace}")
        
        # Get a meaningful error message
        error_msg = str(e) if str(e) else f"{type(e).__name__} occurred"
        if len(error_msg) > 500:
            error_msg = error_msg[:500]
        
        raise HTTPException(status_code=500, detail=f"Chat endpoint error: {error_msg}")


