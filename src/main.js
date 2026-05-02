import './styles.css';
import { FEATURES, get } from './features.js';
import { applyPerPage, fixPerPageOptions } from './perPage.js';
import { applyStyles } from './styles.js';
import { applyLastStatus, startObserver } from './lastStatus.js';
import { renameHeader } from './sort.js';
import { expandTracking } from './tracking.js';
import { stripDescriptionPrice } from './description.js';
import { registerMenu } from './menu.js';

function refresh() {
  applyLastStatus(renameHeader);
  expandTracking();
  stripDescriptionPrice();
}

if (get(FEATURES.perPage.key)) {
  applyPerPage();
  fixPerPageOptions();
}
applyStyles();
refresh();
startObserver(refresh);
registerMenu(refresh);
