import { FEATURES, get } from './features.js';
import { FEATURE_CLASS } from './constants.js';

export function applyStyles() {
  const root = document.documentElement.classList;
  root.toggle(FEATURE_CLASS.hideRecipient, get(FEATURES.hideRecipient.key));
  root.toggle(FEATURE_CLASS.hideTakeout, get(FEATURES.hideTakeout.key));
  root.toggle(FEATURE_CLASS.removeClutter, get(FEATURES.removeClutter.key));
  root.toggle(FEATURE_CLASS.darkTheme, get(FEATURES.darkTheme.key));
}
