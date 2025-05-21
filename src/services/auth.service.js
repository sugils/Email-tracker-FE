// src/services/auth.service.js
import axios from 'axios';

// Use the same URL format in both services
const API_URL = 'http://localhost:5000/api';  // Changed from 127.0.0.1 to localhost

// Create a separate axios instance for authentication that doesn't use interceptors
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Remove withCredentials for now during debugging
  withCredentials: false // Changed from true to false
});

const AuthService = {
  login: async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      
      // Use direct axios call instead of the intercepted api instance
      const response = await authApi.post('/login', { email, password });
      console.log('Login raw response:', response);
      console.log('Login response data:', response.data);
      
      if (response.data && response.data.access_token && response.data.user) {
        // Store token and user info
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      } else {
        console.error('Invalid login response format:', response.data);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Login error response:', error.response);
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      throw { message: errorMsg };
    }
  },

  register: async (email, password, full_name) => {
    try {
      console.log('Attempting registration with:', { email, full_name });
      
      // Add more detailed error logging
      console.log('Sending register request to:', `${API_URL}/register`);
      
      // Use direct axios call with error handling
      const response = await authApi.post('/register', { email, password, full_name })
        .catch(error => {
          console.error('Registration axios error:', error);
          console.error('Registration error config:', error.config);
          if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
          } else if (error.request) {
            console.error('No response received:', error.request);
          }
          throw error;
        });
      
      console.log('Register raw response:', response);
      console.log('Register response data:', response.data);
      
      if (response.data && response.data.access_token && response.data.user) {
        // Store token and user info
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      } else {
        console.error('Invalid register response format:', response.data);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Registration error response:', error.response);
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
      throw { message: errorMsg };
    }
  },

  // Direct registration with fetch for testing CORS issues
  registerWithFetch: async (email, password, full_name) => {
    console.log('Attempting registration with fetch:', { email, full_name });
    
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, full_name })
      });
      
      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', Object.fromEntries([...response.headers]));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetch response data:', data);
        
        if (data && data.access_token && data.user) {
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return data;
      } else {
        const errorText = await response.text();
        console.error('Fetch error response:', errorText);
        throw new Error(errorText || `HTTP error ${response.status}`);
      }
    } catch (error) {
      console.error('Fetch registration error:', error);
      throw { message: error.message || 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      // Parse and validate user object
      const user = JSON.parse(userStr);
      if (!user || typeof user !== 'object' || !user.user_id) {
        // Invalid user data, clear it
        localStorage.removeItem('user');
        return null;
      }
      
      return user;
    } catch (e) {
      // If there's any error (like invalid JSON), clear the storage and return null
      console.error("Error parsing user data:", e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = AuthService.getCurrentUser();
    return !!token && !!user;
  },
  
  // Helper method to inspect token format
  checkToken: () => {
    const token = localStorage.getItem('token');
    if (!token) return 'No token found';
    
    try {
      // Just basic structure validation, not actual JWT verification
      const parts = token.split('.');
      if (parts.length !== 3) return 'Token is not in valid JWT format';
      
      return 'Token appears valid';
    } catch (e) {
      return 'Error checking token: ' + e.message;
    }
  }
};

export default AuthService;