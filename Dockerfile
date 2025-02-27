# # # # # # # FROM node:18-alpine AS builder
# # # # # # # WORKDIR /app

# # # # # # # # Copy package files
# # # # # # # COPY package*.json ./

# # # # # # # # Clean install with specific resolutions
# # # # # # # RUN npm cache clean --force && \
# # # # # # #     rm -f package-lock.json && \
# # # # # # #     npm install --legacy-peer-deps --force

# # # # # # # # Copy source code
# # # # # # # COPY . .

# # # # # # # # Set environment variable to skip optional dependencies
# # # # # # # ENV SKIP_OPTIONAL_DEPENDENCIES=true

# # # # # # # # Build with specific dependency versions
# # # # # # # RUN npm install --save --legacy-peer-deps \
# # # # # # #     ajv@^6.12.6 \
# # # # # # #     ajv-keywords@^3.5.2 && \
# # # # # # #     npm run build

# # # # # # # # Production stage
# # # # # # FROM nginx:alpine
# # # # # # # COPY --from=builder /app/build /usr/share/nginx/html
# # # # # # # COPY nginx.conf /etc/nginx/conf.d/default.conf
# # # # # # # EXPOSE 3000
# # # # # # # CMD ["nginx", "-g", "daemon off;"]
# # # # # # FROM node:18-alpine AS builder
# # # # # # WORKDIR /app

# # # # # # # Copy package files first for better caching
# # # # # # COPY package*.json ./

# # # # # # # Clean install dependencies
# # # # # # RUN npm cache clean --force && \
# # # # # #     npm install --legacy-peer-deps && \
# # # # # #     npm install --save dotenv @babel/plugin-proposal-private-property-in-object

# # # # # # # Copy source code
# # # # # # COPY . .

# # # # # # # Set up environment variables
# # # # # # RUN touch .env
# # # # # # RUN echo "REACT_APP_API_URL=https://imdb-backend.jayachandran.xyz" >> .env
# # # # # # RUN echo "NODE_ENV=development" >> .env

# # # # # # # Build the app
# # # # # # RUN npm run build

# # # # # # # Production stage with Nginx
# # # # # # FROM nginx:alpine
# # # # # # COPY --from=builder /app/build /usr/share/nginx/html
# # # # # # COPY --from=builder /app/.env /usr/share/nginx/html/.env
# # # # # # COPY nginx.conf /etc/nginx/conf.d/default.conf

# # # # # # # Add env handling for runtime configuration (optional - for overriding env vars at runtime)
# # # # # # RUN apk add --no-cache bash
# # # # # # RUN mkdir -p /docker-entrypoint.d
# # # # # # RUN echo '#!/bin/bash' > /docker-entrypoint.d/40-set-env.sh && \
# # # # # #     echo 'if [ ! -z "$BACKEND_URL" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
# # # # # #     echo '  sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=$BACKEND_URL|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
# # # # # #     echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
# # # # # #     echo 'if [ ! -z "$NODE_ENV" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
# # # # # #     echo '  sed -i "s|NODE_ENV=.*|NODE_ENV=$NODE_ENV|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
# # # # # #     echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
# # # # # #     chmod +x /docker-entrypoint.d/40-set-env.sh

# # # # # # # Add health check
# # # # # # HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3000/health || exit 1

# # # # # # EXPOSE 3000
# # # # # # CMD ["nginx", "-g", "daemon off;"]
# # # # # FROM node:18-alpine AS builder
# # # # # WORKDIR /app
# # # # # # Copy package files first for better caching
# # # # # COPY package*.json ./
# # # # # # Clean install dependencies and add required polyfills
# # # # # RUN npm cache clean --force && \
# # # # #     npm install --legacy-peer-deps && \
# # # # #     npm install --save dotenv @babel/plugin-proposal-private-property-in-object && \
# # # # #     npm install --save https-browserify http-browserify stream-browserify assert buffer process

# # # # # # Copy source code
# # # # # COPY . .

