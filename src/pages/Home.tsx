import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, createEvent, updateEvent } from '../lib/api';
import { getLocalTz, utcNow, isWithinMinutes, format, parseISO, localToUtcIso, formatLocal, isoToLocalDate } from '../lib/time';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog.tsx';
import DateTimePicker from '../components/DateTimePicker';

function Home() {
  const queryClient = useQueryClient();
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: getEvents });
  const latest = events[0];
  const nextType: EventType = latest?.type === 'ENTRY' ? 'EXIT' : 'ENTRY';
  const [showConfirm, setShowConfirm] = useState(false);
  const [editTime, setEditTime] = useState(false);
  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigator.vibrate?.(200);
      console.log('Event created'); // Analytics
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) => updateEvent(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
  const handleLog = () => {
    const now = utcNow();
    if (latest && latest.type === nextType && isWithinMinutes(now, latest.occurredAt, 2)) {
      toast.warn('Possible duplicate action');
      setShowConfirm(true);
      return;
    }
    mutation.mutate({
      type: nextType,
      occurredAt: now,
      occurredTz: getLocalTz(),
      source: 'quick',
    });
  };
  const confirmLog = () => {
    setShowConfirm(false);
    const now = utcNow();
    mutation.mutate({
      type: nextType,
      occurredAt: now,
      occurredTz: getLocalTz(),
      source: 'quick',
    });
  };
  const canEditLast = latest && isWithinMinutes(utcNow(), latest.occurredAt, 10);
  const handleEditTime = (newTime: string) => {
    if (!latest) return;
    const localDate = parseISO(newTime);
    const utc = localToUtcIso(localDate, latest.occurredTz);
    updateMutation.mutate({ id: latest.id, data: { occurredAt: utc } });
    setEditTime(false);
  };
  return (
    <div className="flex flex-col items-center p-4 min-h-screen justify-center">
      <button className="bg-green-500 text-white p-8 text-2xl rounded w-full max-w-md" onClick={handleLog}>
        Log {nextType} {nextType === 'ENTRY' ? 'into' : 'from'} India
      </button>
      {canEditLast && !editTime && <button className="mt-2 text-blue-500" onClick={() => setEditTime(true)}>Edit time</button>}
      {editTime && latest && (
        <div className="mt-2">
          <DateTimePicker defaultValue={format(parseISO(latest.occurredAt), 'yyyy-MM-ddTHH:mm')} onBlur={e => handleEditTime(e.target.value)} />
        </div>
      )}
      <Link to="/custom" className="mt-4 text-blue-500">Custom entry</Link>
      <Link to="/summary" className="mt-2 text-blue-500">Summary</Link>
      <div className="mt-4">
        Last two events:
        {events.slice(0, 2).map(e => (
          <div key={e.id} className="text-sm">
            {e.type} at {formatLocal(isoToLocalDate(e.occurredAt, e.occurredTz), 'yyyy-MM-dd HH:mm')} ({e.occurredTz.split('/')[1]})
          </div>
        ))}
      </div>
      <ConfirmDialog open={showConfirm} onConfirm={confirmLog} onCancel={() => setShowConfirm(false)} message="Confirm duplicate action?" />
    </div>
  );
}

export default Home;