import { FEATURES, get } from './features.js';
import { FEATURE_CLASS } from './constants.js';

export function apply() {
  const enabled = get(FEATURES.expandTracking.key);
  document.documentElement.classList.toggle(FEATURE_CLASS.expandTracking, enabled);
  if (!enabled) return;
  const divs = document.querySelectorAll('div[data-original-title]:has(> span.tracking)');
  for (const div of divs) {
    const full = div.getAttribute('data-original-title');
    const span = div.querySelector('span.tracking');
    if (full && span && span.textContent.trim() !== full) {
      span.textContent = full;
    }
    div.removeAttribute('data-toggle');
    div.removeAttribute('data-original-title');
    div.removeAttribute('title');
  }
}
