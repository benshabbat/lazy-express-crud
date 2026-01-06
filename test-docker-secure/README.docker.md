# Docker Setup Guide

## 🐳 What's Included

### Node.js Application
- **Container**: Multi-stage build for smaller image size
- **Port**: 3000
- **User**: Non-root user for security
- **Health Check**: Automatic health monitoring



## 🚀 Quick Start

### 1. Start All Services

```bash
docker-compose up -d
```

This will start:
- Your Node.js application


### 2. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

```

### 3. Access Your Application

📱 **API**: http://localhost:3000

## 🛠️ Common Commands

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes all data)
```bash
docker-compose down -v
```

### Rebuild Containers
```bash
docker-compose up -d --build
```

### View Running Containers
```bash
docker-compose ps
```

### Execute Commands in Container
```bash
# Access app container shell
docker-compose exec app sh

# Run npm commands
docker-compose exec app npm install <package>
```



## 📋 Environment Variables

Edit your `.env` file:

```env
NODE_ENV=development
PORT=3000

```

## 🔒 Production Deployment

### Build for Production
```bash
# Build image
docker build -t test-docker-secure:latest .

# Tag for registry
docker tag test-docker-secure:latest your-registry/test-docker-secure:latest

# Push to registry
docker push your-registry/test-docker-secure:latest
```

### Production Best Practices
- ✅ Use secrets management (not .env files)
- ✅ Set strong database passwords
- ✅ Enable SSL/TLS for database connections
- ✅ Use reverse proxy (nginx/traefik)
- ✅ Set up monitoring (Prometheus/Grafana)
- ✅ Configure log aggregation
- ✅ Regular security updates
- ✅ Backup volumes regularly

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Rebuild
docker-compose up -d --build --force-recreate
```

### Database connection issues
```bash
# Verify database is running
docker-compose ps

# Check database logs


# Restart services
docker-compose restart
```

### Port already in use
```bash
# Check what's using the port
netstat -ano | findstr :3000

# Change port in .env
PORT=3001
docker-compose up -d
```

## 📚 Learn More

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

