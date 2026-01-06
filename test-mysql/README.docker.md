# Docker Setup Guide

## 🐳 What's Included

### Node.js Application
- **Container**: Multi-stage build for smaller image size
- **Port**: 3000
- **User**: Non-root user for security
- **Health Check**: Automatic health monitoring

### MySQL
- **Database**: Running on port 3306
- **Data**: Persisted in Docker volume `mysql-data`
- **Root Password**: Set in .env as `DB_PASSWORD` (default: rootpassword)
- **Database Name**: Set in .env as `DB_NAME` (default: test-mysql)

### phpMyAdmin (Database UI)
- **URL**: http://localhost:8080
- **Username**: root
- **Password**: Your DB_PASSWORD from .env
- Manage your MySQL database through a web interface


## 🚀 Quick Start

### 1. Start All Services

```bash
docker-compose up -d
```

This will start:
- Your Node.js application
- MySQL database
- phpMyAdmin UI

### 2. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mysql
```

### 3. Access Your Application

📱 **API**: http://localhost:3000
🌐 **phpMyAdmin**: http://localhost:8080 (root/your-db-password)

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

### MySQL Commands
```bash
# Access MySQL shell
docker-compose exec mysql mysql -u root -p

# Backup database
docker-compose exec mysql mysqldump -u root -ptest-mysql > backup.sql

# Restore database
docker-compose exec mysql mysql -u root -ptest-mysql < backup.sql
```


## 📋 Environment Variables

Edit your `.env` file:

```env
NODE_ENV=development
PORT=3000
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=test-mysql
```

## 🔒 Production Deployment

### Build for Production
```bash
# Build image
docker build -t test-mysql:latest .

# Tag for registry
docker tag test-mysql:latest your-registry/test-mysql:latest

# Push to registry
docker push your-registry/test-mysql:latest
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
docker-compose logs mysql

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
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)
