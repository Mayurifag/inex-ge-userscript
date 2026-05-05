import './styles.css';
import { FEATURES, get } from './features.js';
import { applyPerPage, fixPerPageOptions } from './perPage.js';
import { applyStyles } from './styles.js';
import { applyLastStatus, startObserver } from './lastStatus.js';
import { renameHeader } from './sort.js';
import { stripDescriptionPrice } from './description.js';
import { translateStatuses } from './translate.js';
import { registerMenu } from './menu.js';

function refresh() {
  translateStatuses();
  applyLastStatus(renameHeader);
  stripDescriptionPrice();
}

if (get(FEATURES.perPage.key)) applyPerPage();
applyStyles();
registerMenu(refresh);

function onReady() {
  if (get(FEATURES.perPage.key)) fixPerPageOptions();
  refresh();
  startObserver(refresh);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onReady, { once: true });
} else {
  onReady();
}
