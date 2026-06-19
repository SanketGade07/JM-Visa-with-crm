const USA_COUNTRY_LABELS = new Set([
  "USA",
  "US",
  "United States",
  "United States of America",
  "United States of America (the)",
]);

const UK_COUNTRY_LABELS = new Set([
  "UK",
  "GB",
  "United Kingdom",
  "United Kingdom of Great Britain and Northern Ireland",
]);

const UAE_COUNTRY_LABELS = new Set([
  "UAE",
  "United Arab Emirates",
]);

export function isUsaCountry(country: string): boolean {
  const trimmed = country.trim();
  if (!trimmed) return false;
  if (USA_COUNTRY_LABELS.has(trimmed)) return true;

  const upper = trimmed.toUpperCase();
  if (upper === "USA" || upper === "US") return true;
  if (upper.includes("MINOR OUTLYING")) return false;
  if (upper === "UNITED STATES OF AMERICA (THE)") return true;
  if (/^UNITED STATES OF AMERICA\b/i.test(trimmed)) return true;

  return false;
}

export function isUkCountry(country: string): boolean {
  const trimmed = country.trim();
  if (!trimmed) return false;
  if (UK_COUNTRY_LABELS.has(trimmed)) return true;
  const upper = trimmed.toUpperCase();
  if (upper === "UK" || upper === "GB") return true;
  if (upper === "UNITED KINGDOM") return true;
  if (/^UNITED KINGDOM\b/i.test(trimmed)) return true;
  return false;
}

export function isUaeCountry(country: string): boolean {
  const trimmed = country.trim();
  if (!trimmed) return false;
  if (UAE_COUNTRY_LABELS.has(trimmed)) return true;
  const upper = trimmed.toUpperCase();
  if (upper === "UAE") return true;
  if (upper === "UNITED ARAB EMIRATES") return true;
  return false;
}

/** Maps country-list / variant labels to CRM department keys where applicable. */
export function normalizeCrmCountry(country: string): string {
  if (isUsaCountry(country)) return "USA";
  if (isUkCountry(country)) return "UK";
  if (isUaeCountry(country)) return "UAE";
  return country.trim();
}

export function getCountryDisplayName(country: string): string {
  const trimmed = country.trim();
  if (isUsaCountry(trimmed)) return "United States of America (the)";
  if (isUkCountry(trimmed)) return "United Kingdom";
  if (isUaeCountry(trimmed)) return "United Arab Emirates";
  return trimmed;
}
