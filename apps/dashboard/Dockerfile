# Dashboard Dockerfile
FROM node:18-alpine AS base

# Install pnpm and build tools for tree-sitter
RUN npm install -g pnpm@9.15.4
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy all package files for proper workspace setup
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/ ./packages/
COPY turbo.json ./
COPY tsconfig.base.json ./

# Install dependencies with proper workspace linking
RUN pnpm install --frozen-lockfile

# Copy source code after dependencies are installed
COPY apps/dashboard ./apps/dashboard

# Force pnpm to install dependencies in each package's node_modules
RUN echo "=== Installing dependencies with shamefully-hoist=false ==="
RUN pnpm install --frozen-lockfile --shamefully-hoist=false

# Debug: Check where Next.js is now installed
RUN echo "=== Checking dashboard node_modules ==="
RUN ls -la /app/apps/dashboard/node_modules/ | grep next || echo "Next.js not in dashboard node_modules"
RUN echo "=== Checking root node_modules ==="
RUN ls -la /app/node_modules/ | grep next || echo "Next.js not in root node_modules"

# Try to build Next.js using the correct approach
RUN echo "=== Attempting to run Next.js build ==="
RUN cd /app/apps/dashboard && pnpm build

# Production stage
FROM node:18-alpine AS runner

RUN npm install -g pnpm@9.15.4
RUN apk add --no-cache python3 make g++

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

EXPOSE 3000

CMD ["pnpm", "start:dashboard"]
