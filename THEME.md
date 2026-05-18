# ShopWave Theme System

## ⚡ One File to Rule Them All

**To change any visual style in the entire app, edit only this file:**

```
src/lib/theme.ts
```

That's it. Save the file → Next.js hot-reloads → every component reflects the new values.

---

## How It Works

```
src/lib/theme.ts          ← You edit this
       │
       ▼
src/app/layout.tsx        ← generateCssVars() reads theme.ts,
       │                     injects :root { --accent: ...; } etc.
       │
       ▼
Every component           ← uses var(--accent), var(--bg), etc.
                             which now resolve to theme.ts values
```

The `globals.css` file also defines Tailwind `@theme` aliases so **both** styles work in components:

```tsx
// ✅ Arbitrary value (always worked)
className="bg-[var(--accent)] text-[var(--text-primary)]"

// ✅ Semantic Tailwind class (new, via @theme)
className="bg-accent text-text-primary"
```

---

## Available Tokens

### Colors (edit in `theme.ts → colors`)

| CSS Variable | Default | Usage |
|---|---|---|
| `--bg` | `#0a0a0f` | Page background |
| `--surface` | `#13131a` | Cards, panels |
| `--surface-2` | `#1c1c28` | Inputs, nested panels |
| `--border` | `#2a2a3a` | Dividers, borders |
| `--accent` | `#6c63ff` | Primary brand color |
| `--accent-hover` | `#7d75ff` | Hover state |
| `--accent-light` | `rgba(108,99,255,0.15)` | Translucent brand bg |
| `--text-primary` | `#f0f0ff` | Headings & body copy |
| `--text-secondary` | `#9898b8` | Labels, muted text |
| `--success` | `#22c55e` | In-stock, success |
| `--danger` | `#ef4444` | Errors, destructive |
| `--warning` | `#f59e0b` | Warnings |
| `--info` | `#3b82f6` | Info states |

### Typography (edit in `theme.ts → typography`)
- `fontFamily` — base font stack
- `fontSizes` — xs → 7xl scale
- `fontWeights` — normal → black

### Border Radius (edit in `theme.ts → radius`)
- `--radius-sm` through `--radius-2xl`

### Shadows (edit in `theme.ts → shadows`)
- `--shadow-accent`, `--shadow-card`, `--shadow-xl`

### Transitions (edit in `theme.ts → transitions`)
- `--transition-fast` (150ms), `--transition-base` (200ms), `--transition-slow` (300ms)

---

## Example: Switching to a Blue Theme

Open `src/lib/theme.ts` and change the `accent` block:

```ts
accent:      "#2563eb",   // blue-600
accentHover: "#3b82f6",   // blue-500
accentLight: "rgba(37, 99, 235, 0.15)",
```

Save → all buttons, links, badges, sidebar active states, and focus rings turn blue instantly.
