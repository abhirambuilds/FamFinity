import os
import sys
import json
import uuid
import time
from typing import Any, Dict, List, Tuple

# Ensure project root (the directory that contains `backend`) is on sys.path
CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.normpath(os.path.join(CURRENT_DIR, "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from dotenv import load_dotenv
import pandas as pd

from backend.supabase_client import get_server_client
from backend.auth_utils import get_password_hash


def _fail_early_if_env_missing() -> None:
    # Never print secrets
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not key:
        missing = []
        if not url:
            missing.append("SUPABASE_URL")
        if not key:
            missing.append("SUPABASE_SERVICE_ROLE_KEY")
        msg = "Missing required env: " + ", ".join(missing) + ". Set them in your environment or .env."
        print(msg)
        sys.exit(2)


def _read_csv_rows() -> List[Dict[str, Any]]:
    data_path = os.path.normpath(os.path.join(PROJECT_ROOT, "data", "sample_user.csv"))
    df = pd.read_csv(data_path)
    rows: List[Dict[str, Any]] = []
    # Expected columns: date, amount, category, description (others ignored)
    for _, r in df.iterrows():
        rows.append({
            "date": str(r.get("date")),
            "amount": float(r.get("amount", 0)),
            "category": str(r.get("category", "other")),
            "metadata": json.dumps({"description": r.get("description", "seed")}),
        })
    return rows


def _sample_answers() -> List[Tuple[int, str]]:
    # Minimal 15 onboarding answers
    base = [
        (1, "Household of 3"),
        (2, "Monthly income ~5000"),
        (3, "Goal: emergency fund"),
        (4, "Spending tracker: weekly"),
        (5, "Debt: low"),
        (6, "Risk level: 3"),
        (7, "Savings rate: 12%"),
        (8, "Budget style: 50/30/20"),
        (9, "Major expense: rent"),
        (10, "Transport: car"),
        (11, "Dining: 2x week"),
        (12, "Groceries: planned"),
        (13, "Utilities: stable"),
        (14, "Subscriptions: some"),
        (15, "Investing: beginner"),
    ]
    return base


def _insert_with_retries(supabase, table: str, payload: List[Dict[str, Any]], max_retries: int = 3) -> int:
    if not payload:
        return 0
    attempt = 0
    last_err: Exception | None = None
    while attempt < max_retries:
        try:
            resp = supabase.table(table).insert(payload).execute()
            # Supabase-py returns data and count not always present; derive count from payload on success
            if getattr(resp, "data", None) is None and getattr(resp, "error", None) is not None:
                raise RuntimeError(str(resp.error))
            return len(payload)
        except Exception as e:
            last_err = e
            # Basic backoff for rate limits
            time.sleep(0.5 * (attempt + 1))
            attempt += 1
    if last_err:
        raise last_err
    return 0


def run_seed() -> int:
    load_dotenv()
    _fail_early_if_env_missing()

    supabase = get_server_client()

    # 1) Insert demo user (delete existing first to allow re-seeding)
    demo_email = "demo.user@example.com"
    
    # Delete existing demo user and related data if present
    try:
        # First, get existing user_id if it exists
        existing = supabase.table("users").select("id").eq("email", demo_email).execute()
        if existing.data and len(existing.data) > 0:
            old_user_id = existing.data[0]["id"]
            # Delete related data first (foreign key constraints)
            supabase.table("user_questions").delete().eq("user_id", old_user_id).execute()
            supabase.table("transactions").delete().eq("user_id", old_user_id).execute()
            supabase.table("goals").delete().eq("user_id", old_user_id).execute()
            # Delete user
            supabase.table("users").delete().eq("email", demo_email).execute()
    except:
        pass  # Ignore errors if user doesn't exist
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": demo_email,
        "name": "Demo User",
        "password_hash": get_password_hash("demo123"),
    }
    users_inserted = _insert_with_retries(supabase, "users", [user])

    # 2) Insert onboarding answers
    q_payload = [{
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "q_id": qid,
        "answer": ans,
    } for (qid, ans) in _sample_answers()]
    questions_inserted = _insert_with_retries(supabase, "user_questions", q_payload)

    # 3) Insert transactions from CSV
    csv_rows = _read_csv_rows()
    t_payload = [{
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "date": r["date"],
        "amount": r["amount"],
        "category": r["category"],
        "metadata": r["metadata"],
    } for r in csv_rows]
    # Chunking (simple)
    tx_inserted = 0
    chunk_size = 500
    for i in range(0, len(t_payload), chunk_size):
        tx_inserted += _insert_with_retries(supabase, "transactions", t_payload[i:i+chunk_size])

    # 4) Insert one demo goal
    goal = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": "Emergency Fund (3 months)",
        "price": 6000.00,
        "deadline": None,
    }
    goals_inserted = _insert_with_retries(supabase, "goals", [goal])

    # Summary (no secrets)
    print(f"Seed complete: users={users_inserted}, questions={questions_inserted}, transactions={tx_inserted}, goals={goals_inserted}")
    return 0


if __name__ == "__main__":
    try:
        code = run_seed()
        sys.exit(code)
    except SystemExit as e:
        raise
    except Exception as e:
        # Helpful, but do not include secrets
        print(f"Seed failed: {e}")
        sys.exit(1)


