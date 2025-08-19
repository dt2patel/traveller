import { Link } from 'react-router-dom';
import { signOutUser } from '../lib/auth';
import SyncBadge from './SyncBadge.tsx';

function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
      <Link to="/">Travel Log</Link>
      <nav className="space-x-4">
        <Link to="/summary">Summary</Link>
        <Link to="/history">History</Link>
        <Link to="/custom">Custom</Link>
      </nav>
      <SyncBadge />
      <button onClick={signOutUser}>Sign Out</button>
    </header>
  );
}

export default Header;