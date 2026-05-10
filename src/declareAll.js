import { FEATURE_CLASS } from './constants.js';
import { FEATURES, get } from './features.js';

const CURRENCY_BY_FLAG = {
  cn: 'CNY',
  'cn-land': 'CNY',
  'cn-sea': 'CNY',
  us: 'USD',
  tr: 'TRY',
  gb: 'GBP',
  cy: 'EUR',
  de: 'EUR',
  es: 'EUR',
  gr: 'EUR',
  it: 'EUR',
};

function isDeclareAllPage() {
  return /\/en\/room\/declare-all(?:\/|\?|$)/.test(
    window.location.pathname + window.location.search,
  );
}

function flagCode() {
  const img = document.querySelector('.parcelsWrapper.declare-all .head .list-x li.active img');
  return img?.src.match(/\/flags\/([^/.]+)\.svg/)?.[1];
}

function selectCurrency(currency) {
  const select = document.querySelector('#valute');
  const option = [...(select?.options ?? [])].find((item) => item.textContent.trim() === currency);
  if (!select || !option || select.value === option.value) return;
  select.value = option.value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

export function apply() {
  const enabled = get(FEATURES.declareAll.key) && isDeclareAllPage();
  document.documentElement.classList.toggle(FEATURE_CLASS.declareAll, enabled);
  if (!enabled) return;
  selectCurrency(CURRENCY_BY_FLAG[flagCode()] ?? 'USD');
}
