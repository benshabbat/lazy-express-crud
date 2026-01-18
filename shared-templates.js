// Shared templates and utilities for lazy-express-crud
// This file contains common code used across multiple generator files

// ============================================
// Utility Functions
// ============================================

// Security: Sanitize error messages for production
export function sanitizeError(error) {
    if (process.env.NODE_ENV === 'production') {
        return 'An error occurred. Please check your configuration.';
    }
    return error.message || error.toString();
}

// Security: Validate path to prevent path traversal
export function validatePath(inputPath) {
    const normalized = path.normalize(inputPath);
    if (normalized.includes('..') || normalized.includes('~')) {
        throw new Error('Invalid path: Path traversal detected');
    }
    if (normalized.length > 500) {
        throw new Error('Path too long');
    }
    return normalized;
}

// Security: Check if path is within project directory
export function isPathInProject(targetPath, projectRoot) {
    const normalizedTarget = path.resolve(projectRoot, targetPath);
    const normalizedRoot = path.resolve(projectRoot);
    return normalizedTarget.startsWith(normalizedRoot);
}

// Security: Validate resource name
export function validateResourceName(name) {
    // Check length (prevent DoS)
    if (!name || name.length === 0 || name.length > 100) {
        throw new Error('Resource name must be between 1 and 100 characters');
    }
    
    // Check for valid PascalCase pattern (for models/resources)
    const validPattern = /^[A-Z][a-zA-Z0-9]*$/;
    if (!validPattern.test(name)) {
        throw new Error('Resource name must be in PascalCase (e.g., User, ProductItem)');
    }
    
    // Prevent path traversal
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
        throw new Error('Resource name cannot contain path separators');
    }
    
    // Prevent reserved JavaScript/TypeScript keywords and Node.js globals
    const reserved = [
        'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
        'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally',
        'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null',
        'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
        'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'implements',
        'interface', 'package', 'private', 'protected', 'public',
        'Node', 'Process', 'Global', 'Console', 'Module', 'Require'
    ];
    
    if (reserved.includes(name)) {
        throw new Error(`"${name}" is a reserved name and cannot be used as a resource name`);
    }
    
    return true;
}

