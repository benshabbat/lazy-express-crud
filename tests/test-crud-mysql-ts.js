#!/usr/bin/env node

/**
 * Automated CRUD testing with MySQL and TypeScript
 * Creates a test project with TypeScript and MySQL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
    getTsConfigTemplate,
    getTypesTemplate,
    getServerTemplateTS,
    getDatabaseConfigTemplateTS,
    getRoutesTemplateTS,
    getControllerTemplateTS,
    getServiceTemplateTS,
    getModelTemplateTS
} from '../typescript-templates-new.js';
import {
    getJestConfigTS,
    getTestTemplateMySQLTS,
} from '../src/templates/tests/index.js';
import {
    getEnvTemplate,
    getGitignoreTemplate,
    getReadmeTemplate
} from '../src/templates/project/index.js';
import {
    sanitizeError,
    validateProjectName
} from '../shared-templates-new.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration constants
const projectName = 'test-ts-mysql-crud';
const dbChoice = 'mysql';
const langChoice = 'typescript';
const resourceName = 'Product';

console.log('🚀 Starting automated TypeScript CRUD test with MySQL...\n');
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
    fs.mkdirSync(path.join(projectPath, 'src', 'types'));
    fs.mkdirSync(path.join(projectPath, '__tests__'));

    console.log('✅ Project directories created');

    // Create TypeScript config
    fs.writeFileSync(
        path.join(projectPath, 'tsconfig.json'),
        getTsConfigTemplate()
    );

    // Create types file
    fs.writeFileSync(
        path.join(projectPath, 'src', 'types', 'index.ts'),
        getTypesTemplate()
    );

    // Create config files
    fs.writeFileSync(
        path.join(projectPath, 'src', 'config', 'database.ts'),
        getDatabaseConfigTemplateTS(dbChoice)
    );

    // Create server.ts
    fs.writeFileSync(
        path.join(projectPath, 'src', 'server.ts'),
        getServerTemplateTS(resourceName, dbChoice, projectName)
    );

    // Create routes
    fs.writeFileSync(
        path.join(projectPath, 'src', 'routes', `${resourceName.toLowerCase()}Routes.ts`),
        getRoutesTemplateTS(resourceName)
    );

    // Create controller
    fs.writeFileSync(
        path.join(projectPath, 'src', 'controllers', `${resourceName.toLowerCase()}Controller.ts`),
        getControllerTemplateTS(resourceName, dbChoice)
    );

    // Create service
    fs.writeFileSync(
        path.join(projectPath, 'src', 'services', `${resourceName.toLowerCase()}Service.ts`),
        getServiceTemplateTS(resourceName, dbChoice)
    );

    // Create model
    fs.writeFileSync(
        path.join(projectPath, 'src', 'models', `${resourceName}.ts`),
        getModelTemplateTS(resourceName, dbChoice)
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
        description: 'Express CRUD API with MySQL and TypeScript',
        type: 'module',
        main: 'dist/server.js',
        scripts: {
            build: 'tsc',
            start: 'node dist/server.js',
            dev: 'tsx watch src/server.ts',
            test: 'node --experimental-vm-modules node_modules/jest/bin/jest.js'
        },
        keywords: ['express', 'crud', 'mysql', 'typescript', 'rest-api'],
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
            typescript: '^5.3.3',
            tsx: '^4.7.0',
            '@types/node': '^20.10.6',
            '@types/express': '^4.17.21',
            '@types/cors': '^2.8.17',
            jest: '^29.7.0',
            '@types/jest': '^29.5.11',
            'ts-jest': '^29.1.1',
            supertest: '^6.3.3',
            '@types/supertest': '^6.0.2'
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
        getJestConfigTS()
    );

    // Create test file
    fs.writeFileSync(
        path.join(projectPath, '__tests__', `${resourceName.toLowerCase()}.test.ts`),
        getTestTemplateMySQLTS(resourceName)
    );

    console.log('✅ Test files created');

    console.log('\n✨ TypeScript MySQL project created successfully!\n');
    console.log('📋 Next steps:');
    console.log(`   1. cd ${projectName}`);
    console.log('   2. npm install');
    console.log('   3. Update .env with your MySQL connection details');
    console.log('   4. npm run build    # Compile TypeScript');
    console.log('   5. npm start        # Run compiled code');
    console.log('   or');
    console.log('   4. npm run dev      # Run with hot reload');
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
