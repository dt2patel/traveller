
import React, { useState, useMemo } from 'react';
import { TravelEvent } from '@/types';
import { runForecast } from '@/lib/summary';
import { endOfYear, format, getYear } from 'date-fns';
import Input from './ui/Input';

interface ForecastProps {
  events: TravelEvent[];
}

const getCurrentFyEnd = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = getYear(now);
    // FY is April 1 to March 31. If we are in Jan-Mar, FY ends this year. Otherwise, next year.
    const fyEndYear = currentMonth < 3 ? currentYear : currentYear + 1;
    return endOfYear(new Date(fyEndYear, 2, 31)); // End of March 31
};

const Forecast: React.FC<ForecastProps> = ({ events }) => {
  const [targetDate, setTargetDate] = useState(format(getCurrentFyEnd(), 'yyyy-MM-dd'));
  const [threshold, setThreshold] = useState(182);

  const availableDays = useMemo(() => {
    if (!targetDate) return 0;
    const targetDateISO = new Date(targetDate).toISOString();
    return runForecast(events, targetDateISO, threshold);
  }, [events, targetDate, threshold]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Stay Forecast</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Target Date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />
        <Input
          label="Target Threshold (days)"
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
        />
      </div>
      <div className="bg-indigo-50 p-4 rounded-lg text-center">
        <p className="text-gray-700">
          You can stay for another <br/>
          <span className="text-3xl font-bold text-brand-primary mx-2">{availableDays}</span>
          day(s) in India before hitting <span className="font-semibold">{threshold} days</span> by <span className="font-semibold">{format(new Date(targetDate), 'MMM d, yyyy')}</span>.
        </p>
      </div>
    </div>
  );
};

export default Forecast;
