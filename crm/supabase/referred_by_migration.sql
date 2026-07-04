-- Add referredBy column to leads
-- Run via Supabase SQL editor or: npm run migrate:referred-by

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS "referredBy" text
  DEFAULT '';
