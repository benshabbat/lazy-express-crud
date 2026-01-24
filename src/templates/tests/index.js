// Test Templates for lazy-express-crud
// Jest test templates for JavaScript and TypeScript

// Jest config for JavaScript projects
export function getJestConfigJS() {
    return `export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/src/**/__tests__/*.test.js'
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
`;
}

// Jest config for TypeScript projects
export function getJestConfigTS() {
    return `export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/config/**',
    '!src/types/**'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
`;
}

// JavaScript test template for MongoDB
export function getTestTemplateMongoJS(resourceName) {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    
    return `import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import ${resourceName} from '../src/models/${resourceName}.js';
import ${resourceLower}Routes from '../src/routes/${resourceLower}Routes.js';

const app = express();
app.use(express.json());
app.use('/api/${resourcePlural}', ${resourceLower}Routes);

// Mock data
const mock${resourceName} = {
    name: 'Test ${resourceName}',
    description: 'Test description'
};

describe('${resourceName} CRUD Operations', () => {
    // Setup: Connect to test database
    beforeAll(async () => {
        const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/test-db';
        await mongoose.connect(testDbUri);
    });

    // Cleanup: Clear database after each test
    afterEach(async () => {
        await ${resourceName}.deleteMany({});
    });

    // Teardown: Close database connection
    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/${resourcePlural}', () => {
        it('should create a new ${resourceLower}', async () => {
            const response = await request(app)
                .post('/api/${resourcePlural}')
                .send(mock${resourceName})
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.name).toBe(mock${resourceName}.name);
            expect(response.body.data.description).toBe(mock${resourceName}.description);
            
            created${resourceName}Id = response.body.data._id;
        });

        it('should return 400 if name is missing', async () => {
            const response = await request(app)
                .post('/api/${resourcePlural}')
                .send({ description: 'Missing name' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should trim whitespace from name', async () => {
            const response = await request(app)
                .post('/api/${resourcePlural}')
                .send({ name: '  Test Name  ', description: 'Test' })
                .expect(201);

            expect(response.body.data.name).toBe('Test Name');
        });
    });

    describe('GET /api/${resourcePlural}', () => {
        beforeEach(async () => {
            // Create test data
            await ${resourceName}.create(mock${resourceName});
            await ${resourceName}.create({ name: 'Second ${resourceName}', description: 'Second' });
        });

        it('should get all ${resourcePlural}', async () => {
            const response = await request(app)
                .get('/api/${resourcePlural}')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.count).toBe(2);
        });

        it('should return empty array when no ${resourcePlural} exist', async () => {
            await ${resourceName}.deleteMany({});
            
            const response = await request(app)
                .get('/api/${resourcePlural}')
                .expect(200);

            expect(response.body.data).toHaveLength(0);
            expect(response.body.count).toBe(0);
        });
    });

    describe('GET /api/${resourcePlural}/:id', () => {
        let testId;

        beforeEach(async () => {
            const created = await ${resourceName}.create(mock${resourceName});
            testId = created._id.toString();
        });

        it('should get a ${resourceLower} by id', async () => {
            const response = await request(app)
                .get(\`/api/${resourcePlural}/\${testId}\`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(mock${resourceName}.name);
            expect(response.body.data._id).toBe(testId);
        });

        it('should return 404 for non-existent ${resourceLower}', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .get(\`/api/${resourcePlural}/\${fakeId}\`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid ObjectId', async () => {
            const response = await request(app)
                .get('/api/${resourcePlural}/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/${resourcePlural}/:id', () => {
        let testId;

        beforeEach(async () => {
            const created = await ${resourceName}.create(mock${resourceName});
            testId = created._id.toString();
        });

        it('should update a ${resourceLower}', async () => {
            const updatedData = {
                name: 'Updated Name',
                description: 'Updated description'
            };

            const response = await request(app)
                .put(\`/api/${resourcePlural}/\${testId}\`)
                .send(updatedData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updatedData.name);
            expect(response.body.data.description).toBe(updatedData.description);
        });

        it('should return 404 for non-existent ${resourceLower}', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .put(\`/api/${resourcePlural}/\${fakeId}\`)
                .send({ name: 'Updated' })
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid ObjectId', async () => {
            const response = await request(app)
                .put('/api/${resourcePlural}/invalid-id')
                .send({ name: 'Updated' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/${resourcePlural}/:id', () => {
        let testId;

        beforeEach(async () => {
            const created = await ${resourceName}.create(mock${resourceName});
            testId = created._id.toString();
        });

        it('should delete a ${resourceLower}', async () => {
            const response = await request(app)
                .delete(\`/api/${resourcePlural}/\${testId}\`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deleted');

            // Verify it's actually deleted
            const deleted = await ${resourceName}.findById(testId);
            expect(deleted).toBeNull();
        });

        it('should return 404 for non-existent ${resourceLower}', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .delete(\`/api/${resourcePlural}/\${fakeId}\`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid ObjectId', async () => {
            const response = await request(app)
                .delete('/api/${resourcePlural}/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
`;
}

