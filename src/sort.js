import { FEATURES, get } from './features.js';
import { ARRIVAL_DATA, HEADER_TEXT, REPLACED_ATTR } from './constants.js';
import { extractInfo } from './lastStatus.js';

const SORT_BOUND_ATTR = 'data-inex-ge-sort-bound';

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

export function renameHeader() {
  const th = document.querySelector('table.table thead tr th:nth-child(4)');
  if (!th) return;
  if (th.getAttribute(REPLACED_ATTR) !== '1') {
    setHeaderText(th, th.dataset.inexGeSort);
    th.setAttribute(REPLACED_ATTR, '1');
  }
  if (get(FEATURES.sortByArrival.key)) attachSort(th);
}
