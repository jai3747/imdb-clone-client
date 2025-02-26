// // src/services/api.service.js

// import axios from 'axios';
// import { API_CONFIG } from '../config/api.config';

// const apiClient = axios.create({
//   baseURL: API_CONFIG.BASE_URL,
//   timeout: API_CONFIG.TIMEOUT,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// const apiService = {
//   // Health check methods
//   checkHealth: async () => {
//     try {
//       const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
//       return response.data;
//     } catch (error) {
//       console.error("Health check failed:", error);
//       throw new Error(error.response?.data?.message || 'Health check failed');
//     }
//   },

//   checkApiStatus: async (endpoint) => {
//     console.log(`Checking API status for endpoint: ${endpoint}`);
//     try {
//       const response = await apiClient.get(endpoint);
//       console.log(`Status response for ${endpoint}:`, response.data);
//       return response.data;
//     } catch (error) {
//       console.error(`API status check failed for ${endpoint}:`, error);
//       return { status: "error" };
//     }
//   },

//   // Movie methods
//   getMovies: async () => {
//     try {
//       const response = await apiClient.get(API_CONFIG.ENDPOINTS.MOVIES);
//       return response.data;
//     } catch (error) {
//       console.error("Failed to fetch movies:", error);
//       throw new Error(error.response?.data?.message || 'Failed to fetch movies');
//     }
//   },

//   getMovie: async (id) => {
//     try {
//       const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.MOVIES}/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(`Failed to fetch movie ${id}:`, error);
//       throw new Error(error.response?.data?.message || 'Failed to fetch movie');
//     }
//   },

//   addMovie: async (movieData) => {
//     try {
//       const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.MOVIES}/add-movie`, movieData);
//       return response.data;
//     } catch (error) {
//       console.error("Failed to add movie:", error);
//       throw new Error(error.response?.data?.message || 'Failed to add movie');
//     }
//   },

//   updateMovie: async (id, movieData) => {
//     try {
//       const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.MOVIES}/edit-movie/${id}`, movieData);
//       return response.data;
//     } catch (error) {
//       console.error(`Failed to update movie ${id}:`, error);
//       throw new Error(error.response?.data?.message || 'Failed to update movie');
//     }
//   },

//   deleteMovie: async (id) => {
//     try {
//       const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.MOVIES}/delete-movie/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(`Failed to delete movie ${id}:`, error);
//       throw new Error(error.response?.data?.message || 'Failed to delete movie');
//     }
//   },

//   // Actor methods
//   getActors: async () => {
//     try {
//       const response = await apiClient.get(API_CONFIG.ENDPOINTS.ACTORS);
//       return response.data;
//     } catch (error) {
//       console.error("Failed to fetch actors:", error);
//       throw new Error(error.response?.data?.message || 'Failed to fetch actors');
//     }
//   },

//   addActor: async (actorData) => {
//     try {
//       const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.ACTORS}/add-actor`, actorData);
//       return response.data;
//     } catch (error) {
//       console.error("Failed to add actor:", error);
//       throw new Error(error.response?.data?.message || 'Failed to add actor');
//     }
//   },

//   // Producer methods
//   getProducers: async () => {
//     try {
//       const response = await apiClient.get(API_CONFIG.ENDPOINTS.PRODUCERS);
//       return response.data;
//     } catch (error) {
//       console.error("Failed to fetch producers:", error);
//       throw new Error(error.response?.data?.message || 'Failed to fetch producers');
//     }
//   },

//   addProducer: async (producerData) => {
//     try {
//       const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.PRODUCERS}/add-producer`, producerData);
//       return response.data;
//     } catch (error) {
//       console.error("Failed to add producer:", error);
//       throw new Error(error.response?.data?.message || 'Failed to add producer');
//     }
//   },

//   // Generic methods
//   get: async (endpoint) => {
//     try {
//       const response = await apiClient.get(endpoint);
//       return response.data;
//     } catch (error) {
//       console.error(`GET request failed for ${endpoint}:`, error);
//       throw new Error(error.response?.data?.message || 'Failed to fetch data');
//     }
//   },

//   post: async (endpoint, data) => {
//     try {
//       const response = await apiClient.post(endpoint, data);
//       return response.data;
//     } catch (error) {
//       console.error(`POST request failed for ${endpoint}:`, error);
//       throw new Error(error.response?.data?.message || 'Failed to post data');
//     }
//   }
// };

// export default apiService;
// src/services/api.service.js

import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Create axios instance with SSL certificate validation disabled
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  },
  // Important: This is the equivalent of curl's -k flag
  httpsAgent: new (require('https').Agent)({  
    rejectUnauthorized: false
  })
});

const apiService = {
  // Health check methods
  checkHealth: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw new Error(error.response?.data?.message || 'Health check failed');
    }
  },

  checkApiStatus: async (endpoint) => {
    console.log(`Checking API status for endpoint: ${endpoint}`);
    try {
      const response = await apiClient.get(endpoint);
      console.log(`Status response for ${endpoint}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`API status check failed for ${endpoint}:`, error);
      return { status: "error" };
    }
  },

  // Movie methods
  getMovies: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.MOVIES);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      throw new Error(error.response?.data?.message || 'Failed to fetch movies');
    }
  },

  getMovie: async (id) => {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.MOVIES}/${id}`);
      return response.data;
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
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.ACTORS);
      return response.data;
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
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.PRODUCERS);
      return response.data;
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
      const response = await apiClient.get(endpoint);
      return response.data;
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
