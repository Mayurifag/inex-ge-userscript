import { FEATURES, get } from './features.js';
import {
  ARRIVAL_DATA,
  ARRIVED_BADGE_CLASS,
  CELL_REPLACED_ATTR,
  ETA_DATA,
  EVENT_COUNT_DATA,
  HEADER_RENAMED_ATTR,
  HEADER_TEXT,
  LAST_UPDATE_DATA,
  SEL_FLIGHT_HEAD,
  SEL_FLIGHT_TD,
} from './constants.js';
import { daysAgo, daysUntil } from './date.js';

const OBSERVER_DEBOUNCE_MS = 50;
const LOG = '[inex-ge]';

const ARRIVED_OVERRIDE_TEXT = 'Arrived, take from branch';

function isArrivedRow(td) {
  const tr = td.closest('tr');
  return !!tr?.querySelector(`td.status span.${ARRIVED_BADGE_CLASS}`);
}

export function extractInfo(td) {
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
  const dateP = active.querySelector('p.date');
  const dateText = dateP?.textContent.trim() ?? '';

  const isArrived = isArrivedRow(td);
  if (isArrived) return { arrival: '', statusText: ARRIVED_OVERRIDE_TEXT, dateText: '', isArrived };
  return { arrival, statusText, dateText, isArrived };
}

function getStatusSummary(info) {
  let sText = info.statusText || '—';
  if (!info.isArrived && info.dateText) {
    const ago = daysAgo(info.dateText);
    if (ago !== null && ago >= 0) {
      const prefix = ago === 0 ? 'Today' : ago === 1 ? 'Yesterday' : `${ago} days ago`;
      sText = `${prefix} — ${info.statusText}`;
    }
  }
  return sText;
}

function getArrivalSummary(arrival) {
  if (!arrival) return '';
  const until = daysUntil(arrival);
  if (until === null) return `Estimated arrival: ${arrival}`;
  if (until > 0) return `ETA: in ${until} ${until === 1 ? 'day' : 'days'}`;
  if (until === 0) return 'ETA: today';
  return arrival;
}

function setRowData(td, arrival) {
  const tr = td.closest('tr');
  if (tr) {
    if (tr.dataset[ARRIVAL_DATA] !== arrival) tr.dataset[ARRIVAL_DATA] = arrival;
    if (tr.dataset[EVENT_COUNT_DATA] !== undefined) delete tr.dataset[EVENT_COUNT_DATA];
    if (tr.dataset[ETA_DATA] !== undefined) delete tr.dataset[ETA_DATA];
    if (tr.dataset[LAST_UPDATE_DATA] !== undefined) delete tr.dataset[LAST_UPDATE_DATA];
  }
}

function syncReplacedCell(td, info) {
  const sText = getStatusSummary(info);
  const s = td.querySelector('.inex-ge-status');
  if (s && s.textContent !== sText) s.textContent = sText;

  const aText = info.arrival ? getArrivalSummary(info.arrival) : '';
  const a = td.querySelector('.inex-ge-arrival');
  if (a && aText && a.textContent !== aText) a.textContent = aText;
  if (a && !aText) a.remove();
  if (!a && aText) {
    const next = document.createElement('span');
    next.className = 'inex-ge-arrival';
    next.textContent = aText;
    s?.after(next);
  }

  setRowData(td, info.arrival);
}

function replaceCell(td) {
  const tip = td.querySelector('div.toolTip');
  if (!tip) return;
  const info = extractInfo(td);
  if (!info) return;
  if (td.getAttribute(CELL_REPLACED_ATTR)) {
    syncReplacedCell(td, info);
    return;
  }

  const sText = getStatusSummary(info);

  const s = document.createElement('span');
  s.className = 'inex-ge-status';
  s.textContent = sText;

  let a = null;
  if (info.arrival) {
    a = document.createElement('span');
    a.className = 'inex-ge-arrival';
    const aText = getArrivalSummary(info.arrival);
    a.textContent = aText;
  }

  const children = a ? [s, a, tip] : [s, tip];
  td.replaceChildren(...children);

  setRowData(td, info.arrival);

  td.setAttribute(CELL_REPLACED_ATTR, '1');
}

function renameHeader() {
  const th = document.querySelector(SEL_FLIGHT_HEAD);
  if (!th) return;
  if (th.getAttribute(HEADER_RENAMED_ATTR) === '1') return;
  th.textContent = HEADER_TEXT;
  th.setAttribute(HEADER_RENAMED_ATTR, '1');
}

export function apply() {
  if (!get(FEATURES.lastStatus.key)) return;
  renameHeader();
  document.querySelectorAll(SEL_FLIGHT_TD).forEach(replaceCell);
}

export function startObserver(onMutation) {
  const table = document.querySelector('table.table');
  if (!table) return null;

  let timer = null;
  let boundTbody = null;

  const fire = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        onMutation();
      } catch (e) {
        console.error(LOG, e);
      }
    }, OBSERVER_DEBOUNCE_MS);
  };

  const inner = new MutationObserver(fire);

  const bind = (tbody) => {
    if (tbody === boundTbody) return;
    inner.disconnect();
    inner.observe(tbody, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-original-title'],
    });
    boundTbody = tbody;
  };

  const initial = table.querySelector('tbody');
  if (initial) bind(initial);

  const outer = new MutationObserver(() => {
    const tbody = table.querySelector('tbody');
    if (tbody && tbody !== boundTbody) {
      bind(tbody);
      fire();
    }
  });
  outer.observe(table, { childList: true });

  return { inner, outer };
}
