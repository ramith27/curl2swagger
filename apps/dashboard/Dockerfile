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

# Copy source code before installing dependencies
COPY apps/dashboard ./apps/dashboard

# Configure pnpm to not hoist dependencies
RUN echo "shamefully-hoist=false" > /app/.npmrc
RUN echo "node-linker=isolated" >> /app/.npmrc

# Install dependencies with the new configuration
RUN pnpm install --frozen-lockfile

# Debug: Check if Next.js is properly installed
RUN echo "=== Checking Next.js installation ==="
RUN ls -la /app/apps/dashboard/node_modules/.bin/ | grep next || echo "Next.js not found in dashboard node_modules"
RUN find /app -name "next" -type d | head -5

# Build the dashboard using npx instead of pnpm to bypass workspace issues
RUN echo "=== Building dashboard with npx ==="
RUN cd /app/apps/dashboard && npx next build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy the standalone build (includes all necessary dependencies)
COPY --from=base /app/apps/dashboard/.next/standalone ./
COPY --from=base /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=base /app/apps/dashboard/public ./apps/dashboard/public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "apps/dashboard/server.js"]
