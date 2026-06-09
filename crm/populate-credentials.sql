-- Update all leads with auto-generated visa credentials
UPDATE leads
SET visaCredentials = jsonb_build_object(
  'username', substring(id, 1, 8) || '_' || substring(md5(random()::text), 1, 4),
  'password', substring(md5(random()::text || clock_timestamp()::text), 1, 12),
  'portalUrl', 'https://visaportal.example.com/login'
)
WHERE visaCredentials IS NULL;

-- Verify the update
SELECT id, name, visaCredentials FROM leads LIMIT 20;
