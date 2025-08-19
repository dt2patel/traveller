
import React from 'react';
import { NavLink } from 'react-router-dom';

const Footer: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center text-xs p-2 rounded-lg transition-colors ${
      isActive ? 'text-brand-primary bg-indigo-100' : 'text-gray-500 hover:text-brand-primary'
    }`;

  const iconBaseClass = "w-6 h-6 mb-1";
  
  return (
    <footer className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
      <nav className="container mx-auto px-4 h-16 grid grid-cols-4 gap-2">
        <NavLink to="/" end className={navLinkClass}>
          <HomeIcon className={iconBaseClass} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/history" className={navLinkClass}>
            <HistoryIcon className={iconBaseClass} />
          <span>History</span>
        </NavLink>
        <NavLink to="/summary" className={navLinkClass}>
            <SummaryIcon className={iconBaseClass} />
          <span>Summary</span>
        </NavLink>
        <NavLink to="/custom-entry" className={navLinkClass}>
            <PlusCircleIcon className={iconBaseClass} />
          <span>Custom</span>
        </NavLink>
      </nav>
    </footer>
  );
};

// SVG Icons
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M2.25 12V21a.75.75 0 00.75.75H21a.75.75 0 00.75-.75V12M12 21V12" />
  </svg>
);

const HistoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const SummaryIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
);

const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Footer;
