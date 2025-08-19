import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listEvents, createEvent } from '../lib/api';
import { auth } from '../lib/firebase';
import { nowUTC, tz } from '../lib/time';
import Button from '../components/Button';
import DateTimePicker from '../components/DateTimePicker';
import type { EventType, Event } from '../types';

export default function CustomEntry() {
  const user = auth.currentUser!;
  const qc = useQueryClient();
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => listEvents(user.uid),
  });
  const last = [...events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
  const [type, setType] = useState<EventType>('ENTRY');
  const [dt, setDt] = useState(nowUTC());
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  return (
    <form
      className="space-y-4 max-w-md"
      onSubmit={async (e) => {
        e.preventDefault();
        if (last && last.type === type && Date.now() - Date.parse(last.occurredAt) < 120000) {
          if (!window.confirm('Same type within 2 minutes. Proceed?')) return;
        }
        await createEvent(user.uid, {
          type,
          occurredAt: dt,
          occurredTz: tz(),
          source: 'custom',
          notes,
        });
        qc.invalidateQueries({ queryKey: ['events'] });
        navigate('/');
      }}
    >
      <div>
        <label className="block mb-1">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as EventType)} className="border p-2 w-full">
          <option value="ENTRY">ENTRY</option>
          <option value="EXIT">EXIT</option>
        </select>
      </div>
      <div>
        <label className="block mb-1">Date & Time</label>
        <DateTimePicker value={dt} onChange={(v) => setDt(new Date(v).toISOString())} />
      </div>
      <div>
        <label className="block mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="border p-2 w-full" />
      </div>
      <Button type="submit" className="w-full">
        Save
      </Button>
    </form>
  );
}
