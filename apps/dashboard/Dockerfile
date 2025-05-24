# Dashboard Dockerfile
FROM node:18-alpine AS base

# Install pnpm (same version as lockfile was created with)
RUN npm install -g pnpm@9.15.4

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build the dashboard
RUN pnpm run build:dashboard

# Production stage
FROM node:18-alpine AS production

RUN npm install -g pnpm@9.15.4

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/ ./packages/

# Install production dependencies only
RUN pnpm install --no-frozen-lockfile --prod

# Copy built application
COPY --from=base /app/apps/dashboard/.next ./apps/dashboard/.next
COPY --from=base /app/apps/dashboard/public ./apps/dashboard/public
COPY --from=base /app/apps/dashboard/package.json ./apps/dashboard/
COPY --from=base /app/packages ./packages

EXPOSE 3000

CMD ["pnpm", "run", "start:dashboard"]
