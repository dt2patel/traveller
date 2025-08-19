import { buildTrips, getDataIssues } from '../lib/summary';
import { formatLocal, isoToLocalDate } from '../lib/time';

function TripTable({ events }: { events: Event[] }) {
  const trips = buildTrips(events);
  const issues = getDataIssues(events);
  return (
    <div className="p-4">
      {issues.length > 0 && (
        <div className="mb-4">
          <h3>Data Issues</h3>
          {issues.map((i, idx) => <p key={idx} className="text-red-500">{i}</p>)}
        </div>
      )}
      <h3>Trip Breakdown</h3>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Entry</th>
            <th>Exit</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((t, i) => (
            <tr key={i}>
              <td>{formatLocal(isoToLocalDate(t.start, 'Asia/Kolkata'), 'yyyy-MM-dd HH:mm')}</td>
              <td>{t.end ? formatLocal(isoToLocalDate(t.end, 'Asia/Kolkata'), 'yyyy-MM-dd HH:mm') : 'Open'}</td>
              <td>{(t.durationMs / (1000 * 60 * 60 * 24)).toFixed(2)} days</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TripTable;