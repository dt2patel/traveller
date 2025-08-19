
export type EventType = 'ENTRY' | 'EXIT';
export type EventSource = 'quick' | 'custom' | 'import';
export type SyncStatus = 'queued' | 'synced' | 'error';

export interface TravelEvent {
  id: string; // client-generated UUID
  userId: string;
  type: EventType;
  occurredAt: string; // ISO string, UTC
  occurredTz: string; // IANA tz string, e.g. "Asia/Kolkata"
  createdAt: string; // ISO string, UTC
  updatedAt: string; // ISO string, UTC
  source: EventSource;
  notes?: string;
  syncStatus?: SyncStatus; // local-only
}

export type NewTravelEvent = Omit<TravelEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string };
export type UpdateTravelEvent = Partial<Omit<TravelEvent, 'id' | 'userId' | 'createdAt'>> & { id: string };

export interface QueuedItem {
  id: string; // UUID for the queue item itself
  action: 'create' | 'update' | 'delete';
  payload: TravelEvent | { id: string, userId: string }; // Full event for create/update, just id for delete
  enqueuedAt: string; // ISO string, UTC
}

// Summary related types
export interface Trip {
  entry: TravelEvent;
  exit: TravelEvent | null;
  durationMs: number;
  warnings: string[];
}

export interface SummaryData {
  status: 'In India' | 'Outside India';
  currentStayDuration: string | null;
  rolling182Days: number;
  rolling365Days: number;
  currentFyDays: number;
  previousFyDays: number;
  trips: Trip[];
  dataHash: string; // Hash of events data used to calculate this summary
}
