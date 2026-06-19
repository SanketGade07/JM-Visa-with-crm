#!/usr/bin/env node
/**
 * Verifies lead Drive folder auto-provisioning for ADMIN and COUNSELOR roles.
 *
 * Usage: node scripts/verify-lead-drive-provision-all-roles.mjs
 * Requires: dev server on http://localhost:3000, Google Drive + Supabase configured.
 */
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

try {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env"), override: true });
} catch {
  // dotenv optional
}

const { google } = require("googleapis");

const BASE_URL = process.env.CRM_BASE_URL ?? "http://localhost:3000";
const ROLES = [
  { role: "ADMIN", email: "admin@jmvisa.com", password: "admin123" },
  { role: "COUNSELOR", email: "counselor@jmvisa.com", password: "counselor123" },
];

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
const ROOT_FOLDER_ID = (process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || "").trim();

function extractCookie(setCookieHeader) {
  if (!setCookieHeader) return "";
  const parts = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  return parts
    .map((c) => c.split(";")[0])
    .filter(Boolean)
    .join("; ");
}

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${data.error || res.status}`);
  }
  const cookie = extractCookie(res.headers.getSetCookie?.() ?? res.headers.get("set-cookie"));
  if (!cookie.includes("crm_role=")) {
    throw new Error(`No crm_role cookie after login as ${email}`);
  }
  return { cookie, role: data.role };
}

function buildTestLead(role) {
  const now = Date.now();
  const today = new Date().toISOString().split("T")[0];
  const name = `Drive Test ${role} ${now}`;
  return {
    id: `lead-drive-test-${role.toLowerCase()}-${now}`,
    name,
    email: `drive-test-${role.toLowerCase()}@example.com`,
    phone: "9876543210",
    country: "UK",
    visaType: "General Inquiry",
    status: "NEW_LEAD",
    source: "MANUAL",
    counselor: "Unassigned",
    dateCreated: today,
    lastUpdated: today,
    isDeleted: false,
    employmentCategory: "private_job",
    checklist: {},
    payments: [],
    notes: `Automated drive provision test (${role})`,
  };
}

async function bulkCreateLead(cookie, lead) {
  const res = await fetch(`${BASE_URL}/api/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ leads: [lead] }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Bulk lead sync failed (${res.status}): ${text}`);
  }
}

async function fetchLead(leadId, cookie) {
  const res = await fetch(`${BASE_URL}/api/leads/${leadId}`, {
    headers: cookie ? { Cookie: cookie } : {},
  });
  if (!res.ok) {
    throw new Error(`GET /api/leads/${leadId} failed: ${res.status}`);
  }
  return res.json();
}

async function waitForDriveFolderId(leadId, cookie, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { lead } = await fetchLead(leadId, cookie);
    if (lead.driveFolderId) {
      return lead.driveFolderId;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`driveFolderId not set within ${timeoutMs}ms for ${leadId}`);
}

async function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  return google.drive({ version: "v3", auth: oauth2Client });
}

async function findClientsFolderId(drive, rootId) {
  const res = await drive.files.list({
    q: `'${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and name='Clients' and trashed=false`,
    fields: "files(id,name)",
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  const folder = (res.data.files || [])[0];
  if (!folder?.id) {
    throw new Error('Clients subfolder not found under root Drive folder');
  }
  return folder.id;
}

async function verifyLeadFolderInDrive(drive, clientsFolderId, leadName, expectedFolderId) {
  const escapedName = leadName.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `'${clientsFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${escapedName}' and trashed=false`,
    fields: "files(id,name)",
    pageSize: 5,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  const matches = res.data.files || [];
  const match = matches.find((f) => f.id === expectedFolderId);
  if (!match) {
    throw new Error(
      `Folder "${leadName}" under Clients/ not found or ID mismatch (expected ${expectedFolderId}, found ${matches.map((f) => f.id).join(", ") || "none"})`
    );
  }
  const folderMeta = await drive.files.get({
    fileId: expectedFolderId,
    fields: "id,name,parents",
    supportsAllDrives: true,
  });
  const parents = folderMeta.data.parents || [];
  if (!parents.includes(clientsFolderId)) {
    throw new Error(
      `Folder ${expectedFolderId} is not under Clients/ (parents: ${parents.join(", ")})`
    );
  }
  return match;
}

async function ensureCounselorLogin() {
  try {
    return await login("counselor@jmvisa.com", "counselor123");
  } catch {
    const admin = await login("admin@jmvisa.com", "admin123");
    const resetRes = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: admin.cookie,
      },
      body: JSON.stringify({
        action: "RESET_PASSWORD",
        id: "user-counselor",
        password: "counselor123",
      }),
    });
    if (!resetRes.ok) {
      throw new Error(`Could not reset counselor password: ${await resetRes.text()}`);
    }
    console.log("  (reset counselor password to default for test login)");
    return login("counselor@jmvisa.com", "counselor123");
  }
}

async function runRoleTest(drive, clientsFolderId, creds) {
  console.log(`\n--- Testing ${creds.role} (${creds.email}) ---`);
  const session =
    creds.role === "COUNSELOR"
      ? await ensureCounselorLogin()
      : await login(creds.email, creds.password);
  const { cookie, role: loggedInRole } = session;
  if (loggedInRole !== creds.role) {
    throw new Error(`Expected role ${creds.role}, got ${loggedInRole}`);
  }
  console.log(`  ✓ Logged in as ${loggedInRole}`);

  const lead = buildTestLead(creds.role);
  await bulkCreateLead(cookie, lead);
  console.log(`  ✓ Bulk-synced new lead: ${lead.id} ("${lead.name}")`);

  const driveFolderId = await waitForDriveFolderId(lead.id, cookie);
  console.log(`  ✓ driveFolderId in DB: ${driveFolderId}`);

  await verifyLeadFolderInDrive(drive, clientsFolderId, lead.name, driveFolderId);
  console.log(`  ✓ Google Drive folder exists at Clients/${lead.name}`);

  return { role: creds.role, leadId: lead.id, leadName: lead.name, driveFolderId };
}

async function main() {
  console.log("\n=== Lead Drive Provision — ADMIN & COUNSELOR ===\n");
  console.log(`Base URL: ${BASE_URL}`);

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !ROOT_FOLDER_ID) {
    console.error("Missing Google Drive env vars. Check .env");
    process.exit(1);
  }

  const drive = await getDriveClient();
  const clientsFolderId = await findClientsFolderId(drive, ROOT_FOLDER_ID);
  console.log(`Clients folder ID: ${clientsFolderId}`);

  const results = [];
  for (const creds of ROLES) {
    results.push(await runRoleTest(drive, clientsFolderId, creds));
  }

  console.log("\n=== All role tests passed ===\n");
  for (const r of results) {
    console.log(`  ${r.role}: ${r.leadName} → ${r.driveFolderId}`);
  }
  console.log("");
}

main().catch((err) => {
  console.error("\n✗ Test failed:", err.message || err);
  process.exit(1);
});
