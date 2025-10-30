"""
LEGACY TEST FILE - archived for reference only.
These tests used local Postgres connections via SQLAlchemy.

Modern tests should mock backend.supabase_client instead.
"""
import pytest

# Legacy imports kept for reference
# from sqlalchemy.ext.asyncio import AsyncSession
# from db import get_db, AsyncSessionLocal


def test_legacy_notice():
    """This test suite is deprecated."""
    print("Legacy test file. Tests now use Supabase mocks.")
    print("See test_supabase_client.py for Supabase-based tests.")


if __name__ == "__main__":
    test_legacy_notice()

