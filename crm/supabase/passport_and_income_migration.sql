-- Add passport and annualIncome columns to leads table (matches app Lead type / writeLeads upsert)
-- Run this directly in the Supabase SQL Editor or use Node scripts

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS "passportNumber" text DEFAULT '',
  ADD COLUMN IF NOT EXISTS "passportIssueDate" text DEFAULT '',
  ADD COLUMN IF NOT EXISTS "passportExpiryDate" text DEFAULT '',
  ADD COLUMN IF NOT EXISTS "passportPlaceOfIssue" text DEFAULT '',
  ADD COLUMN IF NOT EXISTS "annualIncome" text DEFAULT '';
