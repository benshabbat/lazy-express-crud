// Package.json template generator

/**
 * Generate package.json content for new project
 * @param {string} projectName - Project name
 * @param {string} dbChoice - Database choice ('mongodb', 'mysql', 'memory')
 * @param {boolean} isTypeScript - Whether to use TypeScript
 * @returns {object} Package.json content
 */
export function getPackageJsonTemplate(projectName, dbChoice, isTypeScript) {
    return {
        name: projectName,
        version: '1.0.0',
        description: 'Express CRUD API',
        main: isTypeScript ? 'dist/server.js' : 'src/server.js',
        type: 'module',
        scripts: isTypeScript ? {
            build: 'tsc',
            start: 'node dist/server.js',
            dev: 'tsx watch src/server.ts',
            'type-check': 'tsc --noEmit',
            test: 'node --experimental-vm-modules node_modules/jest/bin/jest.js',
            'test:watch': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --watch',
            'test:coverage': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage'
        } : {
            start: 'node src/server.js',
            dev: 'nodemon src/server.js',
            test: 'node --experimental-vm-modules node_modules/jest/bin/jest.js',
            'test:watch': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --watch',
            'test:coverage': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage'
        },
        keywords: ['express', 'crud', 'api'],
        author: '',
        license: 'ISC',
        dependencies: {
            express: '^4.18.2',
            cors: '^2.8.5',
            dotenv: '^16.3.1',
            helmet: '^7.1.0',
            'express-rate-limit': '^7.1.5',
            ...(dbChoice === 'mongodb' && { mongoose: '^8.0.3' }),
            ...(dbChoice === 'mysql' && { mysql2: '^3.6.5' })
        },
        devDependencies: {
            jest: '^29.7.0',
            supertest: '^6.3.4',
            ...(isTypeScript ? {
                typescript: '^5.3.3',
                tsx: '^4.7.0',
                '@types/node': '^20.10.6',
                '@types/express': '^4.17.21',
                '@types/cors': '^2.8.17',
                '@types/jest': '^29.5.11',
                '@types/supertest': '^6.0.2',
                'ts-jest': '^29.1.1'
            } : {
                nodemon: '^3.0.1'
            })
        }
    };
}

/**
 * Generate next steps instructions
 * @param {string} projectName - Project name
 * @param {string} dbChoice - Database choice ('mongodb', 'mysql', 'memory')
 * @returns {string} Next steps text
 */
export function getNextStepsText(projectName, dbChoice) {
    if (dbChoice === 'mongodb') {
        return `
  1. cd ${projectName}
  2. npm install
  3. Make sure MongoDB is running
  4. npm run dev
`;
    } else if (dbChoice === 'mysql') {
        return `
  1. cd ${projectName}
  2. npm install
  3. Create MySQL database: CREATE DATABASE ${projectName};
  4. Update .env file with your MySQL credentials
  5. npm run dev (tables will be created automatically)
`;
    } else {
        return `
  1. cd ${projectName}
  2. npm install
  3. npm run dev
`;
    }
}

/**
 * Get database emoji/icon
 * @param {string} dbChoice - Database choice
 * @returns {string} Database display string
 */
export function getDatabaseDisplayName(dbChoice) {
    if (dbChoice === 'mongodb') return '🍃 MongoDB';
    if (dbChoice === 'mysql') return '🐬 MySQL';
    return '💾 In-Memory';
}
