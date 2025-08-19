
import React from 'react';
import { Trip } from '@/types';
import { formatEventDate } from '@/lib/time';

interface TripTableProps {
  trips: Trip[];
}

const TripTable: React.FC<TripTableProps> = ({ trips }) => {
    const sortedTrips = [...trips].sort((a,b) => b.entry.occurredAt.localeCompare(a.entry.occurredAt));

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Trip Breakdown</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">Entry</th>
              <th scope="col" className="px-4 py-3">Exit</th>
              <th scope="col" className="px-4 py-3">Duration</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrips.map((trip, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{formatEventDate(trip.entry.occurredAt)}</td>
                <td className="px-4 py-2">
                  {trip.exit ? formatEventDate(trip.exit.occurredAt) : <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Open</span>}
                </td>
                <td className="px-4 py-2">
                    {formatDuration(trip.durationMs)}
                    {trip.warnings.length > 0 && 
                        <span title={trip.warnings.join(' ')} className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">!</span>
                    }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const formatDuration = (ms: number): string => {
    if(ms <= 0) return "-";
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
}

export default TripTable;
