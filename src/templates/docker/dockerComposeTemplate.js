// docker-compose.yml templates for different databases

/**
 * Generate docker-compose.yml template based on database choice
 * @param {string} dbChoice - Database choice: 'mongodb', 'mysql', or 'memory'
 * @param {string} projectName - Project name for container naming
 * @param {string} mongoExpressPassword - Secure password for Mongo Express (if MongoDB)
 * @param {string} mysqlPassword - Secure password for MySQL (if MySQL)
 * @returns {string} docker-compose.yml content
 */
export function getDockerComposeTemplate(dbChoice, projectName, mongoExpressPassword = '', mysqlPassword = '') {
    const baseService = `  app:
    build: .
    container_name: ${projectName}-app
    restart: unless-stopped
    ports:
      - "\${PORT:-3000}:3000"
    environment:
      - NODE_ENV=\${NODE_ENV:-development}
      - PORT=3000`;

    if (dbChoice === 'mongodb') {
        return `version: '3.8'

services:
${baseService}
      - MONGODB_URI=mongodb://mongodb:27017/${projectName}
    depends_on:
      - mongodb
    networks:
      - app-network

  mongodb:
    image: mongo:7
    container_name: ${projectName}-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=${projectName}
    volumes:
      - mongodb-data:/data/db
    networks:
      - app-network

  mongo-express:
    image: mongo-express:latest
    container_name: ${projectName}-mongo-express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongodb
      - ME_CONFIG_MONGODB_PORT=27017
      - ME_CONFIG_BASICAUTH_USERNAME=\${MONGO_EXPRESS_USER:-admin}
      - ME_CONFIG_BASICAUTH_PASSWORD=\${MONGO_EXPRESS_PASSWORD:-${mongoExpressPassword}}
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
    } else if (dbChoice === 'mysql') {
        return `version: '3.8'

services:
${baseService}
      - DB_HOST=mysql
      - DB_USER=\${DB_USER:-root}
      - DB_PASSWORD=\${DB_PASSWORD:-${mysqlPassword}}
      - DB_NAME=\${DB_NAME:-${projectName}}
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - app-network

  mysql:
    image: mysql:8.0
    container_name: ${projectName}-mysql
    restart: unless-stopped
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=\${DB_PASSWORD:-${mysqlPassword}}
      - MYSQL_DATABASE=\${DB_NAME:-${projectName}}
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p\${DB_PASSWORD:-${mysqlPassword}}"]
      interval: 10s
      timeout: 5s
      retries: 5

  phpmyadmin:
    image: phpmyadmin:latest
    container_name: ${projectName}-phpmyadmin
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
${baseService}
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
`;
    }
}
