// Environment variables template generator

/**
 * Generate .env template based on database choice
 * @param {string} dbChoice - Database choice: 'mongodb', 'mysql', or 'memory'
 * @param {string} projectName - Project name for database naming
 * @returns {string} .env template content
 */
export function getEnvTemplate(dbChoice, projectName) {
    let template = `PORT=3000
NODE_ENV=development

# CORS Configuration
# Comma-separated list of allowed origins for production
# ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com
`;
    
    if (dbChoice === 'mongodb') {
        template += `
# MongoDB Connection
# Development (no authentication):
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=${projectName}
# MONGODB_USER=
# MONGODB_PASSWORD=

# Production (with authentication - REQUIRED!):
# MONGODB_HOST=your-production-host
# MONGODB_PORT=27017
# MONGODB_USER=your-mongodb-user
# MONGODB_PASSWORD=your-secure-password
# MONGODB_DATABASE=${projectName}
#
# MongoDB Atlas (cloud):
# For Atlas, use the host from your connection string without mongodb://
# Example: MONGODB_HOST=cluster0.abcde.mongodb.net
# Then enable authentication with your Atlas credentials
`;
    } else if (dbChoice === 'mysql') {
        template += `
# MySQL Connection
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=${projectName}

# Production MySQL (with strong password - REQUIRED!):
# DB_HOST=your-production-host
# DB_USER=your-db-user
# DB_PASSWORD=your-secure-password
# DB_NAME=${projectName}
`;
    }
    
    template += `
# Security Notes:
# 1. Never commit .env files to git!
# 2. Use strong passwords in production
# 3. Enable SSL/TLS for database connections in production
# 4. Set ALLOWED_ORIGINS to your production domains
`;
    
    return template;
}
