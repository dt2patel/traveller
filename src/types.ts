export type EventType = 'ENTRY' | 'EXIT';

export interface Event {
  id: string;
  userId: string;
  type: EventType;
  occurredAt: string; // ISO UTC
  occurredTz: string; // IANA tz
  createdAt: string; // ISO UTC
  updatedAt: string; // ISO UTC
  source: 'quick' | 'custom' | 'import';
  notes?: string;
  syncStatus?: 'queued' | 'synced' | 'error';
}

export interface QueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  payload: any;
  enqueuedAt: number;
}
