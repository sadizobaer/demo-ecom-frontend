"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Footer() {
  const { isLoggedIn } = useAuth();

  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold mb-3">
              <span className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white text-sm font-black">
                SW
              </span>
              <span>
                Shop<span className="text-[var(--accent)]">Wave</span>
              </span>
            </Link>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Your one-stop shop for quality products at unbeatable prices. Fast shipping, easy returns.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              Shop
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/wishlist", label: "Wishlist" },
                { href: "/favorites", label: "Favorites" },
                { href: "/cart", label: "Cart" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--accent)] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              Account
            </h3>
            <ul className="space-y-2">
              {!isLoggedIn ? (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="text-[var(--text-secondary)] hover:text-[var(--accent)] text-sm transition-colors"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="text-[var(--text-secondary)] hover:text-[var(--accent)] text-sm transition-colors"
                    >
                      Register
                    </Link>
                  </li>
                </>
              ) : null}
              {[
                { href: "/profile", label: "My Profile" },
                { href: "/orders", label: "My Orders" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--accent)] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {["FAQ", "Shipping Policy", "Return Policy", "Contact Us"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-[var(--text-secondary)] text-sm cursor-not-allowed">
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[var(--text-secondary)] text-sm">
            © {new Date().getFullYear()} ShopWave. All rights reserved.
          </p>
          <p className="text-[var(--text-secondary)] text-sm">
            Built with{" "}
            <span className="text-[var(--accent)]">Next.js</span> &amp; Go
          </p>
        </div>
      </div>
    </footer>
  );
}
