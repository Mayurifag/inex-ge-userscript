import { GM_getValue, GM_setValue } from './gm.js';

export const FEATURES = {
  langRedirect: { key: 'feat.langRedirect', label: 'Redirect /ka/ to /en/' },
  perPage: { key: 'feat.perPage', label: 'Force perPage=40' },
  hideRecipient: { key: 'feat.hideRecipient', label: 'Hide Recipient column' },
  hideTakeout: { key: 'feat.hideTakeout', label: 'Hide takeout parcels' },
  removeClutter: { key: 'feat.removeClutter', label: 'Remove clutter' },
  lastStatus: {
    key: 'feat.lastStatus',
    label: 'Replace Flight number with last status',
    needsReload: true,
  },
  sortByArrival: {
    key: 'feat.sortByArrival',
    label: 'Sort arrivals by progress and ETA',
  },
  expandTracking: {
    key: 'feat.expandTracking',
    label: 'Expand truncated tracking number',
    needsReload: true,
  },
  darkTheme: { key: 'feat.darkTheme', label: 'Dark theme' },
  translateStatus: {
    key: 'feat.translateStatus',
    label: 'Translate Georgian statuses',
    needsReload: true,
  },
  stripPrice: {
    key: 'feat.stripPrice',
    label: 'Strip price prefix from description',
    needsReload: true,
  },
  clickGuard: {
    key: 'feat.clickGuard',
    label: 'Suppress modal click after text-drag',
  },
};

export function get(key) {
  const v = GM_getValue(key);
  return v === undefined ? true : v;
}

export function put(key, val) {
  GM_setValue(key, val);
}
