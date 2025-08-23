
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEvents } from '@/hooks/useEvents';
import { calculateSummary, hashEvents } from '@/lib/summary';
import { getSummaryCache, setSummaryCache } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import SummaryCards from '@/components/SummaryCards';
import TripTable from '@/components/TripTable';
import Forecast from '@/components/Forecast';
import EmptyState from '@/components/EmptyState';
import { SummaryData } from '@/types';
import Button from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { generateCSV } from '@/lib/utils';

const Summary: React.FC = () => {
  const { user } = useAuth();
  const { events, isLoading: isLoadingEvents } = useEvents();

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['summary', user?.uid, hashEvents(events)],
    queryFn: async (): Promise<SummaryData | null> => {
      if (!events || events.length === 0) return null;
      
      const eventsHash = hashEvents(events);
      const cachedSummary = await getSummaryCache();

      if (cachedSummary && cachedSummary.dataHash === eventsHash) {
        return cachedSummary;
      }

      const calculatedSummary = calculateSummary(events);
      const summaryWithHash = { ...calculatedSummary, dataHash: eventsHash };
      
      await setSummaryCache(summaryWithHash);
      return summaryWithHash;
    },
    enabled: !!user && !isLoadingEvents && events.length > 0,
  });

  const isLoading = isLoadingEvents || isLoadingSummary;

  const handleExport = () => {
    generateCSV(events, {});
  }

  if (isLoading) {
    return <div className="text-center p-8">Calculating summary...</div>;
  }

  if (!summary) {
    return (
        <EmptyState
            title="No summary to display"
            message="You need at least one travel event to see a summary."
            action={<Link to="/"><Button>Log First Event</Button></Link>}
        />
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Summary</h1>
        <Button onClick={handleExport} size="sm" variant="secondary">Export All Data</Button>
      </div>

      <SummaryCards summary={summary} />
      <TripTable trips={summary.trips} />
      <Forecast events={events} />
    </div>
  );
};

export default Summary;