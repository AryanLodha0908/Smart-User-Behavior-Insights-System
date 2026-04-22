import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function PagePerformance({ filters }) {
  const [pageData, setPageData] = useState([]);

  useEffect(() => {
    fetchPagePerformance();
  }, [filters]);

  const fetchPagePerformance = async () => {
    try {
      const response = await axios.get('/api/analytics/pages', { params: filters });
      setPageData(response.data);
    } catch (error) {
      console.error('Error fetching page performance:', error);
    }
  };

  return (
    <div className="card">
      <h3>Page Performance Analysis</h3>
      <div style={{ width: '100%', height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="page" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgEngagementScore" fill="#667eea" name="Avg Engagement" />
            <Bar dataKey="avgScrollDepth" fill="#27ae60" name="Avg Scroll %" />
            <Bar dataKey="avgTimeOnPage" fill="#e74c3c" name="Avg Time (s)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PagePerformance;
