import { FEATURES, get } from './features.js';
import { ARRIVAL_DATA, REPLACED_ATTR } from './constants.js';

const REFRESH_DEBOUNCE_MS = 150;
const LOG = '[inex-ge]';

const ROW_STYLE =
  'display:block;font-family:inherit;font-size:12px;line-height:1.3;font-weight:normal;';
const ARRIVAL_STYLE = `${ROW_STYLE}color:red;`;
const STATUS_STYLE = `${ROW_STYLE}color:green;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;`;
const TIP_STYLE_BASE =
  'position:absolute;left:0;top:100%;z-index:99999;background:#fff;color:#000;border:1px solid #ccc;padding:8px;box-shadow:0 2px 8px rgba(0,0,0,0.2);font-family:inherit;font-size:12px;line-height:1.4;white-space:normal;min-width:220px;max-width:420px;text-align:left;';
const TIP_STYLE_HIDDEN = `${TIP_STYLE_BASE}display:none;`;
const TIP_STYLE_SHOWN = `${TIP_STYLE_BASE}display:block;`;

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
  tip.setAttribute('style', TIP_STYLE_HIDDEN);

  td.style.position = 'relative';
  td.style.overflow = 'visible';

  const sText = info.statusText || '—';
  const s = document.createElement('span');
  s.className = 'inex-ge-status';
  s.setAttribute('style', STATUS_STYLE);
  const sNode = document.createTextNode(sText);
  s.appendChild(sNode);

  let a = null;
  let aNode = null;
  if (info.arrival) {
    a = document.createElement('span');
    a.className = 'inex-ge-arrival';
    a.setAttribute('style', ARRIVAL_STYLE);
    aNode = document.createTextNode(`Estimated arrival: ${info.arrival}`);
    a.appendChild(aNode);
  }

  const children = a ? [s, a, tip] : [s, tip];
  td.replaceChildren(...children);

  const tr = td.closest('tr');
  if (tr) tr.dataset[ARRIVAL_DATA] = info.arrival;

  td.addEventListener('mouseenter', () => {
    tip.setAttribute('style', TIP_STYLE_SHOWN);
  });
  td.addEventListener('mouseleave', () => {
    tip.setAttribute('style', TIP_STYLE_HIDDEN);
  });

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
  document.querySelectorAll('table.table tbody td.flightNumber').forEach(replaceCell);
}

export function startObserver(onMutation) {
  const tbody = document.querySelector('table.table tbody');
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