# # # # # # Create a webpack config file to handle polyfills if one doesn't exist
# # # # # RUN if [ ! -f webpack.config.js ]; then \
# # # # #     echo "const webpack = require('webpack');" > webpack.config.js && \
# # # # #     echo "module.exports = {" >> webpack.config.js && \
# # # # #     echo "  resolve: {" >> webpack.config.js && \
# # # # #     echo "    fallback: {" >> webpack.config.js && \
# # # # #     echo "      'https': require.resolve('https-browserify')," >> webpack.config.js && \
# # # # #     echo "      'http': require.resolve('http-browserify')," >> webpack.config.js && \
# # # # #     echo "      'stream': require.resolve('stream-browserify')," >> webpack.config.js && \
# # # # #     echo "      'assert': require.resolve('assert/')," >> webpack.config.js && \
# # # # #     echo "      'buffer': require.resolve('buffer/')," >> webpack.config.js && \
# # # # #     echo "    }" >> webpack.config.js && \
# # # # #     echo "  }," >> webpack.config.js && \
# # # # #     echo "  plugins: [" >> webpack.config.js && \
# # # # #     echo "    new webpack.ProvidePlugin({" >> webpack.config.js && \
# # # # #     echo "      process: 'process/browser'," >> webpack.config.js && \
# # # # #     echo "      Buffer: ['buffer', 'Buffer']," >> webpack.config.js && \
# # # # #     echo "    })," >> webpack.config.js && \
# # # # #     echo "  ]," >> webpack.config.js && \
# # # # #     echo "};" >> webpack.config.js; \
# # # # #     fi

# # # # # # If using Create React App, create a config-overrides.js file
# # # # # RUN if [ -f "package.json" ] && grep -q "react-scripts" package.json; then \
# # # # #     echo "const webpack = require('webpack');" > config-overrides.js && \
# # # # #     echo "module.exports = function override(config, env) {" >> config-overrides.js && \
# # # # #     echo "  config.resolve.fallback = {" >> config-overrides.js && \
# # # # #     echo "    ...config.resolve.fallback," >> config-overrides.js && \
# # # # #     echo "    'https': require.resolve('https-browserify')," >> config-overrides.js && \
# # # # #     echo "    'http': require.resolve('http-browserify')," >> config-overrides.js && \
# # # # #     echo "    'stream': require.resolve('stream-browserify')," >> config-overrides.js && \
# # # # #     echo "    'assert': require.resolve('assert/')," >> config-overrides.js && \
# # # # #     echo "    'buffer': require.resolve('buffer/')" >> config-overrides.js && \
# # # # #     echo "  };" >> config-overrides.js && \
# # # # #     echo "  config.plugins = [" >> config-overrides.js && \
# # # # #     echo "    ...config.plugins," >> config-overrides.js && \
# # # # #     echo "    new webpack.ProvidePlugin({" >> config-overrides.js && \
# # # # #     echo "      process: 'process/browser'," >> config-overrides.js && \
# # # # #     echo "      Buffer: ['buffer', 'Buffer']," >> config-overrides.js && \
# # # # #     echo "    })," >> config-overrides.js && \
# # # # #     echo "  ];" >> config-overrides.js && \
# # # # #     echo "  return config;" >> config-overrides.js && \
# # # # #     echo "};" >> config-overrides.js && \
# # # # #     npm install --save-dev react-app-rewired; \
# # # # #     sed -i 's/"react-scripts build"/"react-app-rewired build"/g' package.json && \
# # # # #     sed -i 's/"react-scripts start"/"react-app-rewired start"/g' package.json && \
# # # # #     sed -i 's/"react-scripts test"/"react-app-rewired test"/g' package.json; \
# # # # #     fi

# # # # # # Set up environment variables
# # # # # RUN touch .env
# # # # # RUN echo "REACT_APP_API_URL=https://imdb-backend.jayachandran.xyz" >> .env
# # # # # RUN echo "NODE_ENV=development" >> .env

