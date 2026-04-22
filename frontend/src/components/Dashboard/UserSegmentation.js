import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

function UserSegmentation() {
  const [segmentData, setSegmentData] = useState([]);

  useEffect(() => {
    fetchSegmentData();
  }, []);

  const fetchSegmentData = async () => {
    try {
      const response = await axios.get('/api/analytics/segmentation');
      setSegmentData(response.data);
    } catch (error) {
      console.error('Error fetching segmentation:', error);
    }
  };

  const COLORS = ['#27ae60', '#f39c12', '#e74c3c'];

  return (
    <div className="card">
      <h3>User Segmentation</h3>
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segmentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {segmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UserSegmentation;
