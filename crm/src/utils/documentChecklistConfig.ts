export type EmploymentCategory =
  | "private_job"
  | "government_job"
  | "business"
  | "housewife"
  | "student"
  | "retired";

export type ChecklistItemDef = { key: string; label: string };
export type ChecklistSection = { title: string; items: ChecklistItemDef[] };

export type DocumentChecklistState = Record<string, boolean>;

export const DEFAULT_EMPLOYMENT_CATEGORY: EmploymentCategory = "private_job";

export const GENERAL_REQUIREMENTS: ChecklistSection = {
  title: "General Requirements",
  items: [
    { key: "termsAndConditions", label: "1. Terms and Conditions" },
    { key: "paymentReceived", label: "2. Payment Received" },
  ],
};

const PRIVATE_JOB_SECTIONS: ChecklistSection[] = [
  {
    title: "Category 1: If Working (Private Job)",
    items: [
      {
        key: "privateJob_offerLetterOrNoc",
        label: "Current Job Offer Letter or No Objection Certificate from Job.",
      },
      {
        key: "privateJob_sixMonthBankStatements",
        label: "6 Months Bank Statements (Where Salary is Credited).",
      },
      {
        key: "privateJob_bankBalance5Lakhs",
        label: "Bank balance more than 5 lakhs (FD/ Saving Letter/ PPF).",
      },
      { key: "privateJob_threeYearsItr", label: "3 years of ITR." },
    ],
  },
];

const GOVERNMENT_JOB_SECTIONS: ChecklistSection[] = [
  {
    title: "Category 2: If Working (Government Job)",
    items: [
      { key: "governmentJob_noc", label: "No Objection Certificate form Job." },
      { key: "governmentJob_governmentIdProof", label: "Government ID Proof." },
      {
        key: "governmentJob_sixMonthBankStatements",
        label: "6 Months Bank Statements (Where Salary is Credited).",
      },
      {
        key: "governmentJob_bankBalance5Lakhs",
        label: "Bank Balance more than 5 Lakhs (FD/ Saving Letter/ PPF).",
      },
      { key: "governmentJob_threeYearsItr", label: "3 years of ITR." },
    ],
  },
];

const BUSINESS_SECTIONS: ChecklistSection[] = [
  {
    title: "Category 3: If Working (Having Business/ Private LTD / Proprietor / Partnership)",
    items: [
      { key: "business_gumastaLicense", label: "Gumasta License." },
      { key: "business_udyamAadhar", label: "Udyam Aadhar." },
      { key: "business_gstCertificate", label: "GST Certificate." },
      { key: "business_shopEstablishmentLicense", label: "Shop establishment License." },
      { key: "business_incorporationCertificate", label: "In-corporation Certificate." },
      { key: "business_fssaiCertificate", label: "FSSAI Certificate." },
      {
        key: "business_sixMonthCurrentAccountStatements",
        label:
          "6 months Current Account Statements (Business name must be written on statements).",
      },
      {
        key: "business_threeMonthSavingStatements",
        label:
          "3 months saving bank Statements (Where you can show your saving for Visa purpose).",
      },
      {
        key: "business_bankBalance5Lakhs",
        label: "Bank Balance more than 5 Lakhs (FD/ Saving Letter/ PPF).",
      },
      { key: "business_companyItr3Years", label: "Company ITR 3 years." },
      { key: "business_savingItr3Years", label: "Saving ITR 3 years." },
      { key: "business_partnershipDeedRegistration", label: "Partnership deed registration." },
    ],
  },
];

const HOUSEWIFE_SECTIONS: ChecklistSection[] = [
  {
    title: "Category 4: If House-Wife",
    items: [
      {
        key: "housewife_sixMonthBankStatements",
        label: "6 months Bank statements (Where she can show her saving).",
      },
      { key: "housewife_savingItr3Years", label: "Saving 3 years ITR (If available)." },
      {
        key: "housewife_bankBalance5Lakhs",
        label: "Bank Balance more than 5 lakhs (FD/ Saving Letter/ PPF).",
      },
      {
        key: "housewife_husbandSponsorship",
        label:
          "If husband is sponsoring: Sponsorship letter is must (6 months Bank statement/ ITR/ Job offer/ NOC/ FD/ Saving letter.)",
      },
      {
        key: "housewife_abroadSponsorSponsorship",
        label:
          "If Sponsor from Abroad Sponsorship letter is must (Job Offer/ 3 months Bank Statements/ Visa Status Proof/ Relationship proof between sponsor)",
      },
    ],
  },
];

