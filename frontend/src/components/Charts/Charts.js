import React from 'react';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function Charts({ analyticsData }) {
  const COLORS = ['#667eea', '#764ba2', '#e74c3c', '#27ae60', '#f39c12'];

  return (
    <div className="charts-section">
      {/* Line Chart - Activity Over Time */}
      <div className="chart-container">
        <h3>📈 User Activity Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#667eea"
              dot={false}
              name="Active Users"
            />
            <Line
              type="monotone"
              dataKey="pageViews"
              stroke="#27ae60"
              dot={false}
              name="Page Views"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Area Chart - Engagement Score Trend */}
      <div className="chart-container">
        <h3>⭐ Engagement Score Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="avgEngagementScore"
              fill="#667eea"
              stroke="#667eea"
              name="Avg Engagement"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart - Bounce Rate Trend */}
      <div className="chart-container">
        <h3>📉 Bounce Rate Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="bounceRate"
              stroke="#e74c3c"
              dot={false}
              name="Bounce Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Charts;
