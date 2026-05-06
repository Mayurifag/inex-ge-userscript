import { FEATURES, get } from './features.js';

function isParcelsPage() {
  return /\/room\/parcels(?:\/|\?|$)/.test(window.location.pathname + window.location.search);
}

export function apply() {
  if (!get(FEATURES.perPage.key)) return;
  if (!isParcelsPage()) return;
  const url = new URL(window.location.href);
  if (url.searchParams.has('perPage')) return;
  url.searchParams.set('perPage', '40');
  window.location.replace(url.toString());
}

export function fixOptions() {
  if (!get(FEATURES.perPage.key)) return;
  const selects = document.querySelectorAll('select[name="perPage"]');
  if (!selects.length) return;
  const url = new URL(window.location.href);
  url.searchParams.delete('perPage');
  url.searchParams.delete('page');
  const base = url.searchParams.toString();
  for (const sel of selects) {
    for (const opt of sel.options) {
      const n = opt.textContent.trim();
      const qs = base ? `${base}&perPage=${n}` : `perPage=${n}`;
      opt.value = `${url.origin}${url.pathname}?${qs}`;
    }
  }
}
