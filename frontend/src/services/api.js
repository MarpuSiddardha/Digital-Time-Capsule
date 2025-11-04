// In api.js
import axios from 'axios';
import { checkToken } from './authService';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Make sure this matches your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
// In api.js - add this before the request interceptor
api.interceptors.request.use(
  (config) => {
    const token = checkToken();
    console.log('Request interceptor - URL:', config.url);
    console.log('Request interceptor - Headers:', config.headers);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added Authorization header with token');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 403 || status === 401) {
      // Clear tokens on auth errors
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;