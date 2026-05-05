import { FEATURES, get } from './features.js';

const DRAG_THRESHOLD = 4;

let bound = false;

export function apply() {
  if (bound) return;
  bound = true;
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
      if (!get(FEATURES.clickGuard.key)) return;
      if (!e.target.closest('tbody tr')) return;
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