# # # # # # Build the app
# # # # # RUN npm run build

# # # # # # Production stage with Nginx
# # # # # FROM nginx:alpine
# # # # # COPY --from=builder /app/build /usr/share/nginx/html
# # # # # COPY --from=builder /app/.env /usr/share/nginx/html/.env
# # # # # COPY nginx.conf /etc/nginx/conf.d/default.conf

# # # # # # Add env handling for runtime configuration (optional - for overriding env vars at runtime)
# # # # # RUN apk add --no-cache bash
# # # # # RUN mkdir -p /docker-entrypoint.d
# # # # # RUN echo '#!/bin/bash' > /docker-entrypoint.d/40-set-env.sh && \
# # # # #     echo 'if [ ! -z "$BACKEND_URL" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
# # # # #     echo '  sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=$BACKEND_URL|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
# # # # #     echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
# # # # #     echo 'if [ ! -z "$NODE_ENV" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
# # # # #     echo '  sed -i "s|NODE_ENV=.*|NODE_ENV=$NODE_ENV|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
# # # # #     echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
# # # # #     chmod +x /docker-entrypoint.d/40-set-env.sh

# # # # # # Add health check
# # # # # HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3000/health || exit 1

# # # # # EXPOSE 3000
# # # # # CMD ["nginx", "-g", "daemon off;"]
# # # # FROM node:18-alpine AS builder
# # # # WORKDIR /app

# # # # # Copy package files first for better caching
# # # # COPY package*.json ./

# # # # # Clean install dependencies
# # # # RUN npm cache clean --force && \
# # # #     npm install --legacy-peer-deps && \
# # # #     npm install --save dotenv @babel/plugin-proposal-private-property-in-object

# # # # # Install required polyfills as dev dependencies
# # # # RUN npm install --save-dev https-browserify http-browserify stream-browserify assert buffer process react-app-rewired

# # # # # Copy source code
# # # # COPY . .

# # # # # Create config-overrides.js file for react-app-rewired
# # # # RUN echo "const webpack = require('webpack');" > config-overrides.js && \
# # # #     echo "module.exports = function override(config, env) {" >> config-overrides.js && \
# # # #     echo "  config.resolve.fallback = {" >> config-overrides.js && \
# # # #     echo "    ...config.resolve.fallback," >> config-overrides.js && \
# # # #     echo "    'https': require.resolve('https-browserify')," >> config-overrides.js && \
# # # #     echo "    'http': require.resolve('http-browserify')," >> config-overrides.js && \
# # # #     echo "    'stream': require.resolve('stream-browserify')," >> config-overrides.js && \
# # # #     echo "    'assert': require.resolve('assert/')," >> config-overrides.js && \
# # # #     echo "    'buffer': require.resolve('buffer/')" >> config-overrides.js && \
# # # #     echo "  };" >> config-overrides.js && \
# # # #     echo "  config.plugins = [" >> config-overrides.js && \
# # # #     echo "    ...config.plugins," >> config-overrides.js && \
# # # #     echo "    new webpack.ProvidePlugin({" >> config-overrides.js && \
# # # #     echo "      process: 'process/browser'," >> config-overrides.js && \
# # # #     echo "      Buffer: ['buffer', 'Buffer']," >> config-overrides.js && \
# # # #     echo "    })," >> config-overrides.js && \
# # # #     echo "  ];" >> config-overrides.js && \
# # # #     echo "  return config;" >> config-overrides.js && \
# # # #     echo "};" >> config-overrides.js

# # # # # Update package.json scripts to use react-app-rewired instead of react-scripts
# # # # RUN if grep -q "\"react-scripts build\"" package.json; then \
# # # #     sed -i 's/"react-scripts build"/"react-app-rewired build"/g' package.json; \
# # # #     fi && \
# # # #     if grep -q "\"react-scripts start\"" package.json; then \
# # # #     sed -i 's/"react-scripts start"/"react-app-rewired start"/g' package.json; \
# # # #     fi && \
# # # #     if grep -q "\"react-scripts test\"" package.json; then \
# # # #     sed -i 's/"react-scripts test"/"react-app-rewired test"/g' package.json; \
# # # #     fi

