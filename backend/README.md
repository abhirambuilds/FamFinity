### Supabase Auth Middleware

This project includes minimal scaffolding for Supabase-based auth. The file `backend/middleware/auth.py` contains a placeholder dependency `get_supabase_user` which should verify a Bearer JWT issued by Supabase and return the `user_id`. For now it returns 501 to avoid insecure assumptions. Continue using existing backend JWTs or complete the integration by calling the Supabase auth endpoint.


## Environment

Add a `.env` with required values (see `env.example`):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` (for `/chat` proxy)
- `USE_LOCAL_LLM` (optional, `true` to enable local LLM hook in advisor)


## Routes

- `/health` — health check
- `/auth/*` — authentication
- `/questions/*` — onboarding questions
- `/upload` — CSV upload
- `/finance/*` — finance aggregations
- `/predict/*` — forecast and recommendations
- `/advisor` — advisor generator (local, explainable JSON)
- `/chat` — Gemini proxy when query is routed to chat

### Routing

Keyword-based deterministic router in `utils/router.py`:

- Finance Assistant if the query contains any of: `how much`, `save`, `spend`, `budget`, `predict`, `graph`.
- Otherwise routes to `/chat` (Gemini proxy).
