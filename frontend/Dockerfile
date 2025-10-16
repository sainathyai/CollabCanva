# Frontend Dockerfile for CollabCanvas
# Using Node 20 LTS for best compatibility with Konva and React 19
# Using full node image instead of alpine to avoid esbuild binary issues
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN rm -rf node_modules package-lock.json && \
  npm install --include=optional

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

