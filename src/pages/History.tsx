import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, deleteEvent, updateEvent } from '../lib/api';
import { parseISO } from 'date-fns';
import EventRow from '../components/EventRow';
import EmptyState from '../components/EmptyState';
import { useState } from 'react';

function History() {
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: getEvents });
  const filtered = events.filter(e => {
    const d = parseISO(e.occurredAt);
    if (rangeStart && d < parseISO(rangeStart)) return false;
    if (rangeEnd && d > parseISO(rangeEnd)) return false;
    return true;
  });
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
  const updateMutation = useMutation({
    mutationFn: ( { id, data }: { id: string; data: Partial<Event> } ) => updateEvent(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
  const handleExport = () => {
    const csv = ['type,occurredAt,occurredTz,notes,createdAt,updatedAt'];
    filtered.forEach(e => {
      csv.push(`${e.type},${e.occurredAt},${e.occurredTz},${e.notes || ''},${e.createdAt},${e.updatedAt}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel-history-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    console.log('CSV exported');
  };
  if (filtered.length === 0) return <EmptyState message="No events" />;
  return (
    <div className="p-4">
      <div className="flex space-x-2 mb-4">
        <input type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)} className="border p-2" />
        <input type="date" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} className="border p-2" />
        <button onClick={handleExport} className="bg-blue-500 text-white px-4 py-2">Export CSV</button>
      </div>
      <ul className="space-y-2">
        {filtered.map(e => (
          <EventRow key={e.id} event={e} onDelete={deleteMutation.mutate} onUpdate={(id, data) => updateMutation.mutate({ id, data })} />
        ))}
      </ul>
    </div>
  );
}

export default History;