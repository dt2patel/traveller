import { describe, expect, test } from 'vitest';
import { nowUTC, tz } from '../src/lib/time';

describe('time utils', () => {
  test('nowUTC returns ISO with Z', () => {
    expect(nowUTC()).toMatch(/Z$/);
  });
  test('tz returns a string', () => {
    expect(tz()).toBeTypeOf('string');
  });
});
