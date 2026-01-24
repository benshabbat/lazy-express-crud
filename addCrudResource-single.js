#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
    getTestTemplateMongoJS,
    getTestTemplateMySQLJS,
    getTestTemplateMemoryJS,
    getTestTemplateMongoTS,
    getTestTemplateMySQLTS,
    getTestTemplateMemoryTS
} from './src/templates/tests/index.js';
import {
    sanitizeError,
    validatePath,
    isPathInProject,
    validateResourceName,
    getProjectConfig,
    hasCrudStructure,
    writeFiles,
    updateServerWithRoute,
    generateResourceTypes,
    fileExists
} from './src/utils/index.js';
import {
    getModelTemplate,
    getControllerTemplate,
    getServiceTemplate,
    getRoutesTemplate
} from './src/templates/addResource/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get resource name from command line arguments
const resourceName = process.argv[2];

if (!resourceName) {
    console.error('❌ Error: Please provide a resource name');
    console.log('\nUsage: add-crud <ResourceName>');
    console.log('Example: add-crud User');
    process.exit(1);
}

// Security: Basic length check to prevent DoS
if (resourceName.length > 100) {
    console.error('❌ Error: Resource name is too long (max 100 characters)');
    process.exit(1);
}

// Validate resource name
try {
    validateResourceName(resourceName);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// Check if we're in an Express CRUD project
const currentDir = process.cwd();
const srcDir = path.join(currentDir, 'src');

if (!hasCrudStructure(currentDir)) {
    console.error('❌ Error: Not in an Express CRUD project directory');
    console.error('Please run this command from the root of your Express CRUD project');
    process.exit(1);
}

// Detect project configuration
const config = getProjectConfig(currentDir);
const { isTypeScript, database: dbChoice, extension: ext } = config;

console.log(`✅ Detected: ${isTypeScript ? 'TypeScript' : 'JavaScript'} project`);
console.log(`✅ Detected: ${dbChoice === 'mongodb' ? 'MongoDB (mongoose)' : dbChoice === 'mysql' ? 'MySQL (mysql2)' : 'In-memory storage'}`);

// Generate names
const resourceLower = resourceName.toLowerCase();
const resourcePlural = resourceLower + 's';
const routeFileName = `${resourceLower}Routes.${ext}`;
const controllerFileName = `${resourceLower}Controller.${ext}`;
const serviceFileName = `${resourceLower}Service.${ext}`;
const modelFileName = `${resourceName}.${ext}`;

console.log(`\n🚀 Adding new CRUD resource: ${resourceName}\n`);

// Check if resource already exists
const modelPath = path.join(srcDir, 'models', modelFileName);
if (fs.existsSync(modelPath)) {
    console.error(`❌ Error: Resource "${resourceName}" already exists`);
    process.exit(1);
}

// Write files
const files = [
    { 
        path: path.join(srcDir, 'models', modelFileName), 
        content: getModelTemplate(resourceName, dbChoice, ext, isTypeScript),
        type: 'Model'
    },
    { 
        path: path.join(srcDir, 'services', serviceFileName), 
        content: getServiceTemplate(resourceName, dbChoice, modelFileName, isTypeScript),
        type: 'Service'
    },
    { 
        path: path.join(srcDir, 'controllers', controllerFileName), 
        content: getControllerTemplate(resourceName, modelFileName, isTypeScript),
        type: 'Controller'
    },
    { 
        path: path.join(srcDir, 'routes', routeFileName), 
        content: getRoutesTemplate(resourceName, ext),
        type: 'Routes'
    }
];

// Add test file
const testsDir = path.join(currentDir, 'tests');
if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
}

const testFileName = `${resourceName}.test.${ext}`;
let testContent;
if (isTypeScript) {
    testContent = dbChoice === 'mongodb' ? getTestTemplateMongoTS(resourceName) :
                  dbChoice === 'mysql' ? getTestTemplateMySQLTS(resourceName) :
                  getTestTemplateMemoryTS(resourceName);
} else {
    testContent = dbChoice === 'mongodb' ? getTestTemplateMongoJS(resourceName) :
                  dbChoice === 'mysql' ? getTestTemplateMySQLJS(resourceName) :
                  getTestTemplateMemoryJS(resourceName);
}
files.push({
    path: path.join(testsDir, testFileName),
    content: testContent,
    type: 'Test'
});

// Create types file for TypeScript projects
if (isTypeScript) {
    const typesDir = path.join(srcDir, 'types');
    const typeFileName = `${resourceName}.types.ts`;
    const typeFilePath = path.join(typesDir, typeFileName);
    
    const typeContent = generateResourceTypes(resourceName, dbChoice);
    files.push({
        path: typeFilePath,
        content: typeContent,
        type: 'Types'
    });
}

// Write all files
writeFiles(files, false);
files.forEach(file => {
    console.log(`✅ Created ${file.type}: ${path.basename(file.path)}`);
});

// Update server.js/server.ts
const serverPath = path.join(srcDir, `server.${ext}`);
const updated = updateServerWithRoute(serverPath, resourceName, ext);

if (updated) {
    console.log(`✅ Updated server.${ext} with ${resourceName} routes`);
}

console.log(`\n✨ CRUD resource "${resourceName}" created successfully!\n`);
console.log('📝 Your new endpoints are ready:');
console.log(`   GET    /api/${resourcePlural}      - Get all ${resourcePlural}`);
console.log(`   GET    /api/${resourcePlural}/:id  - Get ${resourceLower} by id`);
console.log(`   POST   /api/${resourcePlural}      - Create ${resourceLower}`);
console.log(`   PUT    /api/${resourcePlural}/:id  - Update ${resourceLower}`);
console.log(`   DELETE /api/${resourcePlural}/:id  - Delete ${resourceLower}`);

if (dbChoice === 'mysql') {
    console.log('\n💡 MySQL Note:');
    console.log(`   You may need to create the table manually:`);
    console.log(`   CREATE TABLE ${resourcePlural} (`);
    console.log(`       id INT AUTO_INCREMENT PRIMARY KEY,`);
    console.log(`       name VARCHAR(255) NOT NULL,`);
    console.log(`       description TEXT,`);
    console.log(`       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`);
    console.log(`       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
    console.log(`   );`);
}

console.log('');
