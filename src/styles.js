import { FEATURES, get } from './features.js';

const STYLE_ID = 'inex-ge-style';

export function applyStyles() {
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
  if (get(FEATURES.mobileFix.key)) {
    rules.push('@media (max-width: 768px) {');
    rules.push('  table.table tbody td.description {');
    rules.push('    white-space: nowrap !important;');
    rules.push('    overflow: hidden !important;');
    rules.push('    text-overflow: ellipsis !important;');
    rules.push('    max-width: 40vw !important;');
    rules.push('  }');
    rules.push('  table.table tbody td.flightNumber {');
    rules.push('    max-width: 45vw !important;');
    rules.push('  }');
    rules.push('  table.table tbody td.flightNumber .inex-ge-arrival,');
    rules.push('  table.table tbody td.flightNumber .inex-ge-status {');
    rules.push('    overflow: hidden !important;');
    rules.push('    text-overflow: ellipsis !important;');
    rules.push('    white-space: nowrap !important;');
    rules.push('    max-width: 100% !important;');
    rules.push('  }');
    rules.push('}');
  }
  el.textContent = rules.join('\n');
}
