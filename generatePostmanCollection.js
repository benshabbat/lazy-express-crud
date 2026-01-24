#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { validatePath, isPathInProject } from './src/validators/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we're in an Express CRUD project
const currentDir = validatePath(process.cwd());
const srcDir = path.join(currentDir, 'src');
const routesDir = path.join(srcDir, 'routes');
const packageJsonPath = path.join(currentDir, 'package.json');

if (!isPathInProject(srcDir, currentDir) || !isPathInProject(packageJsonPath, currentDir)) {
    console.error('❌ Error: Security violation - paths outside project directory');
    process.exit(1);
}

if (!fs.existsSync(routesDir) || !fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: Not in an Express CRUD project directory');
    console.error('Please run this command from the root of your Express CRUD project');
    process.exit(1);
}

// Verify routesDir is actually a directory
try {
    const stats = fs.statSync(routesDir);
    if (!stats.isDirectory()) {
        console.error('❌ Error: src/routes is not a directory');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Error: Cannot access src/routes directory');
    process.exit(1);
}

console.log('🚀 Generating Postman Collection...\n');

// Read package.json to get project name with validation
let projectName = 'Express CRUD API';
try {
    const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
    
    // Security: Limit file size (package.json should never be huge)
    if (packageContent.length > 1024 * 1024) { // 1MB limit
        throw new Error('package.json file too large');
    }
    
    const packageJson = JSON.parse(packageContent);
    
    // Validate project name
    if (packageJson.name && typeof packageJson.name === 'string') {
        // Sanitize project name (remove potentially dangerous characters)
        projectName = packageJson.name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '').trim();
        if (projectName.length > 214) {
            projectName = projectName.substring(0, 214);
        }
        if (!projectName) {
            projectName = 'Express CRUD API';
        }
    }
} catch (error) {
    console.log('⚠️  Could not read project name from package.json, using default');
    if (error.code !== 'ENOENT') {
        console.log(`   Error: ${error.message}`);
    }
}

// Scan routes directory with security checks
let routeFiles;
try {
    const files = fs.readdirSync(routesDir);
    
    // Validate each file
    routeFiles = files.filter(file => {
        // Security: Check for valid filename pattern (support both .js and .ts)
        const validPattern = /^[a-zA-Z0-9_-]+Routes\.(js|ts)$/;
        if (!validPattern.test(file)) {
            return false;
        }
        
        // Verify it's actually a file and within routes directory
        const filePath = path.join(routesDir, file);
        if (!isPathInProject(filePath, currentDir)) {
            return false;
        }
        
        try {
            const stats = fs.statSync(filePath);
            return stats.isFile();
        } catch {
            return false;
        }
    });
} catch (error) {
    console.error('❌ Error reading routes directory:', error.message);
    process.exit(1);
}

if (routeFiles.length === 0) {
    console.error('❌ No route files found in src/routes/');
    process.exit(1);
}

console.log(`Found ${routeFiles.length} route file(s):`);

// Generate collection items
const collectionItems = [];

