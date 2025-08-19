import { useQuery } from '@tanstack/react-query';
import { getSyncStatus } from '../lib/api';

function SyncBadge() {
  const { data: status = 'synced' } = useQuery({ queryKey: ['syncStatus'], queryFn: getSyncStatus, refetchInterval: 5000 });
  let text = 'All changes synced';
  if (status === 'syncing') text = 'Syncing…';
  if (status === 'error') text = 'Sync error';
  if (status === 'offline') text = 'Offline';
  return <span className="px-2 py-1 bg-gray-200 rounded">{text}</span>;
}

export default SyncBadge;