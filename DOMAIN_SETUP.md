# Domain Configuration Guide

This guide explains how to configure curl2swagger to use custom domains instead of localhost.

## Quick Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file and update these values:**
   ```bash
   # Replace with your actual domains
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   
   # Set a strong JWT secret for production
   JWT_SECRET=your-super-secret-production-jwt-key
   ```

3. **Rebuild and restart the containers:**
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

## Domain Setup Options

### Option 1: Subdomain Setup (Recommended)
- Frontend: `https://curl2swagger.yourdomain.com`
- API: `https://api.curl2swagger.yourdomain.com`

### Option 2: Path-based Setup
- Frontend: `https://yourdomain.com`
- API: `https://yourdomain.com/api`

### Option 3: Separate Domains
- Frontend: `https://yourdomain.com`
- API: `https://api.yourdomain.com`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (must be accessible from browser) | `https://api.yourdomain.com` |
| `FRONTEND_URL` | Frontend URL (used for CORS and redirects) | `https://yourdomain.com` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secure-random-string` |

## Reverse Proxy Configuration

If you're using a reverse proxy (nginx, Apache, etc.), make sure to:

1. **Configure SSL certificates** for both domains
2. **Set up proper headers** for WebSocket support (for real-time features)
3. **Configure CORS** if domains are different

### Example Nginx Configuration

```nginx
# Frontend
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Backend API
server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Testing

After configuration, test the setup:

1. **Frontend**: Visit your frontend domain
2. **API Health**: Visit `https://api.yourdomain.com/health`
3. **API Docs**: Visit `https://api.yourdomain.com/api`

## Troubleshooting

### CORS Issues
If you get CORS errors, ensure `FRONTEND_URL` in the backend environment matches your frontend domain exactly.

### WebSocket Issues
If real-time features don't work, check that your reverse proxy supports WebSocket upgrades.

### SSL/HTTPS Issues
Ensure both domains have valid SSL certificates and all URLs use `https://`.
