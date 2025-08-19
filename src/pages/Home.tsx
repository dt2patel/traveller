import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import { useVibration } from '@/hooks/useVibration';
import { useAnalytics } from '@/hooks/useAnalytics';
import Button from '@/components/ui/Button';
import { getLocalTimezone, isWithinMinutes, formatEventDate } from '@/lib/time';
import ConfirmDialog from '@/components/ConfirmDialog';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const { events, latestEvent, nextEventType, addEvent, isLoading } = useEvents();
  const vibrate = useVibration();
  const { logEvent } = useAnalytics();
  const [showConfirm, setShowConfirm] = useState(false);

  const isEventRecent = latestEvent && isWithinMinutes(latestEvent.createdAt, new Date().toISOString(), 10);
  const secondLatestEvent = events.length > 1 ? events[1] : null;

  const handleQuickLog = async () => {
    // Dedupe check: if last event is same type and within 2 mins
    if (latestEvent && latestEvent.type === nextEventType && isWithinMinutes(latestEvent.occurredAt, new Date().toISOString(), 2)) {
      setShowConfirm(true);
      return;
    }
    await performLog();
  };

  const performLog = async () => {
    setShowConfirm(false);
    try {
      await addEvent({
        type: nextEventType,
        occurredAt: new Date().toISOString(),
        occurredTz: getLocalTimezone(),
        source: 'quick',
      });
      toast.success(`Logged ${nextEventType} successfully!`);
      vibrate();
      logEvent(`quick_log_${nextEventType.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to log event.');
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-between text-center pt-8 pb-4">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
        {latestEvent ? (
          <p className="text-gray-600">
            Your current status is{' '}
            <span className={`font-semibold ${latestEvent.type === 'ENTRY' ? 'text-green-600' : 'text-red-600'}`}>
              {latestEvent.type === 'ENTRY' ? 'In India' : 'Outside India'}
            </span>
          </p>
        ) : (
          <p className="text-gray-600">Ready to log your travel?</p>
        )}
      </div>

      <div className="my-8 w-full px-4">
        <Button
          onClick={handleQuickLog}
          isLoading={isLoading}
          size="xl"
          className={`w-full h-24 text-2xl transition-all duration-300 ${nextEventType === 'ENTRY' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}`}
        >
          {nextEventType === 'ENTRY' ? 'Log Entry Into India' : 'Log Exit From India'}
        </Button>
      </div>
      
      <div className="w-full space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Last Event</h2>
          {isLoading && <p>Loading...</p>}
          {!isLoading && latestEvent ? (
            <div className="bg-gray-100 p-3 rounded-lg w-full max-w-sm mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <p className={`font-medium ${latestEvent.type === 'ENTRY' ? 'text-green-800' : 'text-red-800'}`}>
                  {latestEvent.type}: {formatEventDate(latestEvent.occurredAt)}
                </p>
                {isEventRecent && (
                  <Link to={`/custom-entry/${latestEvent.id}`} className="px-2 py-1 text-xs bg-brand-primary text-white rounded-md hover:bg-indigo-700">
                    Edit
                  </Link>
                )}
              </div>
              {secondLatestEvent && (
                <p className="text-xs text-gray-500 mt-1">
                  Previous: {secondLatestEvent.type} on {formatEventDate(secondLatestEvent.occurredAt).split(',')[0]}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No events logged yet.</p>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          <Link to="/summary" className="text-brand-primary font-semibold hover:underline">View Summary</Link>
          <Link to="/history" className="text-brand-primary font-semibold hover:underline">View History</Link>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={performLog}
        title={`Confirm ${nextEventType}`}
        confirmText={`Yes, log ${nextEventType}`}
      >
        You just logged an {nextEventType} event less than 2 minutes ago. Are you sure you want to log another one?
      </ConfirmDialog>
    </div>
  );
};

export default Home;
