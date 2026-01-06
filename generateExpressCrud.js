#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Get project name from command line arguments
const projectName = process.argv[2] || 'express-crud-app';

// Validate project name for security
function validateProjectName(name) {
    // Check length (prevent DoS)
    if (name.length === 0 || name.length > 214) {
        console.error('❌ Error: Project name must be between 1 and 214 characters.');
        process.exit(1);
    }
    
    // Check for valid characters (alphanumeric, dash, underscore)
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    
    if (!validPattern.test(name)) {
        console.error('❌ Error: Project name can only contain letters, numbers, dashes, and underscores.');
        process.exit(1);
    }
    
    // Prevent path traversal attacks
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
        console.error('❌ Error: Project name cannot contain path separators or parent directory references.');
        process.exit(1);
    }
    
    // Prevent reserved names
    const reserved = ['node_modules', '.git', '.env', 'package.json', 'package-lock.json', 'src', 'dist', 'build'];
    if (reserved.includes(name.toLowerCase())) {
        console.error(`❌ Error: "${name}" is a reserved name and cannot be used.`);
        process.exit(1);
    }
    
    // Prevent starting with dot (hidden files)
    if (name.startsWith('.')) {
        console.error('❌ Error: Project name cannot start with a dot.');
        process.exit(1);
    }
    
    return true;
}

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

// Create project directory
const projectPath = path.join(process.cwd(), projectName);

// Check if directory already exists
if (fs.existsSync(projectPath)) {
    console.error(`❌ Error: Directory "${projectName}" already exists. Please choose a different name or remove the existing directory.`);
    process.exit(1);
}

// Main async function
async function createProject() {
    // Ask for database choice
    const dbChoice = await askDatabaseChoice();
    
    console.log(`\n🚀 Creating Express CRUD project: ${projectName}`);
    console.log(`📊 Database: ${dbChoice === 'mongodb' ? 'MongoDB' : dbChoice === 'mysql' ? 'MySQL' : 'In-Memory'}`);

// Create directory structure
const directories = [
    projectPath,
    path.join(projectPath, 'src'),
    path.join(projectPath, 'src', 'routes'),
    path.join(projectPath, 'src', 'controllers'),
    path.join(projectPath, 'src', 'models'),
    path.join(projectPath, 'src', 'middlewares')
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
    main: 'src/server.js',
    type: 'module',
    scripts: {
        start: 'node src/server.js',
        dev: 'nodemon src/server.js'
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
        nodemon: '^3.0.1'
    }
};

// server.js template based on database choice
const getServerTemplate = (dbChoice) => {
    const mongoConnection = dbChoice === 'mongodb' ? `
import mongoose from 'mongoose';

// MongoDB Connection with security options
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/${projectName}', {
            // Security: Use TLS/SSL in production
            ssl: process.env.NODE_ENV === 'production',
            // Timeout settings
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.error('Please check your MONGODB_URI in .env file');
        process.exit(1);
    }
};

connectDB();
` : '';

    const mysqlConnection = dbChoice === 'mysql' ? `
import mysql from 'mysql2/promise';

// MySQL Connection Pool
export const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '${projectName}',
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
` : '';

    return `import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import itemRoutes from './routes/itemRoutes.js';
${dbChoice === 'mongodb' ? "import mongoose from 'mongoose';\n" : ''}${dbChoice === 'mysql' ? "import mysql from 'mysql2/promise';\n" : ''}
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
${mongoConnection}${mysqlConnection}
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

// itemController.js template based on database choice
const getControllerTemplate = (dbChoice) => {
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    
    return `import Item from '../models/Item.js';
${dbChoice === 'mongodb' ? "import mongoose from 'mongoose';\n" : ''}
// GET all items
export const getAllItems = async (req, res) => {
    try {
        const items = ${isAsync ? 'await ' : ''}Item.${dbChoice === 'mongodb' ? 'find()' : 'getAll()'};
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch items'
        });
    }
};

// GET item by id
export const getItemById = async (req, res) => {
    try {
        ${dbChoice === 'mongodb' ? `// Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        ` : ''}const item = ${isAsync ? 'await ' : ''}Item.${dbChoice === 'mongodb' ? 'findById(req.params.id)' : 'getById(req.params.id)'};
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Item not found'
            });
        }
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch item'
        });
    }
};

// POST create item
export const createItem = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        
        // Input validation
        if (!name || typeof name !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Name is required and must be a string'
            });
        }

        if (name.length > 255) {
            return res.status(400).json({
                success: false,
                error: 'Name must be less than 255 characters'
            });
        }

        if (description && typeof description !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Description must be a string'
            });
        }

        if (description && description.length > 2000) {
            return res.status(400).json({
                success: false,
                error: 'Description must be less than 2000 characters'
            });
        }

        const newItem = ${isAsync ? 'await ' : ''}Item.create({ name, description, price });
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create item'
        });
    }
};

