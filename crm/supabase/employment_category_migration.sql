-- Add employmentCategory column to leads (matches app Lead type / writeLeads upsert)
-- Run via Supabase SQL editor or: npm run migrate:employment-category

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS "employmentCategory" text
  DEFAULT 'private_job';
