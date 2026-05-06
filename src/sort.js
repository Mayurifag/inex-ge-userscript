import { FEATURES, get } from './features.js';
import { ARRIVAL_DATA, HEADER_TEXT, SEL_FLIGHT_HEAD, SEL_TBODY } from './constants.js';
import { extractInfo } from './lastStatus.js';

const SORT_BOUND_ATTR = 'data-inex-ge-sort-bound';
const SORT_AUTO_ATTR = 'data-inex-ge-sort-auto';

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

function statusBucket(text) {
  if (text.startsWith('Arrived, take')) return 0;
  if (text.startsWith('Done')) return 1;
  if (text.includes('customs procedures') || text.includes('terminal procedures')) return 2;
  if (text === 'Sent') return 3;
  return 4;
}

function bucketKey(tr) {
  const text = tr.querySelector('td.flightNumber .inex-ge-status')?.textContent ?? '';
  const b = statusBucket(text);
  if (b === 3) {
    const arrival = parseDmy(getRowArrival(tr));
    return [b, arrival ?? Number.MAX_SAFE_INTEGER];
  }
  return [b, 0];
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
