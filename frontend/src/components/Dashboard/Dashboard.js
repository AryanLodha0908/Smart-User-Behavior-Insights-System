import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from './StatCard';
import Charts from '../Charts/Charts';
import Filters from '../Filters/Filters';
import UserSegmentation from './UserSegmentation';
import PagePerformance from './PagePerformance';
import RealtimeMetrics from './RealtimeMetrics';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeSessions: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    engagementScore: 0,
    totalPageViews: 0
  });

  const [previousData, setPreviousData] = useState({
    totalUsers: 0,
    activeSessions: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    engagementScore: 0,
    totalPageViews: 0
  });

  const [analyticsData, setAnalyticsData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    website: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'startTime', direction: 'desc' });

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        website: filters.website
      };

      // Fetch current period stats
      const statsRes = await axios.get('/api/analytics/stats', { params });
      setDashboardData(statsRes.data);

      // Calculate previous period (same number of days)
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
      const prevStartDate = new Date(prevEndDate);
      prevStartDate.setDate(prevStartDate.getDate() - daysDiff);

      const prevParams = {
        startDate: prevStartDate.toISOString().split('T')[0],
        endDate: prevEndDate.toISOString().split('T')[0],
        website: filters.website
      };

      // Fetch previous period stats for trends
      const prevStatsRes = await axios.get('/api/analytics/stats', { params: prevParams });
      setPreviousData(prevStatsRes.data);

      // Fetch detailed analytics for charts
      const analyticsRes = await axios.get('/api/analytics/timeline', { params });
      setAnalyticsData(analyticsRes.data);

      // Fetch recent sessions
      const sessionsRes = await axios.get('/api/sessions/recent', { params });
      setSessions(sessionsRes.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  // Calculate trend value
  const calculateTrend = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`/api/analytics/export/${format}`, {
        params: filters,
        responseType: format === 'pdf' ? 'blob' : 'json'
      });

      if (format === 'pdf' || format === 'csv') {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analytics-report.${format}`);
        document.body.appendChild(link);
        link.click();
        link.parentElement.removeChild(link);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortedSessions = () => {
    const sorted = [...sessions];
    sorted.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.direction === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
    return sorted;
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      {/* Filters Section */}
      <Filters filters={filters} setFilters={setFilters} onExport={handleExport} />

      {/* Real-time Metrics */}
      <RealtimeMetrics stats={dashboardData} />

      {/* Key Statistics Cards */}
      <div className="dashboard-grid">
        <StatCard
          label="Total Users"
          value={dashboardData.totalUsers.toLocaleString()}
          icon="👥"
          trend={{ value: calculateTrend(dashboardData.totalUsers, previousData.totalUsers), positive: true, period: 'vs previous period' }}
        />
        <StatCard
          label="Active Sessions"
          value={dashboardData.activeSessions.toLocaleString()}
          icon="🔗"
          trend={{ value: calculateTrend(dashboardData.activeSessions, previousData.activeSessions), positive: true, period: 'vs previous period' }}
        />
        <StatCard
          label="Avg Session Duration"
          value={`${Math.round(dashboardData.avgSessionDuration)}s`}
          icon="⏱️"
          trend={{ value: calculateTrend(dashboardData.avgSessionDuration, previousData.avgSessionDuration), positive: true, period: 'vs previous period' }}
        />
        <StatCard
          label="Bounce Rate"
          value={`${dashboardData.bounceRate.toFixed(1)}%`}
          icon="📉"
          trend={{ value: -calculateTrend(dashboardData.bounceRate, previousData.bounceRate), positive: false, period: 'vs previous period' }}
        />
        <StatCard
          label="Avg Engagement Score"
          value={dashboardData.engagementScore.toFixed(2)}
          icon="⭐"
          trend={{ value: calculateTrend(dashboardData.engagementScore, previousData.engagementScore), positive: true, period: 'vs previous period' }}
        />
        <StatCard
          label="Total Page Views"
          value={dashboardData.totalPageViews.toLocaleString()}
          icon="📄"
          trend={{ value: calculateTrend(dashboardData.totalPageViews, previousData.totalPageViews), positive: true, period: 'vs previous period' }}
        />
        />
      </div>

      {/* Charts Section */}
      <Charts analyticsData={analyticsData} />

      {/* User Segmentation */}
      <UserSegmentation />

      {/* Page Performance */}
      <PagePerformance filters={filters} />

      {/* Recent Sessions Table */}
      <div className="card">
        <h3>📊 Recent Sessions</h3>
        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No sessions found for the selected date range</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('sessionId')} style={{ cursor: 'pointer' }}>
                    Session ID {sortConfig.key === 'sessionId' ? (sortConfig.direction === 'desc' ? '↓' : '↑') : ''}
                  </th>
                  <th onClick={() => handleSort('userId')} style={{ cursor: 'pointer' }}>
                    User ID {sortConfig.key === 'userId' ? (sortConfig.direction === 'desc' ? '↓' : '↑') : ''}
                  </th>
                  <th onClick={() => handleSort('duration')} style={{ cursor: 'pointer' }}>
                    Duration (s) {sortConfig.key === 'duration' ? (sortConfig.direction === 'desc' ? '↓' : '↑') : ''}
                  </th>
                  <th>Pages Visited</th>
                  <th>Engagement</th>
                  <th>Bounce Risk</th>
                  <th onClick={() => handleSort('startTime')} style={{ cursor: 'pointer' }}>
                    Timestamp {sortConfig.key === 'startTime' ? (sortConfig.direction === 'desc' ? '↓' : '↑') : ''}
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedSessions().slice(0, 10).map((session) => (
                  <tr key={session._id}>
                    <td><code>{session.sessionId.substring(0, 8)}</code></td>
                    <td><code>{session.userId.substring(0, 8)}</code></td>
                    <td>{Math.round(session.duration)}</td>
                    <td>{session.pages.length}</td>
                    <td>{session.engagementScore.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        session.bounceProb > 0.6 ? 'badge-high' :
                        session.bounceProb > 0.3 ? 'badge-medium' :
                        'badge-low'
                      }`}>
                        {(session.bounceProb * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td>{new Date(session.startTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
