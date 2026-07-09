const encoder = new TextEncoder();

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "dev-jwt-secret-fallback-key-should-be-replaced-in-prod";

async function getHmacKey(): Promise<CryptoKey> {
  const rawKey = encoder.encode(JWT_SECRET.padEnd(32, "0"));
  return crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign", "verify"]
  );
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Unicode-safe base64 encoding and decoding for claims serialization
function encodeClaims(claimsObj: Record<string, unknown>): string {
  const str = JSON.stringify(claimsObj);
  const encoded = btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeClaims(base64url: string): Record<string, unknown> {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLength);
  const binary = atob(padded);
  const str = decodeURIComponent(
    Array.prototype.map
      .call(binary, (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(str) as Record<string, unknown>;
}

export interface SessionPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  exp?: number;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const header = encodeClaims({ alg: "HS256", typ: "JWT" });
  
  // Default expiration: 10 years (effectively forever)
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 10;
  const claims = encodeClaims({ ...payload, exp });

  const signingInput = `${header}.${claims}`;
  const key = await getHmacKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signingInput)
  );

  const signature = bufferToBase64Url(signatureBuffer);
  return `${signingInput}.${signature}`;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  if (!token) return null;
  
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, claims, signature] = parts;
  const signingInput = `${header}.${claims}`;

  try {
    const key = await getHmacKey();
    const signatureBuffer = base64UrlToBuffer(signature);
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      encoder.encode(signingInput)
    );

    if (!isValid) return null;

    const payload = decodeClaims(claims) as unknown as SessionPayload;

    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    console.error("Session verification exception:", err);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    256 // 32 bytes
  );

  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [saltHex, hashHex] = parts;

  try {
    const salt = new Uint8Array(
      saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    const baseKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      256
    );

    const verifyHex = Array.from(new Uint8Array(derivedBits))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return verifyHex === hashHex;
  } catch (err) {
    console.error("Password verification exception:", err);
    return false;
  }
}

export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const rand = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 10);
  return `${prefix}-${timestamp}-${rand}`;
}
