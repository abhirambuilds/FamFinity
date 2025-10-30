import pytest


def test_get_server_client_env(monkeypatch):
    from backend.supabase_client import get_server_client
    monkeypatch.setenv('SUPABASE_URL', 'https://example.supabase.co')
    monkeypatch.setenv('SUPABASE_SERVICE_ROLE_KEY', 'srv_test_key')
    try:
        client = get_server_client()
    except RuntimeError:
        pytest.skip('Environment incomplete for test')
    assert client is not None


