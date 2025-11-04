from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Famfinity API",
    description="Financial intelligence application API",
    version="1.0.0"
)

# Configure CORS
# Get allowed origins from environment variable or use defaults
frontend_url = os.getenv("FRONTEND_URL", "")
allowed_origins = [
    "http://localhost:3000", 
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
]

# Add production frontend URL if provided
if frontend_url:
    allowed_origins.append(frontend_url)
    # Also add without trailing slash if present
    if frontend_url.endswith("/"):
        allowed_origins.append(frontend_url.rstrip("/"))
    else:
        allowed_origins.append(f"{frontend_url}/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Famfinity API is running"}

# Import and include routers
from routes import auth, questions, upload, finance, debug
from routes import advisor as advisor_routes
from routes import chat_proxy as chat_routes
from routes import budgets, expenses, goals, investments

app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(questions.router, prefix="/questions", tags=["onboarding"])
app.include_router(upload.router, prefix="/upload", tags=["csv-upload"])
app.include_router(finance.router, prefix="/finance", tags=["finance"])
app.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
app.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
app.include_router(goals.router, prefix="/goals", tags=["goals"])
app.include_router(investments.router, prefix="/investments", tags=["investments"])

# Optional: Predict router (requires PyTorch - comment out if not installed)
try:
    from routes import predict
    if predict is not None and hasattr(predict, 'router'):
        app.include_router(predict.router, tags=["predict"])
        logger.info("Predict router loaded successfully")
    else:
        logger.warning("Predict router not available (PyTorch may not be installed)")
except (ImportError, AttributeError) as e:
    logger.warning(f"Predict router not available (PyTorch may not be installed): {e}")

app.include_router(advisor_routes.router, tags=["advisor"])
app.include_router(chat_routes.router, tags=["chat"])
app.include_router(debug.router, prefix="/debug", tags=["debug"])

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("Famfinity API starting up...")
    logger.info("Using Supabase API for all database operations")
    
    # Verify Supabase configuration
    try:
        from supabase_client import get_server_client
        # Test that we can create a client (doesn't make network call)
        client = get_server_client()
        logger.info("Supabase client initialized successfully")
    except Exception as e:
        logger.warning(f"Supabase client initialization issue: {e}")
        logger.warning("Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in environment")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
