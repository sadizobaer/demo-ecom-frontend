"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { decodeJwtPayload } from "@/lib/auth";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface AuthUser {
  user_id: number | string;
  username: string;
  email: string;
}

interface AuthContextType {
  /** Whether the user has a valid auth token */
  isLoggedIn: boolean;
  /** Basic user info decoded from localStorage (if available) */
  user: AuthUser | null;
  /** Open the auth modal. Defaults to 'login' tab. */
  openAuthModal: (tab?: "login" | "register") => void;
  /** Close the auth modal */
  closeAuthModal: () => void;
  /** Whether the auth modal is currently visible */
  authModalOpen: boolean;
  /** Which tab is active in the modal */
  authModalTab: "login" | "register";
  /** Call after a successful login to store tokens + update state */
  login: (
    token: string,
    refresh: string,
    userId?: number | string,
    username?: string,
    email?: string
  ) => void;
  /** Clear tokens and log out */
  logout: () => void;
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  // Check for auth query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    if (auth === "login" || auth === "register") {
      setAuthModalTab(auth);
      setAuthModalOpen(true);
      // Clean up URL without refreshing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  // Rehydrate from localStorage on mount — validate token before trusting it
  useEffect(() => {
    const token    = localStorage.getItem("auth_token");
    if (!token) return;

    // Decode and check expiry — decodeJwtPayload returns null if expired/invalid
    const payload = decodeJwtPayload(token);
    if (!payload) {
      // Token is expired or malformed — clean up stale storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_refresh");
      localStorage.removeItem("auth_user_id");
      localStorage.removeItem("auth_username");
      localStorage.removeItem("auth_email");
      return;
    }

    const userId   = localStorage.getItem("auth_user_id")  ?? "";
    const username = localStorage.getItem("auth_username") ?? "";
    const email    = localStorage.getItem("auth_email")    ?? "";

    setIsLoggedIn(true);
    setUser({ user_id: userId, username, email });
  }, []);

  // Listen for login events from GlobalAuthModal (decoupled modal)
  useEffect(() => {
    const handler = (e: Event) => {
      const { token, refresh, email } = (e as CustomEvent).detail ?? {};
      if (!token) return;
      const payload = (() => { try { return JSON.parse(atob(token.split(".")[1])); } catch { return {}; } })();
      const userId = payload?.user_id;
      if (userId != null) localStorage.setItem("auth_user_id", String(userId));
      setIsLoggedIn(true);
      setUser({ user_id: userId ?? "", username: "", email: email ?? "" });
    };
    window.addEventListener("shopwave:auth-success", handler);
    return () => window.removeEventListener("shopwave:auth-success", handler);
  }, []);

  const openAuthModal = useCallback(
    (tab: "login" | "register" = "login") => {
      setAuthModalTab(tab);
      setAuthModalOpen(true);
    },
    []
  );

  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const login = useCallback(
    (token: string, refresh: string, userId?: number | string, username = "", email = "") => {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_refresh", refresh);

      // Prefer explicit userId from response; fallback to JWT payload
      const payload = decodeJwtPayload(token);
      const resolvedUserId = userId ?? payload?.user_id;

      if (resolvedUserId !== undefined && resolvedUserId !== null) {
        localStorage.setItem("auth_user_id", String(resolvedUserId));
      }
      if (username) localStorage.setItem("auth_username", username);
      if (email) localStorage.setItem("auth_email", email);

      setIsLoggedIn(true);
      setUser({
        user_id: resolvedUserId ?? "",
        username,
        email,
      });
      setAuthModalOpen(false);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh");
    localStorage.removeItem("auth_user_id");
    localStorage.removeItem("auth_username");
    localStorage.removeItem("auth_email");
    // Clear server-action cookies too
    const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    ["auth_token","auth_refresh","auth_user_id","auth_username","auth_email"].forEach(
      name => { document.cookie = `${name}=; ${expire}`; }
    );
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
        authModalTab,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
