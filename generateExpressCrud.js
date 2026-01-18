#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
    getTsConfigTemplate,
    getTypesTemplate,
    getServerTemplateTS,
    getDatabaseConfigTemplateTS,
    getRoutesTemplateTS,
    getControllerTemplateTS,
    getServiceTemplateTS,
    getModelTemplateTS
} from './typescript-templates-new.js';
import {
    getJestConfigJS,
    getJestConfigTS,
    getTestTemplateMongoJS,
    getTestTemplateMySQLJS,
    getTestTemplateMemoryJS,
    getTestTemplateMongoTS,
    getTestTemplateMySQLTS,
    getTestTemplateMemoryTS
} from './test-templates.js';
import {
    sanitizeError,
    validateProjectName,
    getControllerTemplate,
    getServiceTemplate,
    getModelTemplate
} from './shared-templates-new.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project name from command line arguments
const projectName = process.argv[2] || 'express-crud-app';

// Validate the project name
validateProjectName(projectName);

// Function to ask user for database choice
function askDatabaseChoice() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('\n📊 Choose your database:');
        console.log('1. MongoDB (NoSQL)');
        console.log('2. MySQL (SQL)');
        console.log('3. In-Memory (No database - for demo)');
        
        rl.question('\nEnter your choice (1/2/3): ', (answer) => {
            rl.close();
            const choice = answer.trim();
            if (choice === '1') {
                resolve('mongodb');
            } else if (choice === '2') {
                resolve('mysql');
            } else if (choice === '3') {
                resolve('memory');
            } else {
                console.log('Invalid choice. Using in-memory storage as default.');
                resolve('memory');
            }
        });
    });
}

// Function to ask user for language choice
function askLanguageChoice() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('\n💻 Choose your language:');
        console.log('1. JavaScript (ES6+)');
        console.log('2. TypeScript');
        
        rl.question('\nEnter your choice (1/2): ', (answer) => {
            rl.close();
            const choice = answer.trim();
            if (choice === '2') {
                resolve('typescript');
            } else {
                resolve('javascript');
            }
        });
    });
}

// Create project directory
const projectPath = path.join(process.cwd(), projectName);

// Check if directory already exists
if (fs.existsSync(projectPath)) {
    console.error(`❌ Error: Directory "${projectName}" already exists. Please choose a different name or remove the existing directory.`);
    process.exit(1);
}

