-- Add assignedAt column to leads (counselor assignment timestamp for recency sort)
-- Run via Supabase SQL editor or: npm run migrate:assigned-at

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMPTZ DEFAULT NULL;
