# Stage 1: Build Frontend and Backend
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Frontend
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Build Backend (Server)
RUN npx tsc -p tsconfig.server.json

# Stage 2: Run Server
FROM node:20-alpine
WORKDIR /app

# Copy production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend (dist) and backend (dist-server)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/server/schema.sql ./server/schema.sql
COPY --from=builder /app/public ./public

# Expose the API port (standard 5000)
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist-server/server/index.js"]
