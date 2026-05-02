# inex.ge userscript — Claude dev guide

## Layout

- `src/main.js` — entry, wires modules.
- `src/features.js` — feature toggles + GM\_\*Value helpers.
- `src/perPage.js` — perPage URL force.
- `src/styles.js` — toggles feature classes on `<html>`.
- `src/styles.css` — all userscript CSS, injected automatically by vite-plugin-monkey via `GM_addStyle`. Edit CSS HERE, never inline.
- `src/lastStatus.js` — Flight cell replacement, MutationObserver loop.
- `src/sort.js` — header rename + arrival-date sort.
- `src/menu.js` — Tampermonkey/Violentmonkey menu commands.
- `src/constants.js` — shared attribute names.
- `vite.config.mjs` — userscript metadata block lives here. Edit metadata HERE, never in built output.
- `dist/inex-ge.user.js` — local build output, **gitignored** on master.
- **`release` branch** — orphan branch holding only the built `inex-ge.user.js` at root. Force-pushed by CI on every master push. Public install URL points here.

## Commands

- `npm run dev` — vite dev server with HMR. Opens an install page (`http://localhost:PORT/`) that points the userscript engine to the live module graph. Edit `src/**` → page reloads automatically.
- `npm run build` — emits `dist/inex-ge.user.js` locally. Do not commit. CI publishes to `release` branch on master push.
- `npm run lint` — ESLint flat config, scopes `src/**/*.js` only.
- `npm run format` — Prettier check. Use `npx prettier --write .` to fix.

## GM\_\* APIs

Import from `'$'` (vite-plugin-monkey client alias). `autoGrant` adds `@grant` lines automatically based on imports — no manual grant list. Example:

```js
import { GM_getValue, GM_setValue } from '$';
```

## Browser context for Claude

Playwright MCP is available. Inspection loop:

1. User runs `npm run dev` and opens inex.ge logged in. (User must log in once — Claude can't.)
2. `mcp__plugin_playwright_playwright__browser_navigate` to `https://inex.ge/en/room/parcels`.
3. `browser_snapshot` for DOM tree, `browser_console_messages` for `[inex-ge]` logs, `browser_evaluate` for ad-hoc DOM queries.
4. After edits, vite HMR reloads — re-snapshot to verify.

## Versioning

- `package.json` `version` drives the `@version` field in built userscript.
- Bump version on every shipped change.

## Conventions

- No comments unless WHY non-obvious (CLAUDE-global rule).
- Surgical changes, no drive-by refactors.
- Match existing style in `src/`.
