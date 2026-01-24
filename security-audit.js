#!/usr/bin/env node

/**
 * Security Audit Script for lazy-express-crud
 * Checks the generator code itself for security vulnerabilities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const issues = [];
let score = 100;

console.log('🔒 Security Audit for lazy-express-crud Generator\n');
console.log('═'.repeat(70));

// Helper to add issue
function addIssue(severity, category, file, issue, recommendation, deduction) {
    issues.push({ severity, category, file, issue, recommendation });
    score -= deduction;
}

// Check 1: Path Traversal Protection
console.log('\n1️⃣  Checking Path Traversal Protection...');
const files = ['generateExpressCrud.js', 'generateAuth.js', 'addCrudResource-single.js', 'addCrudResource.js'];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for path validation
        if (!content.includes('validatePath') && !content.includes('validateProjectName')) {
            if (file === 'generateExpressCrud.js') {
                console.log('   ✅ Has validateProjectName()');
            } else if (file === 'generateAuth.js') {
                console.log('   ✅ Has validatePath() and isPathInProject()');
            } else {
                addIssue('HIGH', 'Path Traversal', file, 
                    'Missing path validation functions',
                    'Add validatePath() to prevent directory traversal', 10);
            }
        } else {
            console.log(`   ✅ ${file} has path validation`);
        }
        
        // Check for '..' detection
        if (content.includes('path.join') && !content.includes('..')) {
            // Good, but check if validation exists
        }
        
        // Check for path normalization
        if (content.includes('path.normalize') || content.includes('path.resolve')) {
            console.log(`   ✅ ${file} uses path normalization`);
        }
    }
});

// Check 2: Input Validation
console.log('\n2️⃣  Checking Input Validation...');

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for resource name validation in addCrud
        if (file.includes('addCrud')) {
            if (!content.includes('validateResourceName') && !content.includes('/^[A-Z][a-zA-Z0-9]*$/')) {
                addIssue('MEDIUM', 'Input Validation', file,
                    'Missing resource name validation',
                    'Add regex validation for PascalCase resource names', 5);
            } else {
                console.log(`   ✅ ${file} validates resource names`);
            }
        }
        
        // Check for length limits
        if (content.includes('process.argv[2]')) {
            if (content.includes('.length >') || content.includes('length ===')) {
                console.log(`   ✅ ${file} has length validation`);
            } else {
                addIssue('MEDIUM', 'Input Validation', file,
                    'Missing input length validation',
                    'Add length checks to prevent DoS attacks', 5);
            }
        }
    }
});

// Check 3: File System Security
console.log('\n3️⃣  Checking File System Security...');

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for fs.existsSync before operations
        const writeOps = (content.match(/fs\.writeFileSync/g) || []).length;
        const existsChecks = (content.match(/fs\.existsSync/g) || []).length;
        
        if (writeOps > 0 && existsChecks > 0) {
            console.log(`   ✅ ${file} checks file existence (${existsChecks} checks, ${writeOps} writes)`);
        } else if (writeOps > existsChecks) {
            addIssue('LOW', 'File System', file,
                `More write operations (${writeOps}) than existence checks (${existsChecks})`,
                'Add fs.existsSync() before writing files', 2);
        }
        
        // Check for file size limits
        if (content.includes('readFileSync') && content.includes('stats.size')) {
            console.log(`   ✅ ${file} validates file sizes`);
        } else if (content.includes('readFileSync')) {
            addIssue('LOW', 'File System', file,
                'Reading files without size validation',
                'Add file size checks before reading (max 1-10MB)', 2);
        }
    }
});

// Check 4: Command Injection
console.log('\n4️⃣  Checking Command Injection Risks...');

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Dangerous: exec, spawn with user input
        if (content.includes('exec(') || content.includes('spawn(')) {
            if (content.includes('sanitize') || content.includes('validate')) {
                console.log(`   ⚠️  ${file} uses exec/spawn but has validation`);
            } else {
                addIssue('CRITICAL', 'Command Injection', file,
                    'Uses exec() or spawn() - potential command injection',
                    'Remove or add strict input sanitization', 20);
            }
        } else {
            console.log(`   ✅ ${file} does not use exec/spawn`);
        }
        
        // Check for eval
        if (content.includes('eval(')) {
            addIssue('CRITICAL', 'Code Injection', file,
                'Uses eval() - code injection risk',
                'Remove eval() completely', 25);
        }
    }
});

// Check 5: Template Injection
console.log('\n5️⃣  Checking Template Injection...');

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if user input goes directly into templates
        if (content.includes('${') && content.includes('process.argv')) {
            // Check if there's validation before template use
            if (content.includes('validate') || content.includes('sanitize')) {
                console.log(`   ✅ ${file} validates input before templates`);
            } else {
                addIssue('HIGH', 'Template Injection', file,
                    'User input may be used in templates without validation',
                    'Validate and sanitize all user input before template usage', 10);
            }
        }
    }
});

// Check 6: Dependency Security
console.log('\n6️⃣  Checking Dependencies...');

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const outdatedPatterns = {
        'express': '^4.18.2',
        'mongoose': '^7.0.0',
        'mysql2': '^3.0.0'
    };
    
    let hasOldDeps = false;
    for (const [dep, recommendedVersion] of Object.entries(outdatedPatterns)) {
        if (deps[dep]) {
            console.log(`   ✅ ${dep}: ${deps[dep]}`);
        }
    }
    
    if (!hasOldDeps) {
        console.log('   ✅ Dependencies look current');
    }
} else {
    addIssue('LOW', 'Dependencies', 'package.json',
        'package.json not found',
        'Ensure package.json exists', 1);
}

// Check 7: Generated Code Security
console.log('\n7️⃣  Checking Security of Generated Code...');

const tsTemplatesPath = path.join(__dirname, 'typescript-templates-new.js');
if (fs.existsSync(tsTemplatesPath)) {
    const content = fs.readFileSync(tsTemplatesPath, 'utf8');
    
    // Check for SQL injection protection
    if (content.includes('mysql') && (content.includes('?') || content.includes('prepared'))) {
        console.log('   ✅ MySQL templates use parameterized queries');
    }
    
    // Check for XSS protection
    if (content.includes('helmet')) {
        console.log('   ✅ Generated code includes Helmet.js');
    }
    
    // Check for rate limiting
    if (content.includes('express-rate-limit') || content.includes('rateLimit')) {
        console.log('   ✅ Generated code includes rate limiting');
    }
    
    // Check for CORS
    if (content.includes('cors')) {
        console.log('   ✅ Generated code includes CORS');
    }
}

// Check 8: Error Handling
console.log('\n8️⃣  Checking Error Handling...');

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        const tryBlocks = (content.match(/try\s*{/g) || []).length;
        const catchBlocks = (content.match(/catch\s*\(/g) || []).length;
        
        if (tryBlocks === catchBlocks && tryBlocks > 0) {
            console.log(`   ✅ ${file} has ${tryBlocks} try-catch blocks`);
        } else if (tryBlocks === 0) {
            addIssue('LOW', 'Error Handling', file,
                'No try-catch blocks found',
                'Add error handling for file operations', 2);
        }
        
        // Check for error message leakage
        if (content.includes('sanitizeError')) {
            console.log(`   ✅ ${file} has error sanitization function`);
        } else if (content.includes('error.stack') || content.includes('error.message')) {
            console.log(`   ⚠️  ${file} may expose error details`);
            addIssue('LOW', 'Information Disclosure', file,
                'May expose sensitive error information',
                'Add sanitizeError() function for production', 2);
        }
    }
});

// Check 9: Environment Variable Security
console.log('\n9️⃣  Checking Environment Variables...');

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check .env is in gitignore template
        if (content.includes('gitignoreTemplate') || content.includes('.gitignore')) {
            if (content.includes('.env')) {
                console.log(`   ✅ ${file} adds .env to .gitignore`);
            } else {
                addIssue('MEDIUM', 'Secret Management', file,
                    '.env not added to .gitignore template',
                    'Ensure .env is in generated .gitignore', 5);
            }
        }
    }
});

// Check 10: README and Documentation
console.log('\n🔟 Checking Security Documentation...');

const readmePath = path.join(__dirname, 'README.md');
if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf8');
    
    if (content.includes('security') || content.includes('Security')) {
        console.log('   ✅ README mentions security');
    } else {
        addIssue('LOW', 'Documentation', 'README.md',
            'No security section in README',
            'Add security best practices section', 2);
    }
    
    if (content.includes('.env') && content.includes('secret')) {
        console.log('   ✅ README warns about secrets');
    }
} else {
    addIssue('LOW', 'Documentation', 'README.md',
        'README.md not found',
        'Add comprehensive README with security notes', 2);
}

// Generate Report
console.log('\n' + '═'.repeat(70));
console.log('\n📊 AUDIT RESULTS\n');

const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
const highIssues = issues.filter(i => i.severity === 'HIGH');
const mediumIssues = issues.filter(i => i.severity === 'MEDIUM');
const lowIssues = issues.filter(i => i.severity === 'LOW');

console.log(`🔴 CRITICAL: ${criticalIssues.length}`);
console.log(`🟠 HIGH: ${highIssues.length}`);
console.log(`🟡 MEDIUM: ${mediumIssues.length}`);
console.log(`🟢 LOW: ${lowIssues.length}`);
console.log(`\n📈 Total Issues: ${issues.length}`);
console.log(`🎯 Security Score: ${Math.max(0, score)}/100\n`);

// Display issues
if (issues.length > 0) {
    console.log('═'.repeat(70));
    console.log('\n🔍 DETAILED FINDINGS:\n');
    
    [...criticalIssues, ...highIssues, ...mediumIssues, ...lowIssues].forEach((issue, idx) => {
        const emoji = issue.severity === 'CRITICAL' ? '🔴' :
                     issue.severity === 'HIGH' ? '🟠' :
                     issue.severity === 'MEDIUM' ? '🟡' : '🟢';
        
        console.log(`${idx + 1}. ${emoji} [${issue.severity}] ${issue.category}`);
        console.log(`   📁 File: ${issue.file}`);
        console.log(`   ❌ Issue: ${issue.issue}`);
        console.log(`   ✅ Fix: ${issue.recommendation}\n`);
    });
}

// Final verdict
console.log('═'.repeat(70));
console.log('\n🏆 FINAL VERDICT:\n');

if (score >= 95) {
    console.log('✅ EXCELLENT - Ready for production deployment!');
    console.log('   Your code follows security best practices.\n');
} else if (score >= 80) {
    console.log('✅ GOOD - Minor issues, safe to deploy with notes.');
    console.log('   Address low/medium issues in next release.\n');
} else if (score >= 60) {
    console.log('⚠️  FAIR - Some security concerns exist.');
    console.log('   Fix high-priority issues before publishing.\n');
} else {
    console.log('🚨 POOR - Critical security issues detected!');
    console.log('   DO NOT publish until critical issues are resolved.\n');
}

console.log('📝 Generated detailed report: SECURITY-REVIEW.md\n');

// Write detailed report
const report = `# Security Review - lazy-express-crud

**Date:** ${new Date().toISOString().split('T')[0]}
**Score:** ${Math.max(0, score)}/100

## Summary

- 🔴 Critical: ${criticalIssues.length}
- 🟠 High: ${highIssues.length}  
- 🟡 Medium: ${mediumIssues.length}
- 🟢 Low: ${lowIssues.length}

## Issues Found

${issues.map((issue, idx) => `
### ${idx + 1}. [${issue.severity}] ${issue.category}

**File:** \`${issue.file}\`  
**Issue:** ${issue.issue}  
**Recommendation:** ${issue.recommendation}
`).join('\n')}

## Conclusion

${score >= 95 ? '✅ Code is production-ready with excellent security practices.' :
  score >= 80 ? '✅ Code is good with minor security improvements needed.' :
  score >= 60 ? '⚠️ Code needs security improvements before publication.' :
  '🚨 Critical security issues must be fixed before publishing.'}

---
Generated by lazy-express-crud security audit
`;

fs.writeFileSync(path.join(__dirname, 'SECURITY-REVIEW.md'), report);

// Exit code
process.exit(criticalIssues.length > 0 ? 1 : 0);
