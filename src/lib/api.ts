import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { v4 as uuid } from 'uuid';
import type { Event, EventType } from '../types';
import { firestore } from './firebase';
import { db } from './db';
import { logEvent } from './analytics';

export async function listEvents(userId: string): Promise<Event[]> {
  const local = await db.getEvents();
  try {
    const snap = await getDocs(collection(firestore, `users/${userId}/events`));
    const remote: Event[] = [];
    snap.forEach((d) => remote.push(d.data() as Event));
    for (const ev of remote) await db.putEvent({ ...ev, syncStatus: 'synced' });
    return await db.getEvents();
  } catch {
    return local;
  }
}

export async function createEvent(userId: string, data: { type: EventType; occurredAt: string; occurredTz: string; source: 'quick' | 'custom' | 'import'; notes?: string; }): Promise<Event> {
  const now = new Date().toISOString();
  const ev: Event = {
    id: uuid(),
    userId,
    type: data.type,
    occurredAt: data.occurredAt,
    occurredTz: data.occurredTz,
    createdAt: now,
    updatedAt: now,
    source: data.source,
    notes: data.notes,
    syncStatus: 'queued',
  };
  await db.putEvent(ev);
  await db.addQueue({ id: ev.id, action: 'create', payload: ev, enqueuedAt: Date.now() });
  logEvent('create');
  return ev;
}

export async function updateEvent(userId: string, ev: Event) {
  const updated = { ...ev, updatedAt: new Date().toISOString(), syncStatus: 'queued' as const };
  await db.putEvent(updated);
  await db.addQueue({ id: ev.id, action: 'update', payload: updated, enqueuedAt: Date.now() });
  logEvent('update');
}

export async function deleteEvent(userId: string, id: string) {
  await db.deleteEvent(id);
  await db.addQueue({ id, action: 'delete', payload: { id, userId }, enqueuedAt: Date.now() });
  logEvent('delete');
}

export async function flushQueue(userId: string) {
  if (!navigator.onLine) return;
  const queue = await db.getQueue();
  for (const item of queue) {
    const ref = doc(firestore, `users/${userId}/events/${item.id}`);
    try {
      if (item.action === 'delete') {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, item.payload);
      }
      await db.deleteQueue(item.id);
      const ev: Event = { ...item.payload, syncStatus: 'synced' };
      if (item.action !== 'delete') await db.putEvent(ev);
    } catch {
      // keep in queue on failure
    }
  }
}
