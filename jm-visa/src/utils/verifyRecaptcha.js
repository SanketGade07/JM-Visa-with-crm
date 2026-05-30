"use server";

import env from "../config/env";

/**
 * Verify a Google reCAPTCHA token against Google's verification endpoint.
 * @param {string | null} token
 * @returns {Promise<{ success: boolean; message?: string }>}
 */
export const verifyRecaptchaToken = async (token) => {
  if (!token) {
    return { success: false, message: "reCAPTCHA token missing." };
  }

  if (!env.RECAPTCHA_SECRET_KEY) {
    console.error("Missing RECAPTCHA_SECRET_KEY environment variable");
    return { success: false, message: "Server misconfiguration: reCAPTCHA secret missing." };
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: env.RECAPTCHA_SECRET_KEY,
        response: token,
      }).toString(),
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data["error-codes"]?.join(", ") || "reCAPTCHA verification failed.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { success: false, message: "Unable to verify reCAPTCHA token." };
  }
};

export default verifyRecaptchaToken;

