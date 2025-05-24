# Backend Dockerfile
FROM node:18-alpine AS base

# Install system dependencies needed for native module compilation
RUN apk add --no-cache python3 make g++

# Install pnpm (same version as lockfile was created with)
RUN npm install -g pnpm@9.15.4

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/ ./packages/

# Copy Prisma schema before installing dependencies (needed for postinstall script)
COPY apps/backend/prisma ./apps/backend/prisma/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client (redundant but kept for safety)
RUN cd apps/backend && pnpm exec prisma generate

# Build the backend
RUN pnpm run build:backend

# Production stage
FROM node:18-alpine AS production

# Install system dependencies for runtime (only Python, no build tools needed)
RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm@9.15.4

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/ ./packages/

# Copy Prisma schema before installing dependencies (needed for postinstall script)
COPY apps/backend/prisma ./apps/backend/prisma/

# Install production dependencies only
RUN pnpm install --no-frozen-lockfile --prod

# Copy built application
COPY --from=base /app/apps/backend/dist ./apps/backend/dist
COPY --from=base /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=base /app/packages ./packages

# Generate Prisma client for production
RUN cd apps/backend && pnpm exec prisma generate

EXPOSE 3001

CMD ["node", "apps/backend/dist/main.js"]
