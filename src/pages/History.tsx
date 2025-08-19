import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listEvents, deleteEvent } from '../lib/api';
import { auth } from '../lib/firebase';
import EventRow from '../components/EventRow';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import type { Event } from '../types';

export default function History() {
  const user = auth.currentUser!;
  const qc = useQueryClient();
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => listEvents(user.uid),
  });

  const handleExport = () => {
    const header = 'type,occurredAt,occurredTz,notes,createdAt,updatedAt\n';
    const rows = events
      .map((e) => `${e.type},${e.occurredAt},${e.occurredTz},"${e.notes || ''}",${e.createdAt},${e.updatedAt}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!events.length) return <EmptyState message="No events" />;
  return (
    <div className="space-y-4">
      <div className="text-right">
        <Button onClick={handleExport}>Export CSV</Button>
      </div>
      <div>
        {events.map((e) => (
          <EventRow
            key={e.id}
            event={e}
            onDelete={async () => {
              await deleteEvent(user.uid, e.id);
              qc.invalidateQueries({ queryKey: ['events'] });
            }}
          />
        ))}
      </div>
    </div>
  );
}