routeFiles.forEach(file => {
    // Security: Sanitize the base name (support both .js and .ts)
    const baseName = file.replace(/Routes\.(js|ts)$/, '').replace(/[^a-zA-Z0-9_-]/g, '');
    
    // Validate length
    if (baseName.length === 0 || baseName.length > 100) {
        console.log(`  ⚠️  Skipping invalid file: ${file}`);
        return;
    }
    
    const resourceName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    const routePath = baseName.toLowerCase() + 's';
    
    console.log(`  ✅ ${resourceName} (/${routePath})`);
    
    const resourceItem = {
        name: resourceName,
        item: [
            {
                name: `Get All ${resourceName}s`,
                request: {
                    method: 'GET',
                    header: [],
                    url: {
                        raw: `{{baseUrl}}/api/${routePath}`,
                        host: ['{{baseUrl}}'],
                        path: ['api', routePath]
                    },
                    description: `Retrieve all ${routePath} from the database`
                },
                response: []
            },
            {
                name: `Get ${resourceName} by ID`,
                request: {
                    method: 'GET',
                    header: [],
                    url: {
                        raw: `{{baseUrl}}/api/${routePath}/:id`,
                        host: ['{{baseUrl}}'],
                        path: ['api', routePath, ':id'],
                        variable: [
                            {
                                key: 'id',
                                value: '1',
                                description: `${resourceName} ID`
                            }
                        ]
                    },
                    description: `Retrieve a specific ${baseName} by its ID`
                },
                response: []
            },
            {
                name: `Create ${resourceName}`,
                request: {
                    method: 'POST',
                    header: [
                        {
                            key: 'Content-Type',
                            value: 'application/json'
                        }
                    ],
                    body: {
                        mode: 'raw',
                        raw: `{\n  "name": "New ${resourceName}",\n  "description": "${resourceName} description"\n}`
                    },
                    url: {
                        raw: `{{baseUrl}}/api/${routePath}`,
                        host: ['{{baseUrl}}'],
                        path: ['api', routePath]
                    },
                    description: `Create a new ${baseName}`
                },
                response: []
            },
            {
                name: `Update ${resourceName}`,
                request: {
                    method: 'PUT',
                    header: [
                        {
                            key: 'Content-Type',
                            value: 'application/json'
                        }
                    ],
                    body: {
                        mode: 'raw',
                        raw: `{\n  "name": "Updated ${resourceName}",\n  "description": "Updated description"\n}`
                    },
                    url: {
                        raw: `{{baseUrl}}/api/${routePath}/:id`,
                        host: ['{{baseUrl}}'],
                        path: ['api', routePath, ':id'],
                        variable: [
                            {
                                key: 'id',
                                value: '1',
                                description: `${resourceName} ID`
                            }
                        ]
                    },
                    description: `Update an existing ${baseName} by ID`
                },
                response: []
            },
            {
                name: `Delete ${resourceName}`,
                request: {
                    method: 'DELETE',
                    header: [],
                    url: {
                        raw: `{{baseUrl}}/api/${routePath}/:id`,
                        host: ['{{baseUrl}}'],
                        path: ['api', routePath, ':id'],
                        variable: [
                            {
                                key: 'id',
                                value: '1',
                                description: `${resourceName} ID`
                            }
                        ]
                    },
                    description: `Delete a ${baseName} by ID`
                },
                response: []
            }
        ]
    };
    
    collectionItems.push(resourceItem);
});

// Add health check
collectionItems.push({
    name: 'Health Check',
    request: {
        method: 'GET',
        header: [],
        url: {
            raw: '{{baseUrl}}/',
            host: ['{{baseUrl}}'],
            path: ['']
        },
        description: 'Check API health and view available endpoints'
    },
    response: []
});

// Create collection object
const collection = {
    info: {
        name: projectName,
        description: `Complete CRUD API collection for ${projectName}`,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: collectionItems,
    variable: [
        {
            key: 'baseUrl',
            value: 'http://localhost:3000',
            type: 'string'
        }
    ]
};

// Write collection file
const outputPath = path.join(currentDir, 'postman-collection.json');

// Security: Verify output path is within project
if (!isPathInProject(outputPath, currentDir)) {
    console.error('❌ Error: Invalid output path');
    process.exit(1);
}

// Check if file exists and warn user
if (fs.existsSync(outputPath)) {
    console.log('⚠️  postman-collection.json already exists, overwriting...');
}

try {
    const collectionString = JSON.stringify(collection, null, 2);
    
    // Security: Limit output size (sanity check)
    if (collectionString.length > 10 * 1024 * 1024) { // 10MB limit
        console.error('❌ Error: Generated collection is too large');
        process.exit(1);
    }
    
    fs.writeFileSync(outputPath, collectionString, { mode: 0o644 }); // Read-write for owner, read for others
    console.log(`\n✨ Postman Collection generated successfully!`);
    console.log(`📁 File: postman-collection.json`);
    console.log(`\n📝 Import to Postman:`);
    console.log(`   1. Open Postman`);
    console.log(`   2. Click Import`);
    console.log(`   3. Select postman-collection.json`);
    console.log(`\n🚀 Ready to test your API!`);
} catch (error) {
    console.error(`❌ Error writing collection file: ${error.message}`);
    process.exit(1);
}
