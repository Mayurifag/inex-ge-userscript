import { FEATURES, get } from './features.js';
import { HIDE_CLASS } from './constants.js';

export function applyStyles() {
  const root = document.documentElement.classList;
  root.toggle(HIDE_CLASS.hideRecipient, get(FEATURES.hideRecipient.key));
  root.toggle(HIDE_CLASS.hideTakeout, get(FEATURES.hideTakeout.key));
  root.toggle(HIDE_CLASS.hideTrackingDate, get(FEATURES.hideTrackingDate.key));
}
