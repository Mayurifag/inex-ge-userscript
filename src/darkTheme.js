import { FEATURES, get } from './features.js';
import { GM_addStyle } from './gm.js';
import darkCss from './dark.user.css?raw';

const STYLE_ID = 'inex-ge-dark-style';

const rules = darkCss;

let el = null;

export function apply() {
  const enabled = get(FEATURES.darkTheme.key);
  if (enabled && !el) {
    el = GM_addStyle(rules);
    if (el && el.id !== undefined) el.id = STYLE_ID;
  } else if (!enabled && el) {
    el.remove();
    el = null;
  }
}
