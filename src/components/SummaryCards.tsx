import { getStatus, getRollingWindowDays, getCurrentFYYear, getFYWindow, calculateDaysInWindow, buildTrips } from '../lib/summary';

function SummaryCards({ events, thresholds }: { events: Event[]; thresholds: { '182': number; '365': number } }) {
  const status = getStatus(events);
  const days182 = getRollingWindowDays(events, 182);
  const days365 = getRollingWindowDays(events, 365);
  const currentFY = getCurrentFYYear();
  const fyCurrent = getFYWindow(currentFY);
  const daysFYCurrent = calculateDaysInWindow(buildTrips(events), fyCurrent.start, fyCurrent.end);
  const fyPrev = getFYWindow(currentFY - 1);
  const daysFYPrev = calculateDaysInWindow(buildTrips(events), fyPrev.start, fyPrev.end);
  const stayLength = status.stayLengthMs ? (status.stayLengthMs / (1000 * 60 * 60 * 24)).toFixed(2) + ' days' : '';
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-white rounded shadow">
        <h3>Status</h3>
        <p>{status.inIndia ? 'In India' : 'Outside India'}</p>
        {status.inIndia && <p>Ongoing stay: {stayLength}</p>}
      </div>
      <div className="p-4 bg-white rounded shadow">
        <h3>Rolling Counters</h3>
        <p>Last 182 days: {days182.toFixed(2)} {days182 >= thresholds[182] && <span className="text-red-500">Warning</span>}</p>
        <p>Last 365 days: {days365.toFixed(2)} {days365 >= thresholds[365] && <span className="text-red-500">Warning</span>}</p>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <h3>Financial Years</h3>
        <p>Current FY: {daysFYCurrent.toFixed(2)}</p>
        <p>Previous FY: {daysFYPrev.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default SummaryCards;