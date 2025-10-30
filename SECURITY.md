# Security Notes

- Never commit or expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend or logs.
- Rotate keys periodically and on any suspected leak.
- Enable Row Level Security (RLS) and define policies for user-owned data.
- Verify uploads and admin actions on the server using the service-role key.
- Prefer short-lived tokens on the client; do not store secrets in localStorage in production.


