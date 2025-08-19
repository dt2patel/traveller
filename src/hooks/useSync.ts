
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { flushQueue } from '@/lib/api';

type SyncStatus = 'online' | 'offline' | 'syncing';

export const useSync = () => {
  const [status, setStatus] = useState<SyncStatus>(navigator.onLine ? 'online' : 'offline');
  const queryClient = useQueryClient();

  const handleSync = useCallback(async () => {
    if (!navigator.onLine) {
        setStatus('offline');
        return;
    }
    setStatus('syncing');
    const success = await flushQueue();
    if (success) {
      // Invalidate queries to refetch fresh data from server
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
    setStatus('online');
  }, [queryClient]);

  useEffect(() => {
    // Initial sync check
    handleSync();

    const goOnline = () => handleSync();
    const goOffline = () => setStatus('offline');

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Also try to sync periodically when online
    const interval = setInterval(() => {
        if(navigator.onLine) {
            handleSync();
        }
    }, 1000 * 60 * 5); // every 5 minutes

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      clearInterval(interval);
    };
  }, [handleSync]);

  return { status, forceSync: handleSync };
};
