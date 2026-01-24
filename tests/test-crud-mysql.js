#!/usr/bin/env node

/**
 * Automated CRUD testing with MySQL
 * Creates a test project with JavaScript and MySQL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
    getJestConfigJS,
    getTestTemplateMySQLJS,
} from '../test-templates.js';
import {
    getDatabaseConfigTemplate,
    getServerTemplate,
    getRoutesTemplate,
    getEnvTemplate,
    getGitignoreTemplate,
    getReadmeTemplate
} from '../src/templates/project/index.js';
import {
    sanitizeError,
    validateProjectName,
    getControllerTemplate,
    getServiceTemplate,
    getModelTemplate
} from '../shared-templates-new.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration constants
const projectName = 'test-mysql-crud';
const dbChoice = 'mysql';
const langChoice = 'javascript';
const resourceName = 'Customer';

console.log('🚀 Starting automated CRUD test with MySQL...\n');
console.log(`📁 Project: ${projectName}`);
console.log(`💾 Database: ${dbChoice}`);
console.log(`💻 Language: ${langChoice}`);
console.log(`📦 Resource: ${resourceName}\n`);

// Validate the project name
validateProjectName(projectName);

// Create project directory
const projectPath = path.join(process.cwd(), projectName);

// Check if directory already exists
if (fs.existsSync(projectPath)) {
    console.log(`⚠️  Directory "${projectName}" already exists. Removing it...`);
    fs.rmSync(projectPath, { recursive: true, force: true });
}

try {
    // Create project directory structure
    fs.mkdirSync(projectPath);
    fs.mkdirSync(path.join(projectPath, 'src'));
    fs.mkdirSync(path.join(projectPath, 'src', 'config'));
    fs.mkdirSync(path.join(projectPath, 'src', 'routes'));
    fs.mkdirSync(path.join(projectPath, 'src', 'controllers'));
    fs.mkdirSync(path.join(projectPath, 'src', 'services'));
    fs.mkdirSync(path.join(projectPath, 'src', 'models'));
    fs.mkdirSync(path.join(projectPath, '__tests__'));

    console.log('✅ Project directories created');

    // Create config files
    fs.writeFileSync(
        path.join(projectPath, 'src', 'config', 'database.js'),
        getDatabaseConfigTemplate(dbChoice)
    );

    // Create server.js
    fs.writeFileSync(
        path.join(projectPath, 'src', 'server.js'),
        getServerTemplate(resourceName, dbChoice)
    );

    // Create routes
    fs.writeFileSync(
        path.join(projectPath, 'src', 'routes', `${resourceName.toLowerCase()}Routes.js`),
        getRoutesTemplate(resourceName)
    );

    // Create controller
    fs.writeFileSync(
        path.join(projectPath, 'src', 'controllers', `${resourceName.toLowerCase()}Controller.js`),
        getControllerTemplate(resourceName, dbChoice, langChoice)
    );

    // Create service
    fs.writeFileSync(
        path.join(projectPath, 'src', 'services', `${resourceName.toLowerCase()}Service.js`),
        getServiceTemplate(resourceName, dbChoice, langChoice)
    );

    // Create model
    fs.writeFileSync(
        path.join(projectPath, 'src', 'models', `${resourceName}.js`),
        getModelTemplate(resourceName, dbChoice, langChoice)
    );

    console.log('✅ Source files created');

    // Create .env
    fs.writeFileSync(
        path.join(projectPath, '.env'),
        getEnvTemplate(dbChoice, projectName)
    );

    // Create .gitignore
    fs.writeFileSync(
        path.join(projectPath, '.gitignore'),
        getGitignoreTemplate()
    );

    // Create README.md
    fs.writeFileSync(
        path.join(projectPath, 'README.md'),
        getReadmeTemplate(projectName, dbChoice, langChoice)
    );

    console.log('✅ Config files created');

    // Create package.json
    const packageJson = {
        name: projectName,
        version: '1.0.0',
        description: 'Express CRUD API with MySQL',
        type: 'module',
        main: 'src/server.js',
        scripts: {
            start: 'node src/server.js',
            dev: 'node --watch src/server.js',
            test: 'node --experimental-vm-modules node_modules/jest/bin/jest.js',
            'init-db': 'node src/scripts/initDatabase.js'
        },
        keywords: ['express', 'crud', 'mysql', 'rest-api'],
        author: '',
        license: 'MIT',
        dependencies: {
            express: '^4.18.2',
            mysql2: '^3.6.5',
            dotenv: '^16.3.1',
            cors: '^2.8.5',
            helmet: '^7.1.0',
            'express-rate-limit': '^7.1.5'
        },
        devDependencies: {
            jest: '^29.7.0',
            supertest: '^6.3.3'
        }
    };

    fs.writeFileSync(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );

    console.log('✅ package.json created');

    // Create Jest config
    fs.writeFileSync(
        path.join(projectPath, 'jest.config.js'),
        getJestConfigJS()
    );

    // Create test file
    fs.writeFileSync(
        path.join(projectPath, '__tests__', `${resourceName.toLowerCase()}.test.js`),
        getTestTemplateMySQLJS(resourceName)
    );

    console.log('✅ Test files created');

    console.log('\n✨ Project created successfully!\n');
    console.log('📋 Next steps:');
    console.log(`   1. cd ${projectName}`);
    console.log('   2. npm install');
    console.log('   3. Update .env with your MySQL connection details');
    console.log('   4. npm run init-db  # Create database tables');
    console.log('   5. npm start');
    console.log('\n📝 Test your API:');
    console.log('   npm test');
    console.log('\n🎯 Available endpoints:');
    console.log(`   GET    /api/${resourceName.toLowerCase()}s`);
    console.log(`   GET    /api/${resourceName.toLowerCase()}s/:id`);
    console.log(`   POST   /api/${resourceName.toLowerCase()}s`);
    console.log(`   PUT    /api/${resourceName.toLowerCase()}s/:id`);
    console.log(`   DELETE /api/${resourceName.toLowerCase()}s/:id`);

} catch (error) {
    console.error('❌ Error creating project:', sanitizeError(error));
    process.exit(1);
}
