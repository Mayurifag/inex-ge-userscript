import { GM_registerMenuCommand, GM_unregisterMenuCommand } from '$';
import { FEATURES, get, put } from './features.js';
import { applyStyles } from './styles.js';

let menuIds = [];

export function registerMenu(refresh) {
  if (typeof GM_unregisterMenuCommand === 'function') {
    for (const id of menuIds) GM_unregisterMenuCommand(id);
  }
  menuIds = [];
  for (const [, { key, label }] of Object.entries(FEATURES)) {
    const enabled = get(key);
    const prefix = enabled ? '[on]' : '[off]';
    const id = GM_registerMenuCommand(`${prefix} ${label}`, () => {
      put(key, !get(key));
      applyStyles();
      refresh();
      registerMenu(refresh);
    });
    menuIds.push(id);
  }
}
