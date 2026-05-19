"use client";

/**
 * StorefrontProviders — Layout shell only.
 *
 * Auth (AuthProvider + GlobalAuthModal) lives in the ROOT layout (RootProviders),
 * so it is available on every page and never duplicated.
 * This component just wraps the storefront pages with Header + Footer.
 */

import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function StorefrontProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-14 sm:pt-16">{children}</main>
      <Footer />
    </div>
  );
}
