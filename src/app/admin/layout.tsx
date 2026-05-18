"use client";

/**
 * Admin Layout — Client Component
 *
 * Guards ALL /admin/* routes:
 *  1. Checks localStorage for a token
 *  2. Decodes the JWT to verify is_admin === true
 *  3. Redirects to / with an error toast if either check fails
 *
 * This is a double-layer defence alongside the Next.js middleware.ts
 * which performs a lightweight cookie-based check on the server edge.
 */

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { decodeJwtPayload } from "@/lib/auth";

// ─────────────────────────────────────────────────────────────
// Sidebar links
// ─────────────────────────────────────────────────────────────
const navLinks = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
];

// ─────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checked, setChecked] = useState(false); // auth check completed?
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.replace("/?auth=required");
      return;
    }

    const payload = decodeJwtPayload(token);

    if (!payload || payload["is_admin"] !== true) {
      // Not an admin — kick back to storefront
      router.replace("/?auth=admin_required");
      return;
    }

    setAdminName((payload["username"] as string) ?? "Admin");
    setChecked(true);
  }, [router]);

  // Show nothing while auth check is in progress
  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] text-sm">Verifying access…</p>
        </div>
      </div>
    );
  }

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh");
    localStorage.removeItem("auth_username");
    localStorage.removeItem("auth_email");
    document.cookie = "is_admin=; Max-Age=0; path=/";
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      {/* ── Mobile backdrop ───────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 flex flex-col
          bg-[var(--surface)] border-r border-[var(--border)]
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border)]">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
            SW
          </div>
          <div>
            <p className="font-bold text-[var(--text-primary)] text-sm leading-none">ShopWave</p>
            <p className="text-[10px] text-[var(--accent)] font-semibold tracking-widest uppercase mt-0.5">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${active
                    ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
                  }
                `}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin info + logout */}
        <div className="px-3 py-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] font-bold text-sm flex-shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{adminName}</p>
              <p className="text-xs text-[var(--accent)]">Administrator</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Storefront
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-xs text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all mt-1"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 px-4 sm:px-6 py-4 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)]">
          <button
            id="admin-sidebar-toggle"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold text-[var(--text-primary)]">
              {navLinks.find(l => pathname.startsWith(l.href))?.label ?? "Admin Panel"}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] hidden sm:block">
              {pathname}
            </p>
          </div>

          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            Admin
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
