import { useState } from 'react';
import { Event } from '../types';
import { formatLocal, isoToLocalDate, relativeTime, localToUtcIso, parseISO } from '../lib/time';
import DateTimePicker from './DateTimePicker';

function EventRow({ event, onDelete, onUpdate }: { event: Event; onDelete: (id: string) => void; onUpdate: (id: string, data: Partial<Event>) => void }) {
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState(event.type);
  const [dateTime, setDateTime] = useState(formatLocal(isoToLocalDate(event.occurredAt, event.occurredTz), 'yyyy-MM-ddTHH:mm'));
  const [notes, setNotes] = useState(event.notes || '');

  const handleSave = () => {
    const localDate = parseISO(dateTime);
    const occurredAt = localToUtcIso(localDate, event.occurredTz);
    onUpdate(event.id, { type, occurredAt, notes });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex space-x-2">
        <select value={type} onChange={e => setType(e.target.value as EventType)}>
          <option>ENTRY</option>
          <option>EXIT</option>
        </select>
        <DateTimePicker value={dateTime} onChange={e => setDateTime(e.target.value)} />
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes" />
        <button onClick={handleSave}>Save</button>
        <button onClick={() => setEditing(false)}>Cancel</button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span>{event.type} {formatLocal(isoToLocalDate(event.occurredAt, event.occurredTz), 'yyyy-MM-dd HH:mm')} ({relativeTime(event.occurredAt)}) {event.occurredTz}</span>
      <button onClick={() => setEditing(true)}>Edit</button>
      <button onClick={() => onDelete(event.id)}>Delete</button>
    </div>
  );
}

export default EventRow;