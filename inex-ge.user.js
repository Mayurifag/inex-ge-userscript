// ==UserScript==
// @name         inex.ge tweaks
// @namespace    https://github.com/Mayurifag/inex-ge-userscript
// @version      0.1.0
// @description  Quality-of-life tweaks for inex.ge parcels page: force perPage=20, hide Recipient column, hide takeout parcels, hide send date in tracking column, replace Flight number cell with two-row last-status info (tooltip preserved), click-to-sort by arrival date.
// @match        https://inex.ge/ka/room/parcels*
// @match        https://inex.ge/en/room/parcels*
// @match        https://inex.ge/ru/room/parcels*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-end
// @noframes
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZD0iTTMyIDQgTDU4IDE3IFY0NyBMMzIgNjAgTDYgNDcgVjE3IFogTTYgMTcgTDMyIDMwIEw1OCAxNyBNMzIgMzAgVjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDY2Y2MiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==
// @homepageURL  https://github.com/Mayurifag/inex-ge-userscript
// @supportURL   https://github.com/Mayurifag/inex-ge-userscript/issues
// @updateURL    https://raw.githubusercontent.com/Mayurifag/inex-ge-userscript/master/inex-ge.user.js
// @downloadURL  https://raw.githubusercontent.com/Mayurifag/inex-ge-userscript/master/inex-ge.user.js
// ==/UserScript==

