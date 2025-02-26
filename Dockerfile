# # FROM node:18-alpine AS builder
# # WORKDIR /app

# # # Copy package files
# # COPY package*.json ./

# # # Clean install with specific resolutions
# # RUN npm cache clean --force && \
# #     rm -f package-lock.json && \
# #     npm install --legacy-peer-deps --force

# # # Copy source code
# # COPY . .

# # # Set environment variable to skip optional dependencies
# # ENV SKIP_OPTIONAL_DEPENDENCIES=true

# # # Build with specific dependency versions
# # RUN npm install --save --legacy-peer-deps \
# #     ajv@^6.12.6 \
# #     ajv-keywords@^3.5.2 && \
# #     npm run build

# # # Production stage
# # FROM nginx:alpine
# # COPY --from=builder /app/build /usr/share/nginx/html
# # COPY nginx.conf /etc/nginx/conf.d/default.conf
# # EXPOSE 3000
# # CMD ["nginx", "-g", "daemon off;"]
# FROM node:18-alpine AS builder
# WORKDIR /app

# # Copy package files first for better caching
# COPY package*.json ./

# # Clean install dependencies
# RUN npm cache clean --force && \
#     npm install --legacy-peer-deps && \
#     npm install --save dotenv @babel/plugin-proposal-private-property-in-object

# # Copy source code
# COPY . .

# # Set up environment variables
# RUN touch .env
# RUN echo "REACT_APP_API_URL=https://imdb-backend.jayachandran.xyz" >> .env
# RUN echo "NODE_ENV=development" >> .env

# # Build the app
# RUN npm run build

# # Production stage with Nginx
# FROM nginx:alpine
# COPY --from=builder /app/build /usr/share/nginx/html
# COPY --from=builder /app/.env /usr/share/nginx/html/.env
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Add env handling for runtime configuration (optional - for overriding env vars at runtime)
# RUN apk add --no-cache bash
# RUN mkdir -p /docker-entrypoint.d
# RUN echo '#!/bin/bash' > /docker-entrypoint.d/40-set-env.sh && \
#     echo 'if [ ! -z "$BACKEND_URL" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
#     echo '  sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=$BACKEND_URL|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
#     echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
#     echo 'if [ ! -z "$NODE_ENV" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
#     echo '  sed -i "s|NODE_ENV=.*|NODE_ENV=$NODE_ENV|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
#     echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
#     chmod +x /docker-entrypoint.d/40-set-env.sh

# # Add health check
# HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3000/health || exit 1

# EXPOSE 3000
# CMD ["nginx", "-g", "daemon off;"]
FROM node:18-alpine AS builder
WORKDIR /app
# Copy package files first for better caching
COPY package*.json ./
# Clean install dependencies and add required polyfills
RUN npm cache clean --force && \
    npm install --legacy-peer-deps && \
    npm install --save dotenv @babel/plugin-proposal-private-property-in-object && \
    npm install --save https-browserify http-browserify stream-browserify assert buffer process

# Copy source code
COPY . .

# Create a webpack config file to handle polyfills if one doesn't exist
RUN if [ ! -f webpack.config.js ]; then \
    echo "const webpack = require('webpack');" > webpack.config.js && \
    echo "module.exports = {" >> webpack.config.js && \
    echo "  resolve: {" >> webpack.config.js && \
    echo "    fallback: {" >> webpack.config.js && \
    echo "      'https': require.resolve('https-browserify')," >> webpack.config.js && \
    echo "      'http': require.resolve('http-browserify')," >> webpack.config.js && \
    echo "      'stream': require.resolve('stream-browserify')," >> webpack.config.js && \
    echo "      'assert': require.resolve('assert/')," >> webpack.config.js && \
    echo "      'buffer': require.resolve('buffer/')," >> webpack.config.js && \
    echo "    }" >> webpack.config.js && \
    echo "  }," >> webpack.config.js && \
    echo "  plugins: [" >> webpack.config.js && \
    echo "    new webpack.ProvidePlugin({" >> webpack.config.js && \
    echo "      process: 'process/browser'," >> webpack.config.js && \
    echo "      Buffer: ['buffer', 'Buffer']," >> webpack.config.js && \
    echo "    })," >> webpack.config.js && \
    echo "  ]," >> webpack.config.js && \
    echo "};" >> webpack.config.js; \
    fi

# If using Create React App, create a config-overrides.js file
RUN if [ -f "package.json" ] && grep -q "react-scripts" package.json; then \
    echo "const webpack = require('webpack');" > config-overrides.js && \
    echo "module.exports = function override(config, env) {" >> config-overrides.js && \
    echo "  config.resolve.fallback = {" >> config-overrides.js && \
    echo "    ...config.resolve.fallback," >> config-overrides.js && \
    echo "    'https': require.resolve('https-browserify')," >> config-overrides.js && \
    echo "    'http': require.resolve('http-browserify')," >> config-overrides.js && \
    echo "    'stream': require.resolve('stream-browserify')," >> config-overrides.js && \
    echo "    'assert': require.resolve('assert/')," >> config-overrides.js && \
    echo "    'buffer': require.resolve('buffer/')" >> config-overrides.js && \
    echo "  };" >> config-overrides.js && \
    echo "  config.plugins = [" >> config-overrides.js && \
    echo "    ...config.plugins," >> config-overrides.js && \
    echo "    new webpack.ProvidePlugin({" >> config-overrides.js && \
    echo "      process: 'process/browser'," >> config-overrides.js && \
    echo "      Buffer: ['buffer', 'Buffer']," >> config-overrides.js && \
    echo "    })," >> config-overrides.js && \
    echo "  ];" >> config-overrides.js && \
    echo "  return config;" >> config-overrides.js && \
    echo "};" >> config-overrides.js && \
    npm install --save-dev react-app-rewired; \
    sed -i 's/"react-scripts build"/"react-app-rewired build"/g' package.json && \
    sed -i 's/"react-scripts start"/"react-app-rewired start"/g' package.json && \
    sed -i 's/"react-scripts test"/"react-app-rewired test"/g' package.json; \
    fi

# Set up environment variables
RUN touch .env
RUN echo "REACT_APP_API_URL=https://imdb-backend.jayachandran.xyz" >> .env
RUN echo "NODE_ENV=development" >> .env

# Build the app
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/.env /usr/share/nginx/html/.env
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add env handling for runtime configuration (optional - for overriding env vars at runtime)
RUN apk add --no-cache bash
RUN mkdir -p /docker-entrypoint.d
RUN echo '#!/bin/bash' > /docker-entrypoint.d/40-set-env.sh && \
    echo 'if [ ! -z "$BACKEND_URL" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
    echo '  sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=$BACKEND_URL|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
    echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
    echo 'if [ ! -z "$NODE_ENV" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
    echo '  sed -i "s|NODE_ENV=.*|NODE_ENV=$NODE_ENV|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
    echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
    chmod +x /docker-entrypoint.d/40-set-env.sh

# Add health check
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
