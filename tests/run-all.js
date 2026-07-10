#!/usr/bin/env node

// Runs the CRUD generation smoke tests and reports pass/fail.
// Each test file scaffolds a project into an isolated temp directory
// (via cwd) so repeated runs never touch the repo itself.

import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testFiles = [
    'test-crud-mongodb.js',
    'test-crud-mysql.js',
    'test-crud-typescript.js',
    'test-crud-mysql-ts.js',
    'test-docker-typescript.js'
];

let failed = 0;

for (const file of testFiles) {
    const runDir = fs.mkdtempSync(join(os.tmpdir(), 'lazycrud-test-'));
    process.stdout.write(`\n=== ${file} ===\n`);

    const result = spawnSync(process.execPath, [join(__dirname, file)], {
        cwd: runDir,
        stdio: 'inherit'
    });

    fs.rmSync(runDir, { recursive: true, force: true });

    if (result.status !== 0) {
        failed++;
        console.error(`❌ ${file} failed (exit code ${result.status})`);
    } else {
        console.log(`✅ ${file} passed`);
    }
}

console.log(`\n${testFiles.length - failed}/${testFiles.length} test files passed`);

if (failed > 0) {
    process.exit(1);
}
