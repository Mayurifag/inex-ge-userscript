export function applyPerPage() {
  const url = new URL(window.location.href);
  if (url.searchParams.has('perPage')) return;
  url.searchParams.set('perPage', '20');
  window.location.replace(url.toString());
}
