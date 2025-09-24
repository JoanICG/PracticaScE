# Backend Dockerfile
FROM node:20-bookworm-slim

# Create app directory
WORKDIR /app

# Install dependencies
COPY backend/package*.json ./
RUN npm ci || npm install

# Copy source
COPY backend/. .
# Ensure no host-built native modules linger
RUN rm -rf node_modules && (npm ci || npm install)

# Expose port
EXPOSE 4000

# Start the app
CMD ["npm", "start"]
