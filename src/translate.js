import { FEATURES, get } from './features.js';

const STATUS_MAP = {
  გამოგზავნილია: 'Sent',
  'ჩამოსულია, მიმდინარეობს სატერმინალო პროცედურები': 'Arrived, terminal procedures in progress',
  'ჩამოსულია, მიმდინარეობს საბაჟო პროცედურები': 'Arrived, customs procedures in progress',
  'გამანაწილებელ ჰაბშია, მიმდინარეობს დახარისხება. დახარისხებისთვის საჭიროა 0-დან 2 დღემდე':
    'At distribution hub, sorting in progress (0–2 days)',
  'დასრულებულია, მიმდინარეობს ფილიალებში განაწილება. განაწილებისთვის საჭიროა 0-დან 3 დღემდე':
    'Done, distributing to branches (0–3 days)',
};

export function translateStatuses() {
  if (!get(FEATURES.translateStatus.key)) return;
  for (const p of document.querySelectorAll('.toolTipWrapper ul li p')) {
    if (p.classList.contains('date')) continue;
    const tx = p.textContent.trim();
    const en = STATUS_MAP[tx];
    if (en && en !== tx) p.textContent = en;
  }
}
