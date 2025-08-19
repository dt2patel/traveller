
import React from 'react';
import { useSync } from '@/hooks/useSync';

const SyncBadge: React.FC = () => {
  const { status } = useSync();

  const getBadgeContent = () => {
    switch (status) {
      case 'online':
        return {
          icon: <CloudCheckIcon />,
          text: 'Synced',
          color: 'text-green-600',
        };
      case 'syncing':
        return {
          icon: <SyncingIcon />,
          text: 'Syncing...',
          color: 'text-blue-600',
        };
      case 'offline':
        return {
          icon: <OfflineIcon />,
          text: 'Offline',
          color: 'text-gray-500',
        };
      default:
        return { icon: null, text: '', color: '' };
    }
  };

  const { icon, text, color } = getBadgeContent();

  return (
    <div className={`flex items-center space-x-1 text-sm ${color}`}>
      {icon}
      <span className="hidden sm:inline">{text}</span>
    </div>
  );
};

// SVG Icons
const iconClass = "w-5 h-5";
const CloudCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3 3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);
const SyncingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${iconClass} animate-spin`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.696a8.25 8.25 0 00-11.667 0A8.25 8.25 0 009.645 2.985c2.25 0 4.33.92 5.855 2.408M21.015 14.652A8.25 8.25 0 0011.355 2.985" />
    </svg>
);
const OfflineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);


export default SyncBadge;
