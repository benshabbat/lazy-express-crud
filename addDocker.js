#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we're in an Express CRUD project
const currentDir = process.cwd();
const packageJsonPath = path.join(currentDir, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: Not in an Express CRUD project directory');
    console.error('Please run this command from the root of your Express CRUD project');
    process.exit(1);
}

// Detect database type from package.json
let dbChoice = 'memory';
try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    if (dependencies.mongoose) {
        dbChoice = 'mongodb';
        console.log('✅ Detected: MongoDB (mongoose)');
    } else if (dependencies.mysql2) {
        dbChoice = 'mysql';
        console.log('✅ Detected: MySQL (mysql2)');
    } else {
        console.log('ℹ️  No database detected, creating Docker setup for Node.js app only');
    }
} catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    process.exit(1);
}

console.log(`\n🐳 Setting up Docker for ${dbChoice === 'mongodb' ? 'MongoDB' : dbChoice === 'mysql' ? 'MySQL' : 'Node.js app'}...\n`);

// Get project name from package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const projectName = packageJson.name || 'express-app';

// Dockerfile template
const dockerfileTemplate = `# Multi-stage build for smaller image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

# Copy dependencies and source from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
`;

// .dockerignore template
const dockerignoreTemplate = `node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
.vscode
.idea
*.log
*.md
!README.md
.DS_Store
coverage
.nyc_output
dist
build
`;

// Docker Compose templates based on database
const getDockerComposeTemplate = (db, projName) => {
    const baseService = {
        app: `  app:
    build: .
    container_name: ${projName}-app
    restart: unless-stopped
    ports:
      - "\${PORT:-3000}:3000"
    environment:
      - NODE_ENV=\${NODE_ENV:-development}
      - PORT=3000`
    };

    if (db === 'mongodb') {
        return `version: '3.8'

services:
${baseService.app}
      - MONGODB_URI=mongodb://mongodb:27017/${projName}
    depends_on:
      - mongodb
    networks:
      - app-network

  mongodb:
    image: mongo:7
    container_name: ${projName}-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=${projName}
    volumes:
      - mongodb-data:/data/db
    networks:
      - app-network

  mongo-express:
    image: mongo-express:latest
    container_name: ${projName}-mongo-express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongodb
      - ME_CONFIG_MONGODB_PORT=27017
      - ME_CONFIG_BASICAUTH_USERNAME=admin
      - ME_CONFIG_BASICAUTH_PASSWORD=admin123
    depends_on:
      - mongodb
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongodb-data:
    driver: local
`;
    } else if (db === 'mysql') {
        return `version: '3.8'

services:
${baseService.app}
      - DB_HOST=mysql
      - DB_USER=\${DB_USER:-root}
      - DB_PASSWORD=\${DB_PASSWORD:-rootpassword}
      - DB_NAME=\${DB_NAME:-${projName}}
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - app-network

  mysql:
    image: mysql:8.0
    container_name: ${projName}-mysql
    restart: unless-stopped
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=\${DB_PASSWORD:-rootpassword}
      - MYSQL_DATABASE=\${DB_NAME:-${projName}}
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p\${DB_PASSWORD:-rootpassword}"]
      interval: 10s
      timeout: 5s
      retries: 5

  phpmyadmin:
    image: phpmyadmin:latest
    container_name: ${projName}-phpmyadmin
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      - PMA_HOST=mysql
      - PMA_PORT=3306
      - PMA_USER=root
      - PMA_PASSWORD=\${DB_PASSWORD:-rootpassword}
    depends_on:
      - mysql
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mysql-data:
    driver: local
`;
    } else {
        // In-memory - just Node.js app
        return `version: '3.8'

services:
${baseService.app}
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
`;
    }
};

