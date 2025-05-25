# Docker Setup Guide

This guide explains how to run curl2swagger using Docker for both development and production environments.

## Prerequisites

- Docker Engine 20.10+ 
- Docker Compose 2.0+
- At least 4GB RAM available for Docker

## Quick Start

### Development Environment

1. **Clone and setup environment**:
   ```bash
   git clone <repository-url>
   cd curl2swagger
   cp .env.example .env
   ```

2. **Start development environment**:
   ```bash
   npm run docker:dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3003
   - Database: localhost:5432
   - Redis: localhost:6379

### Production Environment

1. **Setup environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Deploy production**:
   ```bash
   npm run docker:prod
   ```

## Available Commands

```bash
# Development
npm run docker:dev          # Start development environment
npm run docker:dev:down     # Stop development environment

# Production  
npm run docker:prod         # Start production environment
npm run docker:up           # Start production (alternative)
npm run docker:down         # Stop all services

# Maintenance
npm run docker:build        # Build all images
npm run docker:logs         # View logs from all services
npm run docker:clean        # Remove all containers and volumes
```

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://curl2swagger:password123@postgres:5432/curl2swagger
POSTGRES_DB=curl2swagger
POSTGRES_USER=curl2swagger
POSTGRES_PASSWORD=password123

# Redis
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Application
BACKEND_PORT=3003
FRONTEND_URL=http://localhost:3002
NEXT_PUBLIC_API_URL=http://localhost:3003
```

### Production Overrides

For production deployment, override these variables:

```bash
# Use strong passwords
POSTGRES_PASSWORD=your-strong-database-password
JWT_SECRET=your-very-long-and-random-jwt-secret

# Use your domain
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Architecture

### Services

1. **postgres**: PostgreSQL database (port 5432)
2. **redis**: Redis cache (port 6379)  
3. **backend**: NestJS API server (port 3003)
4. **dashboard**: Next.js frontend (port 3002)

### Volumes

- `postgres_data`: Persistent database storage
- `redis_data`: Redis persistence
- Development: Source code mounted for hot reload

### Networks

- `curl2swagger-network`: Default network for service communication
- `curl2swagger-dev-network`: Development network

## Development Features

The development setup includes:

- **Hot Reload**: Source code changes trigger automatic rebuilds
- **Volume Mounts**: Live code editing without container rebuilds
- **Debug Ports**: All services expose ports for debugging
- **Watch Mode**: File watching for automatic restarts

## Production Optimizations

The production setup includes:

- **Multi-stage Builds**: Optimized image sizes
- **Non-root Users**: Enhanced security
- **Health Checks**: Service availability monitoring
- **Restart Policies**: Automatic recovery from failures
- **Minimal Dependencies**: Only runtime dependencies included

## Database Migrations

Run database migrations:

```bash
# Development
docker-compose -f docker-compose.dev.yml exec backend pnpm run prisma:migrate

# Production  
docker-compose exec backend pnpm run prisma:deploy
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3002, 3003, 5432, 6379 are available
2. **Memory issues**: Increase Docker memory limit to 4GB+
3. **Permission errors**: Check file permissions on mounted volumes

### Logs

View service logs:
```bash
# All services
npm run docker:logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f dashboard
```

### Reset Environment

Complete reset:
```bash
npm run docker:clean
docker volume prune -f
npm run docker:dev
```

## Security Considerations

### Development
- Default passwords are used for convenience
- All services exposed on localhost
- Debug information available

### Production  
- **Change all default passwords**
- **Use strong JWT secrets**  
- **Configure firewall rules**
- **Use HTTPS with proper certificates**
- **Regular security updates**

## Performance Tuning

### Database
```yaml
postgres:
  environment:
    POSTGRES_SHARED_PRELOAD_LIBRARIES: pg_stat_statements
    POSTGRES_MAX_CONNECTIONS: 100
```

### Redis
```yaml
redis:
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### Backend
```yaml
backend:
  environment:
    NODE_OPTIONS: --max-old-space-size=2048
```

## Monitoring

Add monitoring stack:

```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
```
