# --- Stage 1: Builder ---
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# --- Stage 2: Production ---
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy local templates if necessary (usually they are copied to dist if configured in nest-cli.json, 
# but copying src structure might be needed for some assets depending on config)
# COPY --from=builder /app/src/mail/templates ./dist/mail/templates
# Nota: Asegúrate de que nest-cli.json incluya "assets" si tienes templates.

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/main"]
