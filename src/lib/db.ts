import { openDB, DBSchema } from 'idb';

interface MyDB extends DBSchema {
  events: {
    key: string;
    value: Event;
    indexes: { userId: string };
  };
  queue: {
    key: string;
    value: QueueItem;
  };
  summaryCache: {
    key: string;
    value: { hash: string; result: any };
  };
}

const dbPromise = openDB<MyDB>('travel-log-db', 1, {
  upgrade(db) {
    const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
    eventsStore.createIndex('userId', 'userId');
    db.createObjectStore('queue', { keyPath: 'id' });
    db.createObjectStore('summaryCache', { keyPath: 'id' });
  },
});

export { dbPromise };