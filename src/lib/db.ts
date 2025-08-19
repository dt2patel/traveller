
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { TravelEvent, QueuedItem, SummaryData } from '@/types';

const DB_NAME = 'india-travel-log-db';
const DB_VERSION = 1;

interface AppDB extends DBSchema {
  events: {
    key: string;
    value: TravelEvent;
    indexes: { 'by-userId-occurredAt': [string, string] };
  };
  queue: {
    key: string;
    value: QueuedItem;
    indexes: { 'by-enqueuedAt': string };
  };
  summaryCache: {
    key: string; // e.g., 'last-summary'
    value: SummaryData;
  }
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

const getDb = (): Promise<IDBPDatabase<AppDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
          eventsStore.createIndex('by-userId-occurredAt', ['userId', 'occurredAt']);
        }
        if (!db.objectStoreNames.contains('queue')) {
          const queueStore = db.createObjectStore('queue', { keyPath: 'id' });
          queueStore.createIndex('by-enqueuedAt', 'enqueuedAt');
        }
        if (!db.objectStoreNames.contains('summaryCache')) {
          db.createObjectStore('summaryCache', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
};

// Event operations
export const getLocalEvents = async (userId: string): Promise<TravelEvent[]> => {
  const db = await getDb();
  return db.getAllFromIndex('events', 'by-userId-occurredAt', IDBKeyRange.bound([userId, ''], [userId, '\uffff']));
};

export const getLocalEvent = async (id: string): Promise<TravelEvent | undefined> => {
  const db = await getDb();
  return db.get('events', id);
};

export const putLocalEvent = async (event: TravelEvent): Promise<void> => {
  const db = await getDb();
  await db.put('events', event);
};

export const deleteLocalEvent = async (id: string): Promise<void> => {
  const db = await getDb();
  await db.delete('events', id);
};

// Queue operations
export const getQueue = async (): Promise<QueuedItem[]> => {
  const db = await getDb();
  return db.getAllFromIndex('queue', 'by-enqueuedAt');
};

export const addQueueItem = async (item: QueuedItem): Promise<void> => {
  const db = await getDb();
  await db.put('queue', item);
};

export const deleteQueueItem = async (id: string): Promise<void> => {
  const db = await getDb();
  await db.delete('queue', id);
};

// Summary Cache operations
export const getSummaryCache = async (): Promise<SummaryData | undefined> => {
  const db = await getDb();
  return db.get('summaryCache', 'last-summary');
};

export const setSummaryCache = async (summary: SummaryData): Promise<void> => {
  const db = await getDb();
  await db.put('summaryCache', { ...summary, key: 'last-summary' } as any);
};

export default getDb;
