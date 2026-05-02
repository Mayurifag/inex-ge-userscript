import { FEATURES, get } from './features.js';
import { FEATURE_CLASS } from './constants.js';
import { GM_addStyle } from './gm.js';
import darkCss from './dark.user.css?raw';

const DARK_STYLE_ID = 'inex-ge-dark-style';

const darkRules = darkCss
  .replace(/\/\*\s*==UserStyle==[\s\S]*?==\/UserStyle==\s*\*\//, '')
  .replace(/@-moz-document[^{]+\{/, '')
  .replace(/\}\s*$/, '');

let darkEl = null;

function applyDarkTheme() {
  const enabled = get(FEATURES.darkTheme.key);
  if (enabled && !darkEl) {
    darkEl = GM_addStyle(darkRules);
    if (darkEl && darkEl.id !== undefined) darkEl.id = DARK_STYLE_ID;
  } else if (!enabled && darkEl) {
    darkEl.remove();
    darkEl = null;
  }
}

export function applyStyles() {
  const root = document.documentElement.classList;
  root.toggle(FEATURE_CLASS.hideRecipient, get(FEATURES.hideRecipient.key));
  root.toggle(FEATURE_CLASS.hideTakeout, get(FEATURES.hideTakeout.key));
  root.toggle(FEATURE_CLASS.removeClutter, get(FEATURES.removeClutter.key));
  applyDarkTheme();
}
