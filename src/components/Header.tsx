import { Link } from 'react-router-dom';
import { signOut } from '../lib/auth';
import SyncBadge from './SyncBadge';

export default function Header() {
  return (
    <header className="p-4 flex justify-between items-center bg-white shadow">
      <nav className="space-x-4">
        <Link to="/" className="font-semibold">Home</Link>
        <Link to="/history">History</Link>
        <Link to="/summary">Summary</Link>
      </nav>
      <div className="flex items-center space-x-2">
        <SyncBadge />
        <button onClick={() => signOut()} className="text-sm text-gray-600">
          Sign out
        </button>
      </div>
    </header>
  );
}