// PUT update item
export const updateItem = async (req, res) => {
    try {
        ${dbChoice === 'mongodb' ? `// Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        ` : ''}const { name, description, price } = req.body;
        
        // Input validation
        if (name !== undefined) {
            if (typeof name !== 'string' || name.length > 255) {
                return res.status(400).json({
                    success: false,
                    error: 'Name must be a string with max 255 characters'
                });
            }
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || description.length > 2000) {
                return res.status(400).json({
                    success: false,
                    error: 'Description must be a string with max 2000 characters'
                });
            }
        }

        ${dbChoice === 'mongodb' ? 
            `const updatedItem = await Item.findByIdAndUpdate(
            req.params.id, 
            { name, description, price },
            { new: true, runValidators: true }
        );` : 
            `const updatedItem = ${isAsync ? 'await ' : ''}Item.update(req.params.id, { name, description, price });`
        }
        
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                error: 'Item not found'
            });
        }

        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update item'
        });
    }
};

// DELETE item
export const deleteItem = async (req, res) => {
    try {
        ${dbChoice === 'mongodb' ? `// Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        ` : ''}${dbChoice === 'mongodb' ? 
            `const deleted = await Item.findByIdAndDelete(req.params.id);
        
        if (!deleted) {` : 
            `const deleted = ${isAsync ? 'await ' : ''}Item.delete(req.params.id);
        
        if (!deleted) {`
        }
            return res.status(404).json({
                success: false,
                error: 'Item not found'
            });
        }

        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete item'
        });
    }
};
`;
};

// Item.js model template based on database choice
const getModelTemplate = (dbChoice) => {
    if (dbChoice === 'mongodb') {
        return `import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'Price cannot be negative']
    }
}, {
    timestamps: true
});

const Item = mongoose.model('Item', itemSchema);

export default Item;
`;
    } else if (dbChoice === 'mysql') {
        return `import { db } from '../server.js';

class Item {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM items ORDER BY created_at DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM items WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { name, description, price } = data;
        const [result] = await db.query(
            'INSERT INTO items (name, description, price) VALUES (?, ?, ?)',
            [name, description || '', price || 0]
        );
        return {
            id: result.insertId,
            name,
            description: description || '',
            price: price || 0
        };
    }

    static async update(id, data) {
        const { name, description, price } = data;
        const updates = [];
        const values = [];
        
        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (price !== undefined) {
            updates.push('price = ?');
            values.push(price);
        }
        
        if (updates.length === 0) return null;
        
        values.push(id);
        const [result] = await db.query(
            \`UPDATE items SET \${updates.join(', ')} WHERE id = ?\`,
            values
        );
        
        if (result.affectedRows === 0) return null;
        return await Item.getById(id);
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM items WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Helper method to initialize the table
    static async initTable() {
        await db.query(\`
            CREATE TABLE IF NOT EXISTS items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        \`);
    }
}

export default Item;
`;
    } else {
        // In-memory storage
        return `// In-memory data storage (for demo purposes)
// In production, use a real database like MongoDB, PostgreSQL, etc.

let items = [
    { id: '1', name: 'Item 1', description: 'Description 1', price: 100 },
    { id: '2', name: 'Item 2', description: 'Description 2', price: 200 },
    { id: '3', name: 'Item 3', description: 'Description 3', price: 300 }
];

class Item {
    static getAll() {
        return items;
    }

    static getById(id) {
        return items.find(item => item.id === id);
    }

    static create(data) {
        const newItem = {
            id: Date.now().toString(),
            name: data.name,
            description: data.description || '',
            price: data.price || 0,
            createdAt: new Date().toISOString()
        };
        items.push(newItem);
        return newItem;
    }

    static update(id, data) {
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return null;

        items[index] = {
            ...items[index],
            ...data,
            id: items[index].id, // Preserve id
            updatedAt: new Date().toISOString()
        };
        return items[index];
    }

    static delete(id) {
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return false;

        items.splice(index, 1);
        return true;
    }
}

export default Item;
`;
    }
};

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
MONGODB_URI=mongodb://localhost:27017/${projectName}

# Production (with authentication and SSL - REQUIRED!):
# MONGODB_URI=mongodb://username:password@host:port/${projectName}?authSource=admin&ssl=true
#
# MongoDB Atlas (cloud with TLS):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/${projectName}?retryWrites=true&w=majority&ssl=true
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
    { path: path.join(projectPath, 'src', 'server.js'), content: getServerTemplate(dbChoice) },
    { path: path.join(projectPath, 'src', 'routes', 'itemRoutes.js'), content: routesTemplate },
    { path: path.join(projectPath, 'src', 'controllers', 'itemController.js'), content: getControllerTemplate(dbChoice) },
    { path: path.join(projectPath, 'src', 'models', 'Item.js'), content: getModelTemplate(dbChoice) },
    { path: path.join(projectPath, '.env'), content: getEnvTemplate(dbChoice) },
    { path: path.join(projectPath, '.gitignore'), content: gitignoreTemplate },
    { path: path.join(projectPath, 'README.md'), content: getReadmeTemplate(dbChoice) }
];

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