// JavaScript test template for MySQL
export function getTestTemplateMySQLJS(resourceName) {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    
    return `import request from 'supertest';
import express from 'express';
import ${resourceName} from '../src/models/${resourceName}.js';
import ${resourceLower}Routes from '../src/routes/${resourceLower}Routes.js';
import db from '../src/config/database.js';

const app = express();
app.use(express.json());
app.use('/api/${resourcePlural}', ${resourceLower}Routes);

// Mock data
const mock${resourceName} = {
    name: 'Test ${resourceName}',
    description: 'Test description'
};

describe('${resourceName} CRUD Operations', () => {
    // Setup: Create test table
    beforeAll(async () => {
        await new Promise((resolve, reject) => {
            db.query(
                \`CREATE TABLE IF NOT EXISTS ${resourcePlural} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )\`,
                (error) => {
                    if (error) reject(error);
                    else resolve();
                }
            );
        });
    });

    // Cleanup: Clear table after each test
    afterEach(async () => {
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM ${resourcePlural}', (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    });

    // Teardown: Close database connection
    afterAll(async () => {
        await new Promise((resolve) => {
            db.end(() => resolve());
        });
    });

    describe('POST /api/${resourcePlural}', () => {
        it('should create a new ${resourceLower}', async () => {
            const response = await request(app)
                .post('/api/${resourcePlural}')
                .send(mock${resourceName})
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(mock${resourceName}.name);
            expect(response.body.data.description).toBe(mock${resourceName}.description);
        });

        it('should return 400 if name is missing', async () => {
            const response = await request(app)
                .post('/api/${resourcePlural}')
                .send({ description: 'Missing name' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should handle special characters in name', async () => {
            const response = await request(app)
                .post('/api/${resourcePlural}')
                .send({ name: "Test's ${resourceName}", description: 'Test' })
                .expect(201);

            expect(response.body.data.name).toBe("Test's ${resourceName}");
        });
    });

    describe('GET /api/${resourcePlural}', () => {
        beforeEach(async () => {
            // Create test data
            await request(app).post('/api/${resourcePlural}').send(mock${resourceName});
            await request(app).post('/api/${resourcePlural}').send({ name: 'Second ${resourceName}', description: 'Second' });
        });

        it('should get all ${resourcePlural}', async () => {
            const response = await request(app)
                .get('/api/${resourcePlural}')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.count).toBe(2);
        });

        it('should return empty array when no ${resourcePlural} exist', async () => {
            await new Promise((resolve, reject) => {
                db.query('DELETE FROM ${resourcePlural}', (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
            
            const response = await request(app)
                .get('/api/${resourcePlural}')
                .expect(200);

            expect(response.body.data).toHaveLength(0);
            expect(response.body.count).toBe(0);
        });
    });

    describe('GET /api/${resourcePlural}/:id', () => {
        let testId;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/${resourcePlural}')
                .send(mock${resourceName});
            testId = createResponse.body.data.id;
        });

        it('should get a ${resourceLower} by id', async () => {
            const response = await request(app)
                .get(\`/api/${resourcePlural}/\${testId}\`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(mock${resourceName}.name);
            expect(response.body.data.id).toBe(testId);
        });

        it('should return 404 for non-existent ${resourceLower}', async () => {
            const response = await request(app)
                .get('/api/${resourcePlural}/99999')
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid id format', async () => {
            const response = await request(app)
                .get('/api/${resourcePlural}/invalid')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/${resourcePlural}/:id', () => {
        let testId;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/${resourcePlural}')
                .send(mock${resourceName});
            testId = createResponse.body.data.id;
        });

        it('should update a ${resourceLower}', async () => {
            const updatedData = {
                name: 'Updated Name',
                description: 'Updated description'
            };

            const response = await request(app)
                .put(\`/api/${resourcePlural}/\${testId}\`)
                .send(updatedData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updatedData.name);
            expect(response.body.data.description).toBe(updatedData.description);
        });

        it('should return 404 for non-existent ${resourceLower}', async () => {
            const response = await request(app)
                .put('/api/${resourcePlural}/99999')
                .send({ name: 'Updated' })
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/${resourcePlural}/:id', () => {
        let testId;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/${resourcePlural}')
                .send(mock${resourceName});
            testId = createResponse.body.data.id;
        });

        it('should delete a ${resourceLower}', async () => {
            const response = await request(app)
                .delete(\`/api/${resourcePlural}/\${testId}\`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deleted');

            // Verify it's actually deleted
            const getResponse = await request(app)
                .get(\`/api/${resourcePlural}/\${testId}\`)
                .expect(404);
        });

        it('should return 404 for non-existent ${resourceLower}', async () => {
            const response = await request(app)
                .delete('/api/${resourcePlural}/99999')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });
});
`;
}

