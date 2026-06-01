import { getSupabase } from "@/utils/supabase";
import { Lead, Meeting, Activity, Expense, Document } from "@/context/CrmContext";

// ── Leads ────────────────────────────────────────────────────────────────────
export const readLeads = async (): Promise<Lead[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("leads").select("*");
  if (error) {
    console.error("Error reading leads from Supabase:", error);
    return [];
  }
  return (data || []) as Lead[];
};

export const writeLeads = async (leads: Lead[]): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("leads").upsert(leads);
  if (error) {
    console.error("Error writing leads to Supabase:", error);
    return false;
  }
  return true;
};

// ── Meetings ─────────────────────────────────────────────────────────────────
export const readMeetings = async (): Promise<Meeting[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("meetings").select("*");
  if (error) {
    console.error("Error reading meetings from Supabase:", error);
    return [];
  }
  return (data || []) as Meeting[];
};

export const writeMeetings = async (meetings: Meeting[]): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("meetings").upsert(meetings);
  if (error) {
    console.error("Error writing meetings to Supabase:", error);
    return false;
  }
  return true;
};

// ── Activity Log ──────────────────────────────────────────────────────────────
export const readActivities = async (): Promise<Activity[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("activities").select("*");
  if (error) {
    console.error("Error reading activities from Supabase:", error);
    return [];
  }
  return (data || []) as Activity[];
};

export const writeActivities = async (activities: Activity[]): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("activities").upsert(activities);
  if (error) {
    console.error("Error writing activities to Supabase:", error);
    return false;
  }
  return true;
};

export const appendActivity = async (activity: Activity): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("activities").insert(activity);
  if (error) {
    console.error("Error appending activity to Supabase:", error);
    return false;
  }
  return true;
};

// ── Expenses ──────────────────────────────────────────────────────────────────
export const readExpenses = async (): Promise<Expense[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("expenses").select("*");
  if (error) {
    console.error("Error reading expenses from Supabase:", error);
    return [];
  }
  return (data || []) as Expense[];
};

export const writeExpenses = async (expenses: Expense[]): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("expenses").upsert(expenses);
  if (error) {
    console.error("Error writing expenses to Supabase:", error);
    return false;
  }
  return true;
};

// ── Documents ─────────────────────────────────────────────────────────────────
export const readDocuments = async (): Promise<Document[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("documents").select("*");
  if (error) {
    console.error("Error reading documents from Supabase:", error);
    return [];
  }
  return (data || []) as Document[];
};

export const writeDocuments = async (documents: Document[]): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("documents").upsert(documents);
  if (error) {
    console.error("Error writing documents to Supabase:", error);
    return false;
  }
  return true;
};

export const appendDocument = async (doc: Document): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("documents").insert(doc);
  if (error) {
    console.error("Error appending document to Supabase:", error);
    return false;
  }
  return true;
};
