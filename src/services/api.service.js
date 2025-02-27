// src/services/api.service.js
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Create axios instance with appropriate configuration for browser environment
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add withCredentials to handle CORS properly
  withCredentials: false
});

// Add request interceptor to handle any specific requirements
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Request to: ${config.url}`);
    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = {
        ...(config.params || {}),
        _t: Date.now()
      };
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Add retry logic for API calls
const retryAxios = async (fn, retries = 2, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.log(`Retrying... Attempts left: ${retries}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryAxios(fn, retries - 1, delay);
  }
};

const apiService = {
  // Health check methods
  checkHealth: async () => {
    console.log('Checking health endpoint...');
    try {
      return await retryAxios(async () => {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
        console.log('Health response:', response.data);
        return response.data;
      });
    } catch (error) {
      console.error("Health check failed:", error);
      // Return a default status object instead of throwing
      return {
        status: "error",
        database: "disconnected",
        api: {
          actor: false,
          movie: false,
          producer: false
        },
        message: error.message || 'Health check failed'
      };
    }
  },

  checkApiStatus: async (endpoint) => {
    console.log(`Checking API status for endpoint: ${endpoint}`);
    try {
      return await retryAxios(async () => {
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
      return await retryAxios(async () => {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.MOVIES);
        return response.data;
      });
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      // Return empty array instead of throwing
      return { movies: [], error: error.message || 'Failed to fetch movies' };
    }
  },

  getMovie: async (id) => {
    try {
      return await retryAxios(async () => {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.MOVIES}/${id}`);
        return response.data;
      });
    } catch (error) {
      console.error(`Failed to fetch movie ${id}:`, error);
      return { error: error.message || 'Failed to fetch movie' };
    }
  },

  addMovie: async (movieData) => {
    try {
      return await retryAxios(async () => {
        const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.MOVIES}/add-movie`, movieData);
        return response.data;
      });
    } catch (error) {
      console.error("Failed to add movie:", error);
      throw new Error(error.response?.data?.message || 'Failed to add movie');
    }
  },

  updateMovie: async (id, movieData) => {
    try {
      return await retryAxios(async () => {
        const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.MOVIES}/edit-movie/${id}`, movieData);
        return response.data;
      });
    } catch (error) {
      console.error(`Failed to update movie ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to update movie');
    }
  },

  deleteMovie: async (id) => {
    try {
      return await retryAxios(async () => {
        const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.MOVIES}/delete-movie/${id}`);
        return response.data;
      });
    } catch (error) {
      console.error(`Failed to delete movie ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to delete movie');
    }
  },

  // Actor methods
  getActors: async () => {
    try {
      return await retryAxios(async () => {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.ACTORS);
        return response.data;
      });
    } catch (error) {
      console.error("Failed to fetch actors:", error);
      return { actors: [], error: error.message || 'Failed to fetch actors' };
    }
  },

  addActor: async (actorData) => {
    try {
      return await retryAxios(async () => {
        const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.ACTORS}/add-actor`, actorData);
        return response.data;
      });
    } catch (error) {
      console.error("Failed to add actor:", error);
      throw new Error(error.response?.data?.message || 'Failed to add actor');
    }
  },

  // Producer methods
  getProducers: async () => {
    try {
      return await retryAxios(async () => {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.PRODUCERS);
        return response.data;
      });
    } catch (error) {
      console.error("Failed to fetch producers:", error);
      return { producers: [], error: error.message || 'Failed to fetch producers' };
    }
  },

  addProducer: async (producerData) => {
    try {
      return await retryAxios(async () => {
        const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.PRODUCERS}/add-producer`, producerData);
        return response.data;
      });
    } catch (error) {
      console.error("Failed to add producer:", error);
      throw new Error(error.response?.data?.message || 'Failed to add producer');
    }
  },

  // Generic methods
  get: async (endpoint) => {
    try {
      return await retryAxios(async () => {
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
      return await retryAxios(async () => {
        const response = await apiClient.post(endpoint, data);
        return response.data;
      });
    } catch (error) {
      console.error(`POST request failed for ${endpoint}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to post data');
    }
  }
};

export default apiService;
