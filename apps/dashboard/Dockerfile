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

# Install dependencies specifically for dashboard with node-linker=hoisted disabled
RUN echo "=== Setting up .npmrc to prevent hoisting ==="
RUN echo "node-linker=isolated" > /app/.npmrc
RUN echo "shamefully-hoist=false" >> /app/.npmrc

# Reinstall dependencies with isolated node-linker
RUN echo "=== Reinstalling with isolated node-linker ==="
RUN pnpm install --frozen-lockfile

# Alternative: Install Next.js directly in dashboard if still not found
RUN echo "=== Installing Next.js directly in dashboard if needed ==="
RUN cd /app/apps/dashboard && pnpm install next@14.0.3 --save-exact

# Build the dashboard
RUN echo "=== Building dashboard ==="
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
