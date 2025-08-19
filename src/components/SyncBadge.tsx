import { useEffect, useState } from 'react';
import { flushQueue } from '../lib/api';
import { auth } from '../lib/firebase';

export default function SyncBadge() {
  const [status, setStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  useEffect(() => {
    async function sync() {
      if (!auth.currentUser) return;
      if (!navigator.onLine) {
        setStatus('offline');
        return;
      }
      setStatus('syncing');
      await flushQueue(auth.currentUser.uid);
      setStatus('synced');
    }
    sync();
    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
  }, []);

  return (
    <span className="text-xs" aria-label="sync-status">
      {status === 'offline' ? 'Offline' : status === 'syncing' ? 'Syncing…' : 'Synced'}
    </span>
  );
}
