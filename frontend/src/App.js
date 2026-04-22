import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Dashboard from './components/Dashboard/Dashboard';
import AdminPanel from './components/AdminPanel/AdminPanel';
import Navigation from './components/Layout/Navigation';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

function App() {
  const [apiConnected, setApiConnected] = useState(false);

  const trackPageView = useCallback((trackingId, sessionId, userId) => {
    const payload = {
      trackingId,
      sessionId,
      userId,
      page: window.location.pathname,
      pageTitle: document.title,
      referrer: document.referrer,
      deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
      userAgent: navigator.userAgent
    };

    axios.post(`${API_BASE_URL}/tracking/pageview`, payload)
      .then(() => console.log('📍 Page view tracked'))
      .catch(err => console.warn('Failed to track page view:', err.message));
  }, []);

  const trackUserActivity = useCallback((trackingId, sessionId, userId) => {
    let inactivityTimeout;
    let lastTrackTime = Date.now();

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      
      inactivityTimeout = setTimeout(() => {
        console.log('⏱️ User inactive for 30 minutes');
      }, 30 * 60 * 1000);
    };

    // Track user activity - basic interaction detection
    const trackActivity = () => {
      const now = Date.now();
      if (now - lastTrackTime > 30000) { // Track every 30 seconds of activity
        lastTrackTime = now;
        console.log('👁️ User activity detected');
      }
    };

    // Track mouse movement
    document.addEventListener('mousemove', () => {
      resetInactivityTimer();
      trackActivity();
    });

    // Track clicks
    document.addEventListener('click', () => {
      resetInactivityTimer();
      trackActivity();
    });

    // Track scroll
    document.addEventListener('scroll', () => {
      resetInactivityTimer();
      trackActivity();
    });

    // Track key presses
    document.addEventListener('keypress', () => {
      resetInactivityTimer();
      trackActivity();
    });

    resetInactivityTimer();
  }, []);

  const initializeTracking = useCallback(() => {
    try {
      // Get or create session
      const trackingId = window.BehaviorTracking?.trackingId || 'behavior-insights-dashboard-test-id';
      const sessionId = localStorage.getItem('behavior_session_id') || generateUUID();
      const userId = localStorage.getItem('behavior_user_id') || generateUUID();
      
      localStorage.setItem('behavior_session_id', sessionId);
      localStorage.setItem('behavior_user_id', userId);

      console.log('✅ Behavior Tracker initialized');
      console.log('📍 Tracking ID:', trackingId);
      console.log('📊 Session ID:', sessionId);
      console.log('👤 User ID:', userId);

      // Track page view
      trackPageView(trackingId, sessionId, userId);

      // Track user activity
      trackUserActivity(trackingId, sessionId, userId);
    } catch (err) {
      console.error('Tracking initialization error:', err);
    }
  }, [trackPageView, trackUserActivity]);

  useEffect(() => {
    // Check API connection on load
    axios.get(`${API_BASE_URL}/health`)
      .then(() => setApiConnected(true))
      .catch(err => console.error('API Connection failed:', err));

    // Initialize tracking
    initializeTracking();
  }, [initializeTracking]);

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
