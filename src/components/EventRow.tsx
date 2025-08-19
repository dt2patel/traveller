
import React from 'react';
import { Link } from 'react-router-dom';
import { TravelEvent } from '@/types';
import { formatEventDateWithTz, formatRelativeTime } from '@/lib/time';

interface EventRowProps {
  event: TravelEvent;
  onDelete: (id: string) => void;
}

const EventRow: React.FC<EventRowProps> = ({ event, onDelete }) => {
  const isEntry = event.type === 'ENTRY';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isEntry ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isEntry ? <EntryIcon /> : <ExitIcon />}
        </div>
        <div>
          <p className={`text-lg font-semibold ${isEntry ? 'text-green-800' : 'text-red-800'}`}>
            {event.type}
          </p>
          <p className="text-sm text-gray-600">{formatEventDateWithTz(event.occurredAt, event.occurredTz)}</p>
          <p className="text-xs text-gray-400">{formatRelativeTime(event.occurredAt)}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Link to={`/custom-entry/${event.id}`} className="p-2 text-gray-500 hover:text-brand-primary rounded-full hover:bg-gray-100">
            <EditIcon />
        </Link>
        <button onClick={() => onDelete(event.id)} className="p-2 text-gray-500 hover:text-brand-danger rounded-full hover:bg-gray-100">
            <DeleteIcon />
        </button>
      </div>
    </div>
  );
};

const iconClass = "w-6 h-6";

const EntryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3h12" />
    </svg>
);
const ExitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0-3-3m0 0 3-3m-3 3H3" />
    </svg>
);
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

export default EventRow;
