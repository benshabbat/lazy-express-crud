#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Get resource names from command line arguments (can be multiple)
const resourceNames = process.argv.slice(2);

if (resourceNames.length === 0) {
    console.error('❌ Error: Please provide at least one resource name');
    console.log('\nUsage: add-crud <ResourceName> [<ResourceName2> ...]');
    console.log('Example: add-crud User');
    console.log('Example: add-crud User Product Book');
    process.exit(1);
}

console.log(`\n🚀 Creating ${resourceNames.length} resource${resourceNames.length > 1 ? 's' : ''}...\n`);

let successCount = 0;
let failCount = 0;

// Get the original add-crud script path
const originalScript = path.join(__dirname, 'addCrudResource-single.js');

resourceNames.forEach((resourceName, index) => {
    console.log(`\n[${ index + 1}/${resourceNames.length}] Processing: ${resourceName}`);
    console.log('-'.repeat(50));
    
    try {
        execSync(`node "${originalScript}" ${resourceName}`, {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        successCount++;
    } catch (error) {
        console.error(`⚠️  Failed to create ${resourceName}`);
        failCount++;
    }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`✨ Summary: ${successCount} resource${successCount !== 1 ? 's' : ''} created successfully`);
if (failCount > 0) {
    console.log(`⚠️  ${failCount} resource${failCount !== 1 ? 's' : ''} failed`);
}
console.log('='.repeat(50) + '\n');
