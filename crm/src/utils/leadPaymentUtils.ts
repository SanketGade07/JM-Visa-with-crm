import type { Lead } from "@/context/CrmContext";

export function getLeadPaymentSummary(lead: Lead) {
  const totalPackage = lead.payments[0]?.totalPackage || 0;
  const received = lead.payments.reduce((acc, payment) => acc + payment.amountPaid, 0);
  const pending = totalPackage > 0 ? Math.max(0, totalPackage - received) : 0;
  const status =
    totalPackage <= 0 ? null : pending > 0 ? ("pending" as const) : ("received" as const);

  return { totalPackage, received, pending, status };
}

export function canRecordLeadDeposit(lead: Lead) {
  const { totalPackage, pending } = getLeadPaymentSummary(lead);
  return totalPackage > 0 && pending > 0;
}

export function getEligibleDepositLeads(leads: Lead[]) {
  return leads.filter(
    (lead) => lead.status !== "DROPPED" && canRecordLeadDeposit(lead)
  );
}

export function getDepositPickerLeads(leads: Lead[]) {
  return leads.filter((lead) => lead.status !== "DROPPED");
}

export function formatLeadDepositLabel(lead: Lead): string {
  const { totalPackage, pending } = getLeadPaymentSummary(lead);
  if (totalPackage <= 0) {
    return `${lead.name} (${lead.country} — Package not decided)`;
  }
  if (pending <= 0) {
    return `${lead.name} (${lead.country} — Fully paid)`;
  }
  return `${lead.name} (${lead.country} — ₹${pending.toLocaleString("en-IN")} outstanding)`;
}

export function getDepositLeadSummary(lead: Lead) {
  const summary = getLeadPaymentSummary(lead);
  return {
    ...summary,
    label: formatLeadDepositLabel(lead),
  };
}

export function validateDepositAmount(
  lead: Lead,
  amountPaid: number
): { ok: true } | { ok: false; message: string } {
  if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
    return { ok: false, message: "Enter a valid deposit amount" };
  }

  const { totalPackage, pending } = getLeadPaymentSummary(lead);
  if (totalPackage <= 0) {
    return { ok: false, message: "Set a package amount before recording a deposit" };
  }
  if (pending <= 0) {
    return { ok: false, message: "This client has no outstanding balance" };
  }

  if (amountPaid > pending) {
    return {
      ok: false,
      message: `Deposit cannot exceed outstanding balance of ₹${pending.toLocaleString("en-IN")}`,
    };
  }

  return { ok: true };
}

export function validatePackageAmount(
  lead: Lead,
  totalPackage: number
): { ok: true } | { ok: false; message: string } {
  if (!Number.isFinite(totalPackage) || totalPackage <= 0) {
    return { ok: false, message: "Enter a valid package amount" };
  }

  const { received } = getLeadPaymentSummary(lead);
  if (totalPackage < received) {
    return {
      ok: false,
      message: `Package cannot be less than ₹${received.toLocaleString("en-IN")} already received`,
    };
  }

  return { ok: true };
}
