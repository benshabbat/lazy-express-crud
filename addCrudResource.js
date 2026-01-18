#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import { validatePath, validateResourceName, isPathInProject } from './src/validators/index.js';
import { sanitizeError } from './src/utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get resource names from command line arguments (can be multiple)
const resourceNames = process.argv.slice(2);

if (resourceNames.length === 0) {
    console.error('❌ Error: Please provide at least one resource name');
    console.log('\nUsage: add-crud <ResourceName> [<ResourceName2> ...]');
    console.log('Example: add-crud User');
    console.log('Example: add-crud User Product Book');
    process.exit(1);
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
