import { describe, it, expect, vi } from 'vitest';
import { createEvent } from '../../src/lib/api';
import { utcNow } from '../../src/lib/time';

vi.mock('../../src/lib/db', () => ({
  dbPromise: Promise.resolve({
    add: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    getAllFromIndex: vi.fn(),
    count: vi.fn(),
    transaction: () => ({
      objectStore: () => ({
        openCursor: vi.fn().mockResolvedValue(null),
        add: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      }),
      done: Promise.resolve(),
    }),
  }),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({ docs: [] }),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
}));

vi.mock('../../src/lib/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test' } },
}));

describe('api', () => {
  it('createEvent queues and adds local', async () => {
    const event = await createEvent({
      type: 'ENTRY',
      occurredAt: utcNow(),
      occurredTz: 'Asia/Kolkata',
      source: 'quick',
    });
    expect(event.id).toBeDefined();
    expect(event.syncStatus).toBe('queued');
  });
});