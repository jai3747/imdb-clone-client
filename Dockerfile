# FROM node:18-alpine AS builder
# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Clean install with specific resolutions
# RUN npm cache clean --force && \
#     rm -f package-lock.json && \
#     npm install --legacy-peer-deps --force

# # Copy source code
# COPY . .

# # Set environment variable to skip optional dependencies
# ENV SKIP_OPTIONAL_DEPENDENCIES=true

# # Build with specific dependency versions
# RUN npm install --save --legacy-peer-deps \
#     ajv@^6.12.6 \
#     ajv-keywords@^3.5.2 && \
#     npm run build

# # Production stage
# FROM nginx:alpine
# COPY --from=builder /app/build /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
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
