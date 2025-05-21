// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Proper format for JWT token in Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized: Logging out user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response && error.response.status === 403) {
      console.error('Forbidden: User lacks permission for this resource');
      // You can handle this differently, e.g., show a message but don't log out
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Add this to auth.service.js to handle token refresh if needed
const refreshToken = async () => {
  try {
    // Example refresh token implementation (you would need to add this endpoint to your backend)
    const response = await axios.post(`${API_URL}/refresh-token`, {
      token: localStorage.getItem('token'),
    });
    
    if (response.data && response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      return response.data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};