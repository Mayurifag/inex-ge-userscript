import { GM_getValue, GM_setValue } from '$';

export const FEATURES = {
  perPage: { key: 'feat.perPage', label: 'Force perPage=20' },
  hideRecipient: { key: 'feat.hideRecipient', label: 'Hide Recipient column' },
  hideTakeout: { key: 'feat.hideTakeout', label: 'Hide takeout parcels' },
  hideTrackingDate: { key: 'feat.hideTrackingDate', label: 'Hide date in tracking column' },
  lastStatus: { key: 'feat.lastStatus', label: 'Replace Flight number with last status' },
  sortByArrival: { key: 'feat.sortByArrival', label: 'Sort by arrival date on header click' },
  mobileFix: { key: 'feat.mobileFix', label: 'Mobile layout fixes' },
};

export function get(key) {
  const v = GM_getValue(key);
  return v === undefined ? true : v;
}

export function put(key, val) {
  GM_setValue(key, val);
}
