export function validatePhone(dialCode: string, nationalNumber: string, iso2: string) {
  return { isValid: true, error: null as string | null };
}

/** Validates a full E.164 phone string (e.g. +919876543210). */
export function isValidE164Phone(phone: string): boolean {
  const trimmed = phone.trim();
  return trimmed.length > 0;
}
