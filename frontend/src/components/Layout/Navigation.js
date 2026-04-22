import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../ThemeContext';

function Navigation({ apiConnected }) {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <nav>
      <h1>📊 Smart Behavior Insights</h1>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/admin">Admin Panel</Link>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        <span className={`status-indicator ${apiConnected ? 'status-connected' : 'status-disconnected'}`}>
          <span className="status-dot" style={{backgroundColor: apiConnected ? '#27ae60' : '#dc3545'}}></span>
          {apiConnected ? 'Connected' : 'Offline'}
        </span>
      </div>
    </nav>
  );
}

export default Navigation;
