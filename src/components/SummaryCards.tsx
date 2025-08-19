import { useMemo } from 'react';
import type { Event } from '../types';
import { pairTrips, rollingDays, fyDays, Trip } from '../lib/summary';

function msToDH(ms: number) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return `${d}d ${h}h`;
}

export default function SummaryCards({ events }: { events: Event[] }) {
  const trips = useMemo<Trip[]>(() => pairTrips(events), [events]);
  const last = trips[trips.length - 1];
  const inIndia = last && !last.exit;
  const status = inIndia ? 'In India' : 'Outside India';
  const stayLength = inIndia ? msToDH(Date.now() - Date.parse(last.entry.occurredAt)) : '';
  const days182 = rollingDays(trips, 182);
  const days365 = rollingDays(trips, 365);
  const year = new Date().getUTCFullYear();
  const fyCurrent = fyDays(trips, new Date().getUTCMonth() + 1 >= 4 ? year : year - 1);
  const fyPrev = fyDays(trips, new Date().getUTCMonth() + 1 >= 4 ? year - 1 : year - 2);

  return (
    <div className="grid gap-4">
      <div className="p-4 bg-white rounded shadow">
        <div className="font-semibold">Status</div>
        <div>{status}</div>
        {inIndia && <div className="text-sm text-gray-500">{stayLength}</div>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="font-semibold">Last 182 days</div>
          <div>{days182.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="font-semibold">Last 365 days</div>
          <div>{days365.toFixed(2)}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="font-semibold">Current FY</div>
          <div>{fyCurrent.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="font-semibold">Previous FY</div>
          <div>{fyPrev.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
