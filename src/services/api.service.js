// src/services/api.service.js
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Create axios instance with interceptors for better error handling
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with cross-origin requests
});

// Add request interceptor for logging and ensuring HTTP protocol
apiClient.interceptors.request.use(
  config => {
    // Ensure the URL starts with HTTP, not HTTPS
    if (config.url && !config.url.startsWith('/')) {
      config.url = config.url.replace('https://', 'http://');
    }
    
    // Make sure baseURL is using HTTP protocol
    if (config.baseURL && config.baseURL.startsWith('https://')) {
      config.baseURL = config.baseURL.replace('https://', 'http://');
    }
    
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    // Add timestamp to track request duration
    config.metadata = { startTime: new Date().getTime() };
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  response => {
    const duration = new Date().getTime() - response.config.metadata.startTime;
    console.log(`API Response from ${response.config.url}: Status ${response.status} (${duration}ms)`);
    return response;
  },
  error => {
    // Calculate request duration even for errors
    const duration = error.config?.metadata?.startTime 
      ? new Date().getTime() - error.config.metadata.startTime 
      : 'unknown';
    
    if (error.response) {
      console.error(`API Error from ${error.config.url}: Status ${error.response.status} (${duration}ms)`, error.response.data);
    } else if (error.request) {
      console.error(`API Error: No response received after ${duration}ms`, error.request);
      // Check if it's a timeout error and provide more specific logging
      if (error.code === 'ECONNABORTED') {
        console.error(`Request timed out after ${API_CONFIG.TIMEOUT}ms. Consider increasing the timeout in API_CONFIG.`);
      }
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Retry mechanism for API calls
const retryRequest = async (apiCall, retries = 2, delay = 1000) => {
  try {
    return await apiCall();
  } catch (error) {
    if (retries <= 0 || (error.response && error.response.status < 500)) {
      throw error;
    }
    console.log(`Retrying request in ${delay}ms... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(apiCall, retries - 1, delay * 2);
  }
};

const apiService = {
  // Health check methods
  checkHealth: async () => {
    try {
      return await retryRequest(async () => {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
        return response.data;
      });
    } catch (error) {
      console.error("Health check failed:", error);
      throw new Error(error.response?.data?.message || 'Health check failed');
    }
  },

  checkApiStatus: async (endpoint) => {
    console.log(`Checking API status for endpoint: ${endpoint}`);
    try {
      return await retryRequest(async () => {
        const response = await apiClient.get(endpoint);
        console.log(`Status response for ${endpoint}:`, response.data);
        return response.data;
      });
    } catch (error) {
      console.error(`API status check failed for ${endpoint}:`, error);
      return { status: "error" };
    }
  },

  // Movie methods
  getMovies: async () => {
    try {
      return await retryRequest(async () => {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.MOVIES);
        return response.data;
      });
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      throw new Error(error.response?.data?.message || 'Failed to fetch movies');
    }
  },

  getMovie: async (id) => {
    try {
      return await retryRequest(async () => {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.MOVIES}/${id}`);
        return response.data;
      });
    } catch (error) {
      console.error(`Failed to fetch movie ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch movie');
    }
  },

  addMovie: async (movieData) => {
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.MOVIES}/add-movie`, movieData);
      return response.data;
    } catch (error) {
      console.error("Failed to add movie:", error);
      throw new Error(error.response?.data?.message || 'Failed to add movie');
    }
  },

  updateMovie: async (id, movieData) => {
    try {
      const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.MOVIES}/edit-movie/${id}`, movieData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update movie ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to update movie');
    }
  },

  deleteMovie: async (id) => {
    try {
      const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.MOVIES}/delete-movie/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete movie ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to delete movie');
    }
  },

  // Actor methods
  getActors: async () => {
    try {
      return await retryRequest(async () => {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.ACTORS);
        return response.data;
      });
    } catch (error) {
      console.error("Failed to fetch actors:", error);
      throw new Error(error.response?.data?.message || 'Failed to fetch actors');
    }
  },

  addActor: async (actorData) => {
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.ACTORS}/add-actor`, actorData);
      return response.data;
    } catch (error) {
      console.error("Failed to add actor:", error);
      throw new Error(error.response?.data?.message || 'Failed to add actor');
    }
  },

  // Producer methods
  getProducers: async () => {
    try {
      return await retryRequest(async () => {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.PRODUCERS);
        return response.data;
      });
    } catch (error) {
      console.error("Failed to fetch producers:", error);
      throw new Error(error.response?.data?.message || 'Failed to fetch producers');
    }
  },

  addProducer: async (producerData) => {
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.PRODUCERS}/add-producer`, producerData);
      return response.data;
    } catch (error) {
      console.error("Failed to add producer:", error);
      throw new Error(error.response?.data?.message || 'Failed to add producer');
    }
  },

  // Generic methods
  get: async (endpoint) => {
    try {
      return await retryRequest(async () => {
        const response = await apiClient.get(endpoint);
        return response.data;
      });
    } catch (error) {
      console.error(`GET request failed for ${endpoint}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch data');
    }
  },

  post: async (endpoint, data) => {
    try {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`POST request failed for ${endpoint}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to post data');
    }
  }
};

export default apiService;
