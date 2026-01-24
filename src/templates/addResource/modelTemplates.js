// Model templates for adding new resources
// Supports both JavaScript and TypeScript, with MongoDB, MySQL, and In-Memory storage

/**
 * Generate Model template for a new resource
 * @param {string} resourceName - Resource name (e.g., "User")
 * @param {string} dbChoice - Database choice: 'mongodb', 'mysql', or 'memory'
 * @param {string} ext - File extension: 'js' or 'ts'
 * @param {boolean} isTypeScript - Whether this is a TypeScript project
 * @returns {string} Model template code
 */
export function getModelTemplate(resourceName, dbChoice, ext, isTypeScript) {
    if (isTypeScript) {
        return getModelTemplateTS(resourceName, dbChoice);
    }
    
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    
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
}

/**
 * Generate TypeScript Model template
 * @param {string} resourceName - Resource name
 * @param {string} dbChoice - Database choice
 * @returns {string} TypeScript Model template
 */
function getModelTemplateTS(resourceName, dbChoice) {
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
