
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db as firestoreDb } from './firebase';
import {
  getLocalEvents,
  putLocalEvent,
  deleteLocalEvent,
  addQueueItem,
  getQueue,
  deleteQueueItem,
} from './db';
import { TravelEvent, NewTravelEvent, UpdateTravelEvent, QueuedItem } from '@/types';
import { nowUTC } from './time';

const getEventsCollection = (userId: string) => collection(firestoreDb, 'users', userId, 'events');

// --- Public API ---

export const getEvents = async (userId: string, forceFetch = false): Promise<TravelEvent[]> => {
  const localEvents = await getLocalEvents(userId);
  if (forceFetch || localEvents.length === 0) {
    try {
      const remoteEvents = await fetchEventsFromFirestore(userId);
      // Naive merge: replace local with remote
      const batch = (await getLocalEvents(userId)).map(e => deleteLocalEvent(e.id));
      await Promise.all(batch);
      await Promise.all(remoteEvents.map(e => putLocalEvent({ ...e, syncStatus: 'synced' })));
      return remoteEvents;
    } catch (error) {
      console.warn("Could not fetch from Firestore, returning local data.", error);
      return localEvents;
    }
  }
  return localEvents;
};

export const addEvent = async (eventData: NewTravelEvent, userId: string): Promise<TravelEvent> => {
  const now = nowUTC();
  const newEvent: TravelEvent = {
    ...eventData,
    id: eventData.id || uuidv4(),
    userId,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'queued',
  };

  await putLocalEvent(newEvent);
  await addQueueItem({
    id: uuidv4(),
    action: 'create',
    payload: newEvent,
    enqueuedAt: now,
  });

  // Trigger sync in background, don't await it
  flushQueue();

  return newEvent;
};

export const updateEvent = async (eventData: UpdateTravelEvent, userId: string): Promise<TravelEvent> => {
  const existingEvent = await getLocalEvents(userId).then(events => events.find(e => e.id === eventData.id));
  if (!existingEvent) throw new Error("Event not found for update");

  const now = nowUTC();
  const updatedEvent: TravelEvent = {
    ...existingEvent,
    ...eventData,
    updatedAt: now,
    syncStatus: 'queued',
  };

  await putLocalEvent(updatedEvent);
  await addQueueItem({
    id: uuidv4(),
    action: 'update',
    payload: updatedEvent,
    enqueuedAt: now,
  });
  
  flushQueue();

  return updatedEvent;
};

export const deleteEvent = async (id: string, userId: string): Promise<void> => {
  await deleteLocalEvent(id);
  await addQueueItem({
    id: uuidv4(),
    action: 'delete',
    payload: { id, userId },
    enqueuedAt: nowUTC(),
  });
  flushQueue();
};


// --- Sync Engine ---

let isSyncing = false;

export const flushQueue = async (): Promise<boolean> => {
  if (isSyncing || !navigator.onLine) {
    return false;
  }
  isSyncing = true;
  
  const queue = await getQueue();
  if (queue.length === 0) {
    isSyncing = false;
    return true;
  }
  
  console.log(`Syncing ${queue.length} items...`);

  try {
    for (const item of queue) {
      await processQueueItem(item);
      await deleteQueueItem(item.id);
    }
    console.log("Sync complete.");
    return true;
  } catch (error) {
    console.error("Sync failed:", error);
    // Maybe mark items as 'error' in a more robust implementation
    return false;
  } finally {
    isSyncing = false;
  }
};

const processQueueItem = async (item: QueuedItem) => {
  const { action, payload } = item;
  const userId = (payload as TravelEvent).userId || (payload as {userId: string}).userId;
  if (!userId) throw new Error("userId missing in queue payload");
  
  const eventsCollection = getEventsCollection(userId);

  switch (action) {
    case 'create':
    case 'update': {
      const event = payload as TravelEvent;
      const { syncStatus, ...firestorePayload } = event; // Don't save syncStatus to Firestore
      const eventDocRef = doc(eventsCollection, event.id);
      await setDoc(eventDocRef, firestorePayload, { merge: true });
      await putLocalEvent({ ...event, syncStatus: 'synced' });
      break;
    }
    case 'delete': {
      const { id } = payload;
      const eventDocRef = doc(eventsCollection, id);
      await deleteDoc(eventDocRef);
      // Local deletion already happened
      break;
    }
  }
};


// --- Firestore Direct Access ---

const fetchEventsFromFirestore = async (userId: string): Promise<TravelEvent[]> => {
  const querySnapshot = await getDocs(getEventsCollection(userId));
  return querySnapshot.docs.map(doc => ({
    ...doc.data() as Omit<TravelEvent, 'id'>,
    id: doc.id,
  }));
};