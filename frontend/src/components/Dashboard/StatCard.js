import React from 'react';

function StatCard({ label, value, icon, trend = null }) {
  return (
    <div className="card stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {trend && (
        <div style={{
          fontSize: '0.85rem',
          marginTop: '10px',
          color: trend.positive ? '#27ae60' : '#dc3545'
        }}>
          {trend.positive ? '↑' : '↓'} {trend.value}% {trend.period}
        </div>
      )}
    </div>
  );
}

export default StatCard;
