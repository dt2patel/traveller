import { useMemo, useState } from 'react';
import type { Event } from '../types';
import { pairTrips, forecast as forecastDays } from '../lib/summary';

export default function Forecast({ events }: { events: Event[] }) {
  const trips = useMemo(() => pairTrips(events), [events]);
  const fyEnd = new Date();
  fyEnd.setUTCMonth(2, 31); // Mar 31
  const defaultTarget = fyEnd.toISOString().slice(0, 10);
  const [target, setTarget] = useState(defaultTarget);
  const [threshold, setThreshold] = useState(182);
  const days = forecastDays(trips, target + 'T23:59:59.999Z', threshold);
  return (
    <div className="p-4 bg-white rounded shadow space-y-2">
      <div className="font-semibold">Forecast</div>
      <div className="flex space-x-2 items-center">
        <label className="text-sm">Target date</label>
        <input type="date" value={target} onChange={(e) => setTarget(e.target.value)} className="border p-1" />
      </div>
      <div className="flex space-x-2 items-center">
        <label className="text-sm">Threshold</label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(parseInt(e.target.value))}
          className="border p-1 w-20"
        />
      </div>
      <div className="text-sm">
        You can stay <strong>{days.toFixed(2)}</strong> more day(s) in India before hitting {threshold} by {target}.
      </div>
    </div>
  );
}
