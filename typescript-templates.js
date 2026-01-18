// TypeScript Templates for lazy-express-crud
// These functions generate TypeScript code for the project

// tsconfig.json template
export function getTsConfigTemplate() {
    return `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`;
}

// Types for TypeScript projects
export function getTypesTemplate(dbChoice) {
    let types = `// Common types for the application

export interface Item {
    ${dbChoice === 'mongodb' ? '_id' : 'id'}${dbChoice === 'mongodb' ? '?' : ''}: string${dbChoice === 'mongodb' ? ' | undefined' : ''};
    name: string;
    description?: string;
    price?: number;
    ${dbChoice === 'mysql' ? 'created_at?: Date;\n    updated_at?: Date;' : ''}${dbChoice === 'mongodb' ? 'createdAt?: Date;\n    updatedAt?: Date;' : ''}
}

export interface ItemInput {
    name: string;
    description?: string;
    price?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    count?: number;
    message?: string;
}
`;

    return types;
}

// TypeScript server.ts template
export function getServerTemplateTS(dbChoice, projectName) {
    return `import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
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
    app.use((req: Request, res: Response, next: NextFunction) => {
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

const corsOptions: cors.CorsOptions = {
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
app.get('/', (req: Request, res: Response) => {
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    
    // Don't expose error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Something went wrong!' 
        : err.message;
    
    res.status(500).json({ 
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
}

// TypeScript database.ts template
export function getDatabaseConfigTemplateTS(dbChoice, projectName) {
    if (dbChoice === 'mongodb') {
        return `import mongoose from 'mongoose';

// MongoDB Connection with security options
if (!process.env.MONGODB_HOST || !process.env.MONGODB_DATABASE) {
    console.error('❌ Missing MongoDB configuration in .env file');
    console.error('Required: MONGODB_HOST, MONGODB_DATABASE');
    console.error('Optional: MONGODB_USER, MONGODB_PASSWORD, MONGODB_PORT');
    process.exit(1);
}

const connectDB = async (): Promise<void> => {
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
}

// TypeScript routes template
export function getRoutesTemplateTS() {
    return `import express from 'express';
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
}

// TypeScript controller template
export function getControllerTemplateTS(dbChoice) {
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    
    return `import { Request, Response } from 'express';
import Item from '../models/Item.js';
${dbChoice === 'mongodb' ? "import mongoose from 'mongoose';\n" : ''}import type { ApiResponse, ItemInput } from '../types/index.js';

// GET all items
export const getAllItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const items = ${isAsync ? 'await ' : ''}Item.${dbChoice === 'mongodb' ? 'find()' : 'getAll()'};
        res.json({
            success: true,
            count: items.length,
            data: items
        } as ApiResponse);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch items'
        } as ApiResponse);
    }
};

// GET item by id
export const getItemById = async (req: Request, res: Response): Promise<void> => {
    try {
        ${dbChoice === 'mongodb' ? `// Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            } as ApiResponse);
            return;
        }
        ` : ''}const item = ${isAsync ? 'await ' : ''}Item.${dbChoice === 'mongodb' ? 'findById(req.params.id)' : 'getById(req.params.id)'};
        if (!item) {
            res.status(404).json({
                success: false,
                error: 'Item not found'
            } as ApiResponse);
            return;
        }
        res.json({
            success: true,
            data: item
        } as ApiResponse);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch item'
        } as ApiResponse);
    }
};

// POST create item
export const createItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, price }: ItemInput = req.body;
        
        // Input validation
        if (!name || typeof name !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Name is required and must be a string'
            } as ApiResponse);
            return;
        }

        if (name.length > 255) {
            res.status(400).json({
                success: false,
                error: 'Name must be less than 255 characters'
            } as ApiResponse);
            return;
        }

        if (description && typeof description !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Description must be a string'
            } as ApiResponse);
            return;
        }

        if (description && description.length > 2000) {
            res.status(400).json({
                success: false,
                error: 'Description must be less than 2000 characters'
            } as ApiResponse);
            return;
        }

        const newItem = ${isAsync ? 'await ' : ''}Item.create({ name, description, price });
        res.status(201).json({
            success: true,
            data: newItem
        } as ApiResponse);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create item'
        } as ApiResponse);
    }
};

