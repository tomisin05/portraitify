import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Create from './pages/Create';
import Navigation from './components/NavBar';
import Gallery from './pages/Gallery';
import { AuthProvider } from './contexts/AuthContext';
import TutorialButton from './components/TutorialButton';
import './App.css';
import './tutorial.css';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
          {/* Tutorial Button */}
          <TutorialButton />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
