import { FEATURES, get } from './features.js';
import { ARRIVAL_DATA, REPLACED_ATTR, SEL_FLIGHT_TD, SEL_TBODY } from './constants.js';

const REFRESH_DEBOUNCE_MS = 150;
const LOG = '[inex-ge]';

export function extractInfo(td) {
  const tip = td.querySelector('div.toolTip, .inex-ge-tip');
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
  if (td.getAttribute(REPLACED_ATTR)) return;
  const tip = td.querySelector('div.toolTip');
  if (!tip) return;
  const info = extractInfo(td);
  if (!info) return;

  tip.classList.remove('toolTip');
  tip.classList.add('inex-ge-tip');
  td.classList.add('inex-ge-flight-cell');

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

  td.setAttribute(REPLACED_ATTR, '1');
}

export function applyLastStatus(renameHeader) {
  if (!get(FEATURES.lastStatus.key)) return;
  renameHeader();
  document.querySelectorAll(SEL_FLIGHT_TD).forEach(replaceCell);
}

export function startObserver(onMutation) {
  const tbody = document.querySelector(SEL_TBODY);
  if (!tbody) return null;
  const observer = new MutationObserver(() => {
    try {
      if (get(FEATURES.lastStatus.key)) onMutation();
    } catch (e) {
      console.error(LOG, e);
    }
  });
  observer.observe(tbody, { childList: true, subtree: false });
  return observer;
}
