from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime, date
import re

from supabase_client import get_server_client
from auth_utils import get_password_hash, verify_password, create_access_token, verify_token

router = APIRouter()

# Request/Response Models
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        # Check byte length for bcrypt 72-byte limit
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password is too long. Maximum 72 bytes (approximately 24-72 characters depending on characters used)')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Full name must be at least 2 characters long')
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123",
                "full_name": "John Doe"
            }
        }

class SigninRequest(BaseModel):
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }

class AuthResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[str] = None
    access_token: Optional[str] = None
    onboarding_complete: Optional[bool] = False

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime
    onboarding_complete: bool

@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """
    User registration endpoint
    Creates a new user in the database
    """
    try:
        sb = get_server_client()
        
        # Check if user already exists
        existing = sb.table("users").select("id").eq("email", request.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create new user with hashed password
        user_id = str(uuid.uuid4())
        
        # Hash the password (truncation is handled inside get_password_hash if needed)
        # The Pydantic validator already checks password length
        password_hash = get_password_hash(request.password)
        
        new_user = {
            "id": user_id,
            "email": request.email,
            "name": request.full_name,
            "password_hash": password_hash,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = sb.table("users").insert(new_user).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id})
        
        return AuthResponse(
            success=True,
            message="User registered successfully",
            user_id=user_id,
            access_token=access_token,
            onboarding_complete=False  # New users haven't completed onboarding
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/signin", response_model=AuthResponse)
async def signin(request: SigninRequest):
    """
    User authentication endpoint
    """
    try:
        sb = get_server_client()
        
        # Check if user exists and verify password
        result = sb.table("users").select("id, email, name, password_hash").eq("email", request.email).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user = result.data[0]
        
        if not verify_password(request.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user_id = str(user["id"])
        
        # Check if user has completed onboarding (answered 15 questions)
        questions_result = sb.table("user_questions").select("id").eq("user_id", user_id).execute()
        onboarding_complete = len(questions_result.data) >= 15 if questions_result.data else False
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id})
        
        return AuthResponse(
            success=True,
            message="User authenticated successfully",
            user_id=user_id,
            access_token=access_token,
            onboarding_complete=onboarding_complete
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

async def get_current_user(authorization: str = Header(None)):
    """Get current user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    # Verify user still exists via Supabase
    sb = get_server_client()
    result = sb.table("users").select("id, email, name, created_at").eq("id", user_id).execute()
    
    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = result.data[0]
    
    # Check onboarding status
    questions_result = sb.table("user_questions").select("id").eq("user_id", user_id).execute()
    onboarding_complete = len(questions_result.data) >= 15 if questions_result.data else False
    
    # Create a simple object with attributes for compatibility
    class UserObject:
        def __init__(self, data, onboarding_complete):
            self.id = data["id"]
            self.email = data["email"]
            self.name = data["name"]
            # Fix datetime parsing for Supabase format
            created_at_str = data["created_at"]
            try:
                # Handle microseconds with different lengths
                if "." in created_at_str and "+" in created_at_str:
                    # Split at the timezone part
                    tz_part = created_at_str[created_at_str.find("+"):]
                    main_part = created_at_str[:created_at_str.find("+")]
                    if "." in main_part:
                        # Ensure microseconds are 6 digits
                        date_part, time_part = main_part.split("T")
                        if "." in time_part:
                            time_base, microsec = time_part.split(".")
                            microsec = microsec.ljust(6, "0")[:6]  # Pad or truncate to 6 digits
                            main_part = f"{date_part}T{time_base}.{microsec}"
                    created_at_str = main_part + tz_part
                elif created_at_str.endswith("Z"):
                    created_at_str = created_at_str.replace("Z", "+00:00")
                
                self.created_at = datetime.fromisoformat(created_at_str)
            except ValueError:
                # If all else fails, use current time
                self.created_at = datetime.utcnow()
            self.onboarding_complete = onboarding_complete
    
    return UserObject(user, onboarding_complete)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Header(None, alias="Authorization")):
    """
    Get current user information including onboarding status
    """
    # Call get_current_user manually
    user = await get_current_user(authorization=current_user)
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        created_at=user.created_at,
        onboarding_complete=user.onboarding_complete
    )

@router.get("/onboarding-status")
async def check_onboarding_status(authorization: str = Header(None, alias="Authorization")):
    """
    Check if user has completed onboarding (all 15 questions)
    """
    try:
        user = await get_current_user(authorization=authorization)
        
        return {
            "user_id": str(user.id),
            "onboarding_complete": user.onboarding_complete,
            "questions_answered": 15 if user.onboarding_complete else 0  # Can be more detailed if needed
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CompleteSignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    questions: List[Dict[str, Any]]  # List of {q_id, answer}
    transactions: List[Dict[str, Any]]  # List of transaction objects

@router.post("/complete-signup", response_model=AuthResponse)
async def complete_signup(request: CompleteSignupRequest):
    """
    Complete user registration after all onboarding steps are done
    Creates user, saves questions, and saves transactions all at once
    """
    try:
        sb = get_server_client()
        
        # Validate password
        if len(request.password) < 8:
            raise HTTPException(status_code=400, detail='Password must be at least 8 characters long')
        if len(request.password.encode('utf-8')) > 72:
            raise HTTPException(status_code=400, detail='Password is too long')
        if not re.search(r'[A-Za-z]', request.password):
            raise HTTPException(status_code=400, detail='Password must contain at least one letter')
        if not re.search(r'\d', request.password):
            raise HTTPException(status_code=400, detail='Password must contain at least one number')
        
        # Validate full name
        if len(request.full_name.strip()) < 2:
            raise HTTPException(status_code=400, detail='Full name must be at least 2 characters long')
        
        # Check if user already exists
        existing = sb.table("users").select("id").eq("email", request.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Validate questions - must have exactly 15
        if len(request.questions) != 15:
            raise HTTPException(status_code=400, detail="Exactly 15 questions must be answered")
        
        # Validate question IDs are 1-15
        expected_q_ids = set(range(1, 16))
        provided_q_ids = {q.get('q_id') for q in request.questions}
        if expected_q_ids != provided_q_ids:
            raise HTTPException(status_code=400, detail="Question IDs must be 1-15")
        
        # Create new user with hashed password
        user_id = str(uuid.uuid4())
        password_hash = get_password_hash(request.password)
        
        new_user = {
            "id": user_id,
            "email": request.email,
            "name": request.full_name.strip(),
            "password_hash": password_hash,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Insert user
        result = sb.table("users").insert(new_user).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        # Prepare questions for insertion
        question_rows = [
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "q_id": q.get('q_id'),
                "answer": str(q.get('answer', '')),
                "created_at": datetime.utcnow().isoformat()
            }
            for q in request.questions
        ]
        
        # Insert questions
        questions_result = sb.table('user_questions').insert(question_rows).execute()
        if getattr(questions_result, 'error', None):
            # If questions fail, try to delete the user
            try:
                sb.table("users").delete().eq("id", user_id).execute()
            except:
                pass
            raise HTTPException(status_code=500, detail="Failed to save questions")
        
        # Prepare transactions for insertion (if any)
        transaction_rows = []
        if request.transactions:
            for t in request.transactions:
                # Ensure date is in correct format
                transaction_date = t.get('date')
                if isinstance(transaction_date, str):
                    # Parse if it's a string
                    try:
                        transaction_date = datetime.strptime(transaction_date, '%Y-%m-%d').date()
                    except:
                        transaction_date = datetime.fromisoformat(transaction_date).date()
                elif isinstance(transaction_date, (datetime, date)):
                    pass  # Already correct type
                else:
                    raise HTTPException(status_code=400, detail=f"Invalid date format in transaction: {transaction_date}")
                
                transaction_rows.append({
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "date": transaction_date.isoformat() if isinstance(transaction_date, date) else transaction_date,
                    "amount": float(t.get('amount', 0)),
                    "category": str(t.get('category', '')),
                    "metadata": t.get('metadata', {}),
                    "created_at": datetime.utcnow().isoformat()
                })
            
            # Insert transactions
            if transaction_rows:
                transactions_result = sb.table('transactions').insert(transaction_rows).execute()
                if getattr(transactions_result, 'error', None):
                    # If transactions fail, clean up user and questions
                    try:
                        sb.table("user_questions").delete().eq("user_id", user_id).execute()
                        sb.table("users").delete().eq("id", user_id).execute()
                    except:
                        pass
                    raise HTTPException(status_code=500, detail="Failed to save transactions")
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id})
        
        return AuthResponse(
            success=True,
            message="Account created successfully with all onboarding data",
            user_id=user_id,
            access_token=access_token,
            onboarding_complete=True  # User has completed all onboarding steps
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
