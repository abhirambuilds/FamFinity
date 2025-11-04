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


def _gemini_endpoint(model: str) -> str:
    """Build the Gemini API endpoint URL for a given model."""
    return f"https://generativelanguage.googleapis.com/v1/{model}:generateContent"


@router.get("/ai/models")
async def list_gemini_models():
    """Debug endpoint to list available Gemini models for the current API key."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set")
    
    url = "https://generativelanguage.googleapis.com/v1/models"
    timeout = httpx.Timeout(15.0)
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.get(url, params={"key": api_key})
        
        if r.headers.get("content-type", "").startswith("application/json"):
            return {"status": r.status_code, "body": r.json()}
        else:
            return {"status": r.status_code, "body": r.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")


async def _forward_to_gemini(prompt: str) -> str:
    """Forward prompt to Gemini API with robust error handling and parsing."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return "AI is unavailable: missing GEMINI_API_KEY."

    # Allow override via env; default to a known-good model
    model = os.getenv("GEMINI_MODEL", "models/gemini-1.5-flash").strip()
    url = _gemini_endpoint(model)

    system_instruction = (
        "You are a helpful financial assistant. Reply in 2-3 concise sentences. "
        "Focus on key points only."
    )
    enhanced = f"{system_instruction}\n\nUser question: {prompt}"

    payload = {
        "contents": [
            {"parts": [{"text": enhanced}]}
        ],
        "generationConfig": {
            "maxOutputTokens": 150,
            "temperature": 0.7,
            "topP": 0.8,
            "topK": 20
        }
    }

    timeout = httpx.Timeout(20.0)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(url, params={"key": api_key}, json=payload)

        if resp.status_code != 200:
            detail = resp.text
            try:
                j = resp.json()
                detail = j.get("error", {}).get("message", detail)
            except Exception:
                pass
            # Important: include model & endpoint in error for debugging
            raise HTTPException(
                status_code=resp.status_code, 
                detail=f"Gemini error ({model}): {detail}"
            )

        data = resp.json()

        # Robust parsing for Gemini REST:
        # Typical shape: { "candidates": [ { "content": { "parts": [ {"text": "..."} ] } } ] }
        text = ""
        try:
            candidates = data.get("candidates", [])
            if candidates:
                content = candidates[0].get("content", {})
                parts = content.get("parts", [])
                text = "".join(p.get("text", "") for p in parts if isinstance(p, dict))
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            print(f"Response data: {data}")

        return text or "I couldn't generate a response."
    
    except HTTPException:
        # Re-raise HTTPException as-is
        raise
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=500, 
            detail="Gemini API request timed out after 20 seconds"
        )
    except httpx.RequestError as e:
        error_msg = str(e) if str(e) else "Network connection error"
        raise HTTPException(
            status_code=500, 
            detail=f"Network error connecting to Gemini API: {error_msg}"
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Unexpected error in _forward_to_gemini: {error_trace}")
        error_msg = str(e) if str(e) else f"{type(e).__name__} occurred"
        raise HTTPException(
            status_code=500, 
            detail=f"Unexpected error calling Gemini API: {error_msg}"
        )


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


