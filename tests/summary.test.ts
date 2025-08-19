import { describe, expect, test } from 'vitest';
import { pairTrips, rollingDays, fyDays } from '../src/lib/summary';
import type { Event } from '../src/types';

function ev(id: string, type: 'ENTRY' | 'EXIT', at: string): Event {
  return {
    id,
    userId: 'u',
    type,
    occurredAt: at,
    occurredTz: 'UTC',
    createdAt: at,
    updatedAt: at,
    source: 'quick',
  };
}

describe('summary', () => {
  const events = [
    ev('1', 'ENTRY', '2023-01-01T00:00:00.000Z'),
    ev('2', 'EXIT', '2023-01-11T00:00:00.000Z'),
    ev('3', 'ENTRY', '2023-02-01T00:00:00.000Z'),
  ];
  test('pairTrips with open trip', () => {
    const trips = pairTrips(events);
    expect(trips.length).toBe(2);
    expect(trips[1].exit).toBeUndefined();
  });
  test('rollingDays', () => {
    const trips = pairTrips(events);
    const days = rollingDays(trips, 30, '2023-02-10T00:00:00.000Z');
    expect(days).toBeCloseTo(9, 2);
  });
  test('financial year days', () => {
    const trips = pairTrips(events);
    const days = fyDays(trips, 2022, '2023-02-10T00:00:00.000Z');
    expect(days).toBeCloseTo(19, 2);
  });
});
