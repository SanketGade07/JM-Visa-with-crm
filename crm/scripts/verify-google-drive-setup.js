#!/usr/bin/env node
/**
 * Validates Google Drive OAuth credentials and root folder access.
 *
 * Usage: npm run drive:verify-setup
 */
const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
} catch {
  // dotenv optional if vars are exported in shell
}

const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
const ROOT_RAW = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

function extractFolderId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return trimmed;
}

function mask(value) {
  if (!value || value.length < 8) return '(set)';
  return value.slice(0, 6) + '...' + value.slice(-4);
}

async function main() {
  console.log('\n=== Google Drive Setup Verification ===\n');

  let failed = false;

  // 1. Check env vars
  console.log('1. Environment variables');
  if (CLIENT_ID) {
    console.log(`   GOOGLE_OAUTH_CLIENT_ID:     ${mask(CLIENT_ID)}`);
  } else {
    console.log('   GOOGLE_OAUTH_CLIENT_ID:     MISSING');
    failed = true;
  }
  if (CLIENT_SECRET) {
    console.log(`   GOOGLE_OAUTH_CLIENT_SECRET: ${mask(CLIENT_SECRET)}`);
  } else {
    console.log('   GOOGLE_OAUTH_CLIENT_SECRET: MISSING');
    failed = true;
  }
  if (REFRESH_TOKEN) {
    console.log(`   GOOGLE_OAUTH_REFRESH_TOKEN: ${mask(REFRESH_TOKEN)}`);
  } else {
    console.log('   GOOGLE_OAUTH_REFRESH_TOKEN: MISSING');
    failed = true;
  }

  const rootId = extractFolderId(ROOT_RAW);
  if (rootId) {
    console.log(`   GOOGLE_DRIVE_ROOT_FOLDER_ID: ${rootId}`);
    if (ROOT_RAW && ROOT_RAW.includes('drive.google.com')) {
      console.log('   ⚠ Use folder ID only in .env (not full URL). Extracted:', rootId);
    }
  } else {
    console.log('   GOOGLE_DRIVE_ROOT_FOLDER_ID: MISSING (optional if set in app_settings DB)');
  }

  if (failed) {
    console.error('\n✗ Missing required OAuth variables. See GOOGLE_DRIVE_SETUP.md Steps 1–4.\n');
    process.exit(1);
  }

  // 2. OAuth token exchange
  console.log('\n2. OAuth token exchange');
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  let drive;
  try {
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error('No access token returned');
    console.log('   ✓ Access token obtained from refresh token');
    drive = google.drive({ version: 'v3', auth: oauth2Client });
  } catch (err) {
    const msg = err.message || String(err);
    console.error('   ✗ Token exchange failed:', msg);
    if (msg.includes('invalid_grant')) {
      console.error('   → Regenerate refresh token: npm run drive:oauth-token');
      console.error('   → See GOOGLE_DRIVE_SETUP.md Step 4');
    }
    process.exit(1);
  }

  // 3. Drive API enabled check (via about.get)
  console.log('\n3. Drive API access');
  try {
    const about = await drive.about.get({ fields: 'user(displayName,emailAddress)' });
    const user = about.data.user;
    console.log(`   ✓ Authenticated as: ${user.displayName} <${user.emailAddress}>`);
    console.log('   ✓ Google Drive API is enabled and reachable');
  } catch (err) {
    const msg = err.message || String(err);
    console.error('   ✗ Drive API call failed:', msg);
    if (msg.includes('Drive API has not been used') || err.code === 403) {
      console.error('   → Enable Google Drive API in Google Cloud Console (Step 1)');
    }
    process.exit(1);
  }

  // 4. Root folder access
  if (!rootId) {
    console.log('\n4. Root folder');
    console.log('   ⚠ Skipped — set GOOGLE_DRIVE_ROOT_FOLDER_ID or configure via Drive tab');
    console.log('\n✓ OAuth setup verified. Add root folder ID to complete full check.\n');
    process.exit(0);
  }

  console.log('\n4. Root folder access');
  try {
    const folder = await drive.files.get({
      fileId: rootId,
      fields: 'id,name,mimeType,capabilities',
      supportsAllDrives: true,
    });

    if (folder.data.mimeType !== 'application/vnd.google-apps.folder') {
      console.error('   ✗ ID is not a folder:', folder.data.mimeType);
      process.exit(1);
    }

    console.log(`   ✓ Folder accessible: "${folder.data.name}" (${folder.data.id})`);

    const canList = folder.data.capabilities?.canListChildren;
    if (canList === false) {
      console.error('   ✗ Cannot list children — share folder with Storage Owner as Editor');
      process.exit(1);
    }
  } catch (err) {
    const msg = err.message || String(err);
    console.error('   ✗ Cannot access root folder:', msg);
    if (err.code === 404) {
      console.error('   → Folder not found or not shared with Storage Owner Gmail');
    }
    console.error('   → Share root folder as Editor (GOOGLE_DRIVE_SETUP.md Step 5)');
    process.exit(1);
  }

  // 5. List subfolders
  console.log('\n5. List subfolders');
  try {
    const res = await drive.files.list({
      q: `'${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id,name)',
      pageSize: 10,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    const subs = res.data.files || [];
    console.log(`   ✓ Found ${subs.length} subfolder(s)`);
    subs.slice(0, 5).forEach((f) => console.log(`     - ${f.name}`));
    if (subs.length > 5) console.log(`     ... and ${subs.length - 5} more`);
  } catch (err) {
    console.error('   ✗ List failed:', err.message || err);
    process.exit(1);
  }

  console.log('\n✓ Google Drive setup verified successfully.\n');
  console.log('Next: restart dev server and open the Drive tab in the CRM.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
