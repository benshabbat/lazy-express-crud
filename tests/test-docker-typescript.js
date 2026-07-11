#!/usr/bin/env node

/**
 * Regression test for `add-docker` on TypeScript projects (issue #7).
 *
 * A TypeScript project's `npm start` runs the *compiled* output
 * (`node dist/server.js`), not the TypeScript source. The generated
 * Dockerfile must therefore:
 *  - install devDependencies (typescript) in the builder stage
 *  - run `npm run build` before the production stage
 *  - copy `dist/` (not the raw source) into the production image
 *
 * It also verifies the /health endpoint gets injected into src/server.ts
 * (not a hardcoded server.js path).
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectName = 'test-docker-ts';
const addDockerScript = path.join(__dirname, '..', 'addDocker.js');
const projectPath = path.join(process.cwd(), projectName);

console.log('🚀 Starting add-docker TypeScript regression test...\n');

function fail(message) {
    console.error(`❌ ${message}`);
    process.exit(1);
}

try {
    // Set up a minimal TypeScript Express project
    fs.mkdirSync(projectPath, { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src'));

    const packageJson = {
        name: projectName,
        version: '1.0.0',
        type: 'module',
        main: 'dist/server.js',
        scripts: {
            build: 'tsc',
            start: 'node dist/server.js',
            dev: 'tsx watch src/server.ts'
        },
        dependencies: {
            express: '^4.18.2'
        },
        devDependencies: {
            typescript: '^5.3.3',
            tsx: '^4.7.0'
        }
    };
    fs.writeFileSync(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );

    const serverTs = `import express from 'express';

const app = express();

// Error handling middleware
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

export default app;
`;
    fs.writeFileSync(path.join(projectPath, 'src', 'server.ts'), serverTs);

    console.log('✅ Test TypeScript project scaffolded');

    // Run add-docker against the TS project
    const result = spawnSync(process.execPath, [addDockerScript], {
        cwd: projectPath,
        encoding: 'utf8'
    });

    if (result.status !== 0) {
        console.error(result.stdout);
        console.error(result.stderr);
        fail(`add-docker exited with code ${result.status}`);
    }

    console.log('✅ add-docker ran successfully');

    // Verify Dockerfile has a real build stage for TypeScript
    const dockerfilePath = path.join(projectPath, 'Dockerfile');
    if (!fs.existsSync(dockerfilePath)) {
        fail('Dockerfile was not created');
    }
    const dockerfile = fs.readFileSync(dockerfilePath, 'utf8');

    if (!dockerfile.includes('RUN npm run build')) {
        fail('Dockerfile is missing the TypeScript build step (npm run build)');
    }
    if (!dockerfile.includes('/app/dist')) {
        fail('Dockerfile does not copy the compiled dist/ output into the production stage');
    }
    if (/RUN npm ci --only=production\s*\n\s*\n?#? ?Copy source code\s*\nCOPY \. \./.test(dockerfile)) {
        fail('Dockerfile builder stage still uses production-only install without a build step');
    }

    console.log('✅ Dockerfile contains a TypeScript-aware build stage');

    // Verify the health check endpoint was injected into server.ts (not server.js)
    const serverTsPath = path.join(projectPath, 'src', 'server.ts');
    const serverJsPath = path.join(projectPath, 'src', 'server.js');
    if (fs.existsSync(serverJsPath)) {
        fail('add-docker incorrectly created/looked for src/server.js in a TypeScript project');
    }
    const updatedServerTs = fs.readFileSync(serverTsPath, 'utf8');
    if (!updatedServerTs.includes("app.get('/health'")) {
        fail('add-docker did not inject the /health endpoint into src/server.ts');
    }

    console.log('✅ /health endpoint injected into src/server.ts');
    console.log('\n✨ All add-docker TypeScript checks passed!\n');
} catch (error) {
    console.error('❌ Error running add-docker TypeScript test:', error.message);
    process.exit(1);
} finally {
    if (fs.existsSync(projectPath)) {
        fs.rmSync(projectPath, { recursive: true, force: true });
    }
}
