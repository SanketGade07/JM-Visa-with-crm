#!/usr/bin/env node
/**
 * Verifies Lead Details → Attach File flow:
 * 1. Ensure lead has a Drive folder (drive-create if needed)
 * 2. Upload file to lead folder via POST /api/drive/browse
 * 3. Post discussion message with Drive link
 * 4. Confirm file exists in Google Drive under lead folder
 * 5. Confirm discussion activity contains the attachment link
 *
 * Usage: node scripts/verify-lead-attach-file.mjs
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
  const name = `Attach Test ${now}`;
  return {
    id: `lead-attach-test-${now}`,
    name,
    email: `attach-test-${now}@example.com`,
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
    notes: "Automated attach-file test",
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

async function ensureLeadDriveFolder(leadId, cookie) {
  const { lead } = await fetchLead(leadId, cookie);
  if (lead.driveFolderId) return lead.driveFolderId;

  const res = await fetch(`${BASE_URL}/api/leads/${leadId}/drive-create`, {
    method: "POST",
    headers: { Cookie: cookie },
  });
  const data = await res.json();
  if (!res.ok || !data.driveFolderId) {
    throw new Error(
      data.error ?? `drive-create failed (${res.status}) for lead ${leadId}`
    );
  }
  return data.driveFolderId;
}

async function uploadToLeadFolder(cookie, folderId, fileName, content) {
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

async function postDiscussionMessage(cookie, leadId, content) {
  const activity = {
    id: `act-attach-test-${Date.now()}`,
    leadId,
    type: "discussion",
    content,
    createdAt: new Date().toISOString(),
    createdBy: "Admin",
  };
  const res = await fetch(`${BASE_URL}/api/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(activity),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `POST /api/activities failed (${res.status})`);
  }
  return data.activity;
}

async function fetchDiscussionActivities(leadId, cookie) {
  const res = await fetch(`${BASE_URL}/api/activities?leadId=${encodeURIComponent(leadId)}`, {
    headers: { Cookie: cookie },
  });
  if (!res.ok) {
    throw new Error(`GET /api/activities failed: ${res.status}`);
  }
  const activities = await res.json();
  return activities.filter((a) => a.type === "discussion");
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
      `File "${fileName}" not found in lead folder ${folderId} (found: ${files.map((f) => f.name).join(", ") || "none"})`
    );
  }
  return match;
}

async function main() {
  console.log("\n=== Lead Details → Attach File Verification ===\n");
  console.log(`Base URL: ${BASE_URL}`);

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !ROOT_FOLDER_ID) {
    console.error("Missing Google Drive env vars. Check .env");
    process.exit(1);
  }

  const { cookie, role } = await login(ADMIN.email, ADMIN.password);
  console.log(`✓ Logged in as ${role}`);

  const lead = buildTestLead();
  await bulkCreateLead(cookie, lead);
  console.log(`✓ Created test lead: ${lead.id} ("${lead.name}")`);

  const folderId = await ensureLeadDriveFolder(lead.id, cookie);
  console.log(`✓ Lead Drive folder: ${folderId}`);

  const fileName = `attach-test-${Date.now()}.txt`;
  const fileContent = `Attach file test for ${lead.name} at ${new Date().toISOString()}`;

  const uploaded = await uploadToLeadFolder(cookie, folderId, fileName, fileContent);
  console.log(`✓ Uploaded file: ${uploaded.name} (${uploaded.id})`);

  const fileLink =
    uploaded.webViewLink ?? `https://drive.google.com/file/d/${uploaded.id}/view`;
  const discussionContent = `Attached file: [${fileName}](${fileLink})`;

  await postDiscussionMessage(cookie, lead.id, discussionContent);
  console.log(`✓ Posted discussion message with Drive link`);

  const drive = await getDriveClient();
  const driveFile = await verifyFileInDriveFolder(drive, folderId, fileName, uploaded.id);
  console.log(`✓ File confirmed in Google Drive lead folder (id: ${driveFile.id})`);

  const discussions = await fetchDiscussionActivities(lead.id, cookie);
  const attachmentMsg = discussions.find(
    (a) =>
      a.content.includes("Attached file:") &&
      a.content.includes(fileName) &&
      (a.content.includes(uploaded.id) || a.content.includes(fileLink))
  );
  if (!attachmentMsg) {
    throw new Error(
      `Discussion message with attachment link not found. Got ${discussions.length} discussion(s).`
    );
  }
  console.log(`✓ Discussion contains attachment link: ${attachmentMsg.content.slice(0, 80)}…`);

  console.log("\n=== Attach File test passed ===\n");
  console.log(`  Lead: ${lead.name}`);
  console.log(`  Folder: ${folderId}`);
  console.log(`  File: ${fileName} → ${fileLink}`);
  console.log("");
}

main().catch((err) => {
  console.error("\n✗ Test failed:", err.message || err);
  process.exit(1);
});
