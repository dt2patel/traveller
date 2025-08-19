export function nowUTC(): string {
  return new Date().toISOString();
}

export function toUTC(date: Date): string {
  return date.toISOString();
}

export function parseISO(iso: string): Date {
  return new Date(iso);
}

export function formatLocal(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', ...opts }).format(d);
}

export function tz(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function tzAbbr(iso: string): string {
  const dtf = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' });
  return dtf.formatToParts(new Date(iso)).find((p) => p.type === 'timeZoneName')?.value || '';
}
