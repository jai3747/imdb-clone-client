FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install with specific resolutions
RUN npm cache clean --force && \
    rm -f package-lock.json && \
    npm install --legacy-peer-deps --force

# Copy source code
COPY . .

# Set environment variable to skip optional dependencies
ENV SKIP_OPTIONAL_DEPENDENCIES=true

# Build with specific dependency versions
RUN npm install --save --legacy-peer-deps \
    ajv@^6.12.6 \
    ajv-keywords@^3.5.2 && \
    npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]