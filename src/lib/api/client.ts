/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  UNIFIED API CLIENT — lib/api/client.ts                      ║
 * ║                                                               ║
 * ║  Two exported fetch functions enforce strict separation:      ║
 * ║                                                               ║
 * ║  storefrontFetch()  →  always injects X-User-Type: user       ║
 * ║                        no token required for GETs             ║
 * ║                                                               ║
 * ║  adminFetch()       →  always injects X-User-Type: admin      ║
 * ║                        always requires Bearer token           ║
 * ║                        throws if token is missing             ║
 * ║                                                               ║
 * ║  CORS Strategy                                                ║
 * ║    Server Components  → direct call to Go (server-to-server)  ║
 * ║    Client Components  → /api/proxy/* (same-origin, no CORS)   ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const SERVER_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function getBaseUrl(): string {
  // Server-side: call the Go backend directly (no CORS restriction)
  if (typeof window === "undefined") return SERVER_BASE;
  // Client-side: route through the Next.js same-origin proxy
  return "/api/proxy";
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_user_id");
}

// ─────────────────────────────────────────────────────────────
// Typed error
// ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─────────────────────────────────────────────────────────────
// Shared option types
// ─────────────────────────────────────────────────────────────
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface FetchOptions {
  method?: HttpMethod;
  /**
   * Pass a plain object as body.
   * If `multipart: true` → sent as multipart/form-data (Go r.FormValue / r.FormFile)
   * Otherwise            → sent as application/json
   */
  body?: Record<string, unknown> | null;
  multipart?: boolean;
  /** FormData with File fields (for image uploads). Takes priority over `body`. */
  formData?: FormData;
  /** Next.js fetch cache config — only used in Server Components */
  nextOptions?: RequestInit;
}

// ─────────────────────────────────────────────────────────────
// Internal: raw fetch executor
// ─────────────────────────────────────────────────────────────
async function execute<T>(
  path: string,
  extraHeaders: Record<string, string>,
  opts: FetchOptions = {}
): Promise<T> {
  const { method = "GET", body, multipart = false, formData, nextOptions } = opts;
  const base = getBaseUrl();
  const headers: Record<string, string> = { ...extraHeaders };

  let bodyInit: BodyInit | undefined;

  if (formData) {
    // Pre-built FormData (contains File objects) — do NOT set Content-Type
    bodyInit = formData;
  } else if (body) {
    if (multipart) {
      // Build FormData from plain object for Go's r.FormValue()
      const fd = new FormData();
      for (const [k, v] of Object.entries(body)) {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      }
      bodyInit = fd;
      // Let the browser set Content-Type with boundary
    } else {
      headers["Content-Type"] = "application/json";
      bodyInit = JSON.stringify(body);
    }
  }

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: bodyInit,
    ...nextOptions,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || res.statusText);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return res.json() as Promise<T>;
  return res.text() as unknown as T;
}

// ─────────────────────────────────────────────────────────────
// ① STOREFRONT FETCH
//    Always sends X-User-Type: user.
//    Auth token is attached only if one exists (needed for
//    authenticated storefront actions like cart/wishlist).
// ─────────────────────────────────────────────────────────────
export function storefrontFetch<T>(
  path: string,
  opts: FetchOptions = {}
): Promise<T> {
  const token = getToken();
  const userId = getUserId();

  const headers: Record<string, string> = {
    "X-User-Type": "user",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (userId) headers["X-User-Id"] = userId;

  return execute<T>(path, headers, opts);
}

// ─────────────────────────────────────────────────────────────
// ② ADMIN FETCH
//    Always sends X-User-Type: admin + Bearer token.
//    Throws immediately if no token is stored (prevents
//    unauthenticated admin mutations).
// ─────────────────────────────────────────────────────────────
export function adminFetch<T>(
  path: string,
  opts: FetchOptions = {}
): Promise<T> {
  const token = getToken();
  if (!token) {
    throw new ApiError(401, "Admin session required. Please log in.");
  }
  const headers: Record<string, string> = {
    "X-User-Type": "admin",
    Authorization: `Bearer ${token}`,
  };
  return execute<T>(path, headers, opts);
}

/**
 * Legacy alias — kept for backwards compatibility with any existing
 * imports. New code should prefer storefrontFetch or adminFetch.
 */
export const apiFetch = storefrontFetch;
