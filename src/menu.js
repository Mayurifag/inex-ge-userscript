import { GM_registerMenuCommand, GM_unregisterMenuCommand } from './gm.js';
import { FEATURES, get, put } from './features.js';

let menuIds = [];

export function registerMenu(onToggle) {
  if (typeof GM_unregisterMenuCommand === 'function') {
    for (const id of menuIds) GM_unregisterMenuCommand(id);
  }
  menuIds = [];
  for (const feature of Object.values(FEATURES)) {
    const { key, label, needsReload } = feature;
    const enabled = get(key);
    const prefix = enabled ? '[on]' : '[off]';
    const id = GM_registerMenuCommand(`${prefix} ${label}`, () => {
      put(key, !get(key));
      if (needsReload) {
        location.reload();
        return;
      }
      onToggle();
      registerMenu(onToggle);
    });
    menuIds.push(id);
  }
}
