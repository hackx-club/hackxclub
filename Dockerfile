# syntax=docker/dockerfile:1

# ------------------------------------------------------------------------------
# 1. Base stage
# ------------------------------------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app

# ------------------------------------------------------------------------------
# 2. Dependencies stage
# ------------------------------------------------------------------------------
FROM base AS deps
# Copy package manifests and .npmrc (contains legacy-peer-deps=true for React 19)
COPY package.json package-lock.json* .npmrc* ./

# Install clean deterministic dependencies using lockfile and npm caching
RUN npm ci

# ------------------------------------------------------------------------------
# 3. Builder stage
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variable arguments (with fallback stubs for CI/Docker builds)
ARG VITE_SUPABASE_URL=https://dummy.supabase.co
ARG VITE_SUPABASE_PUBLISHABLE_KEY=dummy_key
ARG VITE_SUPABASE_PROJECT_ID=dummy_id

ENV NODE_ENV=production \
    NITRO_PRESET=node-server \
    VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
    VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY} \
    VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}

# Build the Nitro and TanStack Start bundle to .output
RUN npm run build

# ------------------------------------------------------------------------------
# 4. Runner stage (Production minimal image)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    NITRO_PORT=3000 \
    NITRO_HOST=0.0.0.0

# Create an unprivileged non-root system user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy bundled production artifacts from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/.output ./.output

# Switch to unprivileged user
USER nodejs

# Expose web application port
EXPOSE 3000

# Container healthcheck probe using built-in Alpine wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

# Start the standalone Nitro server
CMD ["node", ".output/server/index.mjs"]
