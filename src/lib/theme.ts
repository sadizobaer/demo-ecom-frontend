/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              SHOPWAVE — DESIGN SYSTEM THEME                  ║
 * ║                                                              ║
 * ║  This is the SINGLE SOURCE OF TRUTH for all visual tokens.  ║
 * ║  Edit values here → entire application updates instantly.   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────────
// COLOR PALETTE
// ─────────────────────────────────────────────────────────────
const colors = {
  // ── Backgrounds ──────────────────────────────────────────────
  /** Main page background */
  bg: "#0a0a0f",
  /** Card/panel surface */
  surface: "#13131a",
  /** Elevated surface (inputs, nested panels) */
  surface2: "#1c1c28",
  /** Dividers and borders */
  border: "#2a2a3a",

  // ── Brand / Accent ───────────────────────────────────────────
  /** Primary brand color */
  accent: "#6c63ff",
  /** Hovered state of accent */
  accentHover: "#7d75ff",
  /** Semi-transparent accent (backgrounds, badges) */
  accentLight: "rgba(108, 99, 255, 0.15)",

  // ── Typography ───────────────────────────────────────────────
  /** Headings and primary body copy */
  textPrimary: "#f0f0ff",
  /** Secondary / muted text, labels */
  textSecondary: "#9898b8",
  /** Text on accent-colored backgrounds */
  textOnAccent: "#ffffff",

  // ── Status ───────────────────────────────────────────────────
  /** Success states, in-stock indicators */
  success: "#22c55e",
  /** Error states, destructive actions */
  danger: "#ef4444",
  /** Warnings, low-stock alerts */
  warning: "#f59e0b",
  /** Informational states */
  info: "#3b82f6",
} as const;

// ─────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────────────────────
const typography = {
  /** Base font stack used across the app */
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",

  fontSizes: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem",// 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem",    // 48px
    "6xl": "3.75rem", // 60px
    "7xl": "4.5rem",  // 72px
  },

  fontWeights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },

  lineHeights: {
    tight: "1.2",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
  },
} as const;

// ─────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────
const radius = {
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "18px",
  "2xl": "24px",
  full: "9999px",
} as const;

// ─────────────────────────────────────────────────────────────
// SHADOWS
// ─────────────────────────────────────────────────────────────
const shadows = {
  /** Glow shadow for accent-colored elements */
  accent: "0 8px 32px rgba(108, 99, 255, 0.25)",
  /** Default card shadow */
  card: "0 4px 24px rgba(0, 0, 0, 0.3)",
  /** Strong elevated shadow */
  xl: "0 20px 60px rgba(0, 0, 0, 0.5)",
} as const;

// ─────────────────────────────────────────────────────────────
// TRANSITIONS
// ─────────────────────────────────────────────────────────────
const transitions = {
  fast: "150ms ease",
  base: "200ms ease",
  slow: "300ms ease",
} as const;

// ─────────────────────────────────────────────────────────────
// COMPOSED THEME EXPORT
// ─────────────────────────────────────────────────────────────
export const theme = {
  colors,
  typography,
  radius,
  shadows,
  transitions,
} as const;

export type Theme = typeof theme;

// ─────────────────────────────────────────────────────────────
// CSS VARIABLE GENERATOR
// Used by src/app/layout.tsx to inject :root { ... } at runtime
// so that ALL var(--...) references in every component reflect
// the values defined above.
// ─────────────────────────────────────────────────────────────
export function generateCssVars(): string {
  const c = colors;
  const t = typography;
  const r = radius;
  const s = shadows;
  const tr = transitions;

  return `
    /* === Backgrounds === */
    --bg: ${c.bg};
    --surface: ${c.surface};
    --surface-2: ${c.surface2};
    --border: ${c.border};

    /* === Brand === */
    --accent: ${c.accent};
    --accent-hover: ${c.accentHover};
    --accent-light: ${c.accentLight};

    /* === Text === */
    --text-primary: ${c.textPrimary};
    --text-secondary: ${c.textSecondary};
    --text-on-accent: ${c.textOnAccent};

    /* === Status === */
    --success: ${c.success};
    --danger: ${c.danger};
    --warning: ${c.warning};
    --info: ${c.info};

    /* === Typography === */
    --font-sans: ${t.fontFamily};
    --text-xs: ${t.fontSizes.xs};
    --text-sm: ${t.fontSizes.sm};
    --text-base: ${t.fontSizes.base};
    --text-lg: ${t.fontSizes.lg};
    --text-xl: ${t.fontSizes.xl};
    --text-2xl: ${t.fontSizes["2xl"]};
    --text-3xl: ${t.fontSizes["3xl"]};

    /* === Border Radius === */
    --radius-sm: ${r.sm};
    --radius-md: ${r.md};
    --radius-lg: ${r.lg};
    --radius-xl: ${r.xl};
    --radius-2xl: ${r["2xl"]};
    --radius-full: ${r.full};

    /* === Shadows === */
    --shadow-accent: ${s.accent};
    --shadow-card: ${s.card};
    --shadow-xl: ${s.xl};

    /* === Transitions === */
    --transition-fast: ${tr.fast};
    --transition-base: ${tr.base};
    --transition-slow: ${tr.slow};
  `.trim();
}
