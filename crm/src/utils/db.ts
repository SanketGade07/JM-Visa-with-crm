import fs from "fs";
import path from "path";
import { Lead, Meeting, Activity, Expense, Document } from "@/context/CrmContext";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const MEETINGS_FILE = path.join(DATA_DIR, "meetings.json");
const ACTIVITIES_FILE = path.join(DATA_DIR, "activities.json");
const EXPENSES_FILE = path.join(DATA_DIR, "expenses.json");
const DOCUMENTS_FILE = path.join(DATA_DIR, "documents.json");

const ensureDirectoryAndFiles = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, "[]", "utf-8");
  }
  if (!fs.existsSync(MEETINGS_FILE)) {
    fs.writeFileSync(MEETINGS_FILE, "[]", "utf-8");
  }
  if (!fs.existsSync(ACTIVITIES_FILE)) {
    fs.writeFileSync(ACTIVITIES_FILE, "[]", "utf-8");
  }
  if (!fs.existsSync(EXPENSES_FILE)) {
    fs.writeFileSync(EXPENSES_FILE, "[]", "utf-8");
  }
  if (!fs.existsSync(DOCUMENTS_FILE)) {
    fs.writeFileSync(DOCUMENTS_FILE, "[]", "utf-8");
  }
};

const readJson = <T>(filePath: string): T[] => {
  ensureDirectoryAndFiles();
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T[];
  } catch {
    return [];
  }
};

const writeJson = <T>(filePath: string, data: T[]): boolean => {
  ensureDirectoryAndFiles();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// ── Leads ────────────────────────────────────────────────────────────────────
export const readLeads = (): Lead[] => readJson<Lead>(LEADS_FILE);
export const writeLeads = (leads: Lead[]): boolean => writeJson(LEADS_FILE, leads);

// ── Meetings ─────────────────────────────────────────────────────────────────
export const readMeetings = (): Meeting[] => readJson<Meeting>(MEETINGS_FILE);
export const writeMeetings = (meetings: Meeting[]): boolean =>
  writeJson(MEETINGS_FILE, meetings);

// ── Activity Log ──────────────────────────────────────────────────────────────
export const readActivities = (): Activity[] => readJson<Activity>(ACTIVITIES_FILE);
export const writeActivities = (activities: Activity[]): boolean =>
  writeJson(ACTIVITIES_FILE, activities);

export const appendActivity = (activity: Activity): boolean => {
  const existing = readActivities();
  return writeActivities([...existing, activity]);
};

// ── Expenses ──────────────────────────────────────────────────────────────────
export const readExpenses = (): Expense[] => readJson<Expense>(EXPENSES_FILE);
export const writeExpenses = (expenses: Expense[]): boolean =>
  writeJson(EXPENSES_FILE, expenses);

// ── Documents ─────────────────────────────────────────────────────────────────
export const readDocuments = (): Document[] => readJson<Document>(DOCUMENTS_FILE);
export const writeDocuments = (documents: Document[]): boolean =>
  writeJson(DOCUMENTS_FILE, documents);

export const appendDocument = (doc: Document): boolean => {
  const existing = readDocuments();
  return writeDocuments([...existing, doc]);
};
