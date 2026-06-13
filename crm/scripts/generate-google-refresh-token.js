#!/usr/bin/env node
/**
 * One-time OAuth refresh token generator for Google Drive.
 *
 * Prerequisites:
 *   1. GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env
 *   2. OAuth client has redirect URI: http://localhost:3000/oauth2callback
 *   3. Storage Owner Gmail added as OAuth consent screen test user (if app is in Testing)
 *
 * Usage: npm run drive:oauth-token
 */
const http = require('http');
const path = require('path');
const { URL } = require('url');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
} catch {
  // dotenv optional if vars are exported in shell
}

const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const PORT = 3000;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET in .env');
  console.error('Complete Steps 1–3 in GOOGLE_DRIVE_SETUP.md first.');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
});

console.log('\n=== Google Drive OAuth — Refresh Token Generator ===\n');
console.log('1. Open this URL in your browser and sign in as the Storage Owner Gmail:\n');
console.log(authUrl);
console.log('\n2. After approving, you will be redirected to localhost.\n');
console.log('Waiting for authorization...\n');

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname !== '/oauth2callback') {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>Authorization failed</h1><p>${error}</p>`);
      console.error('Authorization error:', error);
      server.close();
      process.exit(1);
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>Missing authorization code</h1>');
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
      '<h1>Success</h1><p>You can close this tab and return to the terminal.</p>',
    );

    console.log('Authorization successful.\n');

    if (tokens.refresh_token) {
      console.log('Add this to your .env file:\n');
      console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    } else {
      console.warn('No refresh_token in response.');
      console.warn('Revoke prior access at https://myaccount.google.com/permissions');
      console.warn('Then run this script again (prompt=consent is already set).\n');
      if (tokens.access_token) {
        console.log('Access token (short-lived, not for .env):', tokens.access_token.slice(0, 20) + '...');
      }
    }

    server.close();
    process.exit(0);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Token exchange failed</h1>');
    console.error('Token exchange failed:', err.message || err);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}/oauth2callback`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use. Stop the dev server or change PORT in this script.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
