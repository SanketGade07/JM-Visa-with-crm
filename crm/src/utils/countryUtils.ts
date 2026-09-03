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

const CANADA_COUNTRY_LABELS = new Set([
  "Canada",
  "CA",
  "CAN",
]);

export function parseCountries(countryInput: string | string[] | undefined | null): string[] {
  if (!countryInput) return [];
  if (Array.isArray(countryInput)) {
    return countryInput.map((c) => c.trim()).filter(Boolean);
  }
  return countryInput
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function isSingleUsaCountry(country: string): boolean {
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

function isSingleUkCountry(country: string): boolean {
  const trimmed = country.trim();
  if (!trimmed) return false;
  if (UK_COUNTRY_LABELS.has(trimmed)) return true;
  const upper = trimmed.toUpperCase();
  if (upper === "UK" || upper === "GB") return true;
  if (upper === "UNITED KINGDOM") return true;
  if (/^UNITED KINGDOM\b/i.test(trimmed)) return true;
  return false;
}

function isSingleUaeCountry(country: string): boolean {
  const trimmed = country.trim();
  if (!trimmed) return false;
  if (UAE_COUNTRY_LABELS.has(trimmed)) return true;
  const upper = trimmed.toUpperCase();
  if (upper === "UAE") return true;
  if (upper === "UNITED ARAB EMIRATES") return true;
  return false;
}

function isSingleCanadaCountry(country: string): boolean {
  const trimmed = country.trim();
  if (!trimmed) return false;
  if (CANADA_COUNTRY_LABELS.has(trimmed)) return true;
  const upper = trimmed.toUpperCase();
  if (upper === "CANADA" || upper === "CA" || upper === "CAN") return true;
  if (/^CANADA\b/i.test(trimmed)) return true;
  return false;
}

export function isUsaCountry(country: string | string[]): boolean {
  const list = parseCountries(country);
  return list.some((c) => isSingleUsaCountry(c));
}

export function isUkCountry(country: string | string[]): boolean {
  const list = parseCountries(country);
  return list.some((c) => isSingleUkCountry(c));
}

export function isUaeCountry(country: string | string[]): boolean {
  const list = parseCountries(country);
  return list.some((c) => isSingleUaeCountry(c));
}

export function isCanadaCountry(country: string | string[] | undefined | null): boolean {
  if (!country) return false;
  const list = parseCountries(country);
  return list.some((c) => isSingleCanadaCountry(c));
}

/** Maps country-list / variant labels to CRM department keys where applicable. */
export function normalizeCrmCountry(country: string | string[]): string {
  const list = parseCountries(country);
  return list
    .map((c) => {
      if (isSingleUsaCountry(c)) return "USA";
      if (isSingleUkCountry(c)) return "UK";
      if (isSingleUaeCountry(c)) return "UAE";
      return c.trim();
    })
    .filter(Boolean)
    .join(", ");
}

export function getCountryDisplayName(country: string | string[]): string {
  const list = parseCountries(country);
  if (list.length === 0) return "";
  return list
    .map((c) => {
      if (isSingleUsaCountry(c)) return "United States of America (the)";
      if (isSingleUkCountry(c)) return "United Kingdom";
      if (isSingleUaeCountry(c)) return "United Arab Emirates";
      return c.trim();
    })
    .filter(Boolean)
    .join(", ");
}

export function countryMatches(leadCountry: string | string[], filterCountry: string): boolean {
  if (!filterCountry || filterCountry === "All") return true;
  const list = parseCountries(leadCountry);
  const normFilter = normalizeCrmCountry(filterCountry);
  return list.some((c) => {
    const normC = normalizeCrmCountry(c);
    return normC === normFilter || c.toLowerCase() === filterCountry.toLowerCase();
  });
}

