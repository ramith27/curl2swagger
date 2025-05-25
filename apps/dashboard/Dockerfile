# Dashboard Dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9.15.4

# Set working directory
WORKDIR /app

# Copy package files for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/dashboard ./apps/dashboard
COPY tsconfig.base.json ./

# Build the dashboard
RUN cd apps/dashboard && pnpm run build

# Production stage
FROM node:18-alpine AS production

RUN npm install -g pnpm@9.15.4

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/ ./packages/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=base /app/apps/dashboard/.next ./apps/dashboard/.next
COPY --from=base /app/apps/dashboard/public ./apps/dashboard/public
COPY --from=base /app/apps/dashboard/package.json ./apps/dashboard/
COPY --from=base /app/packages ./packages

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3002

CMD ["pnpm", "run", "start", "--filter=dashboard"]
