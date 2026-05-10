import { FEATURES, get } from './features.js';
import {
  ARRIVAL_DATA,
  ARRIVED_BADGE_CLASS,
  ETA_DATA,
  EVENT_COUNT_DATA,
  HEADER_TEXT,
  LAST_UPDATE_DATA,
  SEL_FLIGHT_HEAD,
  SEL_TBODY,
} from './constants.js';
import { daysUntil, parseDmy } from './date.js';
import { extractInfo } from './lastStatus.js';
import { compareSortKeys, getSortKey } from './sortKey.js';

const SORT_BOUND_ATTR = 'data-inex-ge-sort-bound';
const SORT_AUTO_ATTR = 'data-inex-ge-sort-auto';

function getEventCount(tr) {
  const cached = tr.dataset[EVENT_COUNT_DATA];
  if (cached !== undefined) return Number(cached);
  const td = tr.querySelector('td.flightNumber');
  if (!td) return 0;
  const tip = td.querySelector('div.toolTip');
  if (!tip) return 0;
  const count = tip.querySelectorAll('ul li').length;
  tr.dataset[EVENT_COUNT_DATA] = count;
  return count;
}

function getEta(tr) {
  const cached = tr.dataset[ETA_DATA];
  if (cached !== undefined) return Number(cached);
  const td = tr.querySelector('td.flightNumber');
  const arrival = tr.dataset[ARRIVAL_DATA] || (td ? extractInfo(td)?.arrival : '');
  const eta = daysUntil(arrival) ?? Infinity;
  tr.dataset[ETA_DATA] = eta;
  return eta;
}

function getTooltipDate(td) {
  const items = td.querySelectorAll('div.toolTip ul li');
  let active = null;
  for (const li of items) {
    const ps = li.querySelectorAll('p');
    if (ps.length && ps[0].classList.contains('active')) active = li;
  }
  if (!active && items.length) active = items[items.length - 1];
  return active?.querySelector('p.date')?.textContent.trim() ?? '';
}

function getLastUpdate(tr) {
  const cached = tr.dataset[LAST_UPDATE_DATA];
  if (cached !== undefined) return Number(cached);
  const td = tr.querySelector('td.flightNumber');
  const timestamp = td ? parseDmy(getTooltipDate(td)) : null;
  const lastUpdate = timestamp ?? -Infinity;
  tr.dataset[LAST_UPDATE_DATA] = lastUpdate;
  return lastUpdate;
}

function isArrivedRow(tr) {
  return !!tr.querySelector(`td.status span.${ARRIVED_BADGE_CLASS}`);
}

function isDoneRow(tr) {
  return !!tr.querySelector('td.status .takeout');
}

function bucketKey(tr) {
  return getSortKey({
    isArrived: isArrivedRow(tr),
    isDone: isDoneRow(tr),
    eventCount: getEventCount(tr),
    eta: getEta(tr),
    lastUpdate: getLastUpdate(tr),
  });
}

function isParcelsPage() {
  return /^\/(?:[a-z]{2}\/)?room\/parcels(?:\/|$)/.test(window.location.pathname);
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
    const ak = keys.get(a);
    const bk = keys.get(b);
    return sign * compareSortKeys(ak, bk);
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
  if (!isParcelsPage()) return;
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
