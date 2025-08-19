import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx';
import CustomEntry from './pages/CustomEntry.tsx';
import History from './pages/History.tsx';
import Summary from './pages/Summary.tsx';
import Auth from './pages/Auth.tsx';
import NotFound from './pages/NotFound.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';

function App() {
  const [user] = useAuthState(auth);
  if (!user) return <Auth />;
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/custom" element={<CustomEntry />} />
        <Route path="/history" element={<History />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;