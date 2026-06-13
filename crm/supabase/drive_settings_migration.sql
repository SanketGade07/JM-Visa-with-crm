-- Google Drive CRM: app_settings key-value store for drive_root_folder_id
-- Run via Supabase SQL editor or: npm run drive:migrate-settings

CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed placeholder; migration script replaces YOUR_ROOT_FOLDER_ID when env is set
INSERT INTO public.app_settings (key, value)
VALUES ('drive_root_folder_id', 'YOUR_ROOT_FOLDER_ID')
ON CONFLICT (key) DO NOTHING;
