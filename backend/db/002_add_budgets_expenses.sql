-- Migration 002: Add budgets and manual expenses tables
-- Run this in Supabase SQL Editor

-- Budgets table (monthly budgets)
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    month TEXT NOT NULL, -- YYYY-MM format
    income NUMERIC(12,2) NOT NULL DEFAULT 0,
    savings_goal NUMERIC(12,2) NOT NULL DEFAULT 0,
    
    -- Budget categories
    bills_utilities NUMERIC(10,2) DEFAULT 0,
    housing NUMERIC(10,2) DEFAULT 0,
    food NUMERIC(10,2) DEFAULT 0,
    transportation NUMERIC(10,2) DEFAULT 0,
    healthcare NUMERIC(10,2) DEFAULT 0,
    entertainment NUMERIC(10,2) DEFAULT 0,
    shopping NUMERIC(10,2) DEFAULT 0,
    education NUMERIC(10,2) DEFAULT 0,
    other NUMERIC(10,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, month)
);

-- Manual expenses table (for tracking individual expenses)
CREATE TABLE IF NOT EXISTS manual_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    expense_type TEXT CHECK (expense_type IN ('daily', 'monthly', 'one-time')) DEFAULT 'one-time',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment plans table
CREATE TABLE IF NOT EXISTS investment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    plan_type TEXT NOT NULL, -- 'short', 'medium', 'long'
    risk_level INTEGER CHECK (risk_level BETWEEN 1 AND 5), -- 1=no risk, 5=high risk
    amount NUMERIC(12,2),
    recommendations JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
CREATE INDEX IF NOT EXISTS idx_manual_expenses_user_id ON manual_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_expenses_date ON manual_expenses(date);
CREATE INDEX IF NOT EXISTS idx_investment_plans_user_id ON investment_plans(user_id);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_can_access_own_budgets" ON budgets
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "users_can_access_own_manual_expenses" ON manual_expenses
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "users_can_access_own_investment_plans" ON investment_plans
  FOR ALL USING (auth.uid()::text = user_id::text);

