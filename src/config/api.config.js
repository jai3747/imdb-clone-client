// src/config/api.config.js
export const API_CONFIG = {
  // Force HTTP protocol and ensure no protocol auto-switching occurs
  BASE_URL: (process.env.REACT_APP_API_URL || 'http://imdb-dev-backend.jayachandran.xyz').replace('https://', 'http://'),
  TIMEOUT: 30000, // 30 seconds timeout
  ENDPOINTS: {
    HEALTH: '/health',
    MOVIES: '/movies',
    ACTORS: '/actors',
    PRODUCERS: '/producers',
    API_STATUS: {
      MOVIE: '/movies/status',
      ACTOR: '/actors/status',
      PRODUCER: '/producers/status'
    }
  }
};
