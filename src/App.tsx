
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './hooks/useAuth';
import Home from './pages/Home';
import History from './pages/History';
import CustomEntry from './pages/CustomEntry';
import Summary from './pages/Summary';
import Account from './pages/Account';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import { completeSignIn } from './lib/auth';
import { useSync } from './hooks/useSync';
import InstallPWA from './components/InstallPWA';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the redirect from the email link sign-in
    if (window.location.href.includes('apiKey') && window.location.href.includes('oobCode')) {
      completeSignIn(window.location.href)
        .then(() => {
          // The onAuthStateChanged listener in useAuth will handle the user state change.
          // We can navigate to home after successful sign in.
          navigate('/', { replace: true });
        })
        .catch(error => {
          console.error('Sign in completion error:', error);
          // Optionally show a toast to the user
          navigate('/auth', { replace: true });
        });
    }
  }, [navigate]);

  // Initialize sync service
  useSync();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <main className="flex-grow p-4 md:p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/account" element={<Account />} />
          <Route path="/custom-entry" element={<CustomEntry />} />
          <Route path="/custom-entry/:id" element={<CustomEntry />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <InstallPWA />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
