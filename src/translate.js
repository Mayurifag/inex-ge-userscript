import { FEATURES, get } from './features.js';

const STATUS_MAP = {
  გამოგზავნილია: 'Sent',
  'ჩამოსულია, მიმდინარეობს სატერმინალო პროცედურები': 'Terminal processing',
  'ჩამოსულია, მიმდინარეობს საბაჟო პროცედურები': 'Customs clearance',
  'გამანაწილებელ ჰაბშია, მიმდინარეობს დახარისხება. დახარისხებისთვის საჭიროა 0-დან 2 დღემდე':
    'At hub, sorting (0–2 days)',
  'დასრულებულია, მიმდინარეობს ფილიალებში განაწილება. განაწილებისთვის საჭიროა 0-დან 3 დღემდე':
    'Distributing to branch (0–3 days)',
};

const MENU_RE = /^\s*შიდა\s+გზავნილები\s*(\([^)]*\))?\s*$/;

export function apply() {
  if (!get(FEATURES.translateStatus.key)) return;
  if (location.pathname.startsWith('/ka/')) return;
  for (const p of document.querySelectorAll('.toolTipWrapper ul li p')) {
    if (p.classList.contains('date')) continue;
    const tx = p.textContent.trim();
    const en = STATUS_MAP[tx];
    if (en && en !== tx) p.textContent = en;
  }
  for (const p of document.querySelectorAll('.leftBarWrapper a.item > p')) {
    const m = p.textContent.match(MENU_RE);
    if (m) p.textContent = p.textContent.replace(/შიდა\s+გზავნილები/, 'Local Parcels');
  }
}
