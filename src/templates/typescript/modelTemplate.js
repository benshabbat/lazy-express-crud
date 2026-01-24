// TypeScript model template - Database access layer

export function getModelTemplateTS(resourceName, dbChoice) {
    const lowerResource = resourceName.toLowerCase();
    const pluralResource = lowerResource + 's';
    
    if (dbChoice === 'mongodb') {
        return `import mongoose, { Schema, Document } from 'mongoose';

export interface I${resourceName} extends Document {
    name: string;
    description?: string;
    price?: number;
}

const ${lowerResource}Schema = new Schema<I${resourceName}>({
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

const ${resourceName} = mongoose.model<I${resourceName}>('${resourceName}', ${lowerResource}Schema);

export default ${resourceName};
`;
    } else if (dbChoice === 'mysql') {
        return `import db from '../config/database.js';
import type { ${resourceName}, ${resourceName}Input } from '../types/index.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

class ${resourceName}Model {
    static async getAll(): Promise<${resourceName}[]> {
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM ${pluralResource} ORDER BY created_at DESC');
        return rows as ${resourceName}[];
    }

    static async getById(id: string): Promise<${resourceName} | undefined> {
        const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM ${pluralResource} WHERE id = ?', [id]);
        return rows[0] as ${resourceName} | undefined;
    }

    static async create(data: ${resourceName}Input): Promise<${resourceName}> {
        const { name, description, price } = data;
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO ${pluralResource} (name, description, price) VALUES (?, ?, ?)',
            [name, description || '', price || 0]
        );
        return {
            id: result.insertId.toString(),
            name,
            description: description || '',
            price: price || 0
        };
    }

    static async update(id: string, data: Partial<${resourceName}Input>): Promise<${resourceName} | null> {
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
            \`UPDATE ${pluralResource} SET \${updates.join(', ')} WHERE id = ?\`,
            values
        );
        
        if (result.affectedRows === 0) return null;
        return await ${resourceName}Model.getById(id) || null;
    }

    static async delete(id: string): Promise<boolean> {
        const [result] = await db.query<ResultSetHeader>('DELETE FROM ${pluralResource} WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Helper method to initialize the table
    static async initTable(): Promise<void> {
        await db.query(\`
            CREATE TABLE IF NOT EXISTS ${pluralResource} (
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

export default ${resourceName}Model;
`;
    } else {
        // In-memory storage
        return `import type { ${resourceName}, ${resourceName}Input } from '../types/index.js';

// In-memory data storage (for demo purposes)
// In production, use a real database like MongoDB, PostgreSQL, etc.

let ${pluralResource}: ${resourceName}[] = [
    { id: '1', name: '${resourceName} 1', description: 'Description 1', price: 100 },
    { id: '2', name: '${resourceName} 2', description: 'Description 2', price: 200 },
    { id: '3', name: '${resourceName} 3', description: 'Description 3', price: 300 }
];

class ${resourceName}Model {
    static getAll(): ${resourceName}[] {
        return ${pluralResource};
    }

    static getById(id: string): ${resourceName} | undefined {
        return ${pluralResource}.find(${lowerResource} => ${lowerResource}.id === id);
    }

    static create(data: ${resourceName}Input): ${resourceName} {
        const new${resourceName}: ${resourceName} = {
            id: Date.now().toString(),
            name: data.name,
            description: data.description || '',
            price: data.price || 0
        };
        ${pluralResource}.push(new${resourceName});
        return new${resourceName};
    }

    static update(id: string, data: Partial<${resourceName}Input>): ${resourceName} | null {
        const index = ${pluralResource}.findIndex(${lowerResource} => ${lowerResource}.id === id);
        if (index === -1) return null;

        ${pluralResource}[index] = {
            ...${pluralResource}[index],
            ...data,
            id: ${pluralResource}[index].id // Preserve id
        };
        return ${pluralResource}[index];
    }

    static delete(id: string): boolean {
        const index = ${pluralResource}.findIndex(${lowerResource} => ${lowerResource}.id === id);
        if (index === -1) return false;

        ${pluralResource}.splice(index, 1);
        return true;
    }
}

export default ${resourceName}Model;
`;
    }
}