// Security: Validate project name
export function validateProjectName(name) {
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

// ============================================
// JavaScript Templates
// ============================================

// JavaScript Controller template - HTTP handling only
export function getControllerTemplate(dbChoice) {
    return `import * as itemService from '../services/itemService.js';

// GET all items
export const getAllItems = async (req, res) => {
    try {
        const items = await itemService.getAllItems();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch items'
        });
    }
};

// GET item by id
export const getItemById = async (req, res) => {
    try {
        const item = await itemService.getItemById(req.params.id);
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching item:', error);
        const message = error.message || 'Failed to fetch item';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        });
    }
};

// POST create item
export const createItem = async (req, res) => {
    try {
        const newItem = await itemService.createItem(req.body);
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create item'
        });
    }
};

// PUT update item
export const updateItem = async (req, res) => {
    try {
        const updatedItem = await itemService.updateItem(req.params.id, req.body);
        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating item:', error);
        const message = error.message || 'Failed to update item';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        });
    }
};

// DELETE item
export const deleteItem = async (req, res) => {
    try {
        await itemService.deleteItem(req.params.id);
        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        const message = error.message || 'Failed to delete item';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        });
    }
};
`;
}

// JavaScript Service template - Business logic layer
export function getServiceTemplate(dbChoice) {
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    
    return `import Item from '../models/Item.js';
${dbChoice === 'mongodb' ? "import mongoose from 'mongoose';\n" : ''}
// Get all items
export const getAllItems = async () => {
    return ${isAsync ? 'await ' : ''}Item.${dbChoice === 'mongodb' ? 'find()' : 'getAll()'};
};

// Get item by id
export const getItemById = async (id) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    const item = ${isAsync ? 'await ' : ''}Item.${dbChoice === 'mongodb' ? 'findById(id)' : 'getById(id)'};
    if (!item) {
        throw new Error('Item not found');
    }
    return item;
};

// Create new item
export const createItem = async (data) => {
    const { name, description, price } = data;
    
    // Validation
    if (!name || typeof name !== 'string') {
        throw new Error('Name is required and must be a string');
    }
    if (name.length > 255) {
        throw new Error('Name must be less than 255 characters');
    }
    if (description && typeof description !== 'string') {
        throw new Error('Description must be a string');
    }
    if (description && description.length > 2000) {
        throw new Error('Description must be less than 2000 characters');
    }

    return ${isAsync ? 'await ' : ''}Item.create({ name, description, price });
};

// Update item
export const updateItem = async (id, data) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    const { name, description, price } = data;
    
    // Validation
    if (name !== undefined) {
        if (typeof name !== 'string' || name.length > 255) {
            throw new Error('Name must be a string with max 255 characters');
        }
    }
    if (description !== undefined) {
        if (typeof description !== 'string' || description.length > 2000) {
            throw new Error('Description must be a string with max 2000 characters');
        }
    }

    ${dbChoice === 'mongodb' ? 
        `const updatedItem = await Item.findByIdAndUpdate(
        id,
        { name, description, price },
        { new: true, runValidators: true }
    );` :
        `const updatedItem = ${isAsync ? 'await ' : ''}Item.update(id, { name, description, price });`
    }
    
    if (!updatedItem) {
        throw new Error('Item not found');
    }
    return updatedItem;
};

// Delete item
export const deleteItem = async (id) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    ${dbChoice === 'mongodb' ? 
        `const deleted = await Item.findByIdAndDelete(id);` : 
        `const deleted = ${isAsync ? 'await ' : ''}Item.delete(id);`
    }
    
    if (!deleted) {
        throw new Error('Item not found');
    }
    return deleted;
};
`;
}

// JavaScript Model template
export function getModelTemplate(dbChoice) {
    if (dbChoice === 'mongodb') {
        return `import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [255, 'Name cannot be more than 255 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    price: {
        type: Number,
        min: [0, 'Price cannot be negative']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Security: Add index for performance
itemSchema.index({ name: 1 });

const Item = mongoose.model('Item', itemSchema);

export default Item;
`;
    } else if (dbChoice === 'mysql') {
        return `import pool from '../config/database.js';

class Item {
    // Get all items
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
        return rows;
    }

    // Get item by ID
    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
        return rows[0];
    }

    // Create new item
    static async create(itemData) {
        const { name, description, price } = itemData;
        const [result] = await pool.query(
            'INSERT INTO items (name, description, price) VALUES (?, ?, ?)',
            [name, description, price]
        );
        return { id: result.insertId, name, description, price };
    }

    // Update item
    static async update(id, itemData) {
        const { name, description, price } = itemData;
        const [result] = await pool.query(
            'UPDATE items SET name = ?, description = ?, price = ? WHERE id = ?',
            [name, description, price, id]
        );
        if (result.affectedRows === 0) return null;
        return { id, name, description, price };
    }

    // Delete item
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM items WHERE id = ?', [id]);
        return result.affectedRows > 0 ? { id } : null;
    }
}

export default Item;
`;
    } else { // in-memory
        return `// In-memory storage (for demo purposes only - data will be lost on server restart)
let items = [
    { id: '1', name: 'Sample Item 1', description: 'This is a sample item', price: 10.99 },
    { id: '2', name: 'Sample Item 2', description: 'Another sample item', price: 20.99 }
];
let nextId = 3;

class Item {
    // Get all items
    static getAll() {
        return items;
    }

    // Get item by ID
    static getById(id) {
        return items.find(item => item.id === id);
    }

    // Create new item
    static create(itemData) {
        const newItem = {
            id: String(nextId++),
            name: itemData.name,
            description: itemData.description,
            price: itemData.price
        };
        items.push(newItem);
        return newItem;
    }

    // Update item
    static update(id, itemData) {
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return null;
        
        items[index] = {
            ...items[index],
            ...itemData,
            id // Preserve the ID
        };
        return items[index];
    }

    // Delete item
    static delete(id) {
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return null;
        
        const deleted = items[index];
        items.splice(index, 1);
        return deleted;
    }
}

export default Item;
`;
    }
}
