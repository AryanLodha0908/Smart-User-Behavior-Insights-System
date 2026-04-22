import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../ThemeContext';

function RealtimeMetrics({ stats }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, [stats]);

  return (
    <div className="realtime-metrics">
      <h3>🔴 Real-Time Metrics</h3>
      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-label">Live Visitors</div>
          <div className="metric-value">{stats.activeSessions}</div>
        </div>
        <div className="metric-item">
          <div className="metric-label">Bounce Rate</div>
          <div className="metric-value">{stats.bounceRate.toFixed(1)}%</div>
        </div>
        <div className="metric-item">
          <div className="metric-label">Avg Engagement</div>
          <div className="metric-value">{stats.engagementScore.toFixed(2)}/10</div>
        </div>
        <div className="metric-item">
          <div className="metric-label">Page Views Today</div>
          <div className="metric-value">{stats.totalPageViews.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

export default RealtimeMetrics;
