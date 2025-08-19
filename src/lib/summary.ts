import type { Event } from '../types';

export interface Trip {
  entry: Event;
  exit?: Event;
}

export function pairTrips(events: Event[]): Trip[] {
  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const trips: Trip[] = [];
  let current: Event | null = null;
  for (const ev of sorted) {
    if (ev.type === 'ENTRY') {
      if (current) trips.push({ entry: current });
      current = ev;
    } else {
      if (current) {
        trips.push({ entry: current, exit: ev });
        current = null;
      }
    }
  }
  if (current) trips.push({ entry: current });
  return trips;
}

function overlap(startA: number, endA: number, startB: number, endB: number) {
  return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB));
}

export function rollingDays(trips: Trip[], days: number, nowISO = new Date().toISOString()): number {
  const end = Date.parse(nowISO);
  const start = end - days * 86400000;
  const ms = trips.reduce((sum, t) => {
    const s = Date.parse(t.entry.occurredAt);
    const e = Date.parse(t.exit?.occurredAt || nowISO);
    return sum + overlap(s, e, start, end);
  }, 0);
  return ms / 86400000;
}

export function financialYearRange(year: number) {
  const start = Date.parse(`${year}-04-01T00:00:00.000Z`);
  const end = Date.parse(`${year + 1}-03-31T23:59:59.999Z`);
  return { start, end };
}

export function fyDays(trips: Trip[], year: number, nowISO = new Date().toISOString()): number {
  const { start, end } = financialYearRange(year);
  const ms = trips.reduce((sum, t) => {
    const s = Date.parse(t.entry.occurredAt);
    const e = Date.parse(t.exit?.occurredAt || nowISO);
    return sum + overlap(s, e, start, end);
  }, 0);
  return ms / 86400000;
}

export function forecast(trips: Trip[], targetDate: string, threshold: number, nowISO = new Date().toISOString()): number {
  const target = Date.parse(targetDate);
  const start = target - 365 * 86400000;
  const spent = trips.reduce((sum, t) => {
    const s = Date.parse(t.entry.occurredAt);
    const e = Date.parse(t.exit?.occurredAt || nowISO);
    return sum + overlap(s, e, start, nowISO ? Date.parse(nowISO) : target);
  }, 0);
  const daysSpent = spent / 86400000;
  return Math.max(0, threshold - daysSpent);
}