const STUDENT_SECTIONS: ChecklistSection[] = [
  {
    title: "Category 5: If Student",
    items: [
      {
        key: "student_bonafideCertificate",
        label: "Bonafide Certificate from University/ college/ school.",
      },
      {
        key: "student_parentSponsorship",
        label:
          "Mother or Father is sponsoring: Sponsorship letter is must (6 months Bank statement/ ITR/ Job offer/ NOC/ FD/ Saving letter.)",
      },
      {
        key: "student_personalSavings",
        label: "If any saving is available he/she can show the bank statements.",
      },
      {
        key: "student_abroadSponsor",
        label:
          "If Sponsor from Abroad (Job Offer/ 3 months Bank statements/ Visa Status proof/ Relationship proof between sponsor).",
      },
    ],
  },
];

const RETIRED_SECTIONS: ChecklistSection[] = [
  {
    title: "Category 6: If Retired",
    items: [
      {
        key: "retired_sixMonthSavingStatements",
        label: "6 Months Saving bank statement (If Gov employee pension letter is must).",
      },
      { key: "retired_threeYearsItr", label: "3 years ITR" },
      {
        key: "retired_sponsorSponsorship",
        label:
          "If sponsor: Sponsorship letter is must (6 months Bank statement/ ITR/ Job offer/ NOC/ FD/ Saving letter.)",
      },
      {
        key: "retired_fdSavingLetter",
        label: "If any other saving in form of FD/Saving letter.",
      },
    ],
  },
];

export const EMPLOYMENT_CATEGORIES: Record<
  EmploymentCategory,
  { label: string; sections: ChecklistSection[] }
> = {
  private_job: {
    label: "Category 1: If Working (Private Job)",
    sections: PRIVATE_JOB_SECTIONS,
  },
  government_job: {
    label: "Category 2: If Working (Government Job)",
    sections: GOVERNMENT_JOB_SECTIONS,
  },
  business: {
    label: "Category 3: If Working (Having Business/ Private LTD / Proprietor / Partnership)",
    sections: BUSINESS_SECTIONS,
  },
  housewife: {
    label: "Category 4: If House-Wife",
    sections: HOUSEWIFE_SECTIONS,
  },
  student: {
    label: "Category 5: If Student",
    sections: STUDENT_SECTIONS,
  },
  retired: {
    label: "Category 6: If Retired",
    sections: RETIRED_SECTIONS,
  },
};

/** Maps legacy flat checklist keys to new category-driven keys. */
const LEGACY_KEY_MAP: Record<string, string> = {
  visaFeesPaid: "paymentReceived",
  offerLetter: "privateJob_offerLetterOrNoc",
};

const flattenSectionKeys = (sections: ChecklistSection[]): string[] =>
  sections.flatMap((section) => section.items.map((item) => item.key));

export const getCategorySections = (category: EmploymentCategory): ChecklistSection[] =>
  EMPLOYMENT_CATEGORIES[category].sections;

export const getChecklistSectionsForLead = (
  category: EmploymentCategory = DEFAULT_EMPLOYMENT_CATEGORY
): ChecklistSection[] => [GENERAL_REQUIREMENTS, ...getCategorySections(category)];

export const getChecklistKeysForLead = (
  category: EmploymentCategory = DEFAULT_EMPLOYMENT_CATEGORY
): string[] => flattenSectionKeys(getChecklistSectionsForLead(category));

export const buildEmptyChecklist = (
  category: EmploymentCategory = DEFAULT_EMPLOYMENT_CATEGORY
): DocumentChecklistState => {
  const keys = getChecklistKeysForLead(category);
  return Object.fromEntries(keys.map((key) => [key, false]));
};

export const mergeChecklist = (
  stored: DocumentChecklistState = {},
  category: EmploymentCategory = DEFAULT_EMPLOYMENT_CATEGORY
): DocumentChecklistState => {
  const activeKeys = getChecklistKeysForLead(category);
  const result: DocumentChecklistState = { ...stored };

  for (const [legacyKey, newKey] of Object.entries(LEGACY_KEY_MAP)) {
    if (stored[legacyKey] && activeKeys.includes(newKey)) {
      result[newKey] = result[newKey] || stored[legacyKey];
    }
  }

  for (const key of activeKeys) {
    if (result[key] === undefined) {
      result[key] = false;
    }
  }

  return result;
};

export const isActiveChecklistKey = (
  key: string,
  category: EmploymentCategory = DEFAULT_EMPLOYMENT_CATEGORY
): boolean => getChecklistKeysForLead(category).includes(key);

export const getChecklistItemLabel = (key: string): string | undefined => {
  for (const section of Object.values(EMPLOYMENT_CATEGORIES).flatMap((c) => c.sections)) {
    const match = section.items.find((item) => item.key === key);
    if (match) return match.label;
  }
  const generalMatch = GENERAL_REQUIREMENTS.items.find((item) => item.key === key);
  return generalMatch?.label;
};

export const EMPLOYMENT_CATEGORY_OPTIONS: { value: EmploymentCategory; label: string }[] =
  (Object.entries(EMPLOYMENT_CATEGORIES) as [EmploymentCategory, { label: string }][]).map(
    ([value, { label }]) => ({ value, label })
  );
