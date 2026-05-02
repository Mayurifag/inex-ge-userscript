# inex-ge-userscript

[![CI](https://github.com/Mayurifag/inex-ge-userscript/actions/workflows/ci.yml/badge.svg)](https://github.com/Mayurifag/inex-ge-userscript/actions/workflows/ci.yml)

Violentmonkey userscript for [inex.ge](https://inex.ge) — quality-of-life tweaks for the parcel tracking UI.

This README is the spec. An AI agent reads it and produces the userscript end-to-end.

## Target

- Site: `https://inex.ge`
- Locales: `ka`, `en`, `ru` (the language slug is the first path segment)
- Initial scope: parcels list page only
  - URL pattern: `https://inex.ge/{ka|en|ru}/room/parcels`
  - `@match` should cover all three locales

## Features

Every feature toggleable, **enabled by default**. Persist via `GM_setValue` / `GM_getValue`. Toggle takes effect immediately where feasible (re-run feature, or re-apply CSS rule).

All DOM targeting uses **stable class selectors**, never visible text — page may be machine-translated by browser extension.

1. **Force `?perPage=20`** — if URL has no `perPage` param, append `&perPage=20` (or `?perPage=20` if no query string) and navigate. Preserve all other params. If `perPage` already present (any value), do nothing — never override. Once per page load.
2. **Hide Recipient column** — hide 2nd column (header `<th>` + `td.grid-name` cells). CSS rule injected.
3. **Hide `takeout` parcels** — hide `tr` containing `td.status .takeout`. CSS rule injected.
4. **Hide date in tracking column** — hide the send-date `<p>` inside the first column. Date sits two divs deep (`tr > td:first-child div > div > p`); selector uses descendant match (`td:first-child p`) for robustness. Country flag and `span.tracking` remain. CSS rule injected.
5. **Replace Flight number cell content** — column 4 (`td.flightNumber`). Rebuild cell as **two stacked rows, always rendered**:
   - Row 1 (red): `Arrival: DD.MM.YYYY` — pulled from the red `<p>` inside the original tooltip. Falls back to `Arrival: —` when absent so the cell height stays consistent.
   - Row 2 (green, single line, ellipsis on overflow): latest active status text from `<li><p.active></p></li>` (fallback: last `<li>`). Falls back to `—` when absent.
   - The original tooltip subtree is preserved (renamed `.toolTip` → `.inex-ge-tip`, hidden via CSS) so the per-cell `MutationObserver` can refresh status text in place when the site updates the tooltip data. Hover-to-reveal is **not implemented yet** — to be added later.
   - Both rows use `font: inherit` so styling matches the surrounding cell.
   - Column header renamed to **"Last status"** (single label, no per-locale variants).
6. **Sort by arrival date on header click** — clicking the **"Last status"** header sorts rows by estimated arrival date. First click ascending, second descending; arrow indicator (▲/▼) appended to header text. Stable sort. Rows missing an arrival date sink to the bottom. Sort state is per page load; not persisted.

## Settings

- No injected UI on page.
- Use Violentmonkey's per-script menu via `GM_registerMenuCommand`. One command per toggle, prefixed with `[on]` / `[off]`. Click flips state and re-registers commands.
- Storage keys: `feat.perPage`, `feat.hideRecipient`, `feat.hideTakeout`, `feat.hideTrackingDate`, `feat.lastStatus`, `feat.sortByArrival`. Default `true`.

## Userscript metadata

- `@name inex.ge tweaks`
- `@namespace https://github.com/Mayurifag/inex-ge-userscript`
- `@version 0.1.0`
- `@description` (English; skip per-locale variants)
- `@match https://inex.ge/ka/room/parcels*`
- `@match https://inex.ge/en/room/parcels*`
- `@match https://inex.ge/ru/room/parcels*`
- `@grant GM_getValue`
- `@grant GM_setValue`
- `@grant GM_registerMenuCommand`
- `@grant GM_unregisterMenuCommand`
- `@run-at document-end`
- `@noframes`
- `@icon data:image/svg+xml;base64,...` — inlined SVG (parcel/box silhouette, single-color, ~64×64). Hard-coded into the source; no build step generates it, no separate `icon.svg` file.
- `@homepageURL https://github.com/Mayurifag/inex-ge-userscript`
- `@supportURL https://github.com/Mayurifag/inex-ge-userscript/issues`
- `@updateURL https://raw.githubusercontent.com/Mayurifag/inex-ge-userscript/release/inex-ge.user.js`
- `@downloadURL https://raw.githubusercontent.com/Mayurifag/inex-ge-userscript/release/inex-ge.user.js`

## Install

[![Install](https://img.shields.io/badge/install-userscript-brightgreen)](https://raw.githubusercontent.com/Mayurifag/inex-ge-userscript/release/inex-ge.user.js)

Open the URL above in a browser with Violentmonkey/Tampermonkey installed and confirm the install. Updates auto-pull via `@updateURL`.

## Project layout

~~~
.
├── src/
│   ├── main.js
│   ├── features.js
│   ├── perPage.js
│   ├── styles.js
│   ├── styles.css
│   ├── lastStatus.js
│   ├── sort.js
│   ├── menu.js
│   └── constants.js
├── vite.config.mjs
├── eslint.config.mjs
├── CLAUDE.md
├── .editorconfig
├── .prettierrc
├── .prettierignore
├── .gitignore
├── mise.toml
├── package.json
├── package-lock.json
├── Makefile
└── .github/
    ├── workflows/ci.yml
    └── dependabot.yml
~~~

Sources live in `src/`. Vite + `vite-plugin-monkey` bundle to `dist/inex-ge.user.js` (gitignored). CI force-pushes the built file to the **`release` branch**, which is the public install path. master never holds the build artefact.

## Tooling

- **Node**: pin via `mise.toml` (24.x).
- **Package manager**: npm (lockfile committed).
- **Bundler**: Vite + [`vite-plugin-monkey`](https://github.com/lisonge/vite-plugin-monkey). Userscript metadata block is configured in `vite.config.mjs`. `GM_*` APIs are imported from the `'$'` alias; `autoGrant` injects `@grant` lines automatically.
- **Linter**: ESLint flat config (`eslint.config.mjs`) using `@eslint/js` recommended + browser globals on `src/**/*.js`.
- **Formatter**: Prettier. ESLint defers formatting via `eslint-config-prettier/flat`.
- **EditorConfig**: 2-space indent, LF, UTF-8, trim trailing whitespace, final newline.
- **Git**: `.gitignore` for `node_modules/`, `dist/`, OS junk.
- **Dependabot**: weekly PRs for npm + GitHub Actions ecosystems (`.github/dependabot.yml`). CI guards each PR.

## Dev

- `npm run dev` — vite serves the entry; the printed URL installs a dev userscript that hot-reloads as `src/**` changes.
- `npm run build` — emits `dist/inex-ge.user.js`.
- `npm run lint`, `npm run format` — flat ESLint + Prettier checks.

## Makefile

`make ci` is the single entry point CI runs. Locally too.

~~~makefile
.PHONY: install dev build lint format ci clean

install:
	npm ci

dev:
	npm run dev

build:
	npm run build

lint:
	npx eslint .

format:
	npx prettier --check .

ci: install lint format build

clean:
	rm -rf node_modules dist
~~~

## CI

- GitHub Actions workflow at `.github/workflows/ci.yml`.
- Runs on push and PR to `master`.
- Single job: checkout → setup-node (Node 24) → `make ci` (lint + format + build).
- On push to `master`, the built file is force-pushed to the orphan `release` branch. The `release` branch always holds a single commit with `inex-ge.user.js` at root, which is the URL `@updateURL`/`@downloadURL` resolve.
- `permissions: contents: write` (needed for the release branch push). `concurrency` cancels in-progress runs.

## DOM reference (resolved from sample HTML)

### Table structure

- Table: `table.table` on the parcels page. No unique id; scope by header signature or by `tbody tr[id]` rows.
- Each row: `<tr id="{parcelId}">` with seven `<td>` cells in this order:
  1. Trekking — `td.parcel-details` (first), contains country flag + `span.tracking` + send date `<p>`.
  2. Recipient — `td.grid-name.parcel-details` (name + room id).
  3. Description — `td.description.items` (price-CNY + item title).
  4. Flight number — `td.flightNumber` (see below).
  5. Price — `td.price.tracking.parcel-details` (`span` GEL + `<p>` weight).
  6. Status — `td.status.parcel-details` (see below).
  7. Payment — `td.right` (action icons; `.payIcon.cardIcon.payed` = paid).

### Header cells

- `<thead><tr><th>` — no stable class. Target by **column index**, not text (page may be auto-translated). Recipient = 2, Flight number = 4.

### Status cell (feature 3 — hide `takeout`)

- `td.status` contains `div.tableIcons > span.parcel-outline-{warning|success}`.
- `.takeout` class on that inner `<span>` is confirmed present across locales.
- Selector: `tr:has(td.status .takeout)` (CSS `:has` supported in current Chrome/Firefox).

### Flight-number cell (feature 4)

- Hover detail is **rendered inline** in the DOM, not lazy-loaded. No XHR needed → drop `@grant GM_xmlhttpRequest`.
- Structure inside `td.flightNumber`:
  ~~~
  div
    span                              ← flight code text node (e.g. "CN-GE-30042026")
      div.toolTip
        div.toolTipWrapper
          div.numberWrapper
            h1                         ← tracking number
            p[style*="color: red"]     ← "Estimated Arrival Date : DD.MM.YYYY" (optional, absent on some rows)
            h2                         ← "Last Updated: DD.MM.YYYY"
            div.line
            ul
              li
                p.active?              ← status label (Georgian text); `.active` marks current
                p.date                 ← status date
              ...                      ← multiple <li>, last one is latest
    p                                  ← origin country (e.g. "China")
  ~~~
- **Latest known status** = `<li>` whose `<p>` has `.active` (fallback: last `<li>`).
- **Estimated arrival date** = strip `Estimated Arrival Date :` prefix from the red `<p>`. If missing, omit.
- **Replacement cell** (agent picks layout): one line, dot-separated `{arrival} · {statusText} · {statusDate}`. Keep status text raw (Georgian) — do not translate.
- Column header text: replace existing `<th>` text with `Last status`.

### Re-application on DOM changes

- Run features once at `document-end`. Pagination on this site is full-page navigation (URL changes, `@match` re-fires) — no SPA routing observed.
- For safety against client-side re-renders, attach a single `MutationObserver` on `tbody` that re-runs feature 4 (cell replacement) when new `tr` nodes appear. Hide rules (features 2, 3) are CSS-injected, so they apply automatically without observer.

## Things to work on

1) Lingvist still doesnt translate reliably. well, it works..
2) Hover on last status doesnt work
3) Sorting should put unknown first I guess?
4) perPage bug - the page one doesnt work correctly with mine. think whats wrong?
5) CODEREVIEW
6) dark theme?
