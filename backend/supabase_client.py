import os
from functools import lru_cache
from typing import Any

from supabase import create_client, Client


def _get_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


@lru_cache(maxsize=1)
def get_server_client() -> Client:
    """Return Supabase client using service role key (server-only)."""
    url = _get_env("SUPABASE_URL")
    key = _get_env("SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)


@lru_cache(maxsize=1)
def get_anon_client() -> Client:
    """Return Supabase client using anon key (limited, for dev/testing)."""
    url = _get_env("SUPABASE_URL")
    key = _get_env("SUPABASE_ANON_KEY")
    return create_client(url, key)


