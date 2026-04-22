import React, { useState, useEffect } from 'react';
import apiClient from '../../api';

function AdminPanel() {
  const [websites, setWebsites] = useState([]);
  const [newWebsite, setNewWebsite] = useState({
    domain: '',
    name: ''
  });
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalEvents: 0,
    modelAccuracy: 0
  });

  useEffect(() => {
    fetchWebsites();
    fetchStats();
  }, []);

  const fetchWebsites = async () => {
    try {
      const response = await apiClient.get('/admin/websites');
      setWebsites(response.data);
    } catch (error) {
      console.error('Error fetching websites:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    if (!newWebsite.domain || !newWebsite.name) return;

    try {
      await apiClient.post('/admin/websites', newWebsite);
      setNewWebsite({ domain: '', name: '' });
      fetchWebsites();
    } catch (error) {
      console.error('Error adding website:', error);
    }
  };

  const handleDeleteWebsite = async (id) => {
    if (window.confirm('Delete this website?')) {
      try {
        await apiClient.delete(`/admin/websites/${id}`);
        fetchWebsites();
      } catch (error) {
        console.error('Error deleting website:', error);
      }
    }
  };

  const handleRetrain = async () => {
    try {
      const response = await apiClient.post('/admin/retrain-model');
      alert(`Model retrained! New accuracy: ${(response.data.accuracy * 100).toFixed(2)}%`);
      fetchStats();
    } catch (error) {
      console.error('Error retraining model:', error);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🔧 Admin Panel</h2>

      {/* System Stats */}
      <div className="dashboard-grid" style={{ marginBottom: '30px' }}>
        <div className="card stat-card">
          <div style={{ fontSize: '2.5rem' }}>📊</div>
          <div className="stat-value">{stats.totalSessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="card stat-card">
          <div style={{ fontSize: '2.5rem' }}>⚡</div>
          <div className="stat-value">{stats.totalEvents}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="card stat-card">
          <div style={{ fontSize: '2.5rem' }}>🤖</div>
          <div className="stat-value">{(stats.modelAccuracy * 100).toFixed(2)}%</div>
          <div className="stat-label">Model Accuracy</div>
        </div>
      </div>

      {/* Add Website Form */}
      <div className="card">
        <h3>➕ Add New Website</h3>
        <form onSubmit={handleAddWebsite} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input
            type="text"
            placeholder="Website Domain (e.g., example.com)"
            value={newWebsite.domain}
            onChange={(e) => setNewWebsite({ ...newWebsite, domain: e.target.value })}
            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="text"
            placeholder="Website Name"
            value={newWebsite.name}
            onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button type="submit" className="btn btn-primary">Add Website</button>
        </form>
      </div>

      {/* Websites List */}
      <div className="card">
        <h3>🌐 Tracked Websites</h3>
        {websites.length === 0 ? (
          <p style={{ color: '#999' }}>No websites tracked yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Name</th>
                <th>Tracking ID</th>
                <th>Created</th>
                <th>Sessions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {websites.map((website) => (
                <tr key={website._id}>
                  <td>{website.domain}</td>
                  <td>{website.name}</td>
                  <td><code style={{ fontSize: '0.85rem', cursor: 'pointer' }} title="Click to copy" onClick={() => navigator.clipboard.writeText(website.trackingId)}>{website.trackingId}</code></td>
                  <td>{new Date(website.createdAt).toLocaleDateString()}</td>
                  <td>{website.sessions || 0}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteWebsite(website._id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '5px 10px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ML Model Section */}
      <div className="card">
        <h3>🤖 Machine Learning Model</h3>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Current accuracy: <strong>{(stats.modelAccuracy * 100).toFixed(2)}%</strong>
        </p>
        <button onClick={handleRetrain} className="btn btn-success">
          🔄 Retrain Model (Background Task)
        </button>
        <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#999' }}>
          The model is automatically retrained every 24 hours with new data.
        </p>
      </div>
    </div>
  );
}

export default AdminPanel;
