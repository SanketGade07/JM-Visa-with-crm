# Google Drive — Admin Setup Guide

One-time Google Cloud and Drive configuration for the CRM Drive tab. For implementation details see [GOOGLE_DRIVE_FEATURE_SPEC.md](./GOOGLE_DRIVE_FEATURE_SPEC.md).

---

## Prerequisites

- A Google account that will **own all CRM file storage** (the **Storage Owner** Gmail)
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Node.js installed (for local refresh-token generation)

---

## Step 1 — Create project and enable Drive API

1. Open [Google Cloud Console](https://console.cloud.google.com/) → create or select a project (e.g. `JM Visa CRM`).
2. Go to **APIs & Services → Library**.
3. Search for **Google Drive API** → click **Enable**.

---

## Step 2 — OAuth consent screen

1. **APIs & Services → OAuth consent screen**.
2. User type: **External** (or **Internal** if you use Google Workspace and only staff have Google accounts).
3. Fill in app name, support email, and developer contact.
4. On **Scopes**, add:
   ```
   https://www.googleapis.com/auth/drive
   ```
5. Add the Storage Owner Gmail under **Test users** while the app is in Testing mode (required for non-Workspace accounts).
6. Save. You can publish to Production later when ready.

---

## Step 3 — OAuth client credentials

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Application type: **Web application** (recommended for production).
3. Name: e.g. `JM Visa CRM Drive`.
4. **Authorized redirect URIs** — add at least one of:
   - `http://localhost:3000/oauth2callback` (local refresh-token script)
   - `https://developers.google.com/oauthplayground` (OAuth Playground method)
5. Create → copy **Client ID** and **Client secret**.

Add to `.env` (never commit real values):

```env
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-...
```

---

## Step 4 — Generate refresh token

The refresh token ties the app to the **Storage Owner** Gmail. Sign in with that account when prompted.

### Option A — Local script (recommended)

1. Ensure `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` are in `.env`.
2. Add the redirect URI `http://localhost:3000/oauth2callback` to your OAuth client (Step 3).
3. Run:

   ```bash
   npm run drive:oauth-token
   ```

4. Open the URL printed in the terminal, sign in as the Storage Owner, approve access.
5. Copy the printed refresh token into `.env`:

   ```env
   GOOGLE_OAUTH_REFRESH_TOKEN=1//0...
   ```

### Option B — OAuth Playground

1. Open [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Click the gear icon → check **Use your own OAuth credentials** → paste Client ID and Secret.
3. In Step 1, select **Drive API v3 → `https://www.googleapis.com/auth/drive`** → Authorize APIs.
4. Sign in as the Storage Owner Gmail.
5. In Step 2, **Exchange authorization code for tokens**.
6. Copy the **Refresh token** (not the access token) into `GOOGLE_OAUTH_REFRESH_TOKEN`.

> **Note:** If no refresh token appears, revoke prior access at [Google Account Permissions](https://myaccount.google.com/permissions) and repeat with `prompt=consent`.

---

## Step 5 — Create and share root folder

1. In [Google Drive](https://drive.google.com), sign in as the account that **owns** the folder tree (can be the Storage Owner or another account).
2. Create a top-level folder, e.g. `JM Visa CRM Files`.
3. **Share** that folder with the **Storage Owner Gmail** as **Editor** (required even if you created it in another account).
4. Copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```
5. Add to `.env`:

   ```env
   GOOGLE_DRIVE_ROOT_FOLDER_ID=FOLDER_ID_HERE
   ```

   Or save via the Drive tab **Validate & Link** UI after the app is running (stored in Supabase `app_settings`).

---

## Step 6 — Verify setup

With all env vars set, run:

```bash
npm run drive:verify-setup
```

Expected output:

- OAuth credentials detected
- Access token obtained from refresh token
- Root folder accessible (name printed)
- Subfolder listing works

Fix any errors using the troubleshooting table below, then restart the dev server.

---

## Environment variables summary

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_OAUTH_CLIENT_ID` | Yes | OAuth 2.0 client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Yes | OAuth 2.0 client secret |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Yes | Long-lived token for Storage Owner Gmail |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Yes* | Root folder ID (*or set via Drive tab → DB) |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | No | Fallback only — uploads often fail (no quota) |

---

## Sharing rules

Every folder the CRM creates or browses must be shared with the **Storage Owner Gmail** as **Editor**:

- Root folder (Step 5)
- Any lead subfolders created manually or via the app
- Folders created under a different Google account must explicitly grant Editor to the Storage Owner

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Access Denied` / 404 on folder | Share the folder with Storage Owner Gmail as **Editor** |
| `invalid_grant` | Refresh token revoked or wrong OAuth client — regenerate token (Step 4) |
| `redirect_uri_mismatch` | Add exact redirect URI to OAuth client credentials |
| No refresh token returned | Revoke app at [myaccount.google.com/permissions](https://myaccount.google.com/permissions), retry with consent |
| Upload fails with service account | Use OAuth2 vars instead of `GOOGLE_SERVICE_ACCOUNT_KEY` |
| App in Testing mode | Add Storage Owner Gmail under OAuth consent screen → Test users |

---

## Quick checklist

- [ ] Google Drive API enabled in GCP project
- [ ] OAuth consent screen configured with `drive` scope
- [ ] Web application OAuth client created (ID + secret in `.env`)
- [ ] Refresh token generated for Storage Owner Gmail
- [ ] Root folder created in Drive
- [ ] Root folder shared with Storage Owner as Editor
- [ ] `GOOGLE_DRIVE_ROOT_FOLDER_ID` set (folder ID only, not full URL)
- [ ] `npm run drive:verify-setup` passes
