#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
    validatePath,
    validateProjectName,
    readPackageJson,
    detectDatabase,
    fileExists,
    getProjectExtension
} from './src/utils/index.js';
import {
    getDockerfileTemplate,
    getDockerIgnoreTemplate,
    getDockerComposeTemplate,
    getDockerReadmeTemplate
} from './src/templates/docker/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we're in an Express CRUD project
const currentDir = process.cwd();
const packageJson = readPackageJson(currentDir);

if (!packageJson) {
    console.error('❌ Error: Not in an Express CRUD project directory');
    console.error('Please run this command from the root of your Express CRUD project');
    process.exit(1);
}

// Detect database type
const dbChoice = detectDatabase(currentDir);

if (dbChoice === 'mongodb') {
    console.log('✅ Detected: MongoDB (mongoose)');
} else if (dbChoice === 'mysql') {
    console.log('✅ Detected: MySQL (mysql2)');
} else {
    console.log('ℹ️  No database detected, creating Docker setup for Node.js app only');
}

console.log(`\n🐳 Setting up Docker for ${dbChoice === 'mongodb' ? 'MongoDB' : dbChoice === 'mysql' ? 'MySQL' : 'Node.js app'}...\n`);

// Get project name and validate it
let projectName;
try {
    projectName = validateProjectName(packageJson.name || 'express-app');
} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error('Using fallback name: express-app');
    projectName = 'express-app';
}

// Generate secure passwords if needed
const mongoExpressPassword = dbChoice === 'mongodb' ? crypto.randomBytes(16).toString('hex') : '';
const mysqlPassword = dbChoice === 'mysql' ? crypto.randomBytes(24).toString('hex') : '';

// Get templates
const dockerfileTemplate = getDockerfileTemplate();
const dockerignoreTemplate = getDockerIgnoreTemplate();
const dockerComposeContent = getDockerComposeTemplate(dbChoice, projectName, mongoExpressPassword, mysqlPassword);
const dockerReadmeContent = getDockerReadmeTemplate(dbChoice, projectName);

// Create Docker files with path validation
try {
    // Create Dockerfile
    const dockerfilePath = validatePath(path.join(currentDir, 'Dockerfile'));
    fs.writeFileSync(dockerfilePath, dockerfileTemplate);
    console.log('✅ Created Dockerfile');

    // Create .dockerignore
    const dockerignorePath = validatePath(path.join(currentDir, '.dockerignore'));
    fs.writeFileSync(dockerignorePath, dockerignoreTemplate);
    console.log('✅ Created .dockerignore');

    // Create docker-compose.yml
    const dockerComposePath = validatePath(path.join(currentDir, 'docker-compose.yml'));
    fs.writeFileSync(dockerComposePath, dockerComposeContent);
    console.log('✅ Created docker-compose.yml');

    // Create README.docker.md
    const dockerReadmePath = validatePath(path.join(currentDir, 'README.docker.md'));
    fs.writeFileSync(dockerReadmePath, dockerReadmeContent);
    console.log('✅ Created README.docker.md');
} catch (error) {
    console.error(`❌ Error: Failed to create Docker files: ${error.message}`);
    process.exit(1);
}

// Update .env if needed
const envPath = validatePath(path.join(currentDir, '.env'));
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

// Add health check endpoint to server.js/server.ts if it doesn't exist
const serverExt = getProjectExtension(currentDir);
const serverPath = validatePath(path.join(currentDir, 'src', `server.${serverExt}`));
if (fs.existsSync(serverPath)) {
    let serverContent = fs.readFileSync(serverPath, 'utf8');

    if (!serverContent.includes('/health')) {
        // Find the last route definition (before error handling)
        const insertPoint = serverContent.indexOf('// Error handling middleware');
        if (insertPoint !== -1) {
            const healthRoute = `\n// Health check endpoint for Docker\napp.get('/health', (req, res) => {\n    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });\n});\n\n`;
            serverContent = serverContent.slice(0, insertPoint) + healthRoute + serverContent.slice(insertPoint);
            fs.writeFileSync(serverPath, serverContent);
            console.log(`✅ Added /health endpoint to server.${serverExt}`);
        } else {
            console.log(`⚠️  Could not find insertion point in server.${serverExt} - please add a /health endpoint manually`);
        }
    }
} else {
    console.log(`⚠️  Could not find src/server.${serverExt} - please add a /health endpoint manually`);
}

console.log('\n✨ Docker setup complete!\n');

// Security warnings based on database type
if (dbChoice === 'mongodb') {
    console.log('🔒 Security Note:');
    console.log(`   Mongo Express credentials:`);
    console.log(`   - Username: admin (or set MONGO_EXPRESS_USER in .env)`);
    console.log(`   - Password: ${mongoExpressPassword ? mongoExpressPassword.substring(0, 16) + '...' : 'See docker-compose.yml'}`);
    console.log('   ⚠️  Change these in production!');
    console.log('');
} else if (dbChoice === 'mysql') {
    console.log('🔒 Security Note:');
    console.log(`   MySQL root password: ${mysqlPassword ? mysqlPassword.substring(0, 16) + '...' : 'See docker-compose.yml'}`);
    console.log('   ⚠️  Set DB_PASSWORD in .env for production!');
    console.log('');
}

console.log('📋 Next steps:');
console.log('  1. Review docker-compose.yml and .env configuration');
console.log('  2. Start services: docker-compose up -d');
console.log('  3. View logs: docker-compose logs -f');
console.log('  4. Access your API: http://localhost:3000');

if (dbChoice === 'mongodb') {
    console.log('  5. Mongo Express UI: http://localhost:8081');
} else if (dbChoice === 'mysql') {
    console.log('  5. phpMyAdmin: http://localhost:8080');
}

console.log('\n📖 Full documentation: README.docker.md');
console.log('\n🐳 Happy Dockerizing!');
