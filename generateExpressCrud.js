#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
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
} from './typescript-templates-new.js';
import {
    getJestConfigJS,
    getJestConfigTS,
    getTestTemplateMongoJS,
    getTestTemplateMySQLJS,
    getTestTemplateMemoryJS,
    getTestTemplateMongoTS,
    getTestTemplateMySQLTS,
    getTestTemplateMemoryTS
} from './tests/test-templates.js';
import {
    getDatabaseConfigTemplate,
    getServerTemplate,
    getRoutesTemplate,
    getEnvTemplate,
    getGitignoreTemplate,
    getReadmeTemplate
} from './src/templates/project/index.js';
import {
    sanitizeError,
    validateProjectName,
    getControllerTemplate,
    getServiceTemplate,
    getModelTemplate
} from './shared-templates-new.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project name from command line arguments
const projectName = process.argv[2] || 'express-crud-app';

// Validate the project name
validateProjectName(projectName);

// Function to ask user for database choice
function askDatabaseChoice() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('\n📊 Choose your database:');
        console.log('1. MongoDB (NoSQL)');
        console.log('2. MySQL (SQL)');
        console.log('3. In-Memory (No database - for demo)');
        
        rl.question('\nEnter your choice (1/2/3): ', (answer) => {
            rl.close();
            const choice = answer.trim();
            if (choice === '1') {
                resolve('mongodb');
            } else if (choice === '2') {
                resolve('mysql');
            } else if (choice === '3') {
                resolve('memory');
            } else {
                console.log('Invalid choice. Using in-memory storage as default.');
                resolve('memory');
            }
        });
    });
}

// Function to ask user for language choice
function askLanguageChoice() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('\n💻 Choose your language:');
        console.log('1. JavaScript (ES6+)');
        console.log('2. TypeScript');
        
        rl.question('\nEnter your choice (1/2): ', (answer) => {
            rl.close();
            const choice = answer.trim();
            if (choice === '2') {
                resolve('typescript');
            } else {
                resolve('javascript');
            }
        });
    });
}

// Create project directory
const projectPath = path.join(process.cwd(), projectName);

// Check if directory already exists
if (fs.existsSync(projectPath)) {
    console.error(`❌ Error: Directory "${projectName}" already exists. Please choose a different name or remove the existing directory.`);
    process.exit(1);
}

