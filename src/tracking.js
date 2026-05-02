import { FEATURES, get } from './features.js';

export function expandTracking() {
  if (!get(FEATURES.expandTracking.key)) return;
  const spans = document.querySelectorAll('span.tracking');
  for (const span of spans) {
    const parent = span.parentElement;
    const full = parent?.getAttribute('data-original-title');
    if (full && full !== span.textContent.trim()) span.textContent = full;
    parent?.removeAttribute('data-toggle');
    parent?.removeAttribute('data-original-title');
    parent?.removeAttribute('title');
  }
}
