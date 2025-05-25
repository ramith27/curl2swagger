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

# Debug: Check where Next.js is installed and workspace structure
RUN echo "=== Checking root node_modules ==="
RUN ls -la /app/node_modules/ | grep next || echo "Next.js not in root node_modules"
RUN echo "=== Checking dashboard directory ==="
RUN ls -la /app/apps/dashboard/ || echo "Dashboard directory contents"
RUN echo "=== Looking for next executable ==="
RUN find /app -name "next" -type f 2>/dev/null | head -5 || echo "Could not find next executable"
RUN echo "=== Checking pnpm workspace ==="
RUN pnpm list --depth=0 || echo "pnpm list failed"
RUN echo "=== Trying to find next with which ==="
RUN which next || echo "next not in PATH"
RUN echo "=== Trying pnpm which next ==="
RUN pnpm exec which next || echo "pnpm exec which next failed"

# Try to build Next.js using the correct approach
RUN echo "=== Attempting to run Next.js build ==="
RUN cd /app && pnpm --filter=@curl2swagger/dashboard exec next build

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
