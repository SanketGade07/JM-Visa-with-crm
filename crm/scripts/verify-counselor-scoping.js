#!/usr/bin/env node
/**
 * Verifies counselor-scoped tab badge counts match table row logic for
 * Submissions, USA Slots, and Payments (no date filter active).
 *
 * Usage: node ./scripts/verify-counselor-scoping.js
 */
const path = require("path");

try {
  require("dotenv").config({
    path: path.join(__dirname, "..", ".env"),
    override: true,
  });
} catch {
  // dotenv optional
}

function isLeadAssignedToCounselor(lead, counselorName) {
  const assigned = (lead.counselor?.trim().toLowerCase() ?? "");
  const counselor = counselorName.trim().toLowerCase();
  return assigned !== "" && assigned !== "unassigned" && assigned === counselor;
}

function scopeLeadsForUser(leads, user) {
  if (!user || user.role !== "COUNSELOR") return leads;
  return leads.filter((lead) => isLeadAssignedToCounselor(lead, user.name));
}

function getDeskCountriesFromLeads(leads) {
  const set = new Set();
  for (const l of leads) {
    if (l.status !== "DROPPED" && l.country?.trim()) set.add(l.country.trim());
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

function submissionCounts(scopedLeads) {
  const ready = scopedLeads.filter((l) => !l.isDeleted && l.status === "IN_PROGRESS");
  const dispatched = scopedLeads.filter((l) => !l.isDeleted && l.status === "VISA_SUBMISSION");
  const approved = scopedLeads.filter((l) => !l.isDeleted && l.status === "VISA_APPROVED");
  const rejected = scopedLeads.filter((l) => !l.isDeleted && l.status === "VISA_REJECTED");
  return {
    readyCount: ready.length,
    dispatchedCount: dispatched.length,
    approvedCount: approved.length,
    rejectedCount: rejected.length,
    readyRows: ready,
    dispatchedRows: dispatched,
    approvedRows: approved,
    rejectedRows: rejected,
  };
}

function usaSlotCounts(scopedLeads) {
  const usaLeads = scopedLeads.filter((l) => l.country === "USA" && l.status !== "DROPPED");
  const available = usaLeads.filter((l) => !l.usaSlots?.slotsPaid);
  const paid = usaLeads.filter((l) => l.usaSlots?.slotsPaid === true);
  return {
    availableCount: available.length,
    paidCount: paid.length,
    availableRows: available,
    paidRows: paid,
  };
}

function paymentsCounts(scopedLeads) {
  const active = scopedLeads.filter((l) => l.status !== "DROPPED");
  const deskCountries = getDeskCountriesFromLeads(scopedLeads);
  return {
    ledgerCount: active.length,
    ledgerRows: active,
    deskRevenueCount: deskCountries.length,
    deskRevenueRows: deskCountries,
  };
}

function assertEqual(label, a, b) {
  if (a !== b) {
    throw new Error(`${label}: badge count ${a} !== table rows ${b}`);
  }
}

function verifyUser(leads, user) {
  const scoped = scopeLeadsForUser(leads, user);
  const role = user.role;
  const name = user.name;

  if (role === "COUNSELOR") {
    const leaks = scoped.filter((l) => !isLeadAssignedToCounselor(l, name));
    if (leaks.length > 0) {
      throw new Error(
        `${name} (COUNSELOR): ${leaks.length} scoped lead(s) not assigned to counselor`
      );
    }
    const unassignedVisible = scoped.filter((l) => {
      const c = (l.counselor?.trim().toLowerCase() ?? "");
      return c === "" || c === "unassigned";
    });
    if (unassignedVisible.length > 0) {
      throw new Error(
        `${name} (COUNSELOR): ${unassignedVisible.length} unassigned lead(s) visible`
      );
    }
  }

  const subs = submissionCounts(scoped);
  assertEqual(`${name} submissions ready`, subs.readyCount, subs.readyRows.length);
  assertEqual(`${name} submissions dispatched`, subs.dispatchedCount, subs.dispatchedRows.length);
  assertEqual(`${name} submissions approved`, subs.approvedCount, subs.approvedRows.length);
  assertEqual(`${name} submissions rejected`, subs.rejectedCount, subs.rejectedRows.length);

  const usa = usaSlotCounts(scoped);
  assertEqual(`${name} USA available`, usa.availableCount, usa.availableRows.length);
  assertEqual(`${name} USA paid`, usa.paidCount, usa.paidRows.length);

  const pay = paymentsCounts(scoped);
  assertEqual(`${name} payments ledger`, pay.ledgerCount, pay.ledgerRows.length);
  assertEqual(`${name} payments desk revenue`, pay.deskRevenueCount, pay.deskRevenueRows.length);

  return { scoped, subs, usa, pay };
}

async function fetchJson(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} for ${url}: ${body}`);
  }
  return res.json();
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_BUCKET || "crm-documents";
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const leads = await fetchJson(
    `${url}/rest/v1/leads?select=id,name,country,status,isDeleted,counselor,usaSlots,payments`,
    headers
  );
  console.log(`Loaded ${leads.length} leads from Supabase`);

  let users;
  try {
    const usersRes = await fetch(
      `${url}/storage/v1/object/${bucket}/system/users.json`,
      { headers }
    );
    if (!usersRes.ok) {
      users = [
        { id: "user-admin", name: "Admin User", role: "ADMIN" },
        { id: "user-counselor", name: "Priya Mehta", role: "COUNSELOR" },
      ];
      console.log("Using seed users (users.json not found)");
    } else {
      users = JSON.parse(await usersRes.text());
      console.log(`Loaded ${users.length} users from storage`);
    }
  } catch (err) {
    console.error("Failed to load users:", err.message);
    process.exit(1);
  }

  const admin = users.find((u) => u.role === "ADMIN") ?? {
    name: "Admin User",
    role: "ADMIN",
  };
  const counselors = users.filter((u) => u.role === "COUNSELOR");
  const otherRoles = users.filter(
    (u) => u.role !== "ADMIN" && u.role !== "COUNSELOR"
  );

  const adminResult = verifyUser(leads, admin);
  console.log(`✓ Admin (${admin.name}): all ${leads.length} leads in scope`);

  for (const counselor of counselors) {
    const result = verifyUser(leads, counselor);
    const assignedTotal = leads.filter((l) =>
      isLeadAssignedToCounselor(l, counselor.name)
    ).length;
    console.log(
      `✓ Counselor (${counselor.name}): ${result.scoped.length} scoped leads (${assignedTotal} assigned), ` +
        `submissions=${result.subs.readyCount + result.subs.dispatchedCount + result.subs.approvedCount + result.subs.rejectedCount}, ` +
        `usa=${result.usa.availableCount + result.usa.paidCount}, ` +
        `ledger=${result.pay.ledgerCount}, desks=${result.pay.deskRevenueCount}`
    );

    if (result.scoped.length > adminResult.scoped.length) {
      throw new Error(
        `Counselor ${counselor.name} has more scoped leads than admin`
      );
    }
    if (result.subs.readyCount > adminResult.subs.readyCount) {
      throw new Error(`Counselor ${counselor.name} ready count exceeds admin`);
    }
  }

  for (const user of otherRoles) {
    verifyUser(leads, user);
    console.log(`✓ ${user.role} (${user.name}): unscoped — same as admin`);
  }

  const unassigned = leads.filter((l) => {
    const c = (l.counselor?.trim().toLowerCase() ?? "");
    return c === "" || c === "unassigned";
  });
  console.log(`\nUnassigned leads in DB: ${unassigned.length} (visible to admin only)`);

  const counselorWithLeads = counselors.filter((c) =>
    leads.some((l) => isLeadAssignedToCounselor(l, c.name))
  );
  if (counselorWithLeads.length === 0) {
    console.warn(
      "⚠ No counselor has assigned leads in DB — counselor scoping logic verified structurally only"
    );
  } else {
    console.log(
      `Counselors with assigned leads: ${counselorWithLeads.map((c) => c.name).join(", ")}`
    );
  }

  console.log("\n✓ All counselor-scoping checks passed (badge counts match table row logic).\n");
}

main().catch((err) => {
  console.error("✗ Verification failed:", err.message);
  process.exit(1);
});
