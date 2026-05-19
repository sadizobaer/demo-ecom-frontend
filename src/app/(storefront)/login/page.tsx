"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { loginAction } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, login } = useAuth();
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [success, setSuccess] = useState(false);

  // Already logged in → go home
  useEffect(() => {
    if (isLoggedIn && !success) router.replace("/");
  }, [isLoggedIn, router, success]);

  // Server Action returned tokens → store in AuthContext + show success
  useEffect(() => {
    if (!state || state.error || !state.token) return;

    // Save to AuthContext (writes localStorage, sets isLoggedIn = true)
    login(
      state.token,
      state.refresh   ?? "",
      state.user_id,
      state.username  ?? "",
      state.email     ?? ""
    );

    // Show success message, then redirect after 1.5 s
    setSuccess(true);
    const timer = setTimeout(() => {
      router.replace("/");
    }, 1500);
    return () => clearTimeout(timer);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Success screen ──────────────────────────────────────── */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-[var(--success)]/15 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="h-12 w-12 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Login Successful!</h2>
          <p className="text-[var(--text-secondary)]">
            Welcome back, <span className="text-[var(--accent)] font-semibold">{state?.username ?? "there"}</span>!
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Redirecting you to the store…</p>
          <div className="mt-6 flex justify-center">
            <div className="h-1 w-32 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--success)] rounded-full transition-all"
                style={{ width: "100%", transition: "width 1.4s linear" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Login form ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "var(--accent)", opacity: 0.04, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "var(--accent)", opacity: 0.04, filter: "blur(80px)" }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-[var(--accent)]/30">SW</div>
            <span className="text-2xl font-extrabold text-[var(--text-primary)]">
              Shop<span className="text-[var(--accent)]">Wave</span>
            </span>
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold text-[var(--text-primary)]">Welcome back</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Sign in to your account to continue</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl shadow-black/20 p-8">
          {/* Error banner */}
          {state?.error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] text-sm">
              <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={pending}
              className="w-full py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm transition-all shadow-lg shadow-[var(--accent)]/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[var(--accent)] font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)] transition-colors">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
