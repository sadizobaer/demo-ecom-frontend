"use client";

/**
 * RootProviders — mounts at the TOP of the app (app/layout.tsx).
 * Provides AuthContext globally and renders GlobalAuthModal once,
 * always, for every page in the app.
 */

import { AuthProvider } from "@/contexts/AuthContext";
import GlobalAuthModal from "@/components/shared/GlobalAuthModal";

export default function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <GlobalAuthModal />
    </AuthProvider>
  );
}
