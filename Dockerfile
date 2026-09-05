# ==========================================================
# LifeLink Emergency Response - Production Container Image
# Multi-Stage Build: Fast, secure, lightweight Alpine base
# ==========================================================

# 1. Builder Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (including devDependencies for TypeScript & Vite)
COPY package*.json ./
RUN npm install

# Copy source code and build React frontend & Express backend
COPY . .
RUN npm run build

# 2. Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy compiled bundles from builder stage
COPY --from=builder /app/dist ./dist

# Use non-root node user for security
USER node

# Expose standard Cloud Run port
EXPOSE 8080

# Launch LifeLink emergency coordination server
CMD ["node", "dist/server.js"]
