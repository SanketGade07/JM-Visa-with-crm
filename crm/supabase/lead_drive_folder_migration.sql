-- Add driveFolderId column to leads (per-lead Google Drive folder link)
-- Run via Supabase SQL editor or: npm run drive:migrate-lead-folder

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS "driveFolderId" TEXT DEFAULT NULL;
