import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  timeout: 0, // 0 means no timeout - allow infinite time for large uploads
  maxContentLength: Infinity, // Allow infinite content length
  maxBodyLength: Infinity, // Allow infinite body length
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`Response received from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Handle specific error cases
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Cannot connect to server. Please check if the backend is running.';
    } else if (error.code === 'NETWORK_ERROR') {
      error.message = 'Network error. Please check your internet connection.';
    } else if (error.response?.status === 413) {
      error.message = 'File too large. Please choose a smaller file.';
    } else if (error.response?.status === 415) {
      error.message = 'Unsupported file type. Please choose a valid image or video file.';
    }
    
    return Promise.reject(error);
  }
);

export default API;