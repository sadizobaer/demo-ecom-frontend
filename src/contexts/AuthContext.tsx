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

  // Rehydrate from localStorage on mount (client-only)
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const storedUserId = localStorage.getItem("auth_user_id");
    const storedUsername = localStorage.getItem("auth_username");
    const storedEmail = localStorage.getItem("auth_email");

    if (token) {
      setIsLoggedIn(true);
      if (storedUserId || storedUsername || storedEmail) {
        setUser({
          user_id: storedUserId ?? "",
          username: storedUsername ?? "",
          email: storedEmail ?? "",
        });
      }
    }
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
    (token: string, refresh: string, username = "", email = "") => {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_refresh", refresh);

      // Extract user_id from JWT payload
      const payload = decodeJwtPayload(token);
      const userId = payload?.user_id;

      if (userId !== undefined && userId !== null) {
        localStorage.setItem("auth_user_id", String(userId));
      }
      if (username) localStorage.setItem("auth_username", username);
      if (email) localStorage.setItem("auth_email", email);

      setIsLoggedIn(true);
      setUser({
        user_id: userId ?? "",
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
