export type EventType = 'ENTRY' | 'EXIT';

export interface Event {
  id: string;
  userId: string;
  type: EventType;
  occurredAt: string; // ISO UTC
  occurredTz: string; // IANA
  createdAt: string;
  updatedAt: string;
  source: 'quick' | 'custom' | 'import';
  notes?: string;
  syncStatus?: 'queued' | 'synced' | 'error'; // local only
}

export interface QueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  payload: Event | string; // for delete, id
  enqueuedAt: string;
}