import React, { useState, useEffect } from 'react';
import apiClient from '../../api';

function Filters({ filters, setFilters, onExport }) {
  const [websites, setWebsites] = useState([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);

  // Fetch websites on component mount
  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const response = await apiClient.get('/admin/websites');
      setWebsites(response.data);
    } catch (error) {
      console.error('Error fetching websites:', error);
    } finally {
      setLoadingWebsites(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
  };

  return (
    <div className="filters-section">
      <div className="filter-group">
        <label>📅 Start Date</label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label>📅 End Date</label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label>🔗 Website</label>
        <select name="website" value={filters.website} onChange={handleChange} disabled={loadingWebsites}>
          <option value="all">All Websites</option>
          {websites.map((website) => (
            <option key={website._id} value={website.domain}>
              {website.name || website.domain}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={() => setDateRange(7)} title="Last 7 days">
          7D
        </button>
        <button className="btn btn-secondary" onClick={() => setDateRange(30)} title="Last 30 days">
          30D
        </button>
        <button className="btn btn-secondary" onClick={() => setDateRange(90)} title="Last 90 days">
          90D
        </button>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => onExport('csv')} title="Export data as CSV">
          📥 CSV
        </button>
        <button className="btn btn-primary" onClick={() => onExport('pdf')} title="Export data as PDF">
          📄 PDF
        </button>
      </div>
    </div>
  );
}

export default Filters;
