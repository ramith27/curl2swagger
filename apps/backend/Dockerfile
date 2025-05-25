# Backend Dockerfile
FROM node:18-alpine AS base

# Install system dependencies needed for native module compilation
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm@9.15.4

# Set working directory
WORKDIR /app

# Copy package files for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/ ./packages/

# Copy Prisma schema before installing dependencies
COPY apps/backend/prisma ./apps/backend/prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend/src ./apps/backend/src
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/nest-cli.json ./apps/backend/
COPY tsconfig.base.json ./

# Generate Prisma client
RUN cd apps/backend && pnpm exec prisma generate

# Build the backend
RUN cd apps/backend && pnpm run build

# Production stage
FROM node:18-alpine AS production

# Install system dependencies needed for native module compilation (required for tree-sitter)
RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm@9.15.4

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/ ./packages/

# Copy Prisma schema before installing dependencies
COPY apps/backend/prisma ./apps/backend/prisma/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=base /app/apps/backend/dist ./apps/backend/dist
COPY --from=base /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=base /app/packages ./packages

# Copy start script
COPY apps/backend/start.sh ./apps/backend/start.sh
RUN chmod +x ./apps/backend/start.sh

# Generate Prisma client for production
RUN cd apps/backend && pnpm exec prisma generate

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nest -u 1001

# Change ownership to nest user
RUN chown -R nest:nodejs /app

USER nest

EXPOSE 3003

WORKDIR /app/apps/backend

CMD ["./start.sh"]