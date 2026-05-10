const CATEGORY = {
  arrived: 0,
  active: 1,
  done: 2,
};

export function getSortKey({ isArrived, isDone, eventCount, eta, lastUpdate }) {
  const hasEta = Number.isFinite(eta);
  const category = isDone ? CATEGORY.done : isArrived ? CATEGORY.arrived : CATEGORY.active;
  return [category, -eventCount, hasEta ? eta : Infinity, -lastUpdate];
}

export function compareSortKeys(a, b) {
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}
