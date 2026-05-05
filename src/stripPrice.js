import { FEATURES, get } from './features.js';

const PRICE_PREFIX = /^\s*[\d.,]+\s*[A-Z]{2,4}\s*-\s*/;

export function apply() {
  if (!get(FEATURES.stripPrice.key)) return;
  const cells = document.querySelectorAll('td.description');
  for (const td of cells) {
    const attr = td.getAttribute('data-original-title');
    if (attr && attr !== td.textContent.trim()) td.textContent = attr;
    td.removeAttribute('data-toggle');
    td.removeAttribute('data-original-title');
    td.removeAttribute('title');
    const text = td.textContent;
    const stripped = text.replace(PRICE_PREFIX, '');
    if (stripped !== text) td.textContent = stripped.trim();
  }
}
