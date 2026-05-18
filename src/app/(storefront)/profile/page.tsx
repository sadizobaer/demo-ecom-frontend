"use client";

/**
 * Profile Page — requires login.
 * Shows user info and links to their order history, wishlist, favorites.
 */

import { useAuth } from "@/contexts/AuthContext";
import EmptyState from "@/components/shared/EmptyState";
import Link from "next/link";

export default function ProfilePage() {
  const { isLoggedIn, user, logout } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">My Profile</h1>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <EmptyState
            icon="generic"
            title="Sign in to view your profile"
            description="Access your account details, orders, wishlist and more."
            action={{ label: "Sign In", href: "/login" }}
          />
        </div>
      </div>
    );
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "U";

  const quickLinks = [
    {
      href: "/orders",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      label: "My Orders",
      desc: "Track and manage your purchases",
    },
    {
      href: "/wishlist",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      label: "Wishlist",
      desc: "Products saved for later",
    },
    {
      href: "/favorites",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      label: "Favorites",
      desc: "Items you love",
    },
    {
      href: "/cart",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      label: "My Cart",
      desc: "Continue where you left off",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">My Profile</h1>

      {/* Profile card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden mb-6">
        {/* Banner */}
        <div
          className="h-28"
          style={{
            background: "linear-gradient(135deg, var(--accent-light) 0%, transparent 100%)",
          }}
        />

        {/* Avatar + info */}
        <div className="px-6 pb-6 -mt-10 relative">
          <div className="w-20 h-20 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white text-2xl font-extrabold border-4 border-[var(--surface)] shadow-lg mb-4">
            {initials}
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{user?.username ?? "User"}</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">{user?.email ?? "—"}</p>
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                Active member
              </span>
            </div>

            <button
              id="profile-logout-btn"
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--danger)]/30 text-[var(--danger)] text-sm font-medium hover:bg-[var(--danger)]/10 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
          Account Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Username", value: user?.username ?? "—" },
            { label: "Email", value: user?.email ?? "—" },
            { label: "Account ID", value: user?.user_id ? `#${user.user_id}` : "—" },
            { label: "Status", value: "Active" },
          ].map((field) => (
            <div key={field.label} className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--surface-2)]">
              <span className="text-xs text-[var(--text-secondary)]">{field.label}</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{field.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
          Quick Access
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-white/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                {link.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {link.label}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">{link.desc}</p>
              </div>
              <svg
                className="h-4 w-4 text-[var(--text-secondary)] ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
