import axios from 'axios';

// For local development: http://localhost:5000/api
// For production: https://your-vercel-backend.vercel.app/api
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export default apiClient;
