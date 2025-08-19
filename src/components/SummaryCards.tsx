
import React, { useState } from 'react';
import { SummaryData } from '@/types';

interface SummaryCardsProps {
  summary: SummaryData;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const [threshold182, setThreshold182] = useState(182);
  const [threshold365, setThreshold365] = useState(365);

  const renderDays = (days: number, threshold: number) => {
    const isOver = days >= threshold;
    const wholeDays = Math.floor(days);
    return (
      <div className="flex items-baseline space-x-2">
        <span className={`text-2xl font-bold ${isOver ? 'text-brand-danger' : 'text-gray-900'}`}>{days.toFixed(2)}</span>
        <span className="text-sm text-gray-500">days</span>
        {isOver && <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">Warning</span>}
      </div>
    )
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Status Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm col-span-1 md:col-span-2">
        <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
        <p className={`text-2xl font-bold ${summary.status === 'In India' ? 'text-green-600' : 'text-gray-900'}`}>{summary.status}</p>
        {summary.status === 'In India' && summary.currentStayDuration && (
          <p className="text-sm text-gray-500">Ongoing stay: {summary.currentStayDuration}</p>
        )}
      </div>

      {/* Rolling Counters */}
      <Card title="Last 182 Days">{renderDays(summary.rolling182Days, threshold182)}</Card>
      <Card title="Last 365 Days">{renderDays(summary.rolling365Days, threshold365)}</Card>
      
      {/* Financial Year Counters */}
      <Card title="Current FY">{renderDays(summary.currentFyDays, 182)}</Card>
      <Card title="Previous FY">{renderDays(summary.previousFyDays, 182)}</Card>
    </div>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-1">{children}</div>
    </div>
);

export default SummaryCards;
