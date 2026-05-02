import { GM_registerMenuCommand, GM_unregisterMenuCommand } from '$';
import { FEATURES, get, put } from './features.js';
import { applyStyles } from './styles.js';

let menuIds = [];

export function registerMenu({ onLastStatusEnable, onSortEnable }) {
  if (typeof GM_unregisterMenuCommand === 'function') {
    for (const id of menuIds) GM_unregisterMenuCommand(id);
  }
  menuIds = [];
  for (const [name, { key, label }] of Object.entries(FEATURES)) {
    const enabled = get(key);
    const prefix = enabled ? '[on]' : '[off]';
    const id = GM_registerMenuCommand(`${prefix} ${label}`, () => {
      const cur = get(key);
      put(key, !cur);
      applyStyles();
      if (name === 'lastStatus' && !cur) onLastStatusEnable();
      if (name === 'sortByArrival' && !cur) onSortEnable();
      registerMenu({ onLastStatusEnable, onSortEnable });
    });
    menuIds.push(id);
  }
}
