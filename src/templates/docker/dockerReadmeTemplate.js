// README.docker.md template generator

/**
 * Generate Docker README template
 * @param {string} dbChoice - Database choice: 'mongodb', 'mysql', or 'memory'
 * @param {string} projectName - Project name
 * @returns {string} README.docker.md content
 */
export function getDockerReadmeTemplate(dbChoice, projectName) {
    const dbSection = getDbSection(dbChoice, projectName);
    const uiAccess = getUIAccess(dbChoice);
    const dbCommands = getDbCommands(dbChoice, projectName);
    const envVars = getEnvVars(dbChoice, projectName);
    const dbLogs = dbChoice === 'mongodb' ? 'docker-compose logs mongodb' : 
                  dbChoice === 'mysql' ? 'docker-compose logs mysql' : '';
    const learnMore = getLearnMore(dbChoice);

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
${getServicesStarted(dbChoice)}

### 2. View Logs

\`\`\`bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
${dbLogs}
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

${dbCommands}

## 📋 Environment Variables

Edit your \`.env\` file:

\`\`\`env
NODE_ENV=development
PORT=3000
${envVars}
\`\`\`

## 🔒 Production Deployment

### Build for Production
\`\`\`bash
# Build image
docker build -t ${projectName}:latest .

# Tag for registry
docker tag ${projectName}:latest your-registry/${projectName}:latest

# Push to registry
docker push your-registry/${projectName}:latest
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
${dbLogs}

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
${learnMore}
`;
}

/**
 * Get database-specific section
 */
function getDbSection(dbChoice, projectName) {
    if (dbChoice === 'mongodb') {
        return `### MongoDB
- **Database**: Running on port 27017
- **Data**: Persisted in Docker volume \`mongodb-data\`
- **Connection**: \`mongodb://mongodb:27017/${projectName}\`

### Mongo Express (Database UI)
- **URL**: http://localhost:8081
- **Username**: Set via \`MONGO_EXPRESS_USER\` in .env (default: admin)
- **Password**: Auto-generated secure password (see docker-compose.yml or set \`MONGO_EXPRESS_PASSWORD\` in .env)
- View and manage your MongoDB data through a web interface
- ⚠️  **Security**: Change default credentials in production!
`;
    } else if (dbChoice === 'mysql') {
        return `### MySQL
- **Database**: Running on port 3306
- **Data**: Persisted in Docker volume \`mysql-data\`
- **Root Password**: Auto-generated secure password (see docker-compose.yml or set \`DB_PASSWORD\` in .env)
- **Database Name**: Set in .env as \`DB_NAME\` (default: ${projectName})
- ⚠️  **Security**: Set strong \`DB_PASSWORD\` in .env for production!

### phpMyAdmin (Database UI)
- **URL**: http://localhost:8080
- **Username**: root
- **Password**: Same as DB_PASSWORD from docker-compose.yml or .env
- Manage your MySQL database through a web interface
`;
    }
    return '';
}

/**
 * Get UI access information
 */
function getUIAccess(dbChoice) {
    if (dbChoice === 'mongodb') {
        return '\n🌐 **Mongo Express UI**: http://localhost:8081 (credentials in docker-compose.yml)';
    } else if (dbChoice === 'mysql') {
        return '\n🌐 **phpMyAdmin**: http://localhost:8080 (root/[see docker-compose.yml])';
    }
    return '';
}

/**
 * Get services started list
 */
function getServicesStarted(dbChoice) {
    if (dbChoice === 'mongodb') {
        return '- MongoDB database\n- Mongo Express UI';
    } else if (dbChoice === 'mysql') {
        return '- MySQL database\n- phpMyAdmin UI';
    }
    return '';
}

/**
 * Get database-specific commands
 */
function getDbCommands(dbChoice, projectName) {
    if (dbChoice === 'mongodb') {
        return `### MongoDB Commands
\`\`\`bash
# Access MongoDB shell
docker-compose exec mongodb mongosh

# Backup database
docker-compose exec mongodb mongodump --out=/data/backup

# Restore database
docker-compose exec mongodb mongorestore /data/backup
\`\`\`
`;
    } else if (dbChoice === 'mysql') {
        return `### MySQL Commands
\`\`\`bash
# Access MySQL shell
docker-compose exec mysql mysql -u root -p

# Backup database
docker-compose exec mysql mysqldump -u root -p${projectName} > backup.sql

# Restore database
docker-compose exec mysql mysql -u root -p${projectName} < backup.sql
\`\`\`
`;
    }
    return '';
}

/**
 * Get environment variables section
 */
function getEnvVars(dbChoice, projectName) {
    if (dbChoice === 'mongodb') {
        return `MONGODB_URI=mongodb://mongodb:27017/${projectName}`;
    } else if (dbChoice === 'mysql') {
        return `DB_HOST=mysql
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=${projectName}`;
    }
    return '';
}

/**
 * Get learn more links
 */
function getLearnMore(dbChoice) {
    if (dbChoice === 'mongodb') {
        return '- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)';
    } else if (dbChoice === 'mysql') {
        return '- [MySQL Docker Hub](https://hub.docker.com/_/mysql)';
    }
    return '';
}
