/**
 * JWT utilities — client-side only (no secret key needed for decode)
 *
 * JWTs are signed by the server. We only decode the payload here
 * for client-side UI decisions (e.g. "is this user an admin?").
 * The server always re-validates the signature on every request.
 */

export interface JwtPayload {
  user_id?: number | string;
  username?: string;
  email?: string;
  type?: "access" | "refresh";
  is_admin?: boolean;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Decodes a JWT payload without verifying the signature.
 * Returns null if the token is malformed or expired.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    const payload = JSON.parse(json) as JwtPayload;

    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Returns true only when the stored access token:
 *  1. Exists in localStorage
 *  2. Is not expired
 *  3. Has is_admin === true
 */
export function isAdminToken(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("auth_token");
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  return payload?.is_admin === true && payload?.type === "access";
}

/**
 * Returns true when the stored access token is valid (any user).
 */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("auth_token");
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  return payload?.type === "access";
}
