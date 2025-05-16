import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor for better error handling
api.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response) {
    const { status, data } = error.response;
    
    // Handle specific status codes
    if (status === 401) {
      // Redirect to login if token is invalid
      window.location.href = '/login';
    }
    
    // Format error message
    const message = data.error || data.message || 'Request failed';
    return Promise.reject(new Error(`${message} (Status: ${status})`));
  } else if (error.request) {
    return Promise.reject(new Error('No response received from server'));
  }
  return Promise.reject(error);
});

export default api;