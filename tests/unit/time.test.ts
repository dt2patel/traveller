import { describe, it, expect } from 'vitest';
import { utcNow, getLocalTz, isWithinMinutes } from '../../src/lib/time';

describe('time helpers', () => {
  it('utcNow returns ISO string', () => {
    expect(utcNow()).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  it('getLocalTz returns IANA tz', () => {
    expect(getLocalTz()).toBeDefined();
  });

  it('isWithinMinutes checks correctly', () => {
    const iso1 = '2025-01-01T00:00:00Z';
    const iso2 = '2025-01-01T00:01:00Z';
    expect(isWithinMinutes(iso1, iso2, 2)).toBe(true);
  });
});