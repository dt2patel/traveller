export function logEvent(name: string) {
  const key = `analytics:${name}`;
  const count = Number(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, String(count));
}
