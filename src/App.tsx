import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import CustomEntry from './pages/CustomEntry';
import History from './pages/History';
import Summary from './pages/Summary';
import AuthPage from './pages/Auth';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import { completeSignIn } from './lib/auth';
import { useEffect } from 'react';

export default function App() {
  const [user, loading] = useAuthState(auth);
  useEffect(() => {
    completeSignIn();
  }, []);
  if (loading) return null;
  if (!user) return <AuthPage />;
  return (
    <div className="flex flex-col min-h-full">
      <Header />
      <main className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/custom" element={<CustomEntry />} />
          <Route path="/history" element={<History />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
