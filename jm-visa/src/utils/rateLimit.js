const RATE_LIMIT_COOKIE = "jm_form_rl";
const RATE_LIMIT_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((acc, part) => {
    const [key, ...valueParts] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = valueParts.join("=");
    return acc;
  }, {});
};

export const enforceRateLimit = (req) => {
  const cookies = parseCookies(req.headers.get("cookie") || "");
  const lastSubmission = Number(cookies[RATE_LIMIT_COOKIE]);
  const now = Date.now();

  if (!Number.isNaN(lastSubmission) && now - lastSubmission < RATE_LIMIT_WINDOW_MS) {
    const remainingMs = RATE_LIMIT_WINDOW_MS - (now - lastSubmission);
    const retryAfterSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.ceil(remainingMs / 60000);

    return {
      allowed: false,
      retryAfterSeconds,
      message: `You can submit only once every 2 hours from the same device. Please try again in about ${minutes} minute(s), or WhatsApp us directly at +91 9321315524 for urgent help.`,
    };
  }

  const cookieValue = `${RATE_LIMIT_COOKIE}=${now}; Max-Age=${Math.floor(
    RATE_LIMIT_WINDOW_MS / 1000
  )}; Path=/; SameSite=Lax;`;

  return {
    allowed: true,
    cookieValue,
  };
};

export const attachRateLimitCookie = (response, cookieValue) => {
  if (!cookieValue) return;
  response.headers.append("Set-Cookie", cookieValue);
};

