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
        
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=f"Failed to list models: {r.text}")
        
        if r.headers.get("content-type", "").startswith("application/json"):
            data = r.json()
            # Extract models that support generateContent
            models_info = []
            if "models" in data:
                for model in data["models"]:
                    name = model.get("name", "")
                    supported_methods = model.get("supportedGenerationMethods", [])
                    if "generateContent" in supported_methods:
                        # Extract model name from full path (e.g., "models/gemini-1.5-flash" from "models/gemini-1.5-flash")
                        short_name = name.replace("models/", "") if name.startswith("models/") else name
                        models_info.append({
                            "name": name,
                            "short_name": short_name,
                            "display_name": model.get("displayName", ""),
                            "supported_methods": supported_methods
                        })
            
            return {
                "status": r.status_code,
                "available_models_for_generateContent": models_info,
                "full_response": data
            }
        else:
            return {"status": r.status_code, "body": r.text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")


async def _forward_to_gemini(prompt: str) -> str:
    """Forward prompt to Gemini API with robust error handling and parsing."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return "AI is unavailable: missing GEMINI_API_KEY."

    # Allow override via env; default to a known-good model
    # Available models vary by API key - try: gemini-2.0-flash-lite, gemini-1.5-flash, gemini-1.5-pro, gemini-pro
    # Model name should include 'models/' prefix for the endpoint URL
    default_model = os.getenv("GEMINI_MODEL", "").strip()
    
    # Fallback models to try if default fails (in order of preference)
    fallback_models = [
        "models/gemini-2.0-flash-lite",
        "models/gemini-1.5-flash", 
        "models/gemini-1.5-pro",
        "models/gemini-pro"
    ]
    
    # If GEMINI_MODEL is set, use it; otherwise try fallbacks
    models_to_try = [default_model] if default_model else fallback_models
    
    last_error = None
    for model in models_to_try:
        url = _gemini_endpoint(model)
        print(f"Trying Gemini model: {model}, endpoint: {url}")
        
        # Try this model - if it works, return the result; if not, try next
        try:
            result = await _try_gemini_request(api_key, model, url, prompt)
            if result:  # None means empty response, try next model
                return result
            else:
                print(f"Model {model} returned empty response, trying next...")
                continue
        except HTTPException as e:
            # If it's a model not found error, try next model
            if "not found" in str(e.detail).lower() or "not supported" in str(e.detail).lower():
                print(f"Model {model} not available, trying next...")
                last_error = e
                continue
            # For other errors, re-raise immediately
            raise
    
    # If all models failed, return helpful error
    if last_error:
        error_msg = str(last_error.detail)
        if "not found" in error_msg.lower():
            error_msg += " Use GET /ai/models to see available models for your API key."
        raise HTTPException(status_code=500, detail=error_msg)
    
    raise HTTPException(status_code=500, detail="Failed to connect to Gemini API with any available model.")


async def _try_gemini_request(api_key: str, model: str, url: str, prompt: str) -> str:
    """Try a single Gemini API request with the given model."""

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
                # If model not found, suggest checking available models
                if "not found" in detail.lower() or "not supported" in detail.lower():
                    detail += " Use GET /ai/models to see available models for your API key."
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
            if not candidates:
                # Check if there's a promptFeedback indicating why response was blocked
                prompt_feedback = data.get("promptFeedback", {})
                if prompt_feedback:
                    block_reason = prompt_feedback.get("blockReason", "")
                    safety_ratings = prompt_feedback.get("safetyRatings", [])
                    if block_reason or safety_ratings:
                        print(f"Gemini response blocked. Reason: {block_reason}, Safety ratings: {safety_ratings}")
                        # Safety filter blocking is content-related, not model-related, so return error message
                        raise HTTPException(
                            status_code=400,
                            detail="I apologize, but I couldn't generate a response due to content safety filters. Please try rephrasing your question."
                        )
                
                print(f"No candidates in Gemini response. Full response: {data}")
                # Empty response - try next model
                return None
            
            # Check first candidate for blocking/finish reasons
            candidate = candidates[0]
            finish_reason = candidate.get("finishReason", "")
            
            # Check if blocked by safety filters
            if finish_reason == "SAFETY":
                safety_ratings = candidate.get("safetyRatings", [])
                print(f"Response blocked by safety filters: {safety_ratings}")
                # Safety filter blocking is content-related, not model-related, so raise error
                raise HTTPException(
                    status_code=400,
                    detail="I apologize, but I couldn't generate a response due to content safety filters. Please try rephrasing your question."
                )
            
            # Check for other finish reasons that might indicate blocking
            if finish_reason and finish_reason != "STOP":
                print(f"Unexpected finish reason: {finish_reason}")
                # Still try to extract text if available
            
            # Extract text content
            content = candidate.get("content", {})
            parts = content.get("parts", [])
            text = "".join(p.get("text", "") for p in parts if isinstance(p, dict))
            
            if not text:
                print(f"No text in Gemini response. Finish reason: {finish_reason}, Candidate: {candidate}")
                
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            print(f"Response data: {data}")
            import traceback
            print(traceback.format_exc())

        if not text:
            # Return None to indicate this model didn't work, so we can try another
            return None
        
        return text
    
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
        print(f"Unexpected error in _try_gemini_request: {error_trace}")
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