// PUT update item
export const updateItem = async (req: Request, res: Response): Promise<void> => {
    try {
        ${dbChoice === 'mongodb' ? `// Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            } as ApiResponse);
            return;
        }
        ` : ''}const { name, description, price }: Partial<ItemInput> = req.body;
        
        // Input validation
        if (name !== undefined) {
            if (typeof name !== 'string' || name.length > 255) {
                res.status(400).json({
                    success: false,
                    error: 'Name must be a string with max 255 characters'
                } as ApiResponse);
                return;
            }
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || description.length > 2000) {
                res.status(400).json({
                    success: false,
                    error: 'Description must be a string with max 2000 characters'
                } as ApiResponse);
                return;
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
            res.status(404).json({
                success: false,
                error: 'Item not found'
            } as ApiResponse);
            return;
        }

        res.json({
            success: true,
            data: updatedItem
        } as ApiResponse);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update item'
        } as ApiResponse);
    }
};

// DELETE item
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
    try {
        ${dbChoice === 'mongodb' ? `// Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            } as ApiResponse);
            return;
        }
        ` : ''}${dbChoice === 'mongodb' ? 
            `const deleted = await Item.findByIdAndDelete(req.params.id);
        
        if (!deleted) {` : 
            `const deleted = ${isAsync ? 'await ' : ''}Item.delete(req.params.id);
        
        if (!deleted) {`
        }
            res.status(404).json({
                success: false,
                error: 'Item not found'
            } as ApiResponse);
            return;
        }

        res.json({
            success: true,
            message: 'Item deleted successfully'
        } as ApiResponse);
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete item'
        } as ApiResponse);
    }
};
`;
}

// TypeScript model template
export function getModelTemplateTS(dbChoice) {
    if (dbChoice === 'mongodb') {
        return `import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
    name: string;
    description?: string;
    price?: number;
}

const itemSchema = new Schema<IItem>({
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

const Item = mongoose.model<IItem>('Item', itemSchema);

export default Item;
`;
    } else if (dbChoice === 'mysql') {
        return `import db from '../config/database.js';
import type { Item, ItemInput } from '../types/index.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

class ItemModel {
    static async getAll(): Promise<Item[]> {
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM items ORDER BY created_at DESC');
        return rows as Item[];
    }

    static async getById(id: string): Promise<Item | undefined> {
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM items WHERE id = ?', [id]);
        return rows[0] as Item | undefined;
    }

    static async create(data: ItemInput): Promise<Item> {
        const { name, description, price } = data;
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO items (name, description, price) VALUES (?, ?, ?)',
            [name, description || '', price || 0]
        );
        return {
            id: result.insertId.toString(),
            name,
            description: description || '',
            price: price || 0
        };
    }

    static async update(id: string, data: Partial<ItemInput>): Promise<Item | null> {
        const { name, description, price } = data;
        const updates: string[] = [];
        const values: any[] = [];
        
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
        const [result] = await db.query<ResultSetHeader>(
            \`UPDATE items SET \${updates.join(', ')} WHERE id = ?\`,
            values
        );
        
        if (result.affectedRows === 0) return null;
        return await ItemModel.getById(id) || null;
    }

    static async delete(id: string): Promise<boolean> {
        const [result] = await db.query<ResultSetHeader>('DELETE FROM items WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Helper method to initialize the table
    static async initTable(): Promise<void> {
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

export default ItemModel;
`;
    } else {
        // In-memory storage
        return `import type { Item, ItemInput } from '../types/index.js';

// In-memory data storage (for demo purposes)
// In production, use a real database like MongoDB, PostgreSQL, etc.

let items: Item[] = [
    { id: '1', name: 'Item 1', description: 'Description 1', price: 100 },
    { id: '2', name: 'Item 2', description: 'Description 2', price: 200 },
    { id: '3', name: 'Item 3', description: 'Description 3', price: 300 }
];

class ItemModel {
    static getAll(): Item[] {
        return items;
    }

    static getById(id: string): Item | undefined {
        return items.find(item => item.id === id);
    }

    static create(data: ItemInput): Item {
        const newItem: Item = {
            id: Date.now().toString(),
            name: data.name,
            description: data.description || '',
            price: data.price || 0
        };
        items.push(newItem);
        return newItem;
    }

    static update(id: string, data: Partial<ItemInput>): Item | null {
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return null;

        items[index] = {
            ...items[index],
            ...data,
            id: items[index].id // Preserve id
        };
        return items[index];
    }

    static delete(id: string): boolean {
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return false;

        items.splice(index, 1);
        return true;
    }
}

export default ItemModel;
`;
    }
}
