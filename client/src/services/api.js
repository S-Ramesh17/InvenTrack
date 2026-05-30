import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Attach user headers from localStorage before each request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('inventoryUser');
    if (stored) {
      const user = JSON.parse(stored);
      config.headers['x-user-id'] = user._id;
      config.headers['x-user-role'] = user.role;
      config.headers['x-user-name'] = user.name;
    }
  } catch {
    // Ignore parsing errors
  }
  return config;
});

export default api;
