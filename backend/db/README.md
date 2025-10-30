# Database Migrations

This folder contains SQL migration files for setting up the FamFinity database schema in Supabase.

## Migration Files

### `003_complete_schema.sql` ⭐ **USE THIS ONE**
- **Complete schema matching the database diagram**
- Creates all 8 tables: users, transactions, budgets, user_questions, investment_plans, manual_expenses, chats, goals
- Includes indexes for performance
- Sets up Row Level Security (RLS)
- Safe to run multiple times (uses `IF NOT EXISTS`)

### `legacy_migrations/001_init.sql`
- Initial migration (users, user_questions, transactions, goals, chats)
- Kept for reference

### `002_add_budgets_expenses.sql`
- Adds budgets, manual_expenses, and investment_plans tables
- Kept for reference

### `supabase_policies.sql`
- RLS policies for all tables
- **Note**: Policy syntax may need adjustment based on your auth setup

## How to Apply

### Option 1: Supabase SQL Editor (Recommended)
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `003_complete_schema.sql`
5. Click **Run**

### Option 2: Command Line (if you have psql access)
```bash
psql <your-connection-string> < 003_complete_schema.sql
```

## Schema Overview

```
users (1) ──┬──> transactions (many)
            ├──> budgets (many)
            ├──> user_questions (many)
            ├──> investment_plans (many)
            ├──> manual_expenses (many)
            ├──> chats (many)
            └──> goals (many)
```

All tables use UUID primary keys and have `created_at` timestamps. Foreign keys use `ON DELETE CASCADE` to automatically remove related records when a user is deleted.

## Important Notes

1. **RLS Policies**: The migration sets `FOR ALL USING (true)` which allows service role full access. If you're using Supabase Auth with `auth.uid()`, you'll need to update policies like:
   ```sql
   CREATE POLICY "users_can_access_own_transactions" ON transactions
     FOR ALL USING (auth.uid()::text = user_id::text);
   ```

2. **Nullability**: The schema matches the diagram which shows some fields as nullable. Adjust `NOT NULL` constraints in the migration if your business logic requires them.

3. **Data Types**: 
   - UUID for all primary keys
   - NUMERIC for monetary values (no precision specified in diagram)
   - TEXT for strings
   - JSONB for flexible metadata
   - TIMESTAMPTZ for timestamps

## Verification

After running the migration, verify the schema:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check foreign keys
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