(function () {
  'use strict';

  const FEATURES = {
    perPage: { key: 'feat.perPage', label: 'Force perPage=20' },
    hideRecipient: { key: 'feat.hideRecipient', label: 'Hide Recipient column' },
    hideTakeout: { key: 'feat.hideTakeout', label: 'Hide takeout parcels' },
    hideTrackingDate: { key: 'feat.hideTrackingDate', label: 'Hide date in tracking column' },
    lastStatus: { key: 'feat.lastStatus', label: 'Replace Flight number with last status' },
    sortByArrival: { key: 'feat.sortByArrival', label: 'Sort by arrival date on header click' },
  };

  const HEADER_TEXT = 'Last status';
  const STYLE_ID = 'inex-ge-style';
  const REPLACED_ATTR = 'data-inex-ge-replaced';
  const SORT_BOUND_ATTR = 'data-inex-ge-sort-bound';
  const ARRIVAL_DATA = 'inexGeArrival';
  const LOG = '[inex-ge]';

  function get(key) {
    const v = GM_getValue(key);
    return v === undefined ? true : v;
  }

  function put(key, val) {
    GM_setValue(key, val);
  }

  function applyPerPage() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('perPage')) return;
    url.searchParams.set('perPage', '20');
    window.location.replace(url.toString());
  }

  function applyStyles() {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    const rules = [];
    if (get(FEATURES.hideRecipient.key)) {
      rules.push('table.table thead tr th:nth-child(2) { display: none !important; }');
      rules.push('table.table tbody tr td.grid-name { display: none !important; }');
    }
    if (get(FEATURES.hideTakeout.key)) {
      rules.push('table.table tbody tr:has(td.status .takeout) { display: none !important; }');
    }
    if (get(FEATURES.hideTrackingDate.key)) {
      rules.push('table.table tbody tr > td:first-child p { display: none !important; }');
    }
    el.textContent = rules.join('\n');
  }

  function extractInfo(td) {
    const tip = td.querySelector('div.toolTip');
    if (!tip) return null;

    let arrival = '';
    const redP = tip.querySelector('p[style*="color: red"], p[style*="color:red"]');
    if (redP) {
      const txt = redP.textContent;
      const colon = txt.indexOf(':');
      arrival = (colon >= 0 ? txt.slice(colon + 1) : txt).trim();
    }

    const items = tip.querySelectorAll('ul li');
    let active = null;
    for (const li of items) {
      const ps = li.querySelectorAll('p');
      if (ps.length && ps[0].classList.contains('active')) active = li;
    }
    if (!active && items.length) active = items[items.length - 1];
    if (!active) return null;

    const statusText = active.querySelector('p')?.textContent.trim() ?? '';
    const statusDate = active.querySelector('p.date')?.textContent.trim() ?? '';
    return { arrival, statusText, statusDate };
  }

  function replaceCell(td) {
    if (td.getAttribute(REPLACED_ATTR)) return;
    const info = extractInfo(td);
    if (!info) return;

    const tip = td.querySelector('div.toolTip');
    if (!tip) return;

    while (td.firstChild) td.removeChild(td.firstChild);

    const a = document.createElement('span');
    a.className = 'inex-ge-arrival';
    a.textContent = info.arrival ? `Arrival: ${info.arrival}` : 'Arrival: —';
    td.appendChild(a);

    const s = document.createElement('span');
    s.className = 'inex-ge-status';
    s.textContent = info.statusText || '—';
    td.appendChild(s);

    tip.classList.remove('toolTip');
    tip.classList.add('inex-ge-tip');
    td.appendChild(tip);

    td.setAttribute(REPLACED_ATTR, '1');
    const tr = td.closest('tr');
    if (tr) tr.dataset[ARRIVAL_DATA] = info.arrival;
  }

  function parseDmy(s) {
    if (!s) return null;
    const m = s.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (!m) return null;
    return Date.UTC(+m[3], +m[2] - 1, +m[1]);
  }

  function getRowArrival(tr) {
    const cached = tr.dataset[ARRIVAL_DATA];
    if (cached !== undefined) return cached;
    const td = tr.querySelector('td.flightNumber');
    if (!td) return '';
    const info = extractInfo(td);
    const arrival = info ? info.arrival : '';
    tr.dataset[ARRIVAL_DATA] = arrival;
    return arrival;
  }

  function sortByArrival(th, tbody) {
    const cur = th.dataset.inexGeSort;
    const dir = cur === 'asc' ? 'desc' : 'asc';
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => {
      const da = parseDmy(getRowArrival(a));
      const db = parseDmy(getRowArrival(b));
      if (da == null && db == null) return 0;
      if (da == null) return 1;
      if (db == null) return -1;
      return dir === 'asc' ? da - db : db - da;
    });
    for (const r of rows) tbody.appendChild(r);
    th.dataset.inexGeSort = dir;
    setHeaderText(th, dir);
  }

  function setHeaderText(th, dir) {
    const arrow = dir === 'asc' ? ' ▲' : dir === 'desc' ? ' ▼' : '';
    th.textContent = HEADER_TEXT + arrow;
  }

  function attachSort(th) {
    if (th.getAttribute(SORT_BOUND_ATTR) === '1') return;
    const tbody = document.querySelector('table.table tbody');
    if (!tbody) return;
    th.style.cursor = 'pointer';
    th.style.userSelect = 'none';
    th.addEventListener('click', () => {
      if (!get(FEATURES.sortByArrival.key)) return;
      sortByArrival(th, tbody);
    });
    th.setAttribute(SORT_BOUND_ATTR, '1');
  }

  function renameHeader() {
    const th = document.querySelector('table.table thead tr th:nth-child(4)');
    if (!th) return;
    if (th.getAttribute(REPLACED_ATTR) !== '1') {
      setHeaderText(th, th.dataset.inexGeSort);
      th.setAttribute(REPLACED_ATTR, '1');
    }
    if (get(FEATURES.sortByArrival.key)) attachSort(th);
  }

  function applyLastStatus() {
    if (!get(FEATURES.lastStatus.key)) return;
    renameHeader();
    document.querySelectorAll('table.table tbody td.flightNumber').forEach(replaceCell);
  }

  let observer = null;
  function startObserver() {
    if (observer) return;
    const tbody = document.querySelector('table.table tbody');
    if (!tbody) return;
    observer = new MutationObserver(() => {
      try {
        if (get(FEATURES.lastStatus.key)) applyLastStatus();
      } catch (e) {
        console.error(LOG, e);
      }
    });
    observer.observe(tbody, { childList: true, subtree: false });
  }

  let menuIds = [];
  function registerMenu() {
    if (typeof GM_unregisterMenuCommand === 'function') {
      for (const id of menuIds) GM_unregisterMenuCommand(id);
    }
    menuIds = [];
    for (const [name, { key, label }] of Object.entries(FEATURES)) {
      const enabled = get(key);
      const prefix = enabled ? '[on]' : '[off]';
      const id = GM_registerMenuCommand(`${prefix} ${label}`, () => {
        const cur = get(key);
        put(key, !cur);
        applyStyles();
        if (name === 'lastStatus' && !cur) applyLastStatus();
        if (name === 'sortByArrival' && !cur) renameHeader();
        registerMenu();
      });
      menuIds.push(id);
    }
  }

  if (get(FEATURES.perPage.key)) applyPerPage();
  applyStyles();
  applyLastStatus();
  startObserver();
  registerMenu();
})();