# # # # # Set up environment variables
# # # # RUN touch .env
# # # # RUN echo "REACT_APP_API_URL=https://imdb-backend.jayachandran.xyz" >> .env
# # # # RUN echo "NODE_ENV=development" >> .env

# # # # # Build the app
# # # # RUN npm run build

# # # # # Production stage with Nginx
# # # # FROM nginx:alpine
# # # # COPY --from=builder /app/build /usr/share/nginx/html
# # # # COPY --from=builder /app/.env /usr/share/nginx/html/.env
# # # # COPY nginx.conf /etc/nginx/conf.d/default.conf

# # # # # Add env handling for runtime configuration
# # # # RUN apk add --no-cache bash
# # # # RUN mkdir -p /docker-entrypoint.d
# # # # RUN echo '#!/bin/bash' > /docker-entrypoint.d/40-set-env.sh && \
# # # #     echo 'if [ ! -z "$BACKEND_URL" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
# # # #     echo '  sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=$BACKEND_URL|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
# # # #     echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
# # # #     echo 'if [ ! -z "$NODE_ENV" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
# # # #     echo '  sed -i "s|NODE_ENV=.*|NODE_ENV=$NODE_ENV|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
# # # #     echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
# # # #     chmod +x /docker-entrypoint.d/40-set-env.sh

# # # # # Add health check
# # # # HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3000/health || exit 1

# # # # EXPOSE 3000
# # # # CMD ["nginx", "-g", "daemon off;"]
# # # FROM node:18-alpine AS builder
# # # WORKDIR /app

# # # # Copy package files first for better caching
# # # COPY package*.json ./

# # # # Clean install dependencies
# # # RUN npm cache clean --force && \
# # #     npm install --legacy-peer-deps && \
# # #     npm install --save dotenv @babel/plugin-proposal-private-property-in-object

# # # # Copy source code
# # # COPY . .

# # # # Create a custom fix for the https module inside src directory
# # # RUN mkdir -p src/polyfills && \
# # #     echo "// https polyfill for browser" > src/polyfills/https.js && \
# # #     echo "export default {};" >> src/polyfills/https.js

# # # # Modify any imports of 'https' to use our local polyfill
# # # RUN find src -type f -name "*.js" -exec sed -i 's/from [\'"]https[\'"]/from '\''..\/polyfills\/https'\''/g' {} \; || true && \
# # #     find src -type f -name "*.jsx" -exec sed -i 's/from [\'"]https[\'"]/from '\''..\/polyfills\/https'\''/g' {} \; || true && \
# # #     find src -type f -name "*.ts" -exec sed -i 's/from [\'"]https[\'"]/from '\''..\/polyfills\/https'\''/g' {} \; || true && \
# # #     find src -type f -name "*.tsx" -exec sed -i 's/from [\'"]https[\'"]/from '\''..\/polyfills\/https'\''/g' {} \; || true

# # # # Create polyfill for require('https') pattern
# # # RUN mkdir -p src/services && \
# # #     if grep -r "require(['\"]https['\"])" src; then \
# # #       echo "// Polyfill for require('https')" > src/services/https-polyfill.js && \
# # #       echo "const https = {};" >> src/services/https-polyfill.js && \
# # #       echo "module.exports = https;" >> src/services/https-polyfill.js; \
# # #       find src -type f -name "*.js" -exec sed -i 's/require([\'"]https[\'"])/require('\''..\/services\/https-polyfill'\'')/g' {} \; || true; \
# # #       find src -type f -name "*.jsx" -exec sed -i 's/require([\'"]https[\'"])/require('\''..\/services\/https-polyfill'\'')/g' {} \; || true; \
# # #     fi

