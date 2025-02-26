// // config/api.config.js
// export const API_CONFIG = {
//   BASE_URL: process.env.REACT_APP_API_URL || 'http://34.93.196.67:5000',
//   TIMEOUT: 10000,
//   ENDPOINTS: {
//     HEALTH: '/health',
//     MOVIES: '/movies',
//     ACTORS: '/actors',
//     PRODUCERS: '/producers',
//     API_STATUS: {
//       MOVIE: '/movies/status',
//       ACTOR: '/actors/status',
//       PRODUCER: '/producers/status'
//     }
//   }
// };
// config/api.config.js
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://imdb-backend.jayachandran.xyz',
  TIMEOUT: 10000,
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
