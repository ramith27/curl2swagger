# Backend Dockerfile
FROM node:18-slim AS base

# Install system dependencies needed for native module compilation and Prisma
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm and turbo
RUN npm install -g pnpm@9.15.4 turbo

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
COPY turbo.json ./

# Copy package source files
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/parser/src ./packages/parser/src
COPY packages/parser/tsconfig.json ./packages/parser/
COPY packages/infer/src ./packages/infer/src
COPY packages/infer/tsconfig.json ./packages/infer/

# Generate Prisma client
RUN cd apps/backend && pnpm exec prisma generate

# Build packages and backend using Turbo (handles dependencies automatically)
RUN pnpm run build:backend

# Production stage
FROM node:18-slim AS production

# Install system dependencies needed for native module compilation and Prisma
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    postgresql-client \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

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
COPY --from=base /app/tsconfig.base.json ./

# Copy start script
COPY apps/backend/start.sh ./apps/backend/start.sh
RUN chmod +x ./apps/backend/start.sh

# Generate Prisma client for production
RUN cd apps/backend && pnpm exec prisma generate

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nest

# Change ownership to nest user
RUN chown -R nest:nodejs /app

USER nest

EXPOSE 3003

WORKDIR /app/apps/backend

CMD ["./start.sh"]