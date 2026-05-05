# inex.ge userscript — Claude dev guide

## Layout

- `src/main.js` — entry; splits init-only (`init()`) from refresh-time (`refresh()`) features and calls `applyAll()` on toggle.
- `src/features.js` — feature toggles + `get`/`put` helpers. Features carrying `needsReload: true` force a page reload on toggle (used for features that mutate DOM permanently).
- `src/constants.js` — selectors + class names.
- `src/utils.js` — shared helpers (`htmlClassToggler` factory).
- `src/styles.css` — userscript CSS (auto-injected via `GM_addStyle`). Edit CSS HERE, never inline.
- `src/dark.user.css` — dark-theme overrides. Single source, two distributions: (a) raw GitHub URL auto-installs in Stylus as a userstyle (the `.user.css` extension is what triggers it), (b) `darkTheme.js` imports it via `?raw`, runtime-strips the `==UserStyle==` metadata block + `@-moz-document` wrapper, and injects the rules into the page via `GM_addStyle`. Keep the metadata block intact and the wrapper as `@-moz-document domain("inex.ge") { ... }` so both paths keep working.
- Each feature gets one module exporting `apply()` (gates internally on its toggle):
  - `src/perPage.js` — `apply()` redirects to `?perPage=20`; `fixOptions()` rewrites `<select name="perPage">` option values.
  - `src/darkTheme.js` — injects/removes `dark.user.css` rules via `GM_addStyle`.
  - `src/hideRecipient.js`, `src/hideTakeout.js`, `src/removeClutter.js` — slim modules that toggle `inex-ge-*` class on `<html>`.
  - `src/lastStatus.js` — Flight cell replacement, header rename, MutationObserver loop.
  - `src/sort.js` — bucket-based arrival sort. Disabled when pagination links exist.
  - `src/translate.js` — Georgian→English status map.
  - `src/stripPrice.js` — strips price prefix from `td.description`.
  - `src/tracking.js` — replaces truncated tracking span text with full value, kills hover tooltip.
  - `src/clickGuard.js` — suppresses row-click after drag/text-selection (binds once).
- `src/menu.js` — Tampermonkey/Violentmonkey menu commands.
- `vite.config.mjs` — userscript metadata block. `@match: https://inex.ge/*`.
- `dist/inex-ge.user.js` — local build, gitignored on master. CI force-pushes to `release` branch on master push.

## Commands

- `npm run dev` — vite dev server with HMR. Install URL: `http://127.0.0.1:5173/__vite-plugin-monkey.install.user.js`. Reinstall after every dev restart.
- `npm run build` — emits `dist/inex-ge.user.js`.
- `npm run lint` — ESLint flat config, scopes `src/**/*.js`.
- `npm run format` — Prettier check. Use `npx prettier --write .` to fix.
- `make ci` — install + lint + format + build. Run before commit.

## GM\_\* APIs

Import from `'./gm.js'`, never `'$'` directly. The shim falls back to scanning `document.__monkeyWindow-*` keys when vite-plugin-monkey serves stale client.js with an old key (happens after a `npm run dev` restart). Grants are still detected because `gm.js` re-exports from `'$'`.

```js
import { GM_getValue, GM_setValue } from './gm.js';
```

## Browser context

Playwright MCP runs against the dev server. Inspection loop:

1. User must have `npm run dev` running and be logged into inex.ge once. Parcels page (logged-in): `https://inex.ge/en/room/parcels?perPage=20`.
2. `mcp__playwright-chrome__browser_navigate` to a page.
3. `browser_evaluate` for ad-hoc DOM queries.
4. After CSS edits, vite HMR auto-reloads — re-query.
5. Skip screenshots in repo root (gitignored, but project dirty). Save to `.playwright-mcp/` (already ignored) and clean up after.

## Feature contract

Every feature: toggleable via menu, default on, persisted in `GM_*Value`. Each module exports `apply()` and self-gates on its feature key. Two phases:

- `init()` — runs once at load + on toggle. Includes `perPage`, `darkTheme`, the three `<html>`-class togglers (`hideRecipient`/`hideTakeout`/`removeClutter`), `clickGuard`.
- `refresh()` — runs at load, on toggle, and on every `tbody` mutation. Includes `translate`, `lastStatus`, `sort`, `tracking`, `stripPrice`. Order matters: `translate` → `lastStatus` (reads tooltip text) → `sort` (binds header) → `tracking` → `stripPrice`.

`applyAll()` = `init()` + `refresh()`. The menu toggle calls it (or reloads if the feature has `needsReload: true` because it permanently mutates DOM and toggling-off cannot fully restore the original).

## Conventions

- No comments unless WHY non-obvious.
- Surgical changes; no drive-by refactors.
- Match existing style.
- Dark CSS uses variables (`--inex-bg`, `--inex-surface`, `--inex-text`, etc). Bump specificity (`.parcel-home .x .y`) when site uses `!important` + multi-class selectors.
- All color values in property declarations MUST be `var(--inex-*)` — never hardcoded hex/rgb in property values. Hex literals are allowed only in `:root` variable definitions and in attribute selectors that match site-supplied values (e.g. `svg path[fill='#fff']`). If a needed color is missing, add a new variable to `:root` first, then reference it.
- Bump `package.json` version on every shipped change — including dark.user.css-only edits (userscript version still ships out).
