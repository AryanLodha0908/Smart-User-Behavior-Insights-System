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