# # # # Set up environment variables
# # # RUN touch .env
# # # RUN echo "REACT_APP_API_URL=https://imdb-backend.jayachandran.xyz" >> .env
# # # RUN echo "NODE_ENV=development" >> .env

# # # # Build the app
# # # RUN CI=false npm run build

# # # # Production stage with Nginx
# # # FROM nginx:alpine
# # # COPY --from=builder /app/build /usr/share/nginx/html
# # # COPY --from=builder /app/.env /usr/share/nginx/html/.env

# # # # Copy nginx configuration if it exists, otherwise create a default one
# # # COPY nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || echo 'server { \
# # #     listen 3000; \
# # #     root /usr/share/nginx/html; \
# # #     index index.html; \
# # #     location / { \
# # #         try_files $uri $uri/ /index.html; \
# # #     } \
# # # }' > /etc/nginx/conf.d/default.conf

# # # # Add env handling for runtime configuration
# # # RUN apk add --no-cache bash
# # # RUN mkdir -p /docker-entrypoint.d
# # # RUN echo '#!/bin/bash' > /docker-entrypoint.d/40-set-env.sh && \
# # #     echo 'if [ ! -z "$BACKEND_URL" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
# # #     echo '  sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=$BACKEND_URL|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
# # #     echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
# # #     echo 'if [ ! -z "$NODE_ENV" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
# # #     echo '  sed -i "s|NODE_ENV=.*|NODE_ENV=$NODE_ENV|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
# # #     echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
# # #     chmod +x /docker-entrypoint.d/40-set-env.sh

# # # # Add health check
# # # HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3000/health || exit 1

# # # EXPOSE 3000
# # # CMD ["nginx", "-g", "daemon off;"]
# # FROM node:18-alpine AS builder
# # WORKDIR /app

# # # Copy package files first for better caching
# # COPY package*.json ./

# # # Clean install dependencies
# # RUN npm cache clean --force && \
# #     npm install --legacy-peer-deps && \
# #     npm install --save dotenv @babel/plugin-proposal-private-property-in-object

# # # Copy source code
# # COPY . .

# # # Create a custom fix for the https module inside src directory
# # RUN mkdir -p src/polyfills && \
# #     echo "// https polyfill for browser" > src/polyfills/https.js && \
# #     echo "export default {};" >> src/polyfills/https.js

# # # Modify any imports of 'https' to use our local polyfill
# # RUN find src -type f -name "*.js" -exec sed -i 's/from [\'"]https[\'"]/from '\''..\/polyfills\/https'\''/g' {} \; || true && \
# #     find src -type f -name "*.jsx" -exec sed -i 's/from [\'"]https[\'"]/from '\''..\/polyfills\/https'\''/g' {} \; || true && \
# #     find src -type f -name "*.ts" -exec sed -i 's/from [\'"]https[\'"]/from '\''..\/polyfills\/https'\''/g' {} \; || true && \
# #     find src -type f -name "*.tsx" -exec sed -i 's/from [\'"]https[\'"]/from '\''..\/polyfills\/https'\''/g' {} \; || true

# # # Create polyfill for require('https') pattern
# # RUN mkdir -p src/services && \
# #     if grep -r "require(['\"]https['\"])" src; then \
# #       echo "// Polyfill for require('https')" > src/services/https-polyfill.js && \
# #       echo "const https = {};" >> src/services/https-polyfill.js && \
# #       echo "module.exports = https;" >> src/services/https-polyfill.js; \
# #       find src -type f -name "*.js" -exec sed -i 's/require([\'"]https[\'"])/require('\''..\/services\/https-polyfill'\'')/g' {} \; || true; \
# #       find src -type f -name "*.jsx" -exec sed -i 's/require([\'"]https[\'"])/require('\''..\/services\/https-polyfill'\'')/g' {} \; || true; \
# #     fi

# # # Set up environment variables
# # RUN touch .env
# # RUN echo "REACT_APP_API_URL=https://imdb-backend.jayachandran.xyz" >> .env
# # RUN echo "NODE_ENV=development" >> .env

