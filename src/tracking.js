import { FEATURES, get } from './features.js';

export function expandTracking() {
  if (!get(FEATURES.expandTracking.key)) return;
  const divs = document.querySelectorAll('div[data-original-title]:has(> span.tracking)');
  for (const div of divs) {
    const full = div.getAttribute('data-original-title');
    if (full) div.setAttribute('data-inex-tracking', full);
    div.removeAttribute('data-toggle');
    div.removeAttribute('data-original-title');
    div.removeAttribute('title');
  }
}
