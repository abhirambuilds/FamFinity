#!/usr/bin/env python3
"""
Diagnose why signup is not saving users to Supabase

This script tests:
1. Supabase connection
2. Service role key permissions
3. Table existence and structure
4. RLS policies
5. Insert permissions
"""
import os
import sys
from pathlib import Path

# Add backend to path
SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from dotenv import load_dotenv
load_dotenv(REPO_ROOT / ".env")

from supabase_client import get_server_client
import uuid
from datetime import datetime


def test_connection():
    """Test basic Supabase connection"""
    print("\n1️⃣  Testing Supabase Connection...")
    try:
        sb = get_server_client()
        print("   ✅ Successfully created Supabase client")
        return sb
    except Exception as e:
        print(f"   ❌ Failed to create client: {e}")
        return None


def test_table_structure(sb):
    """Test users table structure"""
    print("\n2️⃣  Testing 'users' Table Structure...")
    try:
        # Try to read with select
        result = sb.table("users").select("*").limit(1).execute()
        print(f"   ✅ Can read from users table")
        print(f"   📊 Current user count: {len(result.data) if result.data else 0}")
        
        if result.data and len(result.data) > 0:
            print(f"   📋 Table columns: {list(result.data[0].keys())}")
        
        return True
    except Exception as e:
        print(f"   ❌ Cannot read users table: {e}")
        return False


def test_rls_policies(sb):
    """Check if RLS is blocking inserts"""
    print("\n3️⃣  Testing Row Level Security (RLS)...")
    
    # Try a test insert
    test_user = {
        "id": str(uuid.uuid4()),
        "email": f"test_{datetime.utcnow().timestamp()}@example.com",
        "name": "RLS Test User",
        "password_hash": "test_hash_123",
        "created_at": datetime.utcnow().isoformat()
    }
    
    try:
        result = sb.table("users").insert(test_user).execute()
        
        if result.data:
            print(f"   ✅ Successfully inserted test user")
            print(f"   📝 Inserted user: {result.data}")
            
            # Clean up
            sb.table("users").delete().eq("id", test_user["id"]).execute()
            print(f"   🧹 Cleaned up test user")
            return True
        else:
            print(f"   ❌ Insert returned no data")
            print(f"   📋 Result: {result}")
            return False
            
    except Exception as e:
        print(f"   ❌ Insert failed: {e}")
        print(f"\n   💡 POSSIBLE CAUSE:")
        print(f"      - RLS (Row Level Security) might be enabled on users table")
        print(f"      - Service role key might not have bypass RLS permissions")
        print(f"      - Check Supabase dashboard → Authentication → Policies")
        return False


def test_service_role_key():
    """Verify service role key is being used"""
    print("\n4️⃣  Checking Service Role Key...")
    
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    if not service_key:
        print("   ❌ SUPABASE_SERVICE_ROLE_KEY not set!")
        return False
    
    # Service role keys typically start with 'eyJ' (JWT)
    if service_key.startswith("eyJ"):
        print(f"   ✅ Service role key format looks correct")
        print(f"   🔑 Key prefix: {service_key[:20]}...")
        
        # Check if it's actually the anon key by mistake
        anon_key = os.getenv("SUPABASE_ANON_KEY", "")
        if service_key == anon_key:
            print(f"   ⚠️  WARNING: Service role key matches anon key!")
            print(f"      This might cause permission issues.")
            return False
        
        return True
    else:
        print(f"   ⚠️  Service role key format seems unusual")
        return True


def list_existing_users(sb):
    """List current users in the database"""
    print("\n5️⃣  Listing Existing Users...")
    try:
        result = sb.table("users").select("id, email, name, created_at").execute()
        
        if result.data and len(result.data) > 0:
            print(f"   📊 Found {len(result.data)} users:")
            for user in result.data[:5]:  # Show first 5
                print(f"      - {user.get('email')} (ID: {user.get('id')[:8]}...)")
        else:
            print(f"   📭 No users in database yet")
            print(f"      This is normal for a fresh setup")
        
        return True
    except Exception as e:
        print(f"   ❌ Failed to list users: {e}")
        return False


def check_supabase_dashboard_settings():
    """Provide guidance on Supabase dashboard settings"""
    print("\n6️⃣  Supabase Dashboard Checklist...")
    print("""
   Please verify in your Supabase dashboard:
   
   ✓ Database → Tables → users table exists
   ✓ Table has columns: id, email, name, password_hash, created_at
   ✓ Authentication → Policies:
     - Check if RLS is enabled on 'users' table
     - If yes, ensure service role can bypass RLS
   ✓ Settings → API:
     - Confirm service_role key is correct
     - Confirm URL is correct
   
   Dashboard URL: https://app.supabase.com/project/{your-project-id}
   """)


def main():
    """Run all diagnostics"""
    print("=" * 70)
    print("🔍 FamFinity Signup Issue Diagnostic Tool")
    print("=" * 70)
    
    # Test 1: Connection
    sb = test_connection()
    if not sb:
        print("\n❌ Cannot proceed - fix connection first")
        return 1
    
    # Test 2: Service role key
    key_ok = test_service_role_key()
    
    # Test 3: Table structure
    table_ok = test_table_structure(sb)
    
    # Test 4: List users
    if table_ok:
        list_existing_users(sb)
    
    # Test 5: RLS and insert
    insert_ok = test_rls_policies(sb)
    
    # Test 6: Dashboard checklist
    check_supabase_dashboard_settings()
    
    # Summary
    print("\n" + "=" * 70)
    print("📋 DIAGNOSTIC SUMMARY")
    print("=" * 70)
    
    all_checks = {
        "Supabase Connection": sb is not None,
        "Service Role Key": key_ok,
        "Users Table Access": table_ok,
        "Insert Permission": insert_ok
    }
    
    for check, status in all_checks.items():
        icon = "✅" if status else "❌"
        print(f"{icon} {check}")
    
    if all(all_checks.values()):
        print("\n🎉 All checks passed! The system should be working.")
        print("   If signup still fails, check backend logs for errors.")
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above.")
        print("\n💡 MOST COMMON ISSUES:")
        print("   1. RLS enabled on users table → Disable or add policy for service role")
        print("   2. Using anon key instead of service role key")
        print("   3. Incorrect Supabase URL or key in .env")
    
    print("=" * 70)
    
    return 0 if all(all_checks.values()) else 1


if __name__ == "__main__":
    sys.exit(main())

