
// config/api.config.js/new
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://imdb-dev-backend.jayachandran.xyz',
  TIMEOUT: 30000, // Increased from 10000 to 30000 (30 seconds)
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
