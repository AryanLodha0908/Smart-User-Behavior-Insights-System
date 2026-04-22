import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Dashboard from './components/Dashboard/Dashboard';
import AdminPanel from './components/AdminPanel/AdminPanel';
import Navigation from './components/Layout/Navigation';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    // Check API connection on load
    axios.get(`${API_BASE_URL}/health`)
      .then(() => setApiConnected(true))
      .catch(err => console.error('API Connection failed:', err));

    // Load tracker script after React mounts
    const loadTracker = () => {
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const trackerUrl = isProduction 
        ? 'https://smart-user-behavior-insights-system.vercel.app/tracker.js'
        : '/tracker.js';
      
      const script = document.createElement('script');
      script.src = trackerUrl;
      script.async = true;
      script.onerror = () => {
        console.warn('Failed to load tracker from:', trackerUrl);
        // Fallback to same origin
        const fallback = document.createElement('script');
        fallback.src = '/tracker.js';
        fallback.async = true;
        document.body.appendChild(fallback);
      };
      document.body.appendChild(script);
    };

    loadTracker();
  }, []);

  return (
    <Router>
      <div className="App">
        <Navigation apiConnected={apiConnected} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
