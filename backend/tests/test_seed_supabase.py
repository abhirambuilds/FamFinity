import os
import pytest


def test_seed_script_runs(monkeypatch):
    # If service role key is not set, xfail
    if not os.getenv('SUPABASE_SERVICE_ROLE_KEY') or not os.getenv('SUPABASE_URL'):
        pytest.xfail('SUPABASE env not set for seed test')

    from backend.scripts.seed_supabase import run_seed
    code = run_seed()
    assert code == 0


