"use client";

/**
 * GlobalAuthModal — completely self-contained.
 *
 * Lives in the ROOT layout (app/layout.tsx) so it is ALWAYS mounted,
 * on every page, regardless of routing or context trees.
 *
 * Open/close: DOM custom events (shopwave:open-auth-modal)
 * Login state: writes directly to localStorage, then dispatches
 *              shopwave:auth-success so AuthContext can pick it up.
 * No useAuth() — no context dependency at all.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const OPEN_EVENT = "shopwave:open-auth-modal";
const SUCCESS_EVENT = "shopwave:auth-success";
const API_BASE =
  typeof window !== "undefined"
    ? "/api/proxy"
    : process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type Tab = "login" | "register";

const inputCls =
  "w-full px-4 py-3 rounded-xl text-sm transition-colors outline-none " +
  "border focus:border-[var(--accent)] " +
  "bg-[var(--surface-2)] border-[var(--border)] " +
  "text-[var(--text-primary)] placeholder-[var(--text-secondary)]";

// ─── tiny fetch helpers ───────────────────────────────────────
async function apiPost(path: string, body: Record<string, string>) {
  const fd = new FormData();
  Object.entries(body).forEach(([k, v]) => fd.append(k, v));
  const res = await fetch(`/api/proxy${path}`, {
    method: "POST",
    headers: { "X-User-Type": "user" },
    body: fd,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || res.statusText);
  return JSON.parse(text);
}

// ─── Login form ───────────────────────────────────────────────
function LoginForm({ onSwitch, onClose }: { onSwitch: () => void; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiPost("/login", { email, password });
      // Save to localStorage
      localStorage.setItem("auth_token", data.token ?? "");
      localStorage.setItem("auth_refresh", data.refresh ?? "");
      localStorage.setItem("auth_email", email);
      // Notify AuthContext (if present)
      window.dispatchEvent(
        new CustomEvent(SUCCESS_EVENT, {
          detail: { token: data.token, refresh: data.refresh, email },
        })
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: 12,
          background: "var(--danger, #ef4444)22",
          border: "1px solid var(--danger, #ef4444)55",
          color: "var(--danger, #ef4444)", fontSize: 13,
        }}>
          {error}
        </div>
      )}
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
          Email
        </label>
        <input
          id="gm-login-email"
          type="email" required autoComplete="email"
          placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
          Password
        </label>
        <input
          id="gm-login-password"
          type="password" required autoComplete="current-password"
          placeholder="••••••••"
          value={password} onChange={e => setPassword(e.target.value)}
          className={inputCls}
        />
      </div>
      <button
        id="gm-login-submit"
        type="submit" disabled={loading}
        style={{
          width: "100%", padding: "12px", borderRadius: 12,
          background: "var(--accent, #6366f1)",
          color: "#fff", fontWeight: 600, fontSize: 14,
          border: "none", cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1, transition: "all .2s",
        }}
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
      <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch}
          style={{ color: "var(--accent, #6366f1)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
          Register
        </button>
      </p>
    </form>
  );
}

// ─── Register form ────────────────────────────────────────────
function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPost("/register", form);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "var(--success, #22c55e)22",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
      }}>
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--success, #22c55e)" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>Account created!</p>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>Sign in to continue.</p>
      <button onClick={onSwitch}
        style={{
          width: "100%", padding: "12px", borderRadius: 12,
          background: "var(--accent, #6366f1)", color: "#fff",
          fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer",
        }}>
        Sign In Now
      </button>
    </div>
  );

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: 12,
          background: "var(--danger, #ef4444)22",
          border: "1px solid var(--danger, #ef4444)55",
          color: "var(--danger, #ef4444)", fontSize: 13,
        }}>
          {error}
        </div>
      )}
      {["username", "email", "password"].map(field => (
        <div key={field}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            id={`gm-reg-${field}`}
            name={field}
            type={field === "password" ? "password" : field === "email" ? "email" : "text"}
            required
            autoComplete={field === "password" ? "new-password" : field}
            placeholder={field === "email" ? "you@example.com" : field === "password" ? "••••••••" : "john_doe"}
            value={form[field as keyof typeof form]}
            onChange={handle}
            className={inputCls}
          />
        </div>
      ))}
      <button
        id="gm-reg-submit"
        type="submit" disabled={loading}
        style={{
          width: "100%", padding: "12px", borderRadius: 12,
          background: "var(--accent, #6366f1)",
          color: "#fff", fontWeight: 600, fontSize: 14,
          border: "none", cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}>
        {loading ? "Creating account…" : "Create Account"}
      </button>
      <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
        Already have an account?{" "}
        <button type="button" onClick={onSwitch}
          style={{ color: "var(--accent, #6366f1)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
          Sign In
        </button>
      </p>
    </form>
  );
}

// ─── Modal shell ──────────────────────────────────────────────
export default function GlobalAuthModal() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("login");
  const overlayRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Method 1: Listen for open trigger via custom DOM event
  useEffect(() => {
    const handler = (e: Event) => {
      const t = (e as CustomEvent<{ tab?: Tab }>).detail?.tab ?? "login";
      setTab(t);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);

  // Method 2: Expose as a direct global function — bulletproof fallback
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__sw_openModal = (tab: Tab = "login") => {
      setTab(tab);
      setOpen(true);
    };
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__sw_openModal;
    };
  }, []);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, close]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      id="auth-modal-overlay"
      onClick={e => { if (e.target === overlayRef.current) close(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "gmOverlayIn .18s ease",
      }}
    >
      <div
        id="auth-modal-panel"
        style={{
          width: "100%", maxWidth: 400,
          background: "var(--surface, #1e1e2e)",
          border: "1px solid var(--border, #ffffff18)",
          borderRadius: 20,
          boxShadow: "0 32px 80px rgba(0,0,0,.6)",
          overflow: "hidden",
          animation: "gmPanelIn .22s cubic-bezier(.22,.68,0,1.2)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 24px 0" }}>
          {/* Close btn */}
          <button
            id="auth-modal-close"
            onClick={close}
            aria-label="Close"
            style={{
              position: "absolute", top: 16, right: 16,
              width: 32, height: 32, borderRadius: 8,
              background: "transparent",
              border: "1px solid var(--border, #ffffff18)",
              color: "var(--text-secondary)",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "var(--accent, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 11, fontWeight: 900,
            }}>SW</div>
            <span style={{ fontWeight: 700, color: "var(--text-primary, #fff)" }}>
              Shop<span style={{ color: "var(--accent, #6366f1)" }}>Wave</span>
            </span>
          </div>

          {/* Tab pills */}
          <div style={{
            display: "flex", gap: 4, padding: 4,
            background: "var(--surface-2, #ffffff0a)",
            borderRadius: 12, marginBottom: 24,
          }}>
            {(["login", "register"] as Tab[]).map(t => (
              <button
                key={t}
                id={`auth-modal-tab-${t}`}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 9,
                  fontWeight: 600, fontSize: 13,
                  border: "none", cursor: "pointer",
                  transition: "all .2s",
                  background: tab === t ? "var(--accent, #6366f1)" : "transparent",
                  color: tab === t ? "#fff" : "var(--text-secondary)",
                  boxShadow: tab === t ? "0 2px 8px var(--accent, #6366f1)44" : "none",
                }}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "0 24px 24px", position: "relative" }}>
          {tab === "login"
            ? <LoginForm onSwitch={() => setTab("register")} onClose={close} />
            : <RegisterForm onSwitch={() => setTab("login")} />}
        </div>
      </div>

      <style>{`
        @keyframes gmOverlayIn { from { opacity:0 } to { opacity:1 } }
        @keyframes gmPanelIn {
          from { opacity:0; transform: translateY(24px) scale(0.95) }
          to   { opacity:1; transform: translateY(0) scale(1) }
        }
      `}</style>
    </div>,
    document.body
  );
}
