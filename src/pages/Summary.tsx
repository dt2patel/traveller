import { useQuery } from '@tanstack/react-query';
import { listEvents } from '../lib/api';
import { auth } from '../lib/firebase';
import SummaryCards from '../components/SummaryCards';
import TripTable from '../components/TripTable';
import Forecast from '../components/Forecast';
import { pairTrips } from '../lib/summary';
import Button from '../components/Button';
import type { Event } from '../types';

export default function Summary() {
  const user = auth.currentUser!;
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => listEvents(user.uid),
  });
  const trips = pairTrips(events);
  const handleExport = () => {
    const header = 'type,occurredAt,occurredTz,notes,createdAt,updatedAt\n';
    const rows = events
      .map((e) => `${e.type},${e.occurredAt},${e.occurredTz},"${e.notes || ''}",${e.createdAt},${e.updatedAt}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-4">
      <div className="text-right">
        <Button onClick={handleExport}>Export CSV</Button>
      </div>
      <SummaryCards events={events} />
      <TripTable trips={trips} />
      <Forecast events={events} />
    </div>
  );
}