// JavaScript test template for In-Memory
export function getTestTemplateMemoryJS(resourceName) {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    
    return `import request from 'supertest';
import express from 'express';
import ${resourceName} from '../src/models/${resourceName}.js';
import ${resourceLower}Routes from '../src/routes/${resourceLower}Routes.js';

const app = express();
app.use(express.json());
app.use('/api/${resourcePlural}', ${resourceLower}Routes);

// Mock data
const mock${resourceName} = {
    name: 'Test ${resourceName}',
    description: 'Test description'
};

describe('${resourceName} CRUD Operations (In-Memory)', () => {
    // Clear in-memory data before each test
    beforeEach(() => {
        // Reset the in-memory array
        ${resourceName}.deleteAll();
    });

    describe('POST /api/${resourcePlural}', () => {
        it('should create a new ${resourceLower}', async () => {
            const response = await request(app)
                .post('/api/${resourcePlural}')
                .send(mock${resourceName})
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(mock${resourceName}.name);
            expect(response.body.data.description).toBe(mock${resourceName}.description);
            expect(response.body.data).toHaveProperty('createdAt');
        });

        it('should return 400 if name is missing', async () => {
            const response = await request(app)
                .post('/api/${resourcePlural}')
                .send({ description: 'Missing name' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should generate unique IDs', async () => {
            const response1 = await request(app)
                .post('/api/${resourcePlural}')
                .send(mock${resourceName});
            
            const response2 = await request(app)
                .post('/api/${resourcePlural}')
                .send(mock${resourceName});

            expect(response1.body.data.id).not.toBe(response2.body.data.id);
        });
    });

    describe('GET /api/${resourcePlural}', () => {
        beforeEach(async () => {
            // Create test data
            await request(app).post('/api/${resourcePlural}').send(mock${resourceName});
            await request(app).post('/api/${resourcePlural}').send({ name: 'Second ${resourceName}', description: 'Second' });
        });

        it('should get all ${resourcePlural}', async () => {
            const response = await request(app)
                .get('/api/${resourcePlural}')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.count).toBe(2);
        });

        it('should return empty array when no ${resourcePlural} exist', async () => {
            ${resourceName}.deleteAll();
            
            const response = await request(app)
                .get('/api/${resourcePlural}')
                .expect(200);

            expect(response.body.data).toHaveLength(0);
            expect(response.body.count).toBe(0);
        });
    });

    describe('GET /api/${resourcePlural}/:id', () => {
        let testId;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/${resourcePlural}')
                .send(mock${resourceName});
            testId = createResponse.body.data.id;
        });

        it('should get a ${resourceLower} by id', async () => {
            const response = await request(app)
                .get(\`/api/${resourcePlural}/\${testId}\`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(mock${resourceName}.name);
            expect(response.body.data.id).toBe(testId);
        });

        it('should return 404 for non-existent ${resourceLower}', async () => {
            const response = await request(app)
                .get('/api/${resourcePlural}/non-existent-id')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/${resourcePlural}/:id', () => {
        let testId;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/${resourcePlural}')
                .send(mock${resourceName});
            testId = createResponse.body.data.id;
        });

        it('should update a ${resourceLower}', async () => {
            const updatedData = {
                name: 'Updated Name',
                description: 'Updated description'
            };

            const response = await request(app)
                .put(\`/api/${resourcePlural}/\${testId}\`)
                .send(updatedData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updatedData.name);
            expect(response.body.data.description).toBe(updatedData.description);
            expect(response.body.data).toHaveProperty('updatedAt');
        });

        it('should return 404 for non-existent ${resourceLower}', async () => {
            const response = await request(app)
                .put('/api/${resourcePlural}/non-existent-id')
                .send({ name: 'Updated' })
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should preserve createdAt timestamp', async () => {
            const getResponse = await request(app).get(\`/api/${resourcePlural}/\${testId}\`);
            const originalCreatedAt = getResponse.body.data.createdAt;

            await request(app)
                .put(\`/api/${resourcePlural}/\${testId}\`)
                .send({ name: 'Updated' });

            const updatedResponse = await request(app).get(\`/api/${resourcePlural}/\${testId}\`);
            expect(updatedResponse.body.data.createdAt).toBe(originalCreatedAt);
        });
    });

    describe('DELETE /api/${resourcePlural}/:id', () => {
        let testId;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/${resourcePlural}')
                .send(mock${resourceName});
            testId = createResponse.body.data.id;
        });

        it('should delete a ${resourceLower}', async () => {
            const response = await request(app)
                .delete(\`/api/${resourcePlural}/\${testId}\`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deleted');

            // Verify it's actually deleted
            await request(app)
                .get(\`/api/${resourcePlural}/\${testId}\`)
                .expect(404);
        });

        it('should return 404 for non-existent ${resourceLower}', async () => {
            const response = await request(app)
                .delete('/api/${resourcePlural}/non-existent-id')
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should not affect other ${resourcePlural}', async () => {
            const response2 = await request(app)
                .post('/api/${resourcePlural}')
                .send({ name: 'Second ${resourceName}' });
            
            await request(app).delete(\`/api/${resourcePlural}/\${testId}\`);

            const getAllResponse = await request(app).get('/api/${resourcePlural}');
            expect(getAllResponse.body.data).toHaveLength(1);
            expect(getAllResponse.body.data[0].id).toBe(response2.body.data.id);
        });
    });
});
`;
}

