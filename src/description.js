import { FEATURES, get } from './features.js';

export function stripDescriptionPrice() {
  if (!get(FEATURES.removeClutter.key)) return;
  const cells = document.querySelectorAll('td.description');
  for (const td of cells) {
    const full = td.getAttribute('data-original-title');
    if (full && full !== td.textContent.trim()) td.textContent = full;
    td.removeAttribute('data-toggle');
    td.removeAttribute('data-original-title');
    td.removeAttribute('title');
  }
}
