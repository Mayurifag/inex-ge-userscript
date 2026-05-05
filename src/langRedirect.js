import { FEATURES, get } from './features.js';

export function apply() {
  if (!get(FEATURES.langRedirect.key)) return;
  const p = location.pathname;
  if (!p.startsWith('/ka/')) return;
  location.replace('/en' + p.slice(3) + location.search + location.hash);
}
