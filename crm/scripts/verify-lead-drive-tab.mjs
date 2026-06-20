#!/usr/bin/env node
/**
 * Verifies Lead → DRIVE tab flow (Phase 5):
 * 1. Lead without driveFolderId → POST /api/leads/:id/drive-create (Create folder)
 * 2. Validate folder + browse via GET /api/drive/browse (ADMIN)
 * 3. Upload file via POST /api/drive/browse
 * 4. Confirm file appears in browse listing and in Google Drive
 *
 * Usage: node scripts/verify-lead-drive-tab.mjs
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
const ADMIN = { email: "admin@jmvisa.com", password: "admin123" };

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

function buildTestLead() {
  const now = Date.now();
  const today = new Date().toISOString().split("T")[0];
  const name = `Drive Tab Test ${now}`;
  return {
    id: `lead-drive-tab-test-${now}`,
    name,
    email: `drive-tab-test-${now}@example.com`,
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
    notes: "Automated Lead Drive tab test",
  };
}

async function bulkCreateLead(cookie, lead) {
  const res = await fetch(`${BASE_URL}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ leads: [lead] }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Bulk lead sync failed (${res.status}): ${text}`);
  }
}

async function fetchLead(leadId, cookie) {
  const res = await fetch(`${BASE_URL}/api/leads/${leadId}`, {
    headers: { Cookie: cookie },
  });
  if (!res.ok) {
    throw new Error(`GET /api/leads/${leadId} failed: ${res.status}`);
  }
  return res.json();
}

async function clearDriveFolderId(leadId, cookie) {
  const res = await fetch(`${BASE_URL}/api/leads/${leadId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ driveFolderId: "" }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `PUT /api/leads/${leadId} failed (${res.status})`);
  }
  if (data.lead?.driveFolderId) {
    throw new Error(`Expected driveFolderId cleared on ${leadId}`);
  }
}

async function provisionDriveFolder(leadId, cookie) {
  const res = await fetch(`${BASE_URL}/api/leads/${leadId}/drive-create`, {
    method: "POST",
    headers: { Cookie: cookie },
  });
  const data = await res.json();
  if (!res.ok || !data.driveFolderId) {
    throw new Error(data.error ?? `drive-create failed (${res.status}) for lead ${leadId}`);
  }
  return { driveFolderId: data.driveFolderId, folderName: data.folderName };
}

async function validateFolder(cookie, folderId) {
  const res = await fetch(`${BASE_URL}/api/drive/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ folderId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `validate failed (${res.status})`);
  }
  return data;
}

async function browseFolder(cookie, folderId) {
  const res = await fetch(
    `${BASE_URL}/api/drive/browse?folderId=${encodeURIComponent(folderId)}`,
    { headers: { Cookie: cookie } }
  );
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      msg = JSON.parse(text).error ?? text;
    } catch {
      // keep raw text
    }
    throw new Error(`browse failed (${res.status}): ${msg}`);
  }
  return JSON.parse(text);
}

async function uploadToFolder(cookie, folderId, fileName, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("parentId", folderId);

  const res = await fetch(`${BASE_URL}/api/drive/browse`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.file) {
    throw new Error(data.error ?? `Upload failed (${res.status})`);
  }
  return data.file;
}

async function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  return google.drive({ version: "v3", auth: oauth2Client });
}

async function verifyFileInDriveFolder(drive, folderId, fileName, expectedFileId) {
  const escapedName = fileName.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name='${escapedName}' and trashed=false`,
    fields: "files(id,name,webViewLink)",
    pageSize: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  const files = res.data.files || [];
  const match = files.find((f) => f.id === expectedFileId);
  if (!match) {
    throw new Error(
      `File "${fileName}" not found in folder ${folderId} (found: ${files.map((f) => f.name).join(", ") || "none"})`
    );
  }
  return match;
}

async function main() {
  console.log("\n=== Lead → DRIVE Tab Verification (ADMIN) ===\n");
  console.log(`Base URL: ${BASE_URL}`);

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !ROOT_FOLDER_ID) {
    console.error("Missing Google Drive env vars. Check .env");
    process.exit(1);
  }

  const { cookie, role } = await login(ADMIN.email, ADMIN.password);
  if (role !== "ADMIN") {
    throw new Error(`Expected ADMIN role, got ${role}`);
  }
  console.log(`✓ Logged in as ${role}`);

  const lead = buildTestLead();
  await bulkCreateLead(cookie, lead);
  console.log(`✓ Created test lead: ${lead.id} ("${lead.name}")`);

  const { lead: created } = await fetchLead(lead.id, cookie);
  if (!created.driveFolderId) {
    console.log("  (auto-provision pending or skipped — will test manual create)");
  }

  await clearDriveFolderId(lead.id, cookie);
  console.log(`✓ Cleared driveFolderId to simulate "No Drive folder linked" state`);

  const { driveFolderId, folderName } = await provisionDriveFolder(lead.id, cookie);
  console.log(`✓ Create folder: ${folderName} (${driveFolderId})`);

  const { lead: updated } = await fetchLead(lead.id, cookie);
  if (updated.driveFolderId !== driveFolderId) {
    throw new Error(
      `Lead driveFolderId mismatch: expected ${driveFolderId}, got ${updated.driveFolderId}`
    );
  }
  console.log(`✓ driveFolderId persisted on lead`);

  const validated = await validateFolder(cookie, driveFolderId);
  console.log(`✓ Folder validated: ${validated.folderName ?? folderName}`);

  const initialItems = await browseFolder(cookie, driveFolderId);
  console.log(`✓ Browse folder (ADMIN): ${initialItems.length} item(s) at root`);

  const fileName = `drive-tab-test-${Date.now()}.txt`;
  const fileContent = `Lead Drive tab upload test for ${lead.name} at ${new Date().toISOString()}`;
  const uploaded = await uploadToFolder(cookie, driveFolderId, fileName, fileContent);
  console.log(`✓ Uploaded file: ${uploaded.name} (${uploaded.id})`);

  const afterUpload = await browseFolder(cookie, driveFolderId);
  const listed = afterUpload.find((item) => item.id === uploaded.id && item.name === fileName);
  if (!listed) {
    throw new Error(
      `Uploaded file not in browse listing (items: ${afterUpload.map((i) => i.name).join(", ") || "none"})`
    );
  }
  console.log(`✓ File appears in browse listing after upload`);

  const drive = await getDriveClient();
  await verifyFileInDriveFolder(drive, driveFolderId, fileName, uploaded.id);
  console.log(`✓ File confirmed in Google Drive lead folder`);

  console.log("\n=== Lead Drive tab test passed ===\n");
  console.log(`  Lead: ${lead.name}`);
  console.log(`  Folder: ${driveFolderId}`);
  console.log(`  File: ${fileName}`);
  console.log("");
}

main().catch((err) => {
  console.error("\n✗ Test failed:", err.message || err);
  process.exit(1);
});
