# inex.ge userscript — Claude dev guide

## Layout

- `src/main.js` — entry; wires features, runs `refresh()` on load + observer.
- `src/features.js` — feature toggles + `get`/`put` helpers.
- `src/gm.js` — `GM_*` import shim; falls back to scanning `document.__monkeyWindow-*` keys when dev cache breaks.
- `src/constants.js` — selectors + class names.
- `src/styles.css` — userscript CSS (auto-injected via `GM_addStyle`). Edit CSS HERE, never inline.
- `src/dark.user.css` — dark-theme overrides (CSS variables, surface/text rules, SVG fill recolor). `.user.css` extension so raw GitHub URL auto-installs in Stylus.
- `src/styles.js` — toggles `inex-ge-*` classes on `<html>`.
- `src/perPage.js` — adds `?perPage=20` if missing; rewrites broken `<select name="perPage">` option values.
- `src/lastStatus.js` — Flight cell replacement, MutationObserver loop.
- `src/sort.js` — header rename + bucket-based arrival sort. Disabled when pagination links exist.
- `src/translate.js` — Georgian→English status map.
- `src/tracking.js` — replaces truncated `span.tracking` text with `data-original-title`.
- `src/description.js` — strips price prefix from `td.description` via `data-original-title`.
- `src/menu.js` — Tampermonkey/Violentmonkey menu commands.
- `vite.config.mjs` — userscript metadata block. `@match: https://inex.ge/*`.
- `dist/inex-ge.user.js` — local build, gitignored on master. CI force-pushes to `release` branch on master push.

## Commands

- `npm run dev` — vite dev server with HMR. Install URL: `http://127.0.0.1:5173/__vite-plugin-monkey.install.user.js`. Reinstall after every dev restart (vite caches deps with stale `monkeyWindow` key).
- `npm run build` — emits `dist/inex-ge.user.js`.
- `npm run lint` — ESLint flat config, scopes `src/**/*.js`.
- `npm run format` — Prettier check. Use `npx prettier --write .` to fix.
- `make ci` — install + lint + format + build. Run before commit.

## GM\_\* APIs

Import from `'./gm.js'`, never from `'$'` directly. The shim handles the dev-mode cache issue where `vite-plugin-monkey` serves stale client.js with old `monkeyWindow` key. Import grants are still detected because `gm.js` re-exports from `'$'`.

```js
import { GM_getValue, GM_setValue } from './gm.js';
```

## Browser context

Playwright MCP runs against the dev server. Inspection loop:

1. User must have `npm run dev` running and be logged into inex.ge once.
2. `mcp__playwright-chrome__browser_navigate` to a page.
3. `browser_evaluate` for ad-hoc DOM queries.
4. After CSS edits, vite HMR auto-reloads — re-query.
5. Skip screenshots in repo root (gitignored, but project dirty). Save to `.playwright-mcp/` (already ignored) and clean up after.

## Feature contract

Every feature: toggleable via menu, default on, persisted in `GM_*Value`, takes effect on next `refresh()`. `refresh()` runs at load + on `tbody` mutations. Order matters: `translateStatuses` → `applyLastStatus` (reads tooltip text) → `expandTracking` → `stripDescriptionPrice`.

## Conventions

- No comments unless WHY non-obvious.
- Surgical changes; no drive-by refactors.
- Match existing style.
- Dark CSS uses variables (`--inex-bg`, `--inex-surface`, `--inex-text`, etc). Bump specificity (`.parcel-home .x .y`) when site uses `!important` + multi-class selectors.
- All color values in property declarations MUST be `var(--inex-*)` — never hardcoded hex/rgb in property values. Hex literals are allowed only in `:root` variable definitions and in attribute selectors that match site-supplied values (e.g. `svg path[fill='#fff']`). If a needed color is missing, add a new variable to `:root` first, then reference it.
- Bump `package.json` version on every shipped change.
