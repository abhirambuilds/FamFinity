"""
Compatibility shim for legacy code that imported db.py.

All database operations now use Supabase API via backend.supabase_client.
Local Postgres connections have been removed.
"""
import logging

logger = logging.getLogger(__name__)


class DeprecatedDatabaseError(RuntimeError):
    """Raised when legacy database functions are called."""
    pass


def get_db():
    """Deprecated: Use backend.supabase_client.get_server_client() instead."""
    raise DeprecatedDatabaseError(
        "Local Postgres removed. Use backend.supabase_client.get_server_client() for database operations."
    )


async def init_db():
    """Deprecated: Migrations are now reference-only."""
    logger.warning(
        "init_db() is deprecated. Migrations are in backend/db/legacy_migrations/ for reference only. "
        "Runtime uses Supabase API exclusively."
    )
    # No-op instead of error to allow safe startup


async def test_connection():
    """Deprecated: No local Postgres connection to test."""
    logger.warning(
        "test_connection() is deprecated. No local Postgres connection. "
        "Use backend.supabase_client.get_server_client() to verify Supabase connectivity."
    )
    # Return True to allow startup checks to pass
    return True


def run_migration(migration_file: str):
    """Deprecated: Migrations are now reference-only."""
    raise DeprecatedDatabaseError(
        "run_migration() is deprecated. Migrations in backend/db/legacy_migrations/ are for reference only. "
        "Apply them manually via psql if needed."
    )


# Export deprecated symbols for backwards compatibility
AsyncSessionLocal = None
engine = None
DATABASE_URL = None

logger.info("db.py loaded as compatibility shim. Use backend.supabase_client for all database operations.")
