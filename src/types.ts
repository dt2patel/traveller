export type EventType = 'ENTRY' | 'EXIT';

export interface Event {
  id?: string; // Optional for new events
  userId?: string; // Optional for local events
  type: EventType;
  occurredAt: string; // ISO 8601 string (UTC)
  occurredTz: string; // IANA timezone (e.g., 'Asia/Kolkata')
  notes?: string; // Optional notes
  createdAt: string; // ISO 8601 string (UTC)
  updatedAt: string; // ISO 8601 string (UTC)
  source: 'quick' | 'custom' | 'import'; // Source of the event
  syncStatus?: 'queued' | 'synced' | 'error'; // Optional sync status for offline support
}

// QueueItem for offline queue
export interface QueueItem {
  action: 'create' | 'update' | 'delete';
  payload: Event;
  timestamp: string; // ISO 8601 string
}