# # # Build the app
# # RUN CI=false npm run build

# # # Production stage with Nginx
# # FROM nginx:alpine
# # COPY --from=builder /app/build /usr/share/nginx/html
# # COPY --from=builder /app/.env /usr/share/nginx/html/.env

# # # Create a proper Nginx configuration
# # RUN echo 'server { \
# #     listen 3000 default_server; \
# #     listen [::]:3000 default_server; \
# #     server_name _; \
# #     \
# #     location / { \
# #         root /usr/share/nginx/html; \
# #         index index.html index.htm; \
# #         try_files $uri $uri/ /index.html; \
# #     } \
# #     \
# #     location /health { \
# #         access_log off; \
# #         add_header Content-Type text/plain; \
# #         return 200 '"'"'healthy'"'"'; \
# #     } \
# #     \
# #     error_page 500 502 503 504 /50x.html; \
# #     location = /50x.html { \
# #         root /usr/share/nginx/html; \
# #     } \
# # }' > /etc/nginx/conf.d/default.conf

# # # Add env handling for runtime configuration
# # RUN apk add --no-cache bash
# # RUN mkdir -p /docker-entrypoint.d
# # RUN echo '#!/bin/bash' > /docker-entrypoint.d/40-set-env.sh && \
# #     echo 'if [ ! -z "$BACKEND_URL" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
# #     echo '  sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=$BACKEND_URL|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
# #     echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
# #     echo 'if [ ! -z "$NODE_ENV" ]; then' >> /docker-entrypoint.d/40-set-env.sh && \
# #     echo '  sed -i "s|NODE_ENV=.*|NODE_ENV=$NODE_ENV|g" /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-set-env.sh && \
# #     echo 'fi' >> /docker-entrypoint.d/40-set-env.sh && \
# #     chmod +x /docker-entrypoint.d/40-set-env.sh

# # # Add health check
# # HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3000/health || exit 1

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
# # Create a custom fix for the https module inside src directory
# RUN mkdir -p src/polyfills && \
#     echo "// https polyfill for browser" > src/polyfills/https.js && \
#     echo "export default {};" >> src/polyfills/https.js
# # Modify any imports of 'https' to use our local polyfill
# RUN find src -type f -name "*.js" -exec sed -i 's/from ['\''"]https['\''"]]/from '\''..\/polyfills\/https'\''/g' {} \; || true && \
#     find src -type f -name "*.jsx" -exec sed -i 's/from ['\''"]https['\''"]]/from '\''..\/polyfills\/https'\''/g' {} \; || true && \
#     find src -type f -name "*.ts" -exec sed -i 's/from ['\''"]https['\''"]]/from '\''..\/polyfills\/https'\''/g' {} \; || true && \
#     find src -type f -name "*.tsx" -exec sed -i 's/from ['\''"]https['\''"]]/from '\''..\/polyfills\/https'\''/g' {} \; || true
# # Create polyfill for require('https') pattern
# RUN mkdir -p src/services && \
#     if grep -r "require.*https" src; then \
#       echo "// Polyfill for require('https')" > src/services/https-polyfill.js && \
#       echo "const https = {};" >> src/services/https-polyfill.js && \
#       echo "module.exports = https;" >> src/services/https-polyfill.js && \
#       find src -type f -name "*.js" -exec sed -i 's/require(['\''"]https['\''"])/require('\''..\/services\/https-polyfill'\'')/g' {} \; || true && \
#       find src -type f -name "*.jsx" -exec sed -i 's/require(['\''"]https['\''"])/require('\''..\/services\/https-polyfill'\'')/g' {} \; || true; \
#     fi
# # Set up environment variables
# RUN touch .env
# RUN echo "REACT_APP_API_URL=https://imdb-backend.jayachandran.xyz" >> .env
# RUN echo "NODE_ENV=development" >> .env
# # Build the app
# RUN CI=false npm run build
# # Production stage with Nginx
# FROM nginx:alpine
# COPY --from=builder /app/build /usr/share/nginx/html
# COPY --from=builder /app/.env /usr/share/nginx/html/.env
# # Create a proper Nginx configuration
# RUN echo 'server { \
#     listen 3000 default_server; \
#     listen [::]:3000 default_server; \
#     server_name _; \
#     \
#     location / { \
#         root /usr/share/nginx/html; \
#         index index.html index.htm; \
#         try_files $uri $uri/ /index.html; \
#     } \
#     \
#     location /health { \
#         access_log off; \
#         add_header Content-Type text/plain; \
#         return 200 '"'"'healthy'"'"'; \
#     } \
#     \
#     error_page 500 502 503 504 /50x.html; \
#     location = /50x.html { \
#         root /usr/share/nginx/html; \
#     } \
# }' > /etc/nginx/conf.d/default.conf
# # Add env handling for runtime configuration
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
# Clean install dependencies
RUN npm cache clean --force && \
    npm install --legacy-peer-deps && \
    npm install --save dotenv @babel/plugin-proposal-private-property-in-object
