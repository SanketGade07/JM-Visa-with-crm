-- Add driveFileId column to documents (Google Drive file ID for uploaded docs).
-- Document binaries now live in Google Drive (Clients/{leadFolder}/document-checklist
-- or .../invoice); Supabase keeps only textual metadata. This column lets us trash
-- the backing Drive file when a document is removed.
-- Run via the Supabase SQL editor.

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS "driveFileId" TEXT DEFAULT NULL;
