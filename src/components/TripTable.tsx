import { Trip } from '../lib/summary';
import { formatLocal } from '../lib/time';

function duration(trip: Trip) {
  const end = trip.exit ? trip.exit.occurredAt : new Date().toISOString();
  const ms = Date.parse(end) - Date.parse(trip.entry.occurredAt);
  return (ms / 86400000).toFixed(2);
}

export default function TripTable({ trips }: { trips: Trip[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left">
          <th className="p-2">Entry</th>
          <th className="p-2">Exit</th>
          <th className="p-2">Days</th>
        </tr>
      </thead>
      <tbody>
        {trips.map((t, i) => (
          <tr key={i} className="border-t">
            <td className="p-2">{formatLocal(t.entry.occurredAt)}</td>
            <td className="p-2">{t.exit ? formatLocal(t.exit.occurredAt) : 'Open'}</td>
            <td className="p-2">{duration(t)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