# Copy source code
COPY . .
# Create a custom fix for the https module inside src directory
RUN mkdir -p src/polyfills && \
    echo "// https polyfill for browser" > src/polyfills/https.js && \
    echo "export default {};" >> src/polyfills/https.js

# Create a polyfill for the https Agent in browser
RUN mkdir -p src/services && \
    echo "// Polyfill for browser environment" > src/services/https-polyfill.js && \
    echo "const https = {" >> src/services/https-polyfill.js && \
    echo "  Agent: function(options) {" >> src/services/https-polyfill.js && \
    echo "    // This is a dummy Agent that does nothing in the browser" >> src/services/https-polyfill.js && \
    echo "    return {};" >> src/services/https-polyfill.js && \
    echo "  }" >> src/services/https-polyfill.js && \
    echo "};" >> src/services/https-polyfill.js && \
    echo "export default https;" >> src/services/https-polyfill.js

# Modify any imports of 'https' to use our local polyfill
RUN find src -type f -name "*.js" -exec sed -i 's/from ['\''"]https['\''"]]/from '\''..\/polyfills\/https'\''/g' {} \; || true && \
    find src -type f -name "*.jsx" -exec sed -i 's/from ['\''"]https['\''"]]/from '\''..\/polyfills\/https'\''/g' {} \; || true && \
    find src -type f -name "*.ts" -exec sed -i 's/from ['\''"]https['\''"]]/from '\''..\/polyfills\/https'\''/g' {} \; || true && \
    find src -type f -name "*.tsx" -exec sed -i 's/from ['\''"]https['\''"]]/from '\''..\/polyfills\/https'\''/g' {} \; || true

# Fix the require https pattern
RUN find src -type f -name "*.js" -exec sed -i 's/require(['\''"]https['\''"])/import https from "..\/services\/https-polyfill"/g' {} \; || true && \
    find src -type f -name "*.jsx" -exec sed -i 's/require(['\''"]https['\''"])/import https from "..\/services\/https-polyfill"/g' {} \; || true

# Also update the specific line in api.service.js
RUN sed -i '/new (require.*https.*Agent)/c\  // SSL verification is handled by the browser' src/services/api.service.js || true

# Set up environment variables
RUN touch .env
RUN echo "REACT_APP_API_URL=https://imdb-backend.jayachandran.xyz" >> .env
RUN echo "NODE_ENV=development" >> .env
# Build the app
RUN CI=false npm run build
# Production stage with Nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/.env /usr/share/nginx/html/.env
# Create a proper Nginx configuration
RUN echo 'server { \
    listen 3000 default_server; \
    listen [::]:3000 default_server; \
    server_name _; \
    \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location /health { \
        access_log off; \
        add_header Content-Type text/plain; \
        return 200 '"'"'healthy'"'"'; \
    } \
    \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
        root /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf
# Add env handling for runtime configuration
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
