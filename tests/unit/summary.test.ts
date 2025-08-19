import { describe, it, expect } from 'vitest';
import { buildTrips, calculateDaysInWindow, getFYWindow, forecastMaxStay } from '../../src/lib/summary';
import { Event } from '../../src/types';
import { parseISO, subDays } from 'date-fns';

describe('summary logic', () => {
  const events: Event[] = [
    { id: '1', type: 'ENTRY', occurredAt: '2025-01-01T00:00:00Z', occurredTz: 'Asia/Kolkata', createdAt: '', updatedAt: '', source: 'quick', userId: '' },
    { id: '2', type: 'EXIT', occurredAt: '2025-01-10T00:00:00Z', occurredTz: 'Asia/Kolkata', createdAt: '', updatedAt: '', source: 'quick', userId: '' },
  ];

  it('buildTrips pairs correctly', () => {
    const trips = buildTrips(events);
    expect(trips.length).toBe(1);
    expect(trips[0].durationMs).toBe(9 * 24 * 60 * 60 * 1000);
  });

  it('buildTrips handles open trip', () => {
    const openEvents = [events[0]];
    const trips = buildTrips(openEvents);
    expect(trips.length).toBe(1);
    expect(trips[0].end).toBeNull();
  });

  it('calculateDaysInWindow with overlap', () => {
    const trips = buildTrips(events);
    const ws = parseISO('2025-01-05T00:00:00Z');
    const we = parseISO('2025-01-15T00:00:00Z');
    const days = calculateDaysInWindow(trips, ws, we);
    expect(days).toBe(5);
  });

  it('getFYWindow for boundaries', () => {
    const fy = getFYWindow(2024);
    expect(fy.start.toISOString()).toBe('2024-04-01T00:00:00.000Z');
    expect(fy.end.toISOString()).toBe('2025-03-31T23:59:59.000Z');
  });

  it('forecastMaxStay', () => {
    const target = new Date();
    const ws = subDays(target, 181);
    const max = forecastMaxStay(events, target, 182);
    expect(max).toBeGreaterThan(0);
  });
});