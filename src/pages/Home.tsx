import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listEvents, createEvent, updateEvent } from '../lib/api';
import { auth } from '../lib/firebase';
import { nowUTC, tz, formatLocal } from '../lib/time';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import DateTimePicker from '../components/DateTimePicker';
import type { EventType, Event } from '../types';

export default function Home() {
  const user = auth.currentUser!;
  const qc = useQueryClient();
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => listEvents(user.uid),
  });
  const sorted = [...events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const last = sorted[0];
  const nextType: EventType = last?.type === 'ENTRY' ? 'EXIT' : 'ENTRY';
  const mutation = useMutation({
    mutationFn: () =>
      createEvent(user.uid, {
        type: nextType,
        occurredAt: nowUTC(),
        occurredTz: tz(),
        source: 'quick',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });

  const handleClick = () => {
    if (
      last &&
      last.type === nextType &&
      Date.now() - Date.parse(last.occurredAt) < 120000 &&
      !window.confirm('Log duplicate event?')
    )
      return;
    mutation.mutate();
    if (navigator.vibrate) navigator.vibrate(100);
  };

  const canEdit = last && Date.now() - Date.parse(last.createdAt) < 600000;

  return (
    <div className="space-y-4">
      <div>
        <Button className="w-full text-xl py-10" onClick={handleClick} disabled={mutation.isPending}>
          {nextType === 'ENTRY' ? 'Log ENTRY into India' : 'Log EXIT from India'}
        </Button>
      </div>
      {canEdit && last && (
        <div className="space-y-2">
          <div className="text-sm">Edit time</div>
          <DateTimePicker
            value={last.occurredAt}
            onChange={(v) =>
              updateEvent(user.uid, { ...last, occurredAt: new Date(v).toISOString() }).then(() =>
                qc.invalidateQueries({ queryKey: ['events'] })
              )
            }
          />
        </div>
      )}
      <div className="flex space-x-2">
        {sorted.slice(0, 2).map((e) => (
          <span key={e.id} className="px-2 py-1 bg-gray-200 rounded text-xs">
            {e.type} {formatLocal(e.occurredAt)}
          </span>
        ))}
      </div>
      <div className="flex space-x-4 text-sm">
        <Link to="/custom" className="underline">
          Custom entry
        </Link>
        <Link to="/history" className="underline">
          History
        </Link>
        <Link to="/summary" className="underline">
          Summary
        </Link>
      </div>
    </div>
  );
}
