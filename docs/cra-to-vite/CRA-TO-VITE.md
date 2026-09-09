# Frontend Migration Notes - CRA -> Vite

**Author:** Lawrence Tsungu
**Date:** July 2026
**Scope:** Event Management Platform (React frontend)

This document summarizes the migration of the frontend from Create React App (CRA)
to Vite, the theming bug that came out of it, and the current state of the
Tailwind / shadcn setup. It's meant to bring a senior dev up to speed quickly
without needing to re-trace the whole troubleshooting history.

---

## 1. Why the migration happened

The old project (`frontend/`) was built on CRA. The new project (`turnapp-vite/`)
was scaffolded fresh with Vite to get faster dev server start/HMR and to move
off `react-scripts`, which is effectively unmaintained. Routing was carried over
using `react-router-dom` (no change in routing library, just the build tool).

## 2. Theming: HSL variables + Tailwind

The design system uses CSS custom properties defined as **raw HSL triplets** in
`index.css`, e.g.:

```css
:root {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  /* ...etc */
}
```

Tailwind utility classes like `bg-background` need the config to wrap these in
`hsl()`:

```js
colors: {
  background: "hsl(var(--background))",
}
```

### The bug

During the Vite scaffold, `tailwind.config.cjs` in `turnapp-vite` was left over
from an earlier (incorrect) version that mapped colors directly to the bare
variable:

```js
colors: {
  background: "var(--background)", // WRONG - outputs `background-color: var(--background)`
}
```

Since `--background` resolves to `0 0% 0%` (a bare HSL triplet, not a valid CSS
color on its own), the browser silently discarded the invalid
`background-color` declaration and fell back to default white - rather than
throwing a visible error. This is why the bug was inconsistent: pages that had
an explicit background set elsewhere (image, wrapper component, etc.) masked
the issue, while pages relying purely on `bg-background` rendered white.

### The fix

`tailwind.config.cjs` now wraps every CSS variable color in `hsl(...)`, matches
the variables actually defined in `index.css`, and folds in the
`keyframes`/`animation` blocks needed for Radix accordion transitions and the
hero carousel progress bar (`animate-hero-progress`). Unused leftover color
groups from the original scaffold (`chart-*`, `sidebar-*`) were removed since
`index.css` doesn't define those variables - they can be re-added if a
component needs them later.

**Action for future scaffolds:** always confirm `tailwind.config.cjs` colors
are `hsl(var(--x))`-wrapped whenever CSS variables are defined as bare HSL
triplets (as opposed to full `hsl(...)` or `oklch(...)` strings).

## 3. Verifying the fix

```bash
rm -rf node_modules/.vite
pnpm dev
```

Then hard refresh. All routes (including the landing/home page) should render
the correct black background consistently.

## 4. Running the project in dev mode

### Prerequisites

- **Node.js** - v18+ (v20 LTS recommended)
- **pnpm** - this project uses pnpm, not npm/yarn. Install it globally if it's
  not already on the machine:

  ```bash
  npm install -g pnpm
  # or, via corepack (ships with Node 16.9+):
  corepack enable
  corepack prepare pnpm@latest --activate
  ```

  Verify with:

  ```bash
  pnpm --version
  ```

### First-time setup on a new machine

```bash
# 1. Clone the repo
git clone <repo-url>
cd turnapp-vite

# 2. Install dependencies
pnpm install

# 3. Copy the env template and fill in real values
cp .env.example .env

# 4. Start the dev server
pnpm dev
```

The dev server prints a local URL (typically `http://localhost:5173`) - open
that in the browser. Vite's HMR (hot module reload) will pick up changes
automatically; no manual restart needed for most edits.

### Everyday commands

| Task | Command |
|---|---|
| Install all dependencies (fresh clone / after pulling new deps) | `pnpm install` |
| Add a new dependency | `pnpm add <package>` |
| Add a dev-only dependency | `pnpm add -D <package>` |
| Remove a dependency | `pnpm remove <package>` |
| Start dev server | `pnpm dev` |
| Build for production | `pnpm build` |
| Preview a production build locally | `pnpm preview` |
| Clear Vite's cache (if you see stale/weird behavior after config changes) | `rm -rf node_modules/.vite` |

### If dependencies get into a bad state

Sometimes after switching branches or pulling changes, `node_modules` can get
out of sync with `pnpm-lock.yaml`. Reset with:

```bash
rm -rf node_modules
pnpm install
```

### Onboarding on a new machine (checklist)

1. Install Node.js and pnpm (see Prerequisites above).
2. Clone the repo.
3. `pnpm install`.
4. Copy `.env.example` -> `.env` and fill in real values (get the actual
   secrets from whoever manages them - never copy a teammate's live `.env`
   over Slack/email).
5. `pnpm dev` and confirm the app loads at the printed localhost URL with the
   correct (black) background - that's a quick sanity check that the Tailwind
   config fix described above is intact.

## 5. Current stack summary

| Layer | Tool |
|---|---|
| Build tool | Vite |
| Routing | react-router-dom |
| Styling | Tailwind CSS + CSS variables (HSL) |
| Component library | shadcn/ui (Radix primitives) |
| Animation | tailwindcss-animate |

## 6. Known follow-ups / open items

- Confirm no other components still assume the old `var()`-only mapping
  (search for any inline `style={{ backgroundColor: 'var(--...)' }}` usage
  that bypasses Tailwind entirely - these need the same `hsl()` wrapping).
- If `chart-*` or `sidebar-*` utility classes are needed later, add matching
  CSS variables to `index.css` first, then restore those color groups in
  `tailwind.config.cjs`.
