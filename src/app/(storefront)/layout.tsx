// Server Component layout — keeps RSC / metadata support for child pages.
// Client-side providers (AuthContext, Header, Footer, AuthModal) are
// isolated inside StorefrontProviders which carries the "use client" boundary.

import StorefrontProviders from "@/components/storefront/StorefrontProviders";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StorefrontProviders>{children}</StorefrontProviders>;
}