// README.docker.md template
const getDockerReadmeTemplate = (db, projName) => {
    let dbSection = '';
    let uiAccess = '';
    
    if (db === 'mongodb') {
        dbSection = `### MongoDB
- **Database**: Running on port 27017
- **Data**: Persisted in Docker volume \`mongodb-data\`
- **Connection**: \`mongodb://mongodb:27017/${projName}\`

### Mongo Express (Database UI)
- **URL**: http://localhost:8081
- **Username**: admin
- **Password**: admin123
- View and manage your MongoDB data through a web interface
`;
        uiAccess = '\n🌐 **Mongo Express UI**: http://localhost:8081 (admin/admin123)';
    } else if (db === 'mysql') {
        dbSection = `### MySQL
- **Database**: Running on port 3306
- **Data**: Persisted in Docker volume \`mysql-data\`
- **Root Password**: Set in .env as \`DB_PASSWORD\` (default: rootpassword)
- **Database Name**: Set in .env as \`DB_NAME\` (default: ${projName})

### phpMyAdmin (Database UI)
- **URL**: http://localhost:8080
- **Username**: root
- **Password**: Your DB_PASSWORD from .env
- Manage your MySQL database through a web interface
`;
        uiAccess = '\n🌐 **phpMyAdmin**: http://localhost:8080 (root/your-db-password)';
    }

    return `# Docker Setup Guide

## 🐳 What's Included

### Node.js Application
- **Container**: Multi-stage build for smaller image size
- **Port**: 3000
- **User**: Non-root user for security
- **Health Check**: Automatic health monitoring

${dbSection}

## 🚀 Quick Start

### 1. Start All Services

\`\`\`bash
docker-compose up -d
\`\`\`

This will start:
- Your Node.js application
${db === 'mongodb' ? '- MongoDB database\n- Mongo Express UI' : db === 'mysql' ? '- MySQL database\n- phpMyAdmin UI' : ''}

### 2. View Logs

\`\`\`bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
${db === 'mongodb' ? 'docker-compose logs -f mongodb' : db === 'mysql' ? 'docker-compose logs -f mysql' : ''}
\`\`\`

### 3. Access Your Application

📱 **API**: http://localhost:3000${uiAccess}

## 🛠️ Common Commands

### Stop Services
\`\`\`bash
docker-compose down
\`\`\`

### Stop and Remove Volumes (⚠️ Deletes all data)
\`\`\`bash
docker-compose down -v
\`\`\`

### Rebuild Containers
\`\`\`bash
docker-compose up -d --build
\`\`\`

### View Running Containers
\`\`\`bash
docker-compose ps
\`\`\`

### Execute Commands in Container
\`\`\`bash
# Access app container shell
docker-compose exec app sh

# Run npm commands
docker-compose exec app npm install <package>
\`\`\`

${db === 'mongodb' ? `### MongoDB Commands
\`\`\`bash
# Access MongoDB shell
docker-compose exec mongodb mongosh

# Backup database
docker-compose exec mongodb mongodump --out=/data/backup

# Restore database
docker-compose exec mongodb mongorestore /data/backup
\`\`\`
` : db === 'mysql' ? `### MySQL Commands
\`\`\`bash
# Access MySQL shell
docker-compose exec mysql mysql -u root -p

# Backup database
docker-compose exec mysql mysqldump -u root -p${projName} > backup.sql

# Restore database
docker-compose exec mysql mysql -u root -p${projName} < backup.sql
\`\`\`
` : ''}

## 📋 Environment Variables

