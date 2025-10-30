-- Example RLS policies. Apply via Supabase SQL Editor or psql.

-- Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_access_own_transactions" ON public.transactions
  USING (auth.uid() = user_id::text);

-- User Questions
ALTER TABLE public.user_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_access_own_questions" ON public.user_questions
  USING (auth.uid() = user_id::text);

-- Goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_access_own_goals" ON public.goals
  USING (auth.uid() = user_id::text);

-- Chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_access_own_chats" ON public.chats
  USING (auth.uid() = user_id::text);

-- Budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_access_own_budgets" ON public.budgets
  USING (auth.uid() = user_id::text);

-- Manual Expenses
ALTER TABLE public.manual_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_access_own_manual_expenses" ON public.manual_expenses
  USING (auth.uid() = user_id::text);

-- Investment Plans
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_access_own_investment_plans" ON public.investment_plans
  USING (auth.uid() = user_id::text);

