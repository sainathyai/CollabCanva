# Backend Dockerfile for CollabCanvas
# Using Node 20 LTS for stability
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for TypeScript)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose WebSocket port
EXPOSE 8080

# Start server
CMD ["npm", "start"]
