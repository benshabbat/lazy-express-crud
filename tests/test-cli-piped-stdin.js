#!/usr/bin/env node

/**
 * Regression test for GitHub issue #5:
 * "Piped/non-interactive stdin causes silent failure (exit 0, nothing created)"
 *
 * Exercises the real `generateExpressCrud.js` CLI entry point (not just the
 * template functions) with piped stdin, which is what actually triggered the
 * bug: creating a fresh readline.Interface per prompt broke the second
 * question when stdin isn't a TTY.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const entryScript = path.join(__dirname, '..', 'generateExpressCrud.js');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function cleanup(projectPath) {
    if (fs.existsSync(projectPath)) {
        fs.rmSync(projectPath, { recursive: true, force: true });
    }
}

console.log('🚀 Testing CLI with piped/non-interactive stdin (issue #5)...\n');

// --- Case 1: enough piped input for every prompt should create the project ---
{
    const projectName = 'test-piped-full-input';
    const projectPath = path.join(process.cwd(), projectName);
    cleanup(projectPath);

    const result = spawnSync(process.execPath, [entryScript, projectName], {
        input: '2\n3\n', // TypeScript, In-Memory
        encoding: 'utf-8'
    });

    console.log('Case 1 (full piped input) exit code:', result.status);

    assert(result.status === 0, `Expected exit code 0 with full piped input, got ${result.status}. stderr: ${result.stderr}`);
    assert(fs.existsSync(projectPath), 'Expected project directory to be created with full piped input');
    assert(fs.existsSync(path.join(projectPath, 'tsconfig.json')), 'Expected TypeScript project (choice "2") to include tsconfig.json');

    cleanup(projectPath);
    console.log('✅ Case 1 passed: full piped input creates the project and exits 0\n');
}

// --- Case 2: insufficient piped input must fail loudly, not silently exit 0 ---
{
    const projectName = 'test-piped-partial-input';
    const projectPath = path.join(process.cwd(), projectName);
    cleanup(projectPath);

    const result = spawnSync(process.execPath, [entryScript, projectName], {
        input: '2\n', // only answers the language prompt, stdin then closes (EOF)
        encoding: 'utf-8'
    });

    console.log('Case 2 (partial piped input) exit code:', result.status);

    assert(result.status !== 0, `Expected a non-zero exit code when stdin ends before all prompts are answered, got ${result.status}`);
    assert(!fs.existsSync(projectPath), 'Expected no project directory to be created when input is insufficient');
    assert(
        /input ended/i.test(result.stderr) || /error/i.test(result.stderr),
        `Expected a clear error message on stderr, got: ${result.stderr}`
    );

    cleanup(projectPath);
    console.log('✅ Case 2 passed: insufficient piped input fails loudly instead of silently exiting 0\n');
}

// --- Case 3: --lang/--db flags bypass prompts entirely (no stdin needed) ---
{
    const projectName = 'test-cli-flags-non-interactive';
    const projectPath = path.join(process.cwd(), projectName);
    cleanup(projectPath);

    const result = spawnSync(process.execPath, [
        entryScript,
        projectName,
        '--lang=typescript',
        '--db=mongodb'
    ], {
        input: '', // no stdin provided at all
        encoding: 'utf-8'
    });

    console.log('Case 3 (--lang/--db flags) exit code:', result.status);

    assert(result.status === 0, `Expected exit code 0 when using --lang/--db flags, got ${result.status}. stderr: ${result.stderr}`);
    assert(fs.existsSync(projectPath), 'Expected project directory to be created via --lang/--db flags');
    assert(fs.existsSync(path.join(projectPath, 'tsconfig.json')), 'Expected --lang=typescript to include tsconfig.json');
    assert(fs.existsSync(path.join(projectPath, 'src', 'config', 'database.ts')), 'Expected --db=mongodb to include a database config file');

    cleanup(projectPath);
    console.log('✅ Case 3 passed: --lang/--db flags skip prompts entirely\n');
}

console.log('✨ All piped/non-interactive stdin tests passed!');
