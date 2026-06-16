const USA_COUNTRY_LABELS = new Set([
  "USA",
  "US",
  "United States",
  "United States of America",
  "United States of America (the)",
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

/** Maps country-list / variant labels to CRM department keys where applicable. */
export function normalizeCrmCountry(country: string): string {
  if (isUsaCountry(country)) return "USA";
  return country.trim();
}
