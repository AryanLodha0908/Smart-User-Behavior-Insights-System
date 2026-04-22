import React from 'react';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function Charts({ analyticsData }) {
  const COLORS = ['#667eea', '#764ba2', '#e74c3c', '#27ae60', '#f39c12'];

  // Calculate engagement vs bounce for pie chart
  const engagementPie = [
    {
      name: 'Engaged Users',
      value: analyticsData.filter(d => d.engagementScore > 6).length
    },
    {
      name: 'Medium Engagement',
      value: analyticsData.filter(d => d.engagementScore > 3 && d.engagementScore <= 6).length
    },
    {
      name: 'Low Engagement',
      value: analyticsData.filter(d => d.engagementScore <= 3).length
    }
  ];

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

      {/* Pie Chart - Engagement Distribution */}
      <div className="chart-container">
        <h3>🎯 Engagement Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={engagementPie}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {engagementPie.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
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
