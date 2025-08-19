import { openDB } from 'idb';
import type { Event, QueueItem } from '../types';

const DB_NAME = 'traveller';
const DB_VERSION = 1;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('events')) {
      db.createObjectStore('events', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('queue')) {
      db.createObjectStore('queue', { keyPath: 'id' });
    }
  },
});

export const db = {
  async getEvents(): Promise<Event[]> {
    return (await dbPromise).getAll('events');
  },
  async putEvent(ev: Event) {
    return (await dbPromise).put('events', ev);
  },
  async deleteEvent(id: string) {
    return (await dbPromise).delete('events', id);
  },
  async addQueue(item: QueueItem) {
    return (await dbPromise).put('queue', item);
  },
  async getQueue(): Promise<QueueItem[]> {
    return (await dbPromise).getAll('queue');
  },
  async deleteQueue(id: string) {
    return (await dbPromise).delete('queue', id);
  },
};
