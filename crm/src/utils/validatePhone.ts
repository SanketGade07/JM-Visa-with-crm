import { PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

export function validatePhone(dialCode: string, nationalNumber: string, iso2: string) {
  if (!nationalNumber) return { isValid: true, error: null as string | null };

  const digitsOnly = nationalNumber.replace(/\D/g, "");
  if (digitsOnly.length === 0) return { isValid: true, error: null };

  try {
    const fullNumber = dialCode + digitsOnly;
    const parsed = phoneUtil.parseAndKeepRawInput(fullNumber, iso2.toUpperCase());

    const parsedDialCode = `+${parsed.getCountryCode()}`;
    if (parsedDialCode !== dialCode) {
      return { isValid: false, error: "invalid" };
    }

    const isValid = phoneUtil.isValidNumber(parsed);
    if (!isValid) {
      return { isValid: false, error: "invalid number" };
    }

    return { isValid: true, error: null };
  } catch (error: unknown) {
    const msg = String(error).toLowerCase();
    if (
      msg.includes("country code") ||
      msg.includes("calling code") ||
      msg.includes("missing or invalid")
    ) {
      return { isValid: false, error: "invalid" };
    }
    return { isValid: false, error: "invalid number" };
  }
}

/** Validates a full E.164 phone string (e.g. +919876543210). */
export function isValidE164Phone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  try {
    const parsed = phoneUtil.parseAndKeepRawInput(trimmed);
    return phoneUtil.isValidNumber(parsed);
  } catch {
    return false;
  }
}
