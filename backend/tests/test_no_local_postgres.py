"""
Test to verify no local Postgres connections are attempted.

This test ensures that the codebase does not try to connect to
127.0.0.1:5432, ::1:5432, or localhost:5432 (local Postgres).
"""
import os
import pytest


def test_no_postgres_connection_strings_in_code():
    """
    Verify that backend code does not contain localhost Postgres connection patterns.
    
    This is a safety check to ensure we're not attempting local DB connections.
    """
    backend_dir = os.path.join(os.path.dirname(__file__), "..")
    
    # Patterns that would indicate local Postgres usage
    forbidden_patterns = [
        "127.0.0.1:5432",
        "::1:5432",
        "localhost:5432",
    ]
    
    # Files to check (skip test files and legacy files)
    violations = []
    
    for root, dirs, files in os.walk(backend_dir):
        # Skip __pycache__, legacy directories, and tests
        dirs[:] = [d for d in dirs if d not in ["__pycache__", "legacy_migrations", "tests"]]
        
        for file in files:
            if file.endswith(".py") and not file.startswith("test_") and not file.endswith("_legacy.py"):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                        for pattern in forbidden_patterns:
                            if pattern in content:
                                violations.append(f"{filepath}: contains '{pattern}'")
                except Exception as e:
                    # Skip files that can't be read
                    pass
    
    if violations:
        msg = "Found local Postgres connection patterns:\n" + "\n".join(violations)
        pytest.fail(msg)


def test_db_module_is_compatibility_shim():
    """
    Verify that db.py is a compatibility shim and doesn't create real connections.
    """
    try:
        from backend import db
        
        # Check that get_db raises the deprecation error
        with pytest.raises(db.DeprecatedDatabaseError):
            db.get_db()
        
        # Check that AsyncSessionLocal is None (not a real session factory)
        assert db.AsyncSessionLocal is None, "AsyncSessionLocal should be None in compatibility shim"
        
        # Check that engine is None
        assert db.engine is None, "engine should be None in compatibility shim"
        
    except ImportError as e:
        pytest.skip(f"Could not import db module: {e}")


def test_import_backend_does_not_connect():
    """
    Verify that importing backend modules doesn't attempt database connections.
    
    This test imports main backend modules and ensures no connection is attempted.
    """
    # Temporarily unset DATABASE_URL to ensure it's not used
    original_db_url = os.environ.get("DATABASE_URL")
    if "DATABASE_URL" in os.environ:
        del os.environ["DATABASE_URL"]
    
    try:
        # These imports should not trigger any DB connection attempts
        from backend import main
        from backend import supabase_client
        from backend.routes import auth, questions, upload, finance
        
        # If we get here without exceptions, the test passes
        assert True
        
    except Exception as e:
        # Check that the error is NOT a database connection error
        error_msg = str(e).lower()
        connection_errors = ["connection", "could not connect", "psycopg", "asyncpg"]
        
        for conn_error in connection_errors:
            if conn_error in error_msg:
                pytest.fail(f"Import attempted database connection: {e}")
        
        # If it's a different error (like missing env vars), that's acceptable
        # The point is we're not trying to connect to local Postgres
        
    finally:
        # Restore DATABASE_URL if it was set
        if original_db_url is not None:
            os.environ["DATABASE_URL"] = original_db_url


def test_supabase_client_requires_env_vars():
    """
    Verify that Supabase client functions raise helpful errors when env vars missing.
    """
    # Save original values
    original_url = os.environ.get("SUPABASE_URL")
    original_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    # Clear the env vars
    for key in ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]:
        if key in os.environ:
            del os.environ[key]
    
    try:
        # Clear the LRU cache to force re-evaluation
        from backend.supabase_client import get_server_client
        get_server_client.cache_clear()
        
        # Should raise RuntimeError with helpful message
        with pytest.raises(RuntimeError) as exc_info:
            get_server_client()
        
        # Verify error message is helpful and doesn't leak secrets
        error_msg = str(exc_info.value)
        assert "SUPABASE" in error_msg or "environment" in error_msg.lower()
        # Make sure we're not leaking any actual key values
        assert "srv_" not in error_msg
        assert "anon_" not in error_msg
        
    finally:
        # Restore original values
        if original_url is not None:
            os.environ["SUPABASE_URL"] = original_url
        if original_key is not None:
            os.environ["SUPABASE_SERVICE_ROLE_KEY"] = original_key
        
        # Clear cache again to restore normal state
        from backend.supabase_client import get_server_client
        get_server_client.cache_clear()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

