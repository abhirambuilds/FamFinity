from fastapi import Depends, Header, HTTPException
from typing import Optional
from supabase import Client
from ..backend import supabase_client as sc  # relative import safety in package layout


async def get_supabase_user(authorization: Optional[str] = Header(None)) -> str:
    """Validate Bearer token via Supabase and return user_id (UUID as string).

    Minimal implementation: for now, accept a JWT and rely on Supabase auth API
    by creating an anon client and setting the auth header on requests that need it.
    In a production setup, you'd verify JWT locally or call the auth v1 endpoint.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.split(" ", 1)[1].strip()
    # A minimal approach: just return the token's user id is not directly available without decoding.
    # For now we require backend-issued tokens (existing flow) or accept a user id header override in dev.
    # TODO: Integrate Supabase JWT verification or fetch user via /auth/v1/user endpoint.
    # To keep changes minimal, we fallback to 'X-User-Id' header when present in dev.
    # This keeps routes compatible until full auth migration.
    # If you already use backend JWTs, the existing auth dependency can still be used.
    raise HTTPException(status_code=501, detail="Supabase auth verification not fully implemented yet")


