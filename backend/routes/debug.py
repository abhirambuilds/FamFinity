"""Debug endpoints to test Supabase connectivity and permissions"""
from fastapi import APIRouter, HTTPException
from supabase_client import get_server_client
import uuid
from datetime import datetime

router = APIRouter()


@router.get("/debug/supabase-test")
async def test_supabase_connection():
    """Test Supabase connection and table access"""
    try:
        sb = get_server_client()
        
        # Test 1: Connection
        response = {"tests": {}}
        
        # Test 2: Read from users table
        try:
            users_result = sb.table("users").select("id").limit(1).execute()
            response["tests"]["read_users"] = {
                "status": "PASS",
                "count": len(users_result.data) if users_result.data else 0
            }
        except Exception as e:
            response["tests"]["read_users"] = {
                "status": "FAIL",
                "error": str(e)
            }
        
        # Test 3: Try to insert a test user
        test_user_id = str(uuid.uuid4())
        test_user = {
            "id": test_user_id,
            "email": f"test_{datetime.utcnow().timestamp()}@example.com",
            "name": "Test User",
            "password_hash": "test_hash",
            "created_at": datetime.utcnow().isoformat()
        }
        
        try:
            insert_result = sb.table("users").insert(test_user).execute()
            
            if insert_result.data:
                response["tests"]["insert_user"] = {
                    "status": "PASS",
                    "inserted_id": test_user_id,
                    "data": insert_result.data
                }
                
                # Clean up test user
                sb.table("users").delete().eq("id", test_user_id).execute()
            else:
                response["tests"]["insert_user"] = {
                    "status": "FAIL",
                    "error": "No data returned",
                    "result": str(insert_result)
                }
        except Exception as e:
            response["tests"]["insert_user"] = {
                "status": "FAIL",
                "error": str(e),
                "error_type": type(e).__name__
            }
        
        # Overall status
        all_pass = all(
            test.get("status") == "PASS" 
            for test in response["tests"].values()
        )
        
        response["overall_status"] = "PASS" if all_pass else "FAIL"
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Supabase test failed: {str(e)}"
        )


@router.get("/debug/list-users")
async def list_users():
    """List all users (for debugging)"""
    try:
        sb = get_server_client()
        result = sb.table("users").select("id, email, name, created_at").execute()
        
        return {
            "count": len(result.data) if result.data else 0,
            "users": result.data or []
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list users: {str(e)}"
        )

