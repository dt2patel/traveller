import { TravelEvent, Trip, SummaryData } from '@/types';
import { parseISO, addDays, getYear, isBefore, isAfter, startOfYear, endOfYear, differenceInMilliseconds, subDays, getMonth } from 'date-fns';
import { nowUTC } from './time';
import { toZonedTime } from 'date-fns-tz';

/**
 * Pairs ENTRY and EXIT events into trips.
 */
export const pairEventsToTrips = (events: TravelEvent[]): Trip[] => {
  const sortedEvents = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const trips: Trip[] = [];
  let currentEntry: TravelEvent | null = null;
  let lastType: 'ENTRY' | 'EXIT' | null = null;

  for (let i = 0; i < sortedEvents.length; i++) {
    const event = sortedEvents[i];
    const warnings: string[] = [];

    // Check for duplicate types within 2 minutes
    const prevEvent = sortedEvents[i-1];
    if (prevEvent && prevEvent.type === event.type && differenceInMilliseconds(parseISO(event.occurredAt), parseISO(prevEvent.occurredAt)) < 2 * 60 * 1000) {
      warnings.push('Duplicate event type within 2 minutes of previous.');
    }
    
    if (event.type === 'ENTRY') {
      if (currentEntry) {
        // Found an ENTRY while another trip was open. Close the previous one without an exit.
        trips.push({ entry: currentEntry, exit: null, durationMs: 0, warnings: ['Missing EXIT event.'] });
      }
      currentEntry = event;
    } else if (event.type === 'EXIT') {
      if (currentEntry) {
        // Normal trip pairing
        const durationMs = differenceInMilliseconds(parseISO(event.occurredAt), parseISO(currentEntry.occurredAt));
        trips.push({ entry: currentEntry, exit: event, durationMs, warnings });
        currentEntry = null;
      } else {
        // Found an EXIT without a preceding ENTRY. This is a data issue.
        // We don't add it as a trip, but a more robust system might flag it.
      }
    }
    lastType = event.type;
  }

  // Handle a trip that is still open
  if (currentEntry) {
    const durationMs = differenceInMilliseconds(new Date(), parseISO(currentEntry.occurredAt));
    const warnings = [];
    if (durationMs > 120 * 24 * 60 * 60 * 1000) {
        warnings.push('Open trip is older than 120 days. Please review.');
    }
    trips.push({ entry: currentEntry, exit: null, durationMs, warnings });
  }

  return trips;
};

const getOverlapMilliseconds = (tripStart: Date, tripEnd: Date, windowStart: Date, windowEnd: Date): number => {
    const start = isAfter(tripStart, windowStart) ? tripStart : windowStart;
    const end = isBefore(tripEnd, windowEnd) ? tripEnd : windowEnd;
  
    if (isAfter(start, end)) {
      return 0;
    }
  
    return differenceInMilliseconds(end, start);
};
  
const calculateDaysInWindow = (trips: Trip[], windowStart: Date, windowEnd: Date): number => {
    const totalMs = trips.reduce((acc, trip) => {
        const tripStart = parseISO(trip.entry.occurredAt);
        const tripEnd = trip.exit ? parseISO(trip.exit.occurredAt) : new Date(); // Use now for open trips
        return acc + getOverlapMilliseconds(tripStart, tripEnd, windowStart, windowEnd);
    }, 0);
    return totalMs / (1000 * 60 * 60 * 24);
};

const getFinancialYearBounds = (year: number, tz: string = 'UTC') => {
    // Financial year is April 1 to March 31
    const start = toZonedTime(new Date(year, 3, 1), tz); // April 1st
    const end = toZonedTime(new Date(year + 1, 2, 31, 23, 59, 59, 999), tz); // March 31st
    return { start, end };
};
  
export const calculateSummary = (events: TravelEvent[]): Omit<SummaryData, 'dataHash'> => {
  if (!events || events.length === 0) {
    return {
      status: 'Outside India',
      currentStayDuration: null,
      rolling182Days: 0,
      rolling365Days: 0,
      currentFyDays: 0,
      previousFyDays: 0,
      trips: [],
    };
  }
  const trips = pairEventsToTrips(events);
  const now = new Date();

  // Rolling windows
  const window182End = now;
  const window182Start = subDays(now, 182);
  const rolling182Days = calculateDaysInWindow(trips, window182Start, window182End);

  const window365End = now;
  const window365Start = subDays(now, 365);
  const rolling365Days = calculateDaysInWindow(trips, window365Start, window365End);

  // Financial Years
  const currentYear = getYear(now);
  const currentFyStartYear = getMonth(now) >= 3 ? currentYear : currentYear - 1; // FY starts in April
  const { start: currentFyStart, end: currentFyEnd } = getFinancialYearBounds(currentFyStartYear);
  const currentFyDays = calculateDaysInWindow(trips, currentFyStart, currentFyEnd);
  
  const { start: prevFyStart, end: prevFyEnd } = getFinancialYearBounds(currentFyStartYear - 1);
  const previousFyDays = calculateDaysInWindow(trips, prevFyStart, prevFyEnd);

  const lastTrip = trips[trips.length - 1];
  const status: 'In India' | 'Outside India' = lastTrip && !lastTrip.exit ? 'In India' : 'Outside India';
  
  let currentStayDuration = null;
  if (status === 'In India') {
    const durationMs = differenceInMilliseconds(now, parseISO(lastTrip.entry.occurredAt));
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    currentStayDuration = `${days}d ${hours}h ${minutes}m`;
  }
  
  return {
    status,
    currentStayDuration,
    rolling182Days,
    rolling365Days,
    currentFyDays,
    previousFyDays,
    trips,
  };
};

export const runForecast = (
    events: TravelEvent[],
    targetDateISO: string,
    thresholdDays: number
  ): number => {
    const trips = pairEventsToTrips(events);
    const now = new Date();
    const targetDate = parseISO(targetDateISO);
  
    // Calculate days already spent in the window from past trips
    const daysSpent = calculateDaysInWindow(trips, now, targetDate);
  
    // Remaining days in the window
    const totalWindowDays = differenceInMilliseconds(targetDate, now) / (1000 * 60 * 60 * 24);
  
    const availableDays = thresholdDays - daysSpent;
  
    return Math.max(0, Math.floor(Math.min(availableDays, totalWindowDays)));
};

/**
 * Creates a simple hash of the events array to detect changes.
 */
export const hashEvents = (events: TravelEvent[]): string => {
    if (!events || events.length === 0) return 'no-events';
    const key = events.map(e => `${e.id}:${e.updatedAt}`).join(',');
    // Simple non-crypto hash
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        const char = key.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
};