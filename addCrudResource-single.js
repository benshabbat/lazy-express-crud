#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
    getTestTemplateMongoJS,
    getTestTemplateMySQLJS,
    getTestTemplateMemoryJS,
    getTestTemplateMongoTS,
    getTestTemplateMySQLTS,
    getTestTemplateMemoryTS
} from './test-templates.js';
import {
    sanitizeError,
    validatePath,
    isPathInProject,
    validateResourceName,
    getServiceTemplate as getBaseServiceTemplate
} from './shared-templates-new.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get resource name from command line arguments
const resourceName = process.argv[2];

if (!resourceName) {
    console.error('❌ Error: Please provide a resource name');
    console.log('\nUsage: add-crud <ResourceName>');
    console.log('Example: add-crud User');
    process.exit(1);
}

// Validate resource name
try {
    validateResourceName(resourceName);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

// TypeScript template generators (declared early since they're used in getModelTemplate, etc.)
function getModelTemplateTS() {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    
    if (dbChoice === 'mongodb') {
        return `import mongoose, { Schema, Document } from 'mongoose';

export interface I${resourceName} extends Document {
    name: string;
    description?: string;
}

const ${resourceLower}Schema = new Schema<I${resourceName}>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

const ${resourceName} = mongoose.model<I${resourceName}>('${resourceName}', ${resourceLower}Schema);

export default ${resourceName};
`;
    } else if (dbChoice === 'mysql') {
        return `import db from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface ${resourceName}Data {
    id?: string;
    name: string;
    description?: string;
    created_at?: Date;
    updated_at?: Date;
}

class ${resourceName}Model {
    static async getAll(): Promise<${resourceName}Data[]> {
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM ${resourcePlural} ORDER BY created_at DESC');
        return rows as ${resourceName}Data[];
    }

    static async getById(id: string): Promise<${resourceName}Data | undefined> {
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM ${resourcePlural} WHERE id = ?', [id]);
        return rows[0] as ${resourceName}Data | undefined;
    }

    static async create(data: ${resourceName}Data): Promise<${resourceName}Data> {
        const { name, description } = data;
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO ${resourcePlural} (name, description) VALUES (?, ?)',
            [name, description || '']
        );
        return {
            id: result.insertId.toString(),
            name,
            description: description || ''
        };
    }

    static async update(id: string, data: Partial<${resourceName}Data>): Promise<${resourceName}Data | null> {
        const { name, description } = data;
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
        
        if (updates.length === 0) return null;
        
        values.push(id);
        const [result] = await db.query<ResultSetHeader>(
            \`UPDATE ${resourcePlural} SET \${updates.join(', ')} WHERE id = ?\`,
            values
        );
        
        if (result.affectedRows === 0) return null;
        return await ${resourceName}Model.getById(id) || null;
    }

    static async delete(id: string): Promise<boolean> {
        const [result] = await db.query<ResultSetHeader>('DELETE FROM ${resourcePlural} WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async initTable(): Promise<void> {
        await db.query(\`
            CREATE TABLE IF NOT EXISTS ${resourcePlural} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        \`);
    }
}

export default ${resourceName}Model;
`;
    } else {
        // In-memory
        return `interface ${resourceName}Data {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

let ${resourcePlural}: ${resourceName}Data[] = [
    { 
        id: '1', 
        name: '${resourceName} 1', 
        description: 'Description 1',
        createdAt: new Date().toISOString()
    },
    { 
        id: '2', 
        name: '${resourceName} 2', 
        description: 'Description 2',
        createdAt: new Date().toISOString()
    }
];

class ${resourceName}Model {
    static getAll(): ${resourceName}Data[] {
        return ${resourcePlural};
    }

    static getById(id: string): ${resourceName}Data | undefined {
        return ${resourcePlural}.find(item => item.id === id);
    }

    static create(data: Omit<${resourceName}Data, 'id'>): ${resourceName}Data {
        const newItem: ${resourceName}Data = {
            id: Date.now().toString(),
            name: data.name,
            description: data.description || '',
            createdAt: new Date().toISOString()
        };
        ${resourcePlural}.push(newItem);
        return newItem;
    }

    static update(id: string, data: Partial<${resourceName}Data>): ${resourceName}Data | null {
        const index = ${resourcePlural}.findIndex(item => item.id === id);
        if (index === -1) return null;

        ${resourcePlural}[index] = {
            ...${resourcePlural}[index],
            ...data,
            id: ${resourcePlural}[index].id,
            updatedAt: new Date().toISOString()
        };
        return ${resourcePlural}[index];
    }

    static delete(id: string): boolean {
        const index = ${resourcePlural}.findIndex(item => item.id === id);
        if (index === -1) return false;

        ${resourcePlural}.splice(index, 1);
        return true;
    }
}

export default ${resourceName}Model;
`;
    }
}

function getControllerTemplateTS() {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    const modelFileName = `${resourceName}.${ext}`;
    
    return `import { Request, Response } from 'express';
import * as ${resourceLower}Service from '../services/${modelFileName.replace('.ts', 'Service.ts')}';

// GET all ${resourcePlural}
export const getAll${resourceName}s = async (req: Request, res: Response): Promise<void> => {
    try {
        const items = await ${resourceLower}Service.getAll${resourceName}s();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching ${resourcePlural}:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ${resourcePlural}'
        });
    }
};

// GET ${resourceLower} by id
export const get${resourceName}ById = async (req: Request, res: Response): Promise<void> => {
    try {
        const item = await ${resourceLower}Service.get${resourceName}ById(req.params.id);
        res.json({
            success: true,
            data: item
        });
    } catch (error: any) {
        console.error('Error fetching ${resourceLower}:', error);
        if (error.message === '${resourceName} not found') {
            res.status(404).json({
                success: false,
                error: error.message
            });
            return;
        }
        if (error.message === 'Invalid ID format') {
            res.status(400).json({
                success: false,
                error: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ${resourceLower}'
        });
    }
};

// POST create ${resourceLower}
export const create${resourceName} = async (req: Request, res: Response): Promise<void> => {
    try {
        const newItem = await ${resourceLower}Service.create${resourceName}(req.body);
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error: any) {
        console.error('Error creating ${resourceLower}:', error);
        if (error.message.includes('required') || error.message.includes('must be') || error.message.includes('Invalid')) {
            res.status(400).json({
                success: false,
                error: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create ${resourceLower}'
        });
    }
};

// PUT update ${resourceLower}
export const update${resourceName} = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedItem = await ${resourceLower}Service.update${resourceName}(req.params.id, req.body);
        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error: any) {
        console.error('Error updating ${resourceLower}:', error);
        if (error.message === '${resourceName} not found') {
            res.status(404).json({
                success: false,
                error: error.message
            });
            return;
        }
        if (error.message.includes('must be') || error.message.includes('Invalid')) {
            res.status(400).json({
                success: false,
                error: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update ${resourceLower}'
        });
    }
};

// DELETE ${resourceLower}
export const delete${resourceName} = async (req: Request, res: Response): Promise<void> => {
    try {
        await ${resourceLower}Service.delete${resourceName}(req.params.id);
        res.json({
            success: true,
            message: '${resourceName} deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting ${resourceLower}:', error);
        if (error.message === '${resourceName} not found') {
            res.status(404).json({
                success: false,
                error: error.message
            });
            return;
        }
        if (error.message === 'Invalid ID format') {
            res.status(400).json({
                success: false,
                error: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to delete ${resourceLower}'
        });
    }
};
`;
}

// TypeScript Service template
function getServiceTemplateTS() {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    const modelFileName = `${resourceName}.${ext}`;
    
    return `import ${resourceName} from '../models/${modelFileName}';
${dbChoice === 'mongodb' ? "import mongoose from 'mongoose';\n" : ''}
// Get all ${resourcePlural}
export const getAll${resourceName}s = async () => {
    return ${isAsync ? 'await ' : ''}${resourceName}.${dbChoice === 'mongodb' ? 'find()' : 'getAll()'};
};

// Get ${resourceLower} by id
export const get${resourceName}ById = async (id: string) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    const item = ${isAsync ? 'await ' : ''}${resourceName}.${dbChoice === 'mongodb' ? 'findById(id)' : 'getById(id)'};
    if (!item) {
        throw new Error('${resourceName} not found');
    }
    return item;
};

// Create new ${resourceLower}
export const create${resourceName} = async (data: any) => {
    const { name, description } = data;
    
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

    return ${isAsync ? 'await ' : ''}${resourceName}.create({ name, description });
};

// Update ${resourceLower}
export const update${resourceName} = async (id: string, data: any) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    
    const { name, description } = data;
    
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
        `const updatedItem = await ${resourceName}.findByIdAndUpdate(
        id, 
        { name, description },
        { new: true, runValidators: true }
    );` : 
        `const updatedItem = ${isAsync ? 'await ' : ''}${resourceName}.update(id, { name, description });`
    }
    
    if (!updatedItem) {
        throw new Error('${resourceName} not found');
    }
    return updatedItem;
};

// Delete ${resourceLower}
export const delete${resourceName} = async (id: string) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    
    ${dbChoice === 'mongodb' ? 
        `const deleted = await ${resourceName}.findByIdAndDelete(id);
    
    if (!deleted) {` : 
        `const deleted = ${isAsync ? 'await ' : ''}${resourceName}.delete(id);
    
    if (!deleted) {`
    }
        throw new Error('${resourceName} not found');
    }
    
    return true;
};
`;
}

// Check if we're in an Express CRUD project
const currentDir = process.cwd();
const srcDir = path.join(currentDir, 'src');
const packageJsonPath = path.join(currentDir, 'package.json');

if (!fs.existsSync(srcDir) || !fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: Not in an Express CRUD project directory');
    console.error('Please run this command from the root of your Express CRUD project');
    process.exit(1);
}

// Detect database type from package.json
let dbChoice = 'memory';
let isTypeScript = false;
let ext = 'js';

try {
    if (!fs.existsSync(packageJsonPath)) {
        console.error('❌ Error: package.json not found at:', packageJsonPath);
        console.error('Current directory:', currentDir);
        console.error('Please run this command from your Express CRUD project root directory');
        process.exit(1);
    }
    
    // Security: Check file size before reading (max 10MB)
    const stats = fs.statSync(packageJsonPath);
    if (stats.size > 10 * 1024 * 1024) {
        throw new Error('package.json file too large (max 10MB)');
    }
    
    // Security: Validate path
    validatePath(packageJsonPath);
    if (!isPathInProject(packageJsonPath, currentDir)) {
        throw new Error('Security: package.json path is outside project directory');
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    
    // Detect TypeScript
    if (devDependencies.typescript || devDependencies.tsx) {
        isTypeScript = true;
        ext = 'ts';
        console.log('✅ Detected: TypeScript project');
    } else {
        console.log('✅ Detected: JavaScript project');
    }
    
    if (dependencies.mongoose) {
        dbChoice = 'mongodb';
        console.log('✅ Detected: MongoDB (mongoose)');
    } else if (dependencies.mysql2) {
        dbChoice = 'mysql';
        console.log('✅ Detected: MySQL (mysql2)');
    } else {
        console.log('ℹ️  No database detected, using in-memory storage');
    }
} catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    console.error('Current directory:', currentDir);
    process.exit(1);
}

// Generate names
const resourceLower = resourceName.toLowerCase();
const resourcePlural = resourceLower + 's';
const routeFileName = `${resourceLower}Routes.${ext}`;
const controllerFileName = `${resourceLower}Controller.${ext}`;
const modelFileName = `${resourceName}.${ext}`;

console.log(`\n🚀 Adding new CRUD resource: ${resourceName}\n`);

// Check if resource already exists
const modelPath = path.join(srcDir, 'models', modelFileName);
if (fs.existsSync(modelPath)) {
    console.error(`❌ Error: Resource "${resourceName}" already exists`);
    process.exit(1);
}

// Model template based on database choice
const getModelTemplate = () => {
    if (isTypeScript) {
        return getModelTemplateTS();
    }
    
    if (dbChoice === 'mongodb') {
        return `import mongoose from 'mongoose';

const ${resourceLower}Schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

const ${resourceName} = mongoose.model('${resourceName}', ${resourceLower}Schema);

export default ${resourceName};
`;
    } else if (dbChoice === 'mysql') {
        return `import db from '../config/database.js';

class ${resourceName} {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM ${resourcePlural} ORDER BY created_at DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM ${resourcePlural} WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { name, description } = data;
        const [result] = await db.query(
            'INSERT INTO ${resourcePlural} (name, description) VALUES (?, ?)',
            [name, description || '']
        );
        return {
            id: result.insertId,
            name,
            description: description || ''
        };
    }

    static async update(id, data) {
        const { name, description } = data;
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
        
        if (updates.length === 0) return null;
        
        values.push(id);
        const [result] = await db.query(
            \`UPDATE ${resourcePlural} SET \${updates.join(', ')} WHERE id = ?\`,
            values
        );
        
        if (result.affectedRows === 0) return null;
        return await ${resourceName}.getById(id);
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM ${resourcePlural} WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Helper method to initialize the table
    static async initTable() {
        await db.query(\`
            CREATE TABLE IF NOT EXISTS ${resourcePlural} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        \`);
    }
}

export default ${resourceName};
`;
    } else {
        // In-memory storage
        return `// In-memory data storage for ${resourceName}
// In production, use a real database like MongoDB, PostgreSQL, etc.

let ${resourcePlural} = [
    { 
        id: '1', 
        name: '${resourceName} 1', 
        description: 'Description 1',
        createdAt: new Date().toISOString()
    },
    { 
        id: '2', 
        name: '${resourceName} 2', 
        description: 'Description 2',
        createdAt: new Date().toISOString()
    }
];

class ${resourceName} {
    static getAll() {
        return ${resourcePlural};
    }

    static getById(id) {
        return ${resourcePlural}.find(item => item.id === id);
    }

    static create(data) {
        const newItem = {
            id: Date.now().toString(),
            name: data.name,
            description: data.description || '',
            createdAt: new Date().toISOString()
        };
        ${resourcePlural}.push(newItem);
        return newItem;
    }

    static update(id, data) {
        const index = ${resourcePlural}.findIndex(item => item.id === id);
        if (index === -1) return null;

        ${resourcePlural}[index] = {
            ...${resourcePlural}[index],
            ...data,
            id: ${resourcePlural}[index].id,
            updatedAt: new Date().toISOString()
        };
        return ${resourcePlural}[index];
    }

    static delete(id) {
        const index = ${resourcePlural}.findIndex(item => item.id === id);
        if (index === -1) return false;

        ${resourcePlural}.splice(index, 1);
        return true;
    }
}

export default ${resourceName};
`;
    }
};

// Controller template based on database choice
const getControllerTemplate = () => {
    if (isTypeScript) {
        return getControllerTemplateTS();
    }
    
    return `import * as ${resourceLower}Service from '../services/${modelFileName.replace('.js', 'Service.js')}';

// GET all ${resourcePlural}
export const getAll${resourceName}s = async (req, res) => {
    try {
        const items = await ${resourceLower}Service.getAll${resourceName}s();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching ${resourcePlural}:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ${resourcePlural}'
        });
    }
};

// GET ${resourceLower} by id
export const get${resourceName}ById = async (req, res) => {
    try {
        const item = await ${resourceLower}Service.get${resourceName}ById(req.params.id);
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching ${resourceLower}:', error);
        if (error.message === '${resourceName} not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        if (error.message === 'Invalid ID format') {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ${resourceLower}'
        });
    }
};

// POST create ${resourceLower}
export const create${resourceName} = async (req, res) => {
    try {
        const newItem = await ${resourceLower}Service.create${resourceName}(req.body);
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating ${resourceLower}:', error);
        if (error.message.includes('required') || error.message.includes('must be') || error.message.includes('Invalid')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create ${resourceLower}'
        });
    }
};

// PUT update ${resourceLower}
export const update${resourceName} = async (req, res) => {
    try {
        const updatedItem = await ${resourceLower}Service.update${resourceName}(req.params.id, req.body);
        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating ${resourceLower}:', error);
        if (error.message === '${resourceName} not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        if (error.message.includes('must be') || error.message.includes('Invalid')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update ${resourceLower}'
        });
    }
};

// DELETE ${resourceLower}
export const delete${resourceName} = async (req, res) => {
    try {
        await ${resourceLower}Service.delete${resourceName}(req.params.id);
        res.json({
            success: true,
            message: '${resourceName} deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting ${resourceLower}:', error);
        if (error.message === '${resourceName} not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        if (error.message === 'Invalid ID format') {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to delete ${resourceLower}'
        });
    }
};
`;
};

// Service template (business logic layer)
const getServiceTemplate = () => {
    if (isTypeScript) {
        return getServiceTemplateTS();
    }
    
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    
    return `import ${resourceName} from '../models/${modelFileName}';
${dbChoice === 'mongodb' ? "import mongoose from 'mongoose';\n" : ''}
// Get all ${resourcePlural}
export const getAll${resourceName}s = async () => {
    return ${isAsync ? 'await ' : ''}${resourceName}.${dbChoice === 'mongodb' ? 'find()' : 'getAll()'};
};

// Get ${resourceLower} by id
export const get${resourceName}ById = async (id) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    const item = ${isAsync ? 'await ' : ''}${resourceName}.${dbChoice === 'mongodb' ? 'findById(id)' : 'getById(id)'};
    if (!item) {
        throw new Error('${resourceName} not found');
    }
    return item;
};

// Create new ${resourceLower}
export const create${resourceName} = async (data) => {
    const { name, description } = data;
    
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

    return ${isAsync ? 'await ' : ''}${resourceName}.create({ name, description });
};

// Update ${resourceLower}
export const update${resourceName} = async (id, data) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    
    const { name, description } = data;
    
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
        `const updatedItem = await ${resourceName}.findByIdAndUpdate(
        id, 
        { name, description },
        { new: true, runValidators: true }
    );` : 
        `const updatedItem = ${isAsync ? 'await ' : ''}${resourceName}.update(id, { name, description });`
    }
    
    if (!updatedItem) {
        throw new Error('${resourceName} not found');
    }
    return updatedItem;
};

// Delete ${resourceLower}
export const delete${resourceName} = async (id) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    
    ${dbChoice === 'mongodb' ? 
        `const deleted = await ${resourceName}.findByIdAndDelete(id);
    
    if (!deleted) {` : 
        `const deleted = ${isAsync ? 'await ' : ''}${resourceName}.delete(id);
    
    if (!deleted) {`
    }
        throw new Error('${resourceName} not found');
    }
    
    return true;
};
`;
};

// Routes template
const routesTemplate = `import express from 'express';
import * as ${resourceLower}Controller from '../controllers/${controllerFileName}';

const router = express.Router();

// GET all ${resourcePlural}
router.get('/', ${resourceLower}Controller.getAll${resourceName}s);

// GET ${resourceLower} by id
router.get('/:id', ${resourceLower}Controller.get${resourceName}ById);

// POST create new ${resourceLower}
router.post('/', ${resourceLower}Controller.create${resourceName});

// PUT update ${resourceLower}
router.put('/:id', ${resourceLower}Controller.update${resourceName});

// DELETE ${resourceLower}
router.delete('/:id', ${resourceLower}Controller.delete${resourceName});

export default router;
`;

// Write files
const files = [
    { 
        path: path.join(srcDir, 'models', modelFileName), 
        content: getModelTemplate(),
        type: 'Model'
    },
    { 
        path: path.join(srcDir, 'services', modelFileName.replace('.js', 'Service.js').replace('.ts', 'Service.ts')), 
        content: getServiceTemplate(),
        type: 'Service'
    },
    { 
        path: path.join(srcDir, 'controllers', controllerFileName), 
        content: getControllerTemplate(),
        type: 'Controller'
    },
    { 
        path: path.join(srcDir, 'routes', routeFileName), 
        content: routesTemplate,
        type: 'Routes'
    }
];

// Add test file
const testsDir = path.join(currentDir, 'tests');
if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
}

const testFileName = `${resourceName}.test.${ext}`;
let testContent;
if (isTypeScript) {
    testContent = dbChoice === 'mongodb' ? getTestTemplateMongoTS(resourceName) :
                  dbChoice === 'mysql' ? getTestTemplateMySQLTS(resourceName) :
                  getTestTemplateMemoryTS(resourceName);
} else {
    testContent = dbChoice === 'mongodb' ? getTestTemplateMongoJS(resourceName) :
                  dbChoice === 'mysql' ? getTestTemplateMySQLJS(resourceName) :
                  getTestTemplateMemoryJS(resourceName);
}
files.push({
    path: path.join(testsDir, testFileName),
    content: testContent,
    type: 'Test'
});

files.forEach(file => {
    try {
        fs.writeFileSync(file.path, file.content);
        console.log(`✅ Created ${file.type}: ${path.basename(file.path)}`);
    } catch (error) {
        console.error(`❌ Error creating ${file.type}: ${error.message}`);
        process.exit(1);
    }
});

// Update server.js/server.ts
const serverPath = path.join(srcDir, `server.${ext}`);
try {
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Check if route already imported
    const importStatement = `import ${resourceLower}Routes from './routes/${routeFileName}';`;
    if (!serverContent.includes(importStatement)) {
        // Find the last import statement
        const importRegex = /import .+ from .+;/g;
        const imports = serverContent.match(importRegex);
        if (imports && imports.length > 0) {
            const lastImport = imports[imports.length - 1];
            serverContent = serverContent.replace(lastImport, `${lastImport}\n${importStatement}`);
        }
    }
    
    // Check if route already registered
    const routeStatement = `app.use('/api/${resourcePlural}', ${resourceLower}Routes);`;
    if (!serverContent.includes(routeStatement)) {
        // Find where to add the route (after other app.use routes)
        const routeRegex = /app\.use\('\/api\/\w+',\s+\w+Routes\);/g;
        const routes = serverContent.match(routeRegex);
        if (routes && routes.length > 0) {
            const lastRoute = routes[routes.length - 1];
            serverContent = serverContent.replace(lastRoute, `${lastRoute}\n${routeStatement}`);
        } else {
            // If no routes exist, add after items route
            const itemsRoute = "app.use('/api/items', itemRoutes);";
            if (serverContent.includes(itemsRoute)) {
                serverContent = serverContent.replace(itemsRoute, `${itemsRoute}\n${routeStatement}`);
            }
        }
    }
    
    fs.writeFileSync(serverPath, serverContent);
    console.log(`✅ Updated server.${ext} with ${resourceName} routes`);
} catch (error) {
    console.log(`⚠️  Note: Could not automatically update server.${ext}: ${error.message}`);
    console.log('Please add the routes manually.');
}

console.log(`\n✨ CRUD resource "${resourceName}" created successfully!\n`);
console.log('📝 Your new endpoints are ready:');
console.log(`   GET    /api/${resourcePlural}      - Get all ${resourcePlural}`);
console.log(`   GET    /api/${resourcePlural}/:id  - Get ${resourceLower} by id`);
console.log(`   POST   /api/${resourcePlural}      - Create ${resourceLower}`);
console.log(`   PUT    /api/${resourcePlural}/:id  - Update ${resourceLower}`);
console.log(`   DELETE /api/${resourcePlural}/:id  - Delete ${resourceLower}`);

if (dbChoice === 'mysql') {
    console.log('\n💡 MySQL Note:');
    console.log(`   You may need to create the table manually:`);
    console.log(`   CREATE TABLE ${resourcePlural} (`);
    console.log(`       id INT AUTO_INCREMENT PRIMARY KEY,`);
    console.log(`       name VARCHAR(255) NOT NULL,`);
    console.log(`       description TEXT,`);
    console.log(`       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`);
    console.log(`       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
    console.log(`   );`);
}

console.log('');
