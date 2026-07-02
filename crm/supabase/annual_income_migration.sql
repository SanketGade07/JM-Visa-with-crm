-- Add annualIncome column to leads (matches app Lead type / writeLeads upsert)
-- Run via Supabase SQL editor or: npm run migrate:annual-income

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS "annualIncome" text
  DEFAULT '';
