#!/usr/bin/env node

/**
 * Regression test for GitHub issue #6:
 * add-crud on TypeScript projects generates broken import (.ts extension)
 * that fails tsc build (TS2691).
 *
 * updateServerWithRoute() must always emit a '.js' import extension for the
 * generated route, even when the project's file extension (ext) is 'ts'.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { updateServerWithRoute } from '../src/utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = path.join(process.cwd(), 'server.ts');

const initialServerContent = `import express from 'express';
import bookRoutes from './routes/bookRoutes.js';

const app = express();
app.use('/api/books', bookRoutes);

export default app;
`;

try {
    fs.writeFileSync(serverPath, initialServerContent);

    const updated = updateServerWithRoute(serverPath, 'Product', 'ts');

    if (!updated) {
        console.error('❌ updateServerWithRoute reported no update was made');
        process.exit(1);
    }

    const result = fs.readFileSync(serverPath, 'utf8');

    if (result.includes(`from './routes/productRoutes.ts'`)) {
        console.error('❌ Generated import still uses a literal .ts extension (TS2691)');
        console.error(result);
        process.exit(1);
    }

    if (!result.includes(`import productRoutes from './routes/productRoutes.js';`)) {
        console.error('❌ Expected import statement with .js extension was not found');
        console.error(result);
        process.exit(1);
    }

    if (!result.includes(`app.use('/api/products', productRoutes);`)) {
        console.error('❌ Expected route registration was not found');
        console.error(result);
        process.exit(1);
    }

    console.log('✅ add-crud on TypeScript projects generates a valid .js import');
} finally {
    if (fs.existsSync(serverPath)) {
        fs.rmSync(serverPath);
    }
}
