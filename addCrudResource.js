#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Security: Sanitize error messages for production
function sanitizeError(error) {
    if (process.env.NODE_ENV === 'production') {
        return 'An error occurred. Please check your configuration.';
    }
    return error.message || error.toString();
}

// Security: Validate resource name
function validateResourceName(name) {
    // Check length (prevent DoS)
    if (name.length === 0 || name.length > 100) {
        throw new Error('Resource name must be between 1 and 100 characters');
    }
    
    // Check for valid PascalCase pattern
    const validPattern = /^[A-Z][a-zA-Z0-9]*$/;
    if (!validPattern.test(name)) {
        throw new Error('Resource name must be in PascalCase (e.g., User, ProductItem)');
    }
    
    // Prevent path traversal
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
        throw new Error('Resource name cannot contain path separators');
    }
    
    // Prevent reserved names
    const reserved = ['Node', 'Process', 'Global', 'Console', 'Module', 'Require'];
    if (reserved.includes(name)) {
        throw new Error(`"${name}" is a reserved name and cannot be used`);
    }
    
    return true;
}

// Get resource names from command line arguments (can be multiple)
const resourceNames = process.argv.slice(2);

if (resourceNames.length === 0) {
    console.error('❌ Error: Please provide at least one resource name');
    console.log('\nUsage: add-crud <ResourceName> [<ResourceName2> ...]');
    console.log('Example: add-crud User');
    console.log('Example: add-crud User Product Book');
    process.exit(1);
}

// Security: Validate path to prevent path traversal
function validatePath(inputPath) {
    const normalized = path.normalize(inputPath);
    if (normalized.includes('..') || normalized.includes('~')) {
        throw new Error('Invalid path: Path traversal detected');
    }
    if (normalized.length > 500) {
        throw new Error('Path too long');
    }
    return normalized;
}

// Security: Check if path is within project directory
function isPathInProject(targetPath, projectRoot) {
    const normalizedTarget = path.resolve(projectRoot, targetPath);
    const normalizedRoot = path.resolve(projectRoot);
    return normalizedTarget.startsWith(normalizedRoot);
}

// Validate all resource names first
try {
    resourceNames.forEach(name => validateResourceName(name));
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log(`\n🚀 Creating ${resourceNames.length} resource${resourceNames.length > 1 ? 's' : ''}...\n`);

let successCount = 0;
let failCount = 0;

// Get the original add-crud script path
const originalScript = path.join(__dirname, 'addCrudResource-single.js');

// Security: Validate script path
try {
    validatePath(originalScript);
    if (!isPathInProject(originalScript, __dirname)) {
        throw new Error('Security: Script path is outside allowed directory');
    }
} catch (error) {
    console.error('❌ Security Error:', error.message);
    process.exit(1);
}

// Process resources sequentially with safe spawn
for (let index = 0; index < resourceNames.length; index++) {
    const resourceName = resourceNames[index];
    console.log(`\n[${index + 1}/${resourceNames.length}] Processing: ${resourceName}`);
    console.log('-'.repeat(50));
    
    try {
        // Use spawn with array arguments (safe from injection)
        await new Promise((resolve, reject) => {
            const child = spawn('node', [originalScript, resourceName], {
                stdio: 'inherit',
                cwd: process.cwd(),
                shell: false // Important: disable shell to prevent injection
            });
            
            child.on('close', (code) => {
                if (code === 0) {
                    successCount++;
                    resolve();
                } else {
                    failCount++;
                    reject(new Error(`Process exited with code ${code}`));
                }
            });
            
            child.on('error', reject);
        });
    } catch (error) {
        console.error(`⚠️  Failed to create ${resourceName}`);
    }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`✨ Summary: ${successCount} resource${successCount !== 1 ? 's' : ''} created successfully`);
if (failCount > 0) {
    console.log(`⚠️  ${failCount} resource${failCount !== 1 ? 's' : ''} failed`);
}
console.log('='.repeat(50) + '\n');