Edit your \`.env\` file:

\`\`\`env
NODE_ENV=development
PORT=3000
${db === 'mongodb' ? `MONGODB_URI=mongodb://mongodb:27017/${projName}` : db === 'mysql' ? `DB_HOST=mysql
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=${projName}` : ''}
\`\`\`

## 🔒 Production Deployment

### Build for Production
\`\`\`bash
# Build image
docker build -t ${projName}:latest .

# Tag for registry
docker tag ${projName}:latest your-registry/${projName}:latest

# Push to registry
docker push your-registry/${projName}:latest
\`\`\`

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
\`\`\`bash
# Check logs
docker-compose logs app

# Rebuild
docker-compose up -d --build --force-recreate
\`\`\`

### Database connection issues
\`\`\`bash
# Verify database is running
docker-compose ps

# Check database logs
${db === 'mongodb' ? 'docker-compose logs mongodb' : db === 'mysql' ? 'docker-compose logs mysql' : ''}

# Restart services
docker-compose restart
\`\`\`

### Port already in use
\`\`\`bash
# Check what's using the port
${process.platform === 'win32' ? 'netstat -ano | findstr :3000' : 'lsof -i :3000'}

# Change port in .env
PORT=3001
docker-compose up -d
\`\`\`

## 📚 Learn More

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
${db === 'mongodb' ? '- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)' : db === 'mysql' ? '- [MySQL Docker Hub](https://hub.docker.com/_/mysql)' : ''}
`;
};

// Create Dockerfile
fs.writeFileSync(path.join(currentDir, 'Dockerfile'), dockerfileTemplate);
console.log('✅ Created Dockerfile');

// Create .dockerignore
fs.writeFileSync(path.join(currentDir, '.dockerignore'), dockerignoreTemplate);
console.log('✅ Created .dockerignore');

// Create docker-compose.yml
const dockerComposeContent = getDockerComposeTemplate(dbChoice, projectName);
fs.writeFileSync(path.join(currentDir, 'docker-compose.yml'), dockerComposeContent);
console.log('✅ Created docker-compose.yml');

// Create README.docker.md
const dockerReadmeContent = getDockerReadmeTemplate(dbChoice, projectName);
fs.writeFileSync(path.join(currentDir, 'README.docker.md'), dockerReadmeContent);
console.log('✅ Created README.docker.md');

// Update .env if needed
const envPath = path.join(currentDir, '.env');
if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    let needsUpdate = false;
    
    if (dbChoice === 'mongodb' && !envContent.includes('# Docker')) {
        envContent += `\n# Docker MongoDB Connection (when using docker-compose)
# MONGODB_URI=mongodb://mongodb:27017/${projectName}
`;
        needsUpdate = true;
    } else if (dbChoice === 'mysql' && !envContent.includes('# Docker')) {
        envContent += `\n# Docker MySQL Connection (when using docker-compose)
# DB_HOST=mysql
# DB_USER=root
# DB_PASSWORD=rootpassword
# DB_NAME=${projectName}
`;
        needsUpdate = true;
    }
    
    if (needsUpdate) {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Updated .env with Docker configuration');
    }
}

// Add health check endpoint to server.js if it doesn't exist
const serverPath = path.join(currentDir, 'src', 'server.js');
if (fs.existsSync(serverPath)) {
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    if (!serverContent.includes('/health')) {
        // Find the last route definition (before error handling)
        const insertPoint = serverContent.indexOf('// Error handling middleware');
        if (insertPoint !== -1) {
            const healthRoute = `\n// Health check endpoint for Docker\napp.get('/health', (req, res) => {\n    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });\n});\n\n`;
            serverContent = serverContent.slice(0, insertPoint) + healthRoute + serverContent.slice(insertPoint);
            fs.writeFileSync(serverPath, serverContent);
            console.log('✅ Added /health endpoint to server.js');
        }
    }
}

console.log('\n✨ Docker setup complete!\n');

console.log('📋 Next steps:');
console.log('  1. Review docker-compose.yml and .env configuration');
console.log('  2. Start services: docker-compose up -d');
console.log('  3. View logs: docker-compose logs -f');
console.log('  4. Access your API: http://localhost:3000');

if (dbChoice === 'mongodb') {
    console.log('  5. Mongo Express UI: http://localhost:8081 (admin/admin123)');
} else if (dbChoice === 'mysql') {
    console.log('  5. phpMyAdmin: http://localhost:8080');
}

console.log('\n📖 Full documentation: README.docker.md');
console.log('\n🐳 Happy Dockerizing!');
