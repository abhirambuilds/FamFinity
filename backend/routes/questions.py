from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import uuid
from datetime import datetime

from routes.auth import get_current_user
from supabase_client import get_server_client

router = APIRouter()

# Request/Response Models
class QuestionAnswer(BaseModel):
    q_id: int
    answer: str

class QuestionsSubmitRequest(BaseModel):
    answers: List[QuestionAnswer]

class QuestionsSubmitResponse(BaseModel):
    success: bool
    message: str
    questions_saved: int

@router.post("/submit", response_model=QuestionsSubmitResponse)
async def submit_questions(
    request: QuestionsSubmitRequest, 
    current_user = Depends(get_current_user)
):
    """
    Submit 15 onboarding questions for a user
    """
    try:
        # Validate that we have exactly 15 answers
        if len(request.answers) != 15:
            raise HTTPException(
                status_code=400, 
                detail="Exactly 15 questions must be answered"
            )
        
        # Validate question IDs are 1-15
        expected_q_ids = set(range(1, 16))
        provided_q_ids = {answer.q_id for answer in request.answers}
        
        if expected_q_ids != provided_q_ids:
            raise HTTPException(
                status_code=400,
                detail="Question IDs must be 1-15"
            )
        
        user_id = str(current_user.id)
        
        sb = get_server_client()
        # Delete existing answers
        sb.table('user_questions').delete().eq('user_id', user_id).execute()
        # Insert new answers
        rows = [
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "q_id": ans.q_id,
                "answer": ans.answer,
                "created_at": datetime.utcnow().isoformat()
            }
            for ans in request.answers
        ]
        res = sb.table('user_questions').insert(rows).execute()
        if getattr(res, 'error', None):
            raise HTTPException(status_code=500, detail="Failed to save questions")
        questions_saved = len(rows)
        
        return QuestionsSubmitResponse(
            success=True,
            message="Questions submitted successfully",
            questions_saved=questions_saved
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_user_questions(current_user = Depends(get_current_user)):
    """
    Get all questions answered by a user
    """
    try:
        user_id = str(current_user.id)
        
        sb = get_server_client()
        res = sb.table('user_questions').select('q_id, answer, created_at').eq('user_id', user_id).order('q_id').execute()
        data = getattr(res, 'data', []) or []
        
        return {
            "user_id": user_id,
            "questions": [
                {
                    "q_id": int(q.get('q_id')),
                    "answer": q.get('answer'),
                    "created_at": q.get('created_at')
                }
                for q in data
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