// Main async function
async function createProject() {
    // Ask for language choice
    const langChoice = await askLanguageChoice();
    
    // Ask for database choice
    const dbChoice = await askDatabaseChoice();
    
    const isTypeScript = langChoice === 'typescript';
    const ext = isTypeScript ? 'ts' : 'js';
    
    console.log(`\n🚀 Creating Express CRUD project: ${projectName}`);
    console.log(`💻 Language: ${isTypeScript ? 'TypeScript' : 'JavaScript'}`);
    console.log(`📊 Database: ${dbChoice === 'mongodb' ? 'MongoDB' : dbChoice === 'mysql' ? 'MySQL' : 'In-Memory'}`);

// Create directory structure
const directories = [
    projectPath,
    path.join(projectPath, 'src'),
    path.join(projectPath, 'src', 'routes'),
    path.join(projectPath, 'src', 'controllers'),
    path.join(projectPath, 'src', 'services'),
    path.join(projectPath, 'src', 'models'),
    path.join(projectPath, 'src', 'middlewares'),
    path.join(projectPath, 'src', 'config'),
    path.join(projectPath, 'tests'),
    ...(isTypeScript ? [path.join(projectPath, 'src', 'types')] : [])
];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${path.relative(process.cwd(), dir)}`);
        } catch (error) {
            console.error(`❌ Error creating directory ${dir}: ${error.message}`);
            process.exit(1);
        }
    }
});

// package.json template based on database choice
const packageJson = {
    name: projectName,
    version: '1.0.0',
    description: 'Express CRUD API',
    main: isTypeScript ? 'dist/server.js' : 'src/server.js',
    type: 'module',
    scripts: isTypeScript ? {
        build: 'tsc',
        start: 'node dist/server.js',
        dev: 'tsx watch src/server.ts',
        'type-check': 'tsc --noEmit',
        test: 'node --experimental-vm-modules node_modules/jest/bin/jest.js',
        'test:watch': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --watch',
        'test:coverage': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage'
    } : {
        start: 'node src/server.js',
        dev: 'nodemon src/server.js',
        test: 'node --experimental-vm-modules node_modules/jest/bin/jest.js',
        'test:watch': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --watch',
        'test:coverage': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage'
    },
    keywords: ['express', 'crud', 'api'],
    author: '',
    license: 'ISC',
    dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        dotenv: '^16.3.1',
        helmet: '^7.1.0',
        'express-rate-limit': '^7.1.5',
        ...(dbChoice === 'mongodb' && { mongoose: '^8.0.3' }),
        ...(dbChoice === 'mysql' && { mysql2: '^3.6.5' })
    },
    devDependencies: {
        jest: '^29.7.0',
        supertest: '^6.3.4',
        ...(isTypeScript ? {
            typescript: '^5.3.3',
            tsx: '^4.7.0',
            '@types/node': '^20.10.6',
            '@types/express': '^4.17.21',
            '@types/cors': '^2.8.17',
            '@types/jest': '^29.5.11',
            '@types/supertest': '^6.0.2',
            'ts-jest': '^29.1.1'
        } : {
            nodemon: '^3.0.1'
        })
    }
};

// Write all files
const files = [
    { path: path.join(projectPath, 'package.json'), content: JSON.stringify(packageJson, null, 2) },
    { path: path.join(projectPath, `src/server.${ext}`), content: isTypeScript ? getServerTemplateTS('Item', dbChoice, projectName) : getServerTemplate('Item', dbChoice) },
    { path: path.join(projectPath, `src/routes/itemRoutes.${ext}`), content: isTypeScript ? getRoutesTemplateTS('Item') : getRoutesTemplate('Item') },
    { path: path.join(projectPath, `src/controllers/itemController.${ext}`), content: isTypeScript ? getControllerTemplateTS('Item', dbChoice) : getControllerTemplate('Item', dbChoice) },
    { path: path.join(projectPath, `src/services/itemService.${ext}`), content: isTypeScript ? getServiceTemplateTS('Item', dbChoice) : getServiceTemplate('Item', dbChoice) },
    { path: path.join(projectPath, `src/models/Item.${ext}`), content: isTypeScript ? getModelTemplateTS('Item', dbChoice) : getModelTemplate('Item', dbChoice) },
    { path: path.join(projectPath, '.env'), content: getEnvTemplate(dbChoice, projectName) },
    { path: path.join(projectPath, '.gitignore'), content: isTypeScript ? getGitignoreTemplate() + 'dist/\n' : getGitignoreTemplate() },
    { path: path.join(projectPath, 'README.md'), content: getReadmeTemplate(dbChoice, projectName) }
];

// Add TypeScript specific files
if (isTypeScript) {
    files.push(
        { path: path.join(projectPath, 'tsconfig.json'), content: getTsConfigTemplate() },
        { path: path.join(projectPath, `src/types/index.${ext}`), content: getTypesTemplate(dbChoice) }
    );
}

// Add database config file if using MongoDB or MySQL
if (dbChoice === 'mongodb' || dbChoice === 'mysql') {
    files.push({
        path: path.join(projectPath, `src/config/database.${ext}`),
        content: isTypeScript ? getDatabaseConfigTemplateTS(dbChoice, projectName) : getDatabaseConfigTemplate(dbChoice)
    });
}

// Add Jest configuration file
files.push({
    path: path.join(projectPath, 'jest.config.js'),
    content: isTypeScript ? getJestConfigTS() : getJestConfigJS()
});

// Add test file for Item resource
const testFileName = `Item.test.${isTypeScript ? 'ts' : 'js'}`;
let testContent;
if (isTypeScript) {
    testContent = dbChoice === 'mongodb' ? getTestTemplateMongoTS('Item') :
                  dbChoice === 'mysql' ? getTestTemplateMySQLTS('Item') :
                  getTestTemplateMemoryTS('Item');
} else {
    testContent = dbChoice === 'mongodb' ? getTestTemplateMongoJS('Item') :
                  dbChoice === 'mysql' ? getTestTemplateMySQLJS('Item') :
                  getTestTemplateMemoryJS('Item');
}
files.push({
    path: path.join(projectPath, 'tests', testFileName),
    content: testContent
});

files.forEach(file => {
    try {
        fs.writeFileSync(file.path, file.content);
        console.log(`✅ Created file: ${path.relative(process.cwd(), file.path)}`);
    } catch (error) {
        console.error(`❌ Error creating file ${file.path}: ${error.message}`);
        process.exit(1);
    }
});

const nextSteps = dbChoice === 'mongodb' ? `
  1. cd ${projectName}
  2. npm install
  3. Make sure MongoDB is running
  4. npm run dev
` : dbChoice === 'mysql' ? `
  1. cd ${projectName}
  2. npm install
  3. Create MySQL database: CREATE DATABASE ${projectName};
  4. Update .env file with your MySQL credentials
  5. npm run dev (tables will be created automatically)
` : `
  1. cd ${projectName}
  2. npm install
  3. npm run dev
`;

console.log(`
✨ Project created successfully!

Database: ${dbChoice === 'mongodb' ? '🍃 MongoDB' : dbChoice === 'mysql' ? '🐬 MySQL' : '💾 In-Memory'}

Next steps:${nextSteps}
Your Express CRUD API will be running on http://localhost:3000
`);
}

// Run the async function
createProject().catch(error => {
    console.error('❌ Error creating project:', error);
    process.exit(1);
});
