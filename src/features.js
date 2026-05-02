import { GM_getValue, GM_setValue } from '$';

export const FEATURES = {
  perPage: { key: 'feat.perPage', label: 'Force perPage=20' },
  hideRecipient: { key: 'feat.hideRecipient', label: 'Hide Recipient column' },
  hideTakeout: { key: 'feat.hideTakeout', label: 'Hide takeout parcels' },
  removeClutter: { key: 'feat.removeClutter', label: 'Remove clutter' },
  lastStatus: { key: 'feat.lastStatus', label: 'Replace Flight number with last status' },
  sortByArrival: { key: 'feat.sortByArrival', label: 'Sort by arrival date on header click' },
  expandTracking: { key: 'feat.expandTracking', label: 'Expand truncated tracking number' },
};

export function get(key) {
  const v = GM_getValue(key);
  return v === undefined ? true : v;
}

export function put(key, val) {
  GM_setValue(key, val);
}
