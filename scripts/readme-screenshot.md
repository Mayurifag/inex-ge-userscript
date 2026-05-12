Generate `docs/before-after.webp` for the README. Two screenshots stacked vertically (BEFORE on top, AFTER below) so it reads well in a README on a normal-width screen. PII blurred. Run end-to-end with no questions back to me.

# Prerequisites (verify before doing anything)

1. Dev server up: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/__vite-plugin-monkey.install.user.js` returns `200`. If not, launch `npm run dev` yourself, wait for the install endpoint on the actual Vite port to return `200`, and use that server for the screenshot run. Stop the dev server before ending the task. Only abort if the endpoint still cannot be made available after launching it.
2. Tampermonkey is enabled and Chrome's Tampermonkey extension details page has **Allow User Scripts** enabled. If Tampermonkey shows `Please enable the Allow User Scripts extension setting`, explicitly tell me to open `chrome://extensions/?id=dhdgffkkebhmkfjojejmpbldmpobfkfo` and enable **Allow User Scripts** before continuing.
3. The user is already logged into inex.ge in the Chrome profile that `mcp__playwright-chrome` uses.
4. ImageMagick `magick` is on PATH.

# Selectors with PII (must be blurred)

These cover both BEFORE (recipient column visible) and AFTER (recipient column hidden by feature):

- `.userName` — sidebar full name + room id (`IG…`)
- `.userLink` — header full name + room id
- `table.table tbody td:nth-child(1)` — tracking number cell (also has send-date)
- `table.table tbody td.grid-name` — recipient column
- `table.table tbody td.description` — parcel description (Turkish/Chinese product names — treat as PII per user)

Apply via injected `<style id="inex-ge-blur-pii">` so the rule survives DOM mutations:

```css
.userName,
.userLink,
table.table tbody td:nth-child(1),
table.table tbody td.grid-name,
table.table tbody td.description {
  filter: blur(5px) !important;
}
```

# Label badge (DOM, not image post-processing — must be portable, no system fonts)

Before each screenshot, inject a small fixed-position label in the top-left corner so it bakes into the PNG. Use the page's own font stack:

```js
(label) => {
  const el = document.createElement('div');
  el.id = 'inex-ge-label';
  el.textContent = label;
  Object.assign(el.style, {
    position: 'fixed',
    top: '8px',
    left: '8px',
    zIndex: '2147483647',
    padding: '5px 10px',
    borderRadius: '5px',
    background: 'rgba(0,0,0,0.55)',
    color: '#fff',
    font: '600 16px/1.2 system-ui, sans-serif',
    pointerEvents: 'none',
  });
  document.body.appendChild(el);
};
```

# Steps

Use `mcp__playwright-chrome__*` tools throughout. Do **not** open a fresh isolated browser — we need the existing logged-in profile.

1. **Resize viewport to 1920×1080.** Desktop width — do not shrink. Use `browser_resize` with `width: 1920, height: 1080`.
2. **Find the monkey window** — `vite-plugin-monkey` exposes `GM_*` on a key like `document['__monkeyWindow-XXXX']`. Locate it generically:
   ```js
   const mk = Object.values(document).find(
     (v) => v && typeof v === 'object' && typeof v.GM_setValue === 'function',
   );
   ```
   These are the feature flag keys (all default-true; setting to `false` disables the feature):
   ```
   feat.perPage, feat.hideRecipient, feat.hideTakeout, feat.removeClutter,
   feat.lastStatus, feat.sortByArrival, feat.expandTracking,
   feat.darkTheme, feat.translateStatus
   ```
3. **BEFORE screenshot** (`docs/before.png`):
   - Navigate to `https://inex.ge/en/room/parcels` (no `?perPage=40` — let the site default to 8 rows).
   - Set every flag above to `false` via `mk.GM_setValue(key, false)`.
   - Reload (`browser_navigate` to the same URL) so the userscript re-runs and bails on each feature.
   - Verify `document.documentElement.className === ''` and the Flight column shows raw flight numbers (e.g. `TK-GE-…`, `CN-GE-…`). If userscript effects persist, abort — do not ship a broken BEFORE.
   - Inject the blur CSS above.
   - Inject the label badge (above) with text `"Before"`.
   - `browser_take_screenshot` with `filename: "docs/before.png"`, `type: "png"`, `fullPage: false`.
4. **AFTER screenshot** (`docs/after.png`):
   - Set every flag back to `true` via `mk.GM_setValue(key, true)`.
   - Navigate to `https://inex.ge/en/room/parcels?perPage=40`.
   - Verify the URL contains `perPage=40`, the table has visible rows, and `#inex-ge-dark-style` exists.
   - Inject the blur CSS above.
   - Inject the label badge (above) with text `"After"`.
   - `browser_take_screenshot` with `filename: "docs/after.png"`, `type: "png"`, `fullPage: false`.
5. **Combine** with ImageMagick — plain vertical append, no text drawing (labels are already baked into the PNGs):
   ```sh
   magick docs/before.png docs/after.png -append -quality 85 docs/before-after.webp
   ```
6. **Cleanup**: delete `docs/before.png` and `docs/after.png`. Only `docs/before-after.webp` is checked in.
7. Print the final path and file size, nothing else.

# Don't

- Don't change any source file in `src/` to make this work — the GM-flag flip is sufficient.
- Don't touch `package.json` version.
- Don't leave PNG intermediates in `docs/`.
- Don't shrink the viewport below 1920 wide. The README screenshot must read like a desktop view.
- Don't `--fullPage` — the viewport crop is what we want.
