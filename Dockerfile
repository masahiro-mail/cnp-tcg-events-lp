FROM node:18-alpine

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Clean npm cache and install dependencies
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --production=false

# Copy source code
COPY . .

# Set Node options for build
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build application
RUN npm run build

# Remove development dependencies and rebuild for production
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]