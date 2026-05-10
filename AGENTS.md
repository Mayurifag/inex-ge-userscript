# AGENTS.md

Keep this file concise — only info not already in CLAUDE.md.

## OVERVIEW

Violentmonkey userscript for inex.ge parcels page. Vite 8 + vite-plugin-monkey bundles to `dist/inex-ge.user.js`. CI
auto-publishes to `release` branch.

## STRUCTURE

```
.
├── src/              # 18 feature modules + 2 CSS files
├── docs/             # Screenshots + README assets
├── scripts/          # readme-screenshot automation
├── .github/          # CI workflow (master → release branch)
├── dist/             # Build output (gitignored, CI-generated)
├── vite.config.mjs   # Userscript metadata + build config
└── Makefile          # `make ci` = install + lint + format + build
```

## WHERE TO LOOK

| Task             | Location                       | Notes                                     |
| ---------------- | ------------------------------ | ----------------------------------------- |
| Add feature      | `src/features.js` → new module | Export `apply()`, self-gate on toggle key |
| Fix DOM selector | `src/constants.js`             | All selectors in one place                |
| GM API issue     | `src/gm.js`                    | Shim scans `document.__monkeyWindow-*`    |
| Dark theme color | `src/dark.user.css`            | Dual-distribution: Stylus + GM_addStyle   |
| Build output     | `dist/inex-ge.user.js`         | Unminified for readability                |

## CODE MAP

| Symbol                  | Type     | File                | Role                                 |
| ----------------------- | -------- | ------------------- | ------------------------------------ |
| `applyAll`              | function | `src/main.js`       | Orchestrates `init()` + `refresh()`  |
| `get` / `put`           | function | `src/features.js`   | GM storage helpers                   |
| `GM_*` shim             | module   | `src/gm.js`         | Cross-environment GM API access      |
| `extractInfo`           | function | `src/lastStatus.js` | Parses tooltip → status/arrival/date |
| `daysAgo` / `daysUntil` | function | `src/lastStatus.js` | Relative date math                   |

## CONVENTIONS

- Node 24+ required (`"engines": { "node": ">=24" }`)
- ESM only (`"type": "module"`)
- No comments unless WHY non-obvious
- Dark CSS: only `--inex-*` vars in property values; add new var to `:root` first
- Bump `package.json` version on every shipped change (even CSS-only). CSS changes should bump patch version, too.
  Single branch = 1 version bump, dont bump several versions.

## ANTI-PATTERNS

- **Never** import `$` (GM APIs) directly — always use `./gm.js`
- **Never** inline CSS — edit `src/styles.css` or `src/dark.user.css`
- **Never** break `dark.user.css` metadata block or `@-moz-document` wrapper (Stylus compatibility)
- **Never** edit lockfiles directly — use `npm install`

## NOTES

- `dist/` is gitignored on master; CI force-pushes built output to `release` branch
- `inex-creds.txt` is git-crypt encrypted (GPG mode); don't commit plaintext
- `inex-creds.txt` uses `email=...` and `password=...` lines
- `.gitattributes` marks it for encryption; global hooks auto-handle

## Login for testing

```bash
agent-browser open https://inex.ge/en/login && agent-browser wait --load networkidle && agent-browser snapshot -i
# fill email/password, submit, then:
agent-browser state save inex-auth.json
# reuse: agent-browser state load inex-auth.json
```

## Testing workflow

1. `npm run dev` must stay running for the Tampermonkey dev userscript to work; install from
   `http://127.0.0.1:<port>/__vite-plugin-monkey.install.user.js`
2. `agent-browser open 'https://inex.ge/en/room/parcels?perPage=20'`
3. `agent-browser eval` to inspect DOM
4. For UI fixes, open the fixed page in Chrome and show/verify the result before stopping.
5. Stop `npm run dev` before ending the task.

Tampermonkey shows the dev install as `server:inex.ge tweaks`. After login, the site may show a notification or
parcel-declaration modal that must be acknowledged before the page becomes scrollable.

## Profile persistence

`agent-browser.json` in project root:

```json
{
  "headed": true,
  "profile": "./browser-data"
}
```

This persists the full Chrome profile (Extensions like Tampermonkey, cookies, logins) across sessions. Use
`--session-name inex` for additional auto-save/restore of cookies+localStorage. `browser-data/` is gitignored.

## Key selectors

- `td.flightNumber div.toolTip ul li` — tracking events; each has `<p class="active">` status + `<p class="date">`
  dd.mm.yyyy
- `td.flightNumber .inex-ge-status` / `.inex-ge-arrival` — userscript-injected spans
- `th:nth-child(4)` — Arrival column header
- `td.status span.parcel-outline-success` — arrived badge

## Extensions

Tampermonkey CWS: `https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo`
