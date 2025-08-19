import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createEvent, getEvents } from '../lib/api';
import { getLocalTz, format, parseISO, localToUtcIso } from '../lib/time';
import { toast } from 'react-toastify';
import { EventType } from '../types';

function CustomEntry() {
  const [type, setType] = useState<EventType>('ENTRY');
  const [dateTime, setDateTime] = useState(format(new Date(), 'yyyy-MM-ddTHH:mm'));
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: getEvents });
  const latest = events[0];
  const wouldBreak = latest && latest.type === type;
  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigator.vibrate?.(200);
      console.log('Custom event created');
    },
  });
  const handleSubmit = () => {
    if (wouldBreak) toast.warn('Breaks alternation');
    const localDate = parseISO(dateTime);
    const occurredAt = localToUtcIso(localDate, getLocalTz());
    mutation.mutate({
      type,
      occurredAt,
      occurredTz: getLocalTz(),
      source: 'custom',
      notes,
    });
  };
  return (
    <div className="p-4">
      <label>Type:</label>
      <select value={type} onChange={e => setType(e.target.value as EventType)} className="border p-2">
        <option>ENTRY</option>
        <option>EXIT</option>
      </select>
      <label>Date/Time:</label>
      <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className="border p-2" />
      <label>Notes:</label>
      <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes" className="border p-2" />
      {wouldBreak && <p className="text-red-500">Warning: breaks alternation</p>}
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 mt-2">Save</button>
    </div>
  );
}

export default CustomEntry;