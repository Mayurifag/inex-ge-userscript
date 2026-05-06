import { FEATURES, get } from './features.js';
import {
  ARRIVAL_DATA,
  CELL_REPLACED_ATTR,
  HEADER_RENAMED_ATTR,
  HEADER_TEXT,
  SEL_FLIGHT_HEAD,
  SEL_FLIGHT_TD,
} from './constants.js';

const REFRESH_DEBOUNCE_MS = 150;
const OBSERVER_DEBOUNCE_MS = 50;
const LOG = '[inex-ge]';

const ARRIVED_BADGE_CLASS = 'parcel-outline-success';
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
  if (isArrivedRow(td)) return { arrival: '', statusText: ARRIVED_OVERRIDE_TEXT };
  return { arrival, statusText };
}

function refreshSummary(td, aNode, sNode) {
  const info = extractInfo(td);
  if (!info) return;
  const sText = info.statusText || '—';
  if (sNode.nodeValue !== sText) sNode.nodeValue = sText;
  if (aNode && info.arrival) {
    const aText = `Estimated arrival: ${info.arrival}`;
    if (aNode.nodeValue !== aText) aNode.nodeValue = aText;
  }
  const tr = td.closest('tr');
  if (tr) tr.dataset[ARRIVAL_DATA] = info.arrival;
}

function replaceCell(td) {
  if (td.getAttribute(CELL_REPLACED_ATTR)) return;
  const tip = td.querySelector('div.toolTip');
  if (!tip) return;
  const info = extractInfo(td);
  if (!info) return;

  const sText = info.statusText || '—';
  const s = document.createElement('span');
  s.className = 'inex-ge-status';
  const sNode = document.createTextNode(sText);
  s.appendChild(sNode);

  let a = null;
  let aNode = null;
  if (info.arrival) {
    a = document.createElement('span');
    a.className = 'inex-ge-arrival';
    aNode = document.createTextNode(`Estimated arrival: ${info.arrival}`);
    a.appendChild(aNode);
  }

  const children = a ? [s, a, tip] : [s, tip];
  td.replaceChildren(...children);

  const tr = td.closest('tr');
  if (tr) tr.dataset[ARRIVAL_DATA] = info.arrival;

  let timer = null;
  const obs = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        refreshSummary(td, aNode, sNode);
      } catch (e) {
        console.error(LOG, e);
      }
    }, REFRESH_DEBOUNCE_MS);
  });
  obs.observe(tip, { characterData: true, subtree: true, childList: true });

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
    inner.observe(tbody, { childList: true });
    inner.observe(tbody, {
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