// Main async function
async function createProject() {
    // Ask for language choice
    const langChoice = await askLanguageChoice();
    
    // Ask for database choice
    const dbChoice = await askDatabaseChoice();
    
    const isTypeScript = langChoice === 'typescript';
    const ext = isTypeScript ? 'ts' : 'js';
    
    console.log(`\n🚀 Creating Express CRUD project: ${projectName}`);
    console.log(`💻 Language: ${isTypeScript ? 'TypeScript' : 'JavaScript'}`);
    console.log(`📊 Database: ${dbChoice === 'mongodb' ? 'MongoDB' : dbChoice === 'mysql' ? 'MySQL' : 'In-Memory'}`);

// Create directory structure
const directories = [
    projectPath,
    path.join(projectPath, 'src'),
    path.join(projectPath, 'src', 'routes'),
    path.join(projectPath, 'src', 'controllers'),
    path.join(projectPath, 'src', 'services'),
    path.join(projectPath, 'src', 'models'),
    path.join(projectPath, 'src', 'middlewares'),
    path.join(projectPath, 'src', 'config'),
    path.join(projectPath, 'tests'),
    ...(isTypeScript ? [path.join(projectPath, 'src', 'types')] : [])
];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${path.relative(process.cwd(), dir)}`);
        } catch (error) {
            console.error(`❌ Error creating directory ${dir}: ${error.message}`);
            process.exit(1);
        }
    }
});

// package.json template based on database choice
const packageJson = {
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

// Database configuration template
const getDatabaseConfigTemplate = (dbChoice) => {
    if (dbChoice === 'mongodb') {
        return `import mongoose from 'mongoose';

// MongoDB Connection with security options
if (!process.env.MONGODB_HOST || !process.env.MONGODB_DATABASE) {
    console.error('❌ Missing MongoDB configuration in .env file');
    console.error('Required: MONGODB_HOST, MONGODB_DATABASE');
    console.error('Optional: MONGODB_USER, MONGODB_PASSWORD, MONGODB_PORT');
    process.exit(1);
}

const connectDB = async () => {
    try {
        // Build MongoDB URI from components
        const port = process.env.MONGODB_PORT || '27017';
        const hasAuth = process.env.MONGODB_USER && process.env.MONGODB_PASSWORD;
        
        const uri = hasAuth
            ? \`mongodb://\${process.env.MONGODB_USER}:\${process.env.MONGODB_PASSWORD}@\${process.env.MONGODB_HOST}:\${port}/\${process.env.MONGODB_DATABASE}\`
            : \`mongodb://\${process.env.MONGODB_HOST}:\${port}/\${process.env.MONGODB_DATABASE}\`;
        
        await mongoose.connect(uri, {
            // Security: Use TLS/SSL in production
            ssl: process.env.NODE_ENV === 'production',
            // Timeout settings
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.error('Please check your MongoDB configuration in .env file');
        process.exit(1);
    }
};

export default connectDB;
`;
    } else if (dbChoice === 'mysql') {
        return `import mysql from 'mysql2/promise';

// MySQL Connection Pool
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    console.error('❌ Missing MySQL configuration in .env file');
    console.error('Required: DB_HOST, DB_USER, DB_NAME, DB_PASSWORD');
    process.exit(1);
}

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
db.getConnection()
    .then(connection => {
        console.log('✅ MySQL connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL connection error:', err);
        process.exit(1);
    });

export default db;
`;
    }
    return '';
};

// server.js template based on database choice
const getServerTemplate = (dbChoice) => {

    return `import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import itemRoutes from './routes/itemRoutes.js';
${dbChoice === 'mongodb' ? "import connectDB from './config/database.js';\n" : ''}${dbChoice === 'mysql' ? "import db from './config/database.js';\n" : ''}
const app = express();
const PORT = process.env.PORT || 3000;

// Environment validation
const requiredEnvVars = ${dbChoice === 'mongodb' ? "['MONGODB_URI']" : dbChoice === 'mysql' ? "['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']" : '[]'};
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
}
${dbChoice === 'mongodb' ? '\n// Connect to MongoDB\nconnectDB();\n' : ''}${dbChoice === 'mysql' ? '\n// MySQL connection pool is ready\n// Import db in models: import db from \'../config/database.js\';\n' : ''}
// Security Middleware
app.use(helmet()); // Security headers

// HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(\`https://\${req.header('host')}\${req.url}\`);
        } else {
            next();
        }
    });
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// CORS configuration with whitelist
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (process.env.NODE_ENV === 'production') {
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        } else {
            // Development: allow all origins
            callback(null, true);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to Express CRUD API',
        database: '${dbChoice === 'mongodb' ? 'MongoDB' : dbChoice === 'mysql' ? 'MySQL' : 'In-Memory'}',
        endpoints: {
            'GET /api/items': 'Get all items',
            'GET /api/items/:id': 'Get item by id',
            'POST /api/items': 'Create new item',
            'PUT /api/items/:id': 'Update item',
            'DELETE /api/items/:id': 'Delete item'
        }
    });
});

app.use('/api/items', itemRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Don't expose error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Something went wrong!' 
        : err.message;
    
    res.status(err.status || 500).json({ 
        error: errorMessage 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(\`🚀 Server is running on http://localhost:\${PORT}\`);
    console.log(\`Environment: \${process.env.NODE_ENV || 'development'}\`);
});

export default app;
`;
};

// itemRoutes.js template
const routesTemplate = `import express from 'express';
import * as itemController from '../controllers/itemController.js';

const router = express.Router();

// GET all items
router.get('/', itemController.getAllItems);

// GET item by id
router.get('/:id', itemController.getItemById);

// POST create new item
router.post('/', itemController.createItem);

// PUT update item
router.put('/:id', itemController.updateItem);

// DELETE item
router.delete('/:id', itemController.deleteItem);

export default router;
`;

// .env template based on database choice
const getEnvTemplate = (dbChoice) => {
    let template = `PORT=3000
NODE_ENV=development

# CORS Configuration
# Comma-separated list of allowed origins for production
# ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com
`;
    
    if (dbChoice === 'mongodb') {
        template += `
# MongoDB Connection
# Development (no authentication):
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=${projectName}
# MONGODB_USER=
# MONGODB_PASSWORD=

# Production (with authentication - REQUIRED!):
# MONGODB_HOST=your-production-host
# MONGODB_PORT=27017
# MONGODB_USER=your-mongodb-user
# MONGODB_PASSWORD=your-secure-password
# MONGODB_DATABASE=${projectName}
#
# MongoDB Atlas (cloud):
# For Atlas, use the host from your connection string without mongodb://
# Example: MONGODB_HOST=cluster0.abcde.mongodb.net
# Then enable authentication with your Atlas credentials
`;
    } else if (dbChoice === 'mysql') {
        template += `
# MySQL Connection
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=${projectName}

# Production MySQL (with strong password - REQUIRED!):
# DB_HOST=your-production-host
# DB_USER=your-db-user
# DB_PASSWORD=your-secure-password
# DB_NAME=${projectName}
`;
    }
    
    template += `
# Security Notes:
# 1. Never commit .env files to git!
# 2. Use strong passwords in production
# 3. Enable SSL/TLS for database connections in production
# 4. Set ALLOWED_ORIGINS to your production domains
`;
    
    return template;
};

// .gitignore template
const gitignoreTemplate = `node_modules/
.env
.DS_Store
*.log
`;

// README.md template based on database choice
const getReadmeTemplate = (dbChoice) => {
    const dbSetup = dbChoice === 'mongodb' ? `
### Database Setup (MongoDB)

1. Install MongoDB on your machine
2. Start MongoDB service
3. Update the \`MONGODB_URI\` in \`.env\` file if needed

The database will be created automatically when you start the server.
` : dbChoice === 'mysql' ? `
### Database Setup (MySQL)

1. Install MySQL on your machine
2. Create a database:
\`\`\`sql
CREATE DATABASE ${projectName};
\`\`\`

3. Update the database credentials in \`.env\` file

4. Run the table initialization (the table will be created automatically on first run, or you can create it manually):
\`\`\`sql
USE ${projectName};

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`
` : `
### Note

This project uses in-memory storage for demonstration purposes.
Data will be lost when the server restarts.
For production, consider using a real database like MongoDB or MySQL.
`;

    return `# ${projectName}

Express CRUD API with ${dbChoice === 'mongodb' ? 'MongoDB' : dbChoice === 'mysql' ? 'MySQL' : 'In-Memory Storage'}

## Installation

\`\`\`bash
npm install
\`\`\`
${dbSetup}
## Usage

### Development mode with auto-reload:
\`\`\`bash
npm run dev
\`\`\`

### Production mode:
\`\`\`bash
npm start
\`\`\`

## API Endpoints

### Get all items
\`\`\`
GET http://localhost:3000/api/items
\`\`\`

### Get item by ID
\`\`\`
GET http://localhost:3000/api/items/:id
\`\`\`

### Create new item
\`\`\`
POST http://localhost:3000/api/items
Content-Type: application/json

{
    "name": "New Item",
    "description": "Item description",
    "price": 150
}
\`\`\`

### Update item
\`\`\`
PUT http://localhost:3000/api/items/:id
Content-Type: application/json

{
    "name": "Updated Item",
    "description": "Updated description",
    "price": 200
}
\`\`\`

### Delete item
\`\`\`
DELETE http://localhost:3000/api/items/:id
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── config/
│   │   └── database.js${dbChoice === 'mongodb' || dbChoice === 'mysql' ? ' (database connection)' : ''}
│   ├── controllers/
│   │   └── itemController.js
│   ├── models/
│   │   └── Item.js
│   ├── routes/
│   │   └── itemRoutes.js
│   ├── middlewares/
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
\`\`\`

## Technologies

- Express.js - Web framework
- ${dbChoice === 'mongodb' ? 'MongoDB with Mongoose - Database' : dbChoice === 'mysql' ? 'MySQL - Database' : 'In-Memory Storage (for demo)'}
- helmet - Security headers
- express-rate-limit - Rate limiting protection
- CORS - Cross-origin resource sharing
- dotenv - Environment variables

## Security Features

This API includes several security measures:

- **Helmet**: Security headers (XSS, clickjacking, etc.)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Type and length validation on all inputs
- **MongoDB ObjectId Validation**: Prevents NoSQL injection${dbChoice === 'mongodb' ? '' : ' (when using MongoDB)'}
- **SQL Parameterized Queries**: Prevents SQL injection${dbChoice === 'mysql' ? '' : ' (when using MySQL)'}
- **Payload Size Limit**: 10MB max to prevent DoS
- **Error Message Sanitization**: No sensitive data exposed in production

### Production Security Checklist

Before deploying to production:

- [ ] Configure CORS with specific origins
- [ ] Use strong passwords in production databases
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS/TLS
- [ ] Keep dependencies updated
- [ ] Use a process manager (PM2)
- [ ] Set up proper logging
- [ ] Configure firewall rules
- [ ] Use secrets management (not .env in production)
- [ ] Enable database authentication

## License

ISC
`;
};

// Write all files
const files = [
    { path: path.join(projectPath, 'package.json'), content: JSON.stringify(packageJson, null, 2) },
    { path: path.join(projectPath, `src/server.${ext}`), content: isTypeScript ? getServerTemplateTS(dbChoice, projectName) : getServerTemplate(dbChoice) },
    { path: path.join(projectPath, `src/routes/itemRoutes.${ext}`), content: isTypeScript ? getRoutesTemplateTS() : routesTemplate },
    { path: path.join(projectPath, `src/controllers/itemController.${ext}`), content: isTypeScript ? getControllerTemplateTS(dbChoice) : getControllerTemplate(dbChoice) },
    { path: path.join(projectPath, `src/services/itemService.${ext}`), content: isTypeScript ? getServiceTemplateTS(dbChoice) : getServiceTemplate(dbChoice) },
    { path: path.join(projectPath, `src/models/Item.${ext}`), content: isTypeScript ? getModelTemplateTS(dbChoice) : getModelTemplate(dbChoice) },
    { path: path.join(projectPath, '.env'), content: getEnvTemplate(dbChoice) },
    { path: path.join(projectPath, '.gitignore'), content: isTypeScript ? gitignoreTemplate + 'dist/\n' : gitignoreTemplate },
    { path: path.join(projectPath, 'README.md'), content: getReadmeTemplate(dbChoice) }
];

// Add TypeScript specific files
if (isTypeScript) {
    files.push(
        { path: path.join(projectPath, 'tsconfig.json'), content: getTsConfigTemplate() },
        { path: path.join(projectPath, `src/types/index.${ext}`), content: getTypesTemplate(dbChoice) }
    );
}

// Add database config file if using MongoDB or MySQL
if (dbChoice === 'mongodb' || dbChoice === 'mysql') {
    files.push({
        path: path.join(projectPath, `src/config/database.${ext}`),
        content: isTypeScript ? getDatabaseConfigTemplateTS(dbChoice, projectName) : getDatabaseConfigTemplate(dbChoice)
    });
}

// Add Jest configuration file
files.push({
    path: path.join(projectPath, 'jest.config.js'),
    content: isTypeScript ? getJestConfigTS() : getJestConfigJS()
});

// Add test file for Item resource
const testFileName = `Item.test.${isTypeScript ? 'ts' : 'js'}`;
let testContent;
if (isTypeScript) {
    testContent = dbChoice === 'mongodb' ? getTestTemplateMongoTS('Item') :
                  dbChoice === 'mysql' ? getTestTemplateMySQLTS('Item') :
                  getTestTemplateMemoryTS('Item');
} else {
    testContent = dbChoice === 'mongodb' ? getTestTemplateMongoJS('Item') :
                  dbChoice === 'mysql' ? getTestTemplateMySQLJS('Item') :
                  getTestTemplateMemoryJS('Item');
}
files.push({
    path: path.join(projectPath, 'tests', testFileName),
    content: testContent
});

files.forEach(file => {
    try {
        fs.writeFileSync(file.path, file.content);
        console.log(`✅ Created file: ${path.relative(process.cwd(), file.path)}`);
    } catch (error) {
        console.error(`❌ Error creating file ${file.path}: ${error.message}`);
        process.exit(1);
    }
});

const nextSteps = dbChoice === 'mongodb' ? `
  1. cd ${projectName}
  2. npm install
  3. Make sure MongoDB is running
  4. npm run dev
` : dbChoice === 'mysql' ? `
  1. cd ${projectName}
  2. npm install
  3. Create MySQL database: CREATE DATABASE ${projectName};
  4. Update .env file with your MySQL credentials
  5. npm run dev (tables will be created automatically)
` : `
  1. cd ${projectName}
  2. npm install
  3. npm run dev
`;

console.log(`
✨ Project created successfully!

Database: ${dbChoice === 'mongodb' ? '🍃 MongoDB' : dbChoice === 'mysql' ? '🐬 MySQL' : '💾 In-Memory'}

Next steps:${nextSteps}
Your Express CRUD API will be running on http://localhost:3000
`);
}

// Run the async function
createProject().catch(error => {
    console.error('❌ Error creating project:', error);
    process.exit(1);
});
