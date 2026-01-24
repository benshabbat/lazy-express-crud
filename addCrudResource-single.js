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
} from './tests/test-templates.js';
import {
    sanitizeError,
    validatePath,
    isPathInProject,
    validateResourceName
} from './shared-templates-new.js';
import {
    getModelTemplate,
    getControllerTemplate,
    getServiceTemplate
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
const packageJsonPath = path.join(currentDir, 'package.json');

if (!fs.existsSync(srcDir) || !fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: Not in an Express CRUD project directory');
    console.error('Please run this command from the root of your Express CRUD project');
    process.exit(1);
}

// Detect database type from package.json
let dbChoice = 'memory';
let isTypeScript = false;
let ext = 'js';

try {
    if (!fs.existsSync(packageJsonPath)) {
        console.error('❌ Error: package.json not found at:', packageJsonPath);
        console.error('Current directory:', currentDir);
        console.error('Please run this command from your Express CRUD project root directory');
        process.exit(1);
    }
    
    // Security: Check file size before reading (max 10MB)
    const stats = fs.statSync(packageJsonPath);
    if (stats.size > 10 * 1024 * 1024) {
        throw new Error('package.json file too large (max 10MB)');
    }
    
    // Security: Validate path
    validatePath(packageJsonPath);
    if (!isPathInProject(packageJsonPath, currentDir)) {
        throw new Error('Security: package.json path is outside project directory');
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    
    // Detect TypeScript
    if (devDependencies.typescript || devDependencies.tsx) {
        isTypeScript = true;
        ext = 'ts';
        console.log('✅ Detected: TypeScript project');
    } else {
        console.log('✅ Detected: JavaScript project');
    }
    
    if (dependencies.mongoose) {
        dbChoice = 'mongodb';
        console.log('✅ Detected: MongoDB (mongoose)');
    } else if (dependencies.mysql2) {
        dbChoice = 'mysql';
        console.log('✅ Detected: MySQL (mysql2)');
    } else {
        console.log('ℹ️  No database detected, using in-memory storage');
    }
} catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    console.error('Current directory:', currentDir);
    process.exit(1);
}

// Generate names
const resourceLower = resourceName.toLowerCase();
const resourcePlural = resourceLower + 's';
const routeFileName = `${resourceLower}Routes.${ext}`;
const controllerFileName = `${resourceLower}Controller.${ext}`;
const modelFileName = `${resourceName}.${ext}`;

console.log(`\n🚀 Adding new CRUD resource: ${resourceName}\n`);

// Check if resource already exists
const modelPath = path.join(srcDir, 'models', modelFileName);
if (fs.existsSync(modelPath)) {
    console.error(`❌ Error: Resource "${resourceName}" already exists`);
    process.exit(1);
}

// Routes template
const routesTemplate = `import express from 'express';
import * as ${resourceLower}Controller from '../controllers/${controllerFileName}';

const router = express.Router();

// GET all ${resourcePlural}
router.get('/', ${resourceLower}Controller.getAll${resourceName}s);

// GET ${resourceLower} by id
router.get('/:id', ${resourceLower}Controller.get${resourceName}ById);

// POST create new ${resourceLower}
router.post('/', ${resourceLower}Controller.create${resourceName});

// PUT update ${resourceLower}
router.put('/:id', ${resourceLower}Controller.update${resourceName});

// DELETE ${resourceLower}
router.delete('/:id', ${resourceLower}Controller.delete${resourceName});

export default router;
`;

// Write files
const files = [
    { 
        path: path.join(srcDir, 'models', modelFileName), 
        content: getModelTemplate(resourceName, dbChoice, ext, isTypeScript),
        type: 'Model'
    },
    { 
        path: path.join(srcDir, 'services', modelFileName.replace('.js', 'Service.js').replace('.ts', 'Service.ts')), 
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
        content: routesTemplate,
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

files.forEach(file => {
    try {
        fs.writeFileSync(file.path, file.content);
        console.log(`✅ Created ${file.type}: ${path.basename(file.path)}`);
    } catch (error) {
        console.error(`❌ Error creating ${file.type}: ${error.message}`);
        process.exit(1);
    }
});

// Update server.js/server.ts
const serverPath = path.join(srcDir, `server.${ext}`);
try {
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Check if route already imported
    const importStatement = `import ${resourceLower}Routes from './routes/${routeFileName}';`;
    if (!serverContent.includes(importStatement)) {
        // Find the last import statement
        const importRegex = /import .+ from .+;/g;
        const imports = serverContent.match(importRegex);
        if (imports && imports.length > 0) {
            const lastImport = imports[imports.length - 1];
            serverContent = serverContent.replace(lastImport, `${lastImport}\n${importStatement}`);
        }
    }
    
    // Check if route already registered
    const routeStatement = `app.use('/api/${resourcePlural}', ${resourceLower}Routes);`;
    if (!serverContent.includes(routeStatement)) {
        // Find where to add the route (after other app.use routes)
        const routeRegex = /app\.use\('\/api\/\w+',\s+\w+Routes\);/g;
        const routes = serverContent.match(routeRegex);
        if (routes && routes.length > 0) {
            const lastRoute = routes[routes.length - 1];
            serverContent = serverContent.replace(lastRoute, `${lastRoute}\n${routeStatement}`);
        } else {
            // If no routes exist, add after items route
            const itemsRoute = "app.use('/api/items', itemRoutes);";
            if (serverContent.includes(itemsRoute)) {
                serverContent = serverContent.replace(itemsRoute, `${itemsRoute}\n${routeStatement}`);
            }
        }
    }
    
    fs.writeFileSync(serverPath, serverContent);
    console.log(`✅ Updated server.${ext} with ${resourceName} routes`);
} catch (error) {
    console.log(`⚠️  Note: Could not automatically update server.${ext}: ${error.message}`);
    console.log('Please add the routes manually.');
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
