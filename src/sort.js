import { FEATURES, get } from './features.js';
import { HEADER_TEXT, SEL_FLIGHT_HEAD, SEL_TBODY } from './constants.js';

const SORT_BOUND_ATTR = 'data-inex-ge-sort-bound';
const SORT_AUTO_ATTR = 'data-inex-ge-sort-auto';
const EVENT_COUNT_ATTR = 'inexGeEventCount';

function getEventCount(tr) {
  const cached = tr.dataset[EVENT_COUNT_ATTR];
  if (cached !== undefined) return Number(cached);
  const td = tr.querySelector('td.flightNumber');
  if (!td) return 0;
  const tip = td.querySelector('div.toolTip');
  if (!tip) return 0;
  const count = tip.querySelectorAll('ul li').length;
  tr.dataset[EVENT_COUNT_ATTR] = count;
  return count;
}

function bucketKey(tr) {
  return [-getEventCount(tr), 0];
}

function setHeaderArrow(th, dir) {
  const arrow = dir === 'asc' ? ' ▲' : dir === 'desc' ? ' ▼' : '';
  th.textContent = HEADER_TEXT + arrow;
}

function sortRows(th, tbody) {
  const cur = th.dataset.inexGeSort;
  const dir = cur === 'asc' ? 'desc' : 'asc';
  const sign = dir === 'asc' ? 1 : -1;
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const keys = new Map(rows.map((r) => [r, bucketKey(r)]));
  rows.sort((a, b) => {
    const [ba, va] = keys.get(a);
    const [bb, vb] = keys.get(b);
    if (ba !== bb) return sign * (ba - bb);
    return sign * (va - vb);
  });
  for (const r of rows) tbody.appendChild(r);
  th.dataset.inexGeSort = dir;
  setHeaderArrow(th, dir);
}

function hasPagination() {
  return document.querySelectorAll('a.page').length > 0;
}

export function apply() {
  if (!get(FEATURES.sortByArrival.key)) return;
  if (hasPagination()) return;
  const th = document.querySelector(SEL_FLIGHT_HEAD);
  if (!th) return;
  const tbody = document.querySelector(SEL_TBODY);
  if (!tbody) return;
  if (th.getAttribute(SORT_BOUND_ATTR) !== '1') {
    th.style.cursor = 'pointer';
    th.style.userSelect = 'none';
    th.addEventListener('click', () => {
      if (!get(FEATURES.sortByArrival.key)) return;
      sortRows(th, tbody);
    });
    th.setAttribute(SORT_BOUND_ATTR, '1');
  }
  if (tbody.getAttribute(SORT_AUTO_ATTR) !== '1') {
    sortRows(th, tbody);
    tbody.setAttribute(SORT_AUTO_ATTR, '1');
  }
}
