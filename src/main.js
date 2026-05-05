import './styles.css';
import * as perPage from './perPage.js';
import * as darkTheme from './darkTheme.js';
import * as hideRecipient from './hideRecipient.js';
import * as hideTakeout from './hideTakeout.js';
import * as removeClutter from './removeClutter.js';
import * as lastStatus from './lastStatus.js';
import * as sort from './sort.js';
import * as tracking from './tracking.js';
import * as translate from './translate.js';
import * as stripPrice from './stripPrice.js';
import * as clickGuard from './clickGuard.js';
import { registerMenu } from './menu.js';

function init() {
  perPage.apply();
  darkTheme.apply();
  hideRecipient.apply();
  hideTakeout.apply();
  removeClutter.apply();
  clickGuard.apply();
}

function refresh() {
  translate.apply();
  lastStatus.apply();
  sort.apply();
  tracking.apply();
  stripPrice.apply();
}

function applyAll() {
  init();
  refresh();
}

init();
registerMenu(applyAll);

function onReady() {
  perPage.fixOptions();
  refresh();
  lastStatus.startObserver(refresh);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onReady, { once: true });
} else {
  onReady();
}
