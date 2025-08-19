import { useState } from 'react';
import { forecastMaxStay, getCurrentFYYear, getFYWindow } from '../lib/summary';
import { format, parseISO } from 'date-fns';

function Forecast({ events }: { events: Event[] }) {
  const currentFYEnd = getFYWindow(getCurrentFYYear()).end;
  const [targetDate, setTargetDate] = useState(format(currentFYEnd, 'yyyy-MM-dd'));
  const [threshold, setThreshold] = useState(182);
  const maxStay = forecastMaxStay(events, parseISO(targetDate), threshold);
  return (
    <div className="p-4">
      <h3>Forecast</h3>
      <label>Target Date: <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} /></label>
      <label>Threshold: <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} /></label>
      <p>You can stay <strong>{maxStay.toFixed(0)}</strong> more day(s) in India before hitting {threshold} by {targetDate}.</p>
    </div>
  );
}

export default Forecast;