"use client";

/**
 * AuthModal — self-contained modal.
 *
 * Open/close state is driven by DOM custom events (AUTH_MODAL_EVENT),
 * NOT by AuthContext. This makes it immune to React context tree issues.
 *
 * The login() function still calls AuthContext to persist the session.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api/storefront";
import {
  AUTH_MODAL_EVENT,
  type AuthModalTab,
} from "@/lib/authModalEvents";

// ─────────────────────────────────────────────────────────────
// Shared input style
// ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] " +
  "text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] " +
  "focus:outline-none focus:border-[var(--accent)] transition-colors";

// ─────────────────────────────────────────────────────────────
// Login Form
// ─────────────────────────────────────────────────────────────
function LoginForm({
  onSwitch,
  onClose,
}: {
  onSwitch: () => void;
  onClose: () => void;
}) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(form);
      login(res.token, res.refresh, undefined, form.email);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="px-4 py-2.5 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] text-sm">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="modal-login-email"
          className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
        >
          Email
        </label>
        <input
          id="modal-login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handle}
          className={inputCls}
        />
      </div>

      <div>
        <label
          htmlFor="modal-login-password"
          className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
        >
          Password
        </label>
        <input
          id="modal-login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={handle}
          className={inputCls}
        />
      </div>

      <button
        id="modal-login-submit"
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-lg shadow-[var(--accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          id="modal-switch-to-register"
          className="text-[var(--accent)] font-medium hover:underline"
        >
          Register
        </button>
      </p>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Register Form
// ─────────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.register(form);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto">
          <svg
            className="h-8 w-8 text-[var(--success)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-[var(--text-primary)] font-semibold">Account created!</p>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Sign in to continue.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitch}
          id="modal-go-to-login-after-register"
          className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="px-4 py-2.5 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] text-sm">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="modal-register-username"
          className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
        >
          Username
        </label>
        <input
          id="modal-register-username"
          name="username"
          type="text"
          required
          autoComplete="username"
          placeholder="john_doe"
          value={form.username}
          onChange={handle}
          className={inputCls}
        />
      </div>

      <div>
        <label
          htmlFor="modal-register-email"
          className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
        >
          Email
        </label>
        <input
          id="modal-register-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handle}
          className={inputCls}
        />
      </div>

      <div>
        <label
          htmlFor="modal-register-password"
          className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
        >
          Password
        </label>
        <input
          id="modal-register-password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={handle}
          className={inputCls}
        />
      </div>

      <button
        id="modal-register-submit"
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-lg shadow-[var(--accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account…" : "Create Account"}
      </button>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          id="modal-switch-to-login"
          className="text-[var(--accent)] font-medium hover:underline"
        >
          Sign In
        </button>
      </p>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Modal Shell
// ─────────────────────────────────────────────────────────────
export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AuthModalTab>("login");
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Hydration guard — portals need the DOM
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for open events dispatched by any button anywhere
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ tab: AuthModalTab }>).detail;
      setTab(detail?.tab ?? "login");
      setOpen(true);
    };
    window.addEventListener(AUTH_MODAL_EVENT, handler);
    return () => window.removeEventListener(AUTH_MODAL_EVENT, handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted || !open) return null;

  const isLogin = tab === "login";

  return createPortal(
    <div
      ref={overlayRef}
      id="auth-modal-overlay"
      onClick={(e) => {
        if (e.target === overlayRef.current) setOpen(false);
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        id="auth-modal-panel"
        style={{ animation: "authSlideUp .22s ease both" }}
        className="relative w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header row */}
        <div className="relative px-6 pt-6 pb-2">
          {/* Close */}
          <button
            id="auth-modal-close"
            aria-label="Close modal"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white text-xs font-black">
              SW
            </span>
            <span className="font-bold text-[var(--text-primary)]">
              Shop<span className="text-[var(--accent)]">Wave</span>
            </span>
          </div>

          {/* Tab pills */}
          <div className="flex gap-1 p-1 rounded-xl bg-[var(--surface-2)] mb-6">
            <button
              id="auth-modal-tab-login"
              onClick={() => setTab("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                isLogin
                  ? "bg-[var(--accent)] text-white shadow-md"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-modal-tab-register"
              onClick={() => setTab("register")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                !isLogin
                  ? "bg-[var(--accent)] text-white shadow-md"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6">
          {isLogin ? (
            <LoginForm
              onSwitch={() => setTab("register")}
              onClose={() => setOpen(false)}
            />
          ) : (
            <RegisterForm onSwitch={() => setTab("login")} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes authSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}
