import './styles.css';
import { FEATURES, get } from './features.js';
import { applyPerPage, fixPerPageOptions } from './perPage.js';
import { applyStyles } from './styles.js';
import { applyLastStatus, startObserver } from './lastStatus.js';
import { renameHeader } from './sort.js';
import { registerMenu } from './menu.js';

console.log('[inex-ge] script loaded', { url: location.href });

function runLastStatus() {
  applyLastStatus(renameHeader);
}

if (get(FEATURES.perPage.key)) {
  applyPerPage();
  fixPerPageOptions();
}
applyStyles();
runLastStatus();
startObserver(runLastStatus);
registerMenu({ onLastStatusEnable: runLastStatus, onSortEnable: renameHeader });
