"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api/storefront";

export default function RegisterPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Already logged in → go home
  useEffect(() => {
    if (isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.register(form);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "var(--bg)" }}>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: 600, height: 600, borderRadius: "50%",
          background: "var(--accent)", opacity: 0.04, filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", right: "-10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "var(--accent)", opacity: 0.04, filter: "blur(80px)",
        }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-[var(--accent)]/30">
              SW
            </div>
            <span className="text-2xl font-extrabold text-[var(--text-primary)]">
              Shop<span className="text-[var(--accent)]">Wave</span>
            </span>
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold text-[var(--text-primary)]">Create account</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Join ShopWave and start shopping today</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl shadow-black/20 p-8">

          {success ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-5">
                <svg className="h-10 w-10 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Account created!</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Your account has been created successfully. Sign in to start shopping.
              </p>
              <Link
                href="/login"
                id="register-go-to-login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm transition-all shadow-lg shadow-[var(--accent)]/30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In Now
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] text-sm">
                  <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="reg-username" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Username
                  </label>
                  <input
                    id="reg-username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    autoFocus
                    placeholder="john_doe"
                    value={form.username}
                    onChange={handle}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Email address
                  </label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handle}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Password
                  </label>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handle}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  />
                </div>

                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm transition-all shadow-lg shadow-[var(--accent)]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating account…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Create Account
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
                <p className="text-sm text-[var(--text-secondary)]">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[var(--accent)] font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
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
