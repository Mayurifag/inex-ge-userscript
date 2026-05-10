const MS_PER_DAY = 86_400_000;

export function parseDmy(s) {
  if (!s) return null;
  const m = s.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!m) return null;
  return Date.UTC(+m[3], +m[2] - 1, +m[1]);
}

function getTodayUtc() {
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

export function daysAgo(dateStr) {
  const d = parseDmy(dateStr);
  return d !== null ? Math.floor((getTodayUtc() - d) / MS_PER_DAY) : null;
}

export function daysUntil(dateStr) {
  const d = parseDmy(dateStr);
  return d !== null ? Math.floor((d - getTodayUtc()) / MS_PER_DAY) : null;
}
