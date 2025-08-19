import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../lib/api';
import { useState } from 'react';
import SummaryCards from '../components/SummaryCards.tsx';
import TripTable from '../components/TripTable.tsx';
import Forecast from '../components/Forecast.tsx';
import { getSummaryData } from '../lib/summary';

function Summary() {
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: getEvents });
  const [thresholds, setThresholds] = useState({ '182': 182, '365': 365 });
  // Use getSummaryData for cached trips etc, but for UI, pass events
  getSummaryData(events); // To cache
  const handleExport = () => {
    // Export all, similar to history
    const csv = ['type,occurredAt,occurredTz,notes,createdAt,updatedAt'];
    events.forEach(e => {
      csv.push(`${e.type},${e.occurredAt},${e.occurredTz},${e.notes || ''},${e.createdAt},${e.updatedAt}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };
  return (
    <div className="p-4">
      <SummaryCards events={events} thresholds={thresholds} />
      <TripTable events={events} />
      <Forecast events={events} />
      <button onClick={handleExport} className="bg-blue-500 text-white px-4 py-2 mt-4">Export CSV</button>
    </div>
  );
}

export default Summary;