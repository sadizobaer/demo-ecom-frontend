"use server";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function backendPost(path: string, fields: Record<string, string>) {
  const res = await fetch(`${BACKEND}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-User-Type": "user",
    },
    body: new URLSearchParams(fields).toString(),
    cache: "no-store",
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

// ── Login Action ──────────────────────────────────────────────
// Returns token data on success so the CLIENT can call login()
// and update AuthContext state immediately (no cookie sync lag).
export interface LoginResult {
  error: string;
  token?: string;
  refresh?: string;
  user_id?: number;
  username?: string;
  email?: string;
}

export async function loginAction(
  _prev: LoginResult | null,
  formData: FormData
): Promise<LoginResult> {
  const email    = ((formData.get("email")    as string) ?? "").trim();
  const password = ((formData.get("password") as string) ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  let result: { ok: boolean; status: number; text: string };
  try {
    result = await backendPost("/login", { email, password });
  } catch (err) {
    console.error("[loginAction] fetch error:", err);
    return { error: "Cannot reach the server. Is the backend running?" };
  }

  if (!result.ok) {
    return { error: result.text.trim() || "Invalid email or password." };
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(result.text);
  } catch {
    return { error: "Unexpected server response." };
  }

  // Return tokens to the client — AuthContext.login() handles storage
  return {
    error: "",
    token:    String(data.token    ?? ""),
    refresh:  String(data.refresh  ?? ""),
    user_id:  Number(data.user_id  ?? 0),
    username: String(data.username ?? ""),
    email:    String(data.email    ?? email),
  };
}

// ── Register Action ───────────────────────────────────────────
export interface RegisterResult {
  error: string;
  success: boolean;
}

export async function registerAction(
  _prev: RegisterResult | null,
  formData: FormData
): Promise<RegisterResult> {
  const username = ((formData.get("username") as string) ?? "").trim();
  const email    = ((formData.get("email")    as string) ?? "").trim();
  const password = ((formData.get("password") as string) ?? "").trim();

  if (!username || !email || !password) {
    return { error: "All fields are required.", success: false };
  }

  let result: { ok: boolean; status: number; text: string };
  try {
    result = await backendPost("/register", { username, email, password });
  } catch (err) {
    console.error("[registerAction] fetch error:", err);
    return { error: "Cannot reach the server. Is the backend running?", success: false };
  }

  if (!result.ok) {
    return { error: result.text.trim() || "Registration failed. Please try again.", success: false };
  }

  return { error: "", success: true };
}
