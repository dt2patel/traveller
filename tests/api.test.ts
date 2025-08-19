import { describe, expect, test, vi } from 'vitest';
import { createEvent, flushQueue } from '../src/lib/api';
import { db } from '../src/lib/db';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(() => ({})),
  getDocs: vi.fn(async () => ({ forEach: () => {} })),
  setDoc: vi.fn(async () => {}),
  deleteDoc: vi.fn(async () => {}),
}));

describe('api queue', () => {
  test('create and flush', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    await createEvent('user1', {
      type: 'ENTRY',
      occurredAt: new Date().toISOString(),
      occurredTz: 'UTC',
      source: 'quick',
    });
    let q = await db.getQueue();
    expect(q.length).toBe(1);
    await flushQueue('user1');
    q = await db.getQueue();
    expect(q.length).toBe(0);
  });
});
