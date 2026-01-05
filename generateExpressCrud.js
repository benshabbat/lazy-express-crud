#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

// Create project directory
const projectPath = path.join(process.cwd(), projectName);

// Check if directory already exists
if (fs.existsSync(projectPath)) {
    console.error(`❌ Error: Directory "${projectName}" already exists. Please choose a different name or remove the existing directory.`);
    process.exit(1);
}

console.log(`🚀 Creating Express CRUD project: ${projectName}`);

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

// package.json template
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
        dotenv: '^16.3.1'
    },
    devDependencies: {
        nodemon: '^3.0.1'
    }
};

// server.js template
const serverTemplate = `import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import itemRoutes from './routes/itemRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to Express CRUD API',
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
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(\`🚀 Server is running on http://localhost:\${PORT}\`);
});

export default app;
`;

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

// itemController.js template
const controllerTemplate = `import Item from '../models/Item.js';

// GET all items
export const getAllItems = (req, res) => {
    try {
        const items = Item.getAll();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// GET item by id
export const getItemById = (req, res) => {
    try {
        const item = Item.getById(req.params.id);
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// POST create item
export const createItem = (req, res) => {
    try {
        const { name, description, price } = req.body;
        
        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }

        const newItem = Item.create({ name, description, price });
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// PUT update item
export const updateItem = (req, res) => {
    try {
        const { name, description, price } = req.body;
        const updatedItem = Item.update(req.params.id, { name, description, price });
        
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// DELETE item
export const deleteItem = (req, res) => {
    try {
        const deleted = Item.delete(req.params.id);
        
        if (!deleted) {
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
`;

// Item.js model template (In-memory storage)
const modelTemplate = `// In-memory data storage (for demo purposes)
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

// .env template
const envTemplate = `PORT=3000
NODE_ENV=development
`;

// .gitignore template
const gitignoreTemplate = `node_modules/
.env
.DS_Store
*.log
`;

// README.md template
const readmeTemplate = `# ${projectName}

Express CRUD API generated automatically

## Installation

\`\`\`bash
npm install
\`\`\`

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

## Note

This project uses in-memory storage for demonstration purposes. 
For production, integrate a real database like MongoDB, PostgreSQL, or MySQL.
`;

// Write all files
const files = [
    { path: path.join(projectPath, 'package.json'), content: JSON.stringify(packageJson, null, 2) },
    { path: path.join(projectPath, 'src', 'server.js'), content: serverTemplate },
    { path: path.join(projectPath, 'src', 'routes', 'itemRoutes.js'), content: routesTemplate },
    { path: path.join(projectPath, 'src', 'controllers', 'itemController.js'), content: controllerTemplate },
    { path: path.join(projectPath, 'src', 'models', 'Item.js'), content: modelTemplate },
    { path: path.join(projectPath, '.env'), content: envTemplate },
    { path: path.join(projectPath, '.gitignore'), content: gitignoreTemplate },
    { path: path.join(projectPath, 'README.md'), content: readmeTemplate }
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

console.log(`
✨ Project created successfully!

Next steps:
  1. cd ${projectName}
  2. npm install
  3. npm run dev

Your Express CRUD API will be running on http://localhost:3000
`);
