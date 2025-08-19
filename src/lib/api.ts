import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';
import { dbPromise } from './db';
import { v4 as uuid } from 'uuid';
import { utcNow } from './time';

const getUserId = () => auth.currentUser?.uid || '';

async function syncEvent(event: Event) {
  const userId = getUserId();
  if (!userId) throw new Error('Not authenticated');
  const eventRef = doc(db, `users/${userId}/events/${event.id}`);
  await setDoc(eventRef, { ...event, syncStatus: undefined });
}

async function deleteSyncedEvent(id: string) {
  const userId = getUserId();
  if (!userId) throw new Error('Not authenticated');
  const eventRef = doc(db, `users/${userId}/events/${id}`);
  await deleteDoc(eventRef);
}

async function flushQueue() {
  const dbLocal = await dbPromise;
  const tx = dbLocal.transaction(['queue', 'events', 'summaryCache'], 'readwrite');
  const queueStore = tx.objectStore('queue');
  const eventsStore = tx.objectStore('events');
  const cacheStore = tx.objectStore('summaryCache');
  let cursor = await queueStore.openCursor();
  while (cursor) {
    const item = cursor.value;
    try {
      if (item.action === 'create' || item.action === 'update') {
        const payload = item.payload as Event;
        await syncEvent(payload);
        await eventsStore.put({ ...payload, syncStatus: 'synced' });
      } else if (item.action === 'delete') {
        await deleteSyncedEvent(item.payload as string);
        await eventsStore.delete(item.payload as string);
      }
      await cursor.delete();
      await cacheStore.delete('lastSummary');
    } catch (error) {
      if (item.action === 'create' || item.action === 'update') {
        const payload = item.payload as Event;
        await eventsStore.put({ ...payload, syncStatus: 'error' });
      }
    }
    cursor = await cursor.continue();
  }
  await tx.done;
}

async function enqueue(action: QueueItem['action'], payload: QueueItem['payload']) {
  const dbLocal = await dbPromise;
  const item: QueueItem = {
    id: uuid(),
    action,
    payload,
    enqueuedAt: utcNow(),
  };
  await dbLocal.add('queue', item);
}

async function createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'syncStatus'>) {
  const userId = getUserId();
  if (!userId) throw new Error('Not authenticated');
  const id = uuid();
  const now = utcNow();
  const event: Event = {
    id,
    userId,
    ...data,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'queued',
  };
  const dbLocal = await dbPromise;
  await dbLocal.add('events', event);
  await enqueue('create', event);
  await dbLocal.delete('summaryCache', 'lastSummary');
  return event;
}

async function updateEvent(id: string, data: Partial<Event>) {
  const userId = getUserId();
  if (!userId) throw new Error('Not authenticated');
  const dbLocal = await dbPromise;
  const event = await dbLocal.get('events', id);
  if (!event || event.userId !== userId) throw new Error('Event not found');
  const updated = { ...event, ...data, updatedAt: utcNow(), syncStatus: 'queued' };
  await dbLocal.put('events', updated);
  await enqueue('update', updated);
  await dbLocal.delete('summaryCache', 'lastSummary');
  return updated;
}

async function deleteEvent(id: string) {
  const userId = getUserId();
  if (!userId) throw new Error('Not authenticated');
  const dbLocal = await dbPromise;
  const event = await dbLocal.get('events', id);
  if (!event || event.userId !== userId) throw new Error('Event not found');
  await dbLocal.delete('events', id);
  await enqueue('delete', id);
  await dbLocal.delete('summaryCache', 'lastSummary');
}

async function getEvents(): Promise<Event[]> {
  const userId = getUserId();
  if (!userId) return [];
  const dbLocal = await dbPromise;
  let localEvents = await dbLocal.getAllFromIndex('events', 'userId', userId);
  if (navigator.onLine) {
    try {
      const q = query(collection(db, `users/${userId}/events`), orderBy('occurredAt', 'desc'));
      const snapshot = await getDocs(q);
      const syncedEvents = snapshot.docs.map(d => ({ ...d.data(), id: d.id, syncStatus: 'synced' } as Event));
      const eventMap = new Map<string, Event>();
      syncedEvents.forEach(e => eventMap.set(e.id, e));
      localEvents.forEach(e => {
        const synced = eventMap.get(e.id);
        if (!synced || new Date(e.updatedAt) > new Date(synced.updatedAt)) {
          eventMap.set(e.id, e);
        } else if (synced && e.syncStatus === 'queued') {
          eventMap.set(e.id, { ...synced, syncStatus: 'synced' });
        }
      });
      const tx = dbLocal.transaction('events', 'readwrite');
      for (const e of eventMap.values()) {
        await tx.store.put(e);
      }
      await tx.done;
      localEvents = Array.from(eventMap.values());
    } catch (e) {
      // Use local
    }
  }
  return localEvents.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

async function getSyncStatus() {
  if (!navigator.onLine) return 'offline';
  const dbLocal = await dbPromise;
  const queueCount = await dbLocal.count('queue');
  const errorCount = (await dbLocal.getAll('events')).filter(e => e.syncStatus === 'error').length;
  if (queueCount > 0) return 'syncing';
  if (errorCount > 0) return 'error';
  return 'synced';
}

export { createEvent, updateEvent, deleteEvent, getEvents, flushQueue, getSyncStatus };