// TypeScript test templates (similar structure but with types)
export function getTestTemplateMongoTS(resourceName) {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    
    return `import request from 'supertest';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import ${resourceName}, { I${resourceName} } from '../src/models/${resourceName}.js';
import ${resourceLower}Routes from '../src/routes/${resourceLower}Routes.js';

const app: Express = express();
app.use(express.json());
app.use('/api/${resourcePlural}', ${resourceLower}Routes);

// Mock data
const mock${resourceName}: Partial<I${resourceName}> = {
    name: 'Test ${resourceName}',
    description: 'Test description'
};

describe('${resourceName} CRUD Operations', () => {
    // Setup: Connect to test database
    beforeAll(async () => {
        const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/test-db';
        await mongoose.connect(testDbUri);
    });

    // Cleanup: Clear database after each test
    afterEach(async () => {
        await ${resourceName}.deleteMany({});
    });

    // Teardown: Close database connection
    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/${resourcePlural}', () => {
        it('should create a new ${resourceLower}', async () => {
            const response = await request(app)
                .post('/api/${resourcePlural}')
                .send(mock${resourceName})
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.name).toBe(mock${resourceName}.name);
            expect(response.body.data.description).toBe(mock${resourceName}.description);
            
            created${resourceName}Id = response.body.data._id;
        });

        it('should return 400 if name is missing', async () => {
            const response = await request(app)
                .post('/api/${resourcePlural}')
                .send({ description: 'Missing name' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should trim whitespace from name', async () => {
            const response = await request(app)
                .post('/api/${resourcePlural}')
                .send({ name: '  Test Name  ', description: 'Test' })
                .expect(201);

            expect(response.body.data.name).toBe('Test Name');
        });
    });

    describe('GET /api/${resourcePlural}', () => {
        beforeEach(async () => {
            // Create test data
            await ${resourceName}.create(mock${resourceName});
            await ${resourceName}.create({ name: 'Second ${resourceName}', description: 'Second' });
        });

        it('should get all ${resourcePlural}', async () => {
            const response = await request(app)
                .get('/api/${resourcePlural}')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.count).toBe(2);
        });

        it('should return empty array when no ${resourcePlural} exist', async () => {
            await ${resourceName}.deleteMany({});
            
            const response = await request(app)
                .get('/api/${resourcePlural}')
                .expect(200);

            expect(response.body.data).toHaveLength(0);
            expect(response.body.count).toBe(0);
        });
    });

    describe('GET /api/${resourcePlural}/:id', () => {
        let testId: string;

        beforeEach(async () => {
            const created = await ${resourceName}.create(mock${resourceName});
            testId = created._id.toString();
        });

        it('should get a ${resourceLower} by id', async () => {
            const response = await request(app)
                .get(\`/api/${resourcePlural}/\${testId}\`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(mock${resourceName}.name);
            expect(response.body.data._id).toBe(testId);
        });

        it('should return 404 for non-existent ${resourceLower}', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .get(\`/api/${resourcePlural}/\${fakeId}\`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid ObjectId', async () => {
            const response = await request(app)
                .get('/api/${resourcePlural}/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/${resourcePlural}/:id', () => {
        let testId: string;

        beforeEach(async () => {
            const created = await ${resourceName}.create(mock${resourceName});
            testId = created._id.toString();
        });

        it('should update a ${resourceLower}', async () => {
            const updatedData = {
                name: 'Updated Name',
                description: 'Updated description'
            };

            const response = await request(app)
                .put(\`/api/${resourcePlural}/\${testId}\`)
                .send(updatedData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updatedData.name);
            expect(response.body.data.description).toBe(updatedData.description);
        });

        it('should return 404 for non-existent ${resourceLower}', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .put(\`/api/${resourcePlural}/\${fakeId}\`)
                .send({ name: 'Updated' })
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid ObjectId', async () => {
            const response = await request(app)
                .put('/api/${resourcePlural}/invalid-id')
                .send({ name: 'Updated' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/${resourcePlural}/:id', () => {
        let testId: string;

        beforeEach(async () => {
            const created = await ${resourceName}.create(mock${resourceName});
            testId = created._id.toString();
        });

        it('should delete a ${resourceLower}', async () => {
            const response = await request(app)
                .delete(\`/api/${resourcePlural}/\${testId}\`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deleted');

            // Verify it's actually deleted
            const deleted = await ${resourceName}.findById(testId);
            expect(deleted).toBeNull();
        });

        it('should return 404 for non-existent ${resourceLower}', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .delete(\`/api/${resourcePlural}/\${fakeId}\`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid ObjectId', async () => {
            const response = await request(app)
                .delete('/api/${resourcePlural}/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
`;
}

export function getTestTemplateMySQLTS(resourceName) {
    const js = getTestTemplateMySQLJS(resourceName);
    // Convert to TypeScript by adding types
    return js
        .replace(/const app = express\(\);/g, 'const app: Express = express();')
        .replace(/import express from 'express';/g, "import express, { Express } from 'express';")
        .replace(/let testId;/g, 'let testId: number;');
}

export function getTestTemplateMemoryTS(resourceName) {
    const js = getTestTemplateMemoryJS(resourceName);
    // Convert to TypeScript by adding types
    return js
        .replace(/const app = express\(\);/g, 'const app: Express = express();')
        .replace(/import express from 'express';/g, "import express, { Express } from 'express';")
        .replace(/let testId;/g, 'let testId: string;');
}
