import { parseISO, differenceInMilliseconds, subDays } from 'date-fns';
import { utcNow, isWithinMinutes } from './time';
import { dbPromise } from './db';

interface Trip {
  start: string;
  end: string | null;
  durationMs: number;
}

async function getSummaryData(events: Event[]) {
  const sortedEvents = [...events].sort((a, b) => a.id.localeCompare(b.id));
  const hashData = sortedEvents.map(e => ({ ...e, syncStatus: undefined }));
  const hash = btoa(JSON.stringify(hashData));
  const dbLocal = await dbPromise;
  const cached = await dbLocal.get('summaryCache', 'lastSummary');
  if (cached && cached.hash === hash) {
    return cached.result;
  }
  const trips = buildTrips(events);
  const status = getStatus(events);
  const issues = getDataIssues(events);
  const result = { trips, status, issues };
  await dbLocal.put('summaryCache', { id: 'lastSummary', hash, result });
  return result;
}

function buildTrips(events: Event[]): Trip[] {
  const sorted = [...events].sort((a, b) => parseISO(a.occurredAt).getTime() - parseISO(b.occurredAt).getTime());
  const trips: Trip[] = [];
  let currentStart: string | null = null;
  for (const ev of sorted) {
    if (ev.type === 'ENTRY') {
      if (currentStart === null) {
        currentStart = ev.occurredAt;
      } else {
        currentStart = ev.occurredAt;
      }
    } else if (ev.type === 'EXIT') {
      if (currentStart !== null) {
        const duration = differenceInMilliseconds(parseISO(ev.occurredAt), parseISO(currentStart));
        trips.push({ start: currentStart, end: ev.occurredAt, durationMs: duration });
        currentStart = null;
      }
    }
  }
  if (currentStart !== null) {
    const now = utcNow();
    const duration = differenceInMilliseconds(parseISO(now), parseISO(currentStart));
    trips.push({ start: currentStart, end: null, durationMs: duration });
  }
  return trips;
}

function calculateDaysInWindow(trips: Trip[], windowStart: Date, windowEnd: Date): number {
  let totalMs = 0;
  const ws = windowStart.getTime();
  const we = windowEnd.getTime();
  for (const trip of trips) {
    const ts = parseISO(trip.start).getTime();
    const te = trip.end ? parseISO(trip.end).getTime() : Date.now();
    const overlapStart = Math.max(ts, ws);
    const overlapEnd = Math.min(te, we);
    if (overlapStart < overlapEnd) {
      totalMs += overlapEnd - overlapStart;
    }
  }
  return totalMs / (1000 * 60 * 60 * 24);
}

function getRollingWindowDays(events: Event[], days: number): number {
  const now = new Date();
  const start = subDays(now, days - 1);
  const trips = buildTrips(events);
  return calculateDaysInWindow(trips, start, now);
}

function getFYWindow(year: number): { start: Date, end: Date } {
  const start = new Date(Date.UTC(year, 3, 1));
  const end = new Date(Date.UTC(year + 1, 2, 31, 23, 59, 59));
  return { start, end };
}

function getCurrentFYYear() {
  const now = new Date();
  return now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
}

function getStatus(events: Event[]): { inIndia: boolean, stayLengthMs: number | null } {
  if (events.length === 0) return { inIndia: false, stayLengthMs: null };
  const last = events.sort((a, b) => parseISO(b.occurredAt).getTime() - parseISO(a.occurredAt).getTime())[0];
  if (last.type === 'EXIT') return { inIndia: false, stayLengthMs: null };
  const stayStart = parseISO(last.occurredAt);
  return { inIndia: true, stayLengthMs: differenceInMilliseconds(new Date(), stayStart) };
}

function forecastMaxStay(events: Event[], targetDate: Date, threshold: number): number {
  const windowStart = subDays(targetDate, threshold - 1);
  const trips = buildTrips(events);
  const spent = calculateDaysInWindow(trips, windowStart, targetDate);
  return threshold - spent;
}

function getDataIssues(events: Event[]): string[] {
  const issues = [];
  const sorted = [...events].sort((a, b) => parseISO(a.occurredAt).getTime() - parseISO(b.occurredAt).getTime());
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev.type === curr.type && isWithinMinutes(curr.occurredAt, prev.occurredAt, 2)) {
      issues.push(`Duplicate ${curr.type} at ${curr.occurredAt}`);
    }
  }
  const last = sorted[sorted.length - 1];
  if (last && last.type === 'ENTRY' && differenceInMilliseconds(new Date(), parseISO(last.occurredAt)) / (1000 * 60 * 60 * 24) > 120) {
    issues.push('Open trip older than 120 days');
  }
  return issues;
}

export { buildTrips, calculateDaysInWindow, getRollingWindowDays, getFYWindow, getCurrentFYYear, getStatus, forecastMaxStay, getDataIssues, getSummaryData };