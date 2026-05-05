import { FEATURES, get } from './features.js';

const PRICE_PREFIX = /^\s*[\d.,]+\s*[A-Z]{2,4}\s*-\s*/;
const DRAG_THRESHOLD = 4;

export function stripDescriptionPrice() {
  if (!get(FEATURES.removeClutter.key)) return;
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

export function guardDescriptionClick() {
  let downX = 0;
  let downY = 0;
  document.addEventListener(
    'mousedown',
    (e) => {
      downX = e.clientX;
      downY = e.clientY;
    },
    true,
  );
  document.addEventListener(
    'click',
    (e) => {
      if (!e.target.closest('td.description')) return;
      const moved = Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > DRAG_THRESHOLD;
      const selected = (window.getSelection()?.toString() ?? '').length > 0;
      if (moved || selected) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true,
  );
}
