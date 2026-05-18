/**
 * authModalEvents.ts
 *
 * Opens the GlobalAuthModal via TWO parallel mechanisms for maximum reliability:
 *
 *   1. Custom DOM event  — window.dispatchEvent(...)
 *   2. Direct window fn — window.__sw_openModal(tab)  (set by GlobalAuthModal on mount)
 *
 * Usage:
 *   import { triggerAuthModal } from "@/lib/authModalEvents";
 *   triggerAuthModal("login");   // or "register"
 */

export const AUTH_MODAL_EVENT = "shopwave:open-auth-modal" as const;

export type AuthModalTab = "login" | "register";

export function triggerAuthModal(tab: AuthModalTab = "login") {
  if (typeof window === "undefined") return;

  // Mechanism 1: custom event (GlobalAuthModal listens)
  window.dispatchEvent(
    new CustomEvent(AUTH_MODAL_EVENT, { detail: { tab } })
  );

  // Mechanism 2: direct global function (set by GlobalAuthModal on mount)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__sw_openModal?.(tab);
}
