// Shared Model Templates - JavaScript
// Database access layer

/**
 * Generate JavaScript model template
 * @param {string} resourceName - Resource name (e.g., 'Product', 'User')
 * @param {string} dbChoice - Database choice (mongodb, mysql, memory)
 * @returns {string} Model template code
 */
export function getModelTemplate(resourceName, dbChoice) {
    const lowerResource = resourceName.toLowerCase();
    const pluralResource = lowerResource + 's';
    
    if (dbChoice === 'mongodb') {
        return `import mongoose from 'mongoose';

const ${lowerResource}Schema = new mongoose.Schema({
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
${lowerResource}Schema.index({ name: 1 });

const ${resourceName} = mongoose.model('${resourceName}', ${lowerResource}Schema);

export default ${resourceName};
`;
    } else if (dbChoice === 'mysql') {
        return `import pool from '../config/database.js';

class ${resourceName} {
    // Get all ${pluralResource}
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM ${pluralResource} ORDER BY created_at DESC');
        return rows;
    }

    // Get ${lowerResource} by ID
    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM ${pluralResource} WHERE id = ?', [id]);
        return rows[0];
    }

    // Create new ${lowerResource}
    static async create(${lowerResource}Data) {
        const { name, description, price } = ${lowerResource}Data;
        const [result] = await pool.query(
            'INSERT INTO ${pluralResource} (name, description, price) VALUES (?, ?, ?)',
            [name, description, price]
        );
        return { id: result.insertId, name, description, price };
    }

    // Update ${lowerResource}
    static async update(id, ${lowerResource}Data) {
        const { name, description, price } = ${lowerResource}Data;
        const [result] = await pool.query(
            'UPDATE ${pluralResource} SET name = ?, description = ?, price = ? WHERE id = ?',
            [name, description, price, id]
        );
        if (result.affectedRows === 0) return null;
        return { id, name, description, price };
    }

    // Delete ${lowerResource}
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM ${pluralResource} WHERE id = ?', [id]);
        return result.affectedRows > 0 ? { id } : null;
    }
}

export default ${resourceName};
`;
    } else { // in-memory
        return `// In-memory storage (for demo purposes only - data will be lost on server restart)
let ${pluralResource} = [
    { id: '1', name: 'Sample ${resourceName} 1', description: 'This is a sample ${lowerResource}', price: 10.99 },
    { id: '2', name: 'Sample ${resourceName} 2', description: 'Another sample ${lowerResource}', price: 20.99 }
];
let nextId = 3;

class ${resourceName} {
    // Get all ${pluralResource}
    static getAll() {
        return ${pluralResource};
    }

    // Get ${lowerResource} by ID
    static getById(id) {
        return ${pluralResource}.find(${lowerResource} => ${lowerResource}.id === id);
    }

    // Create new ${lowerResource}
    static create(${lowerResource}Data) {
        const new${resourceName} = {
            id: String(nextId++),
            name: ${lowerResource}Data.name,
            description: ${lowerResource}Data.description,
            price: ${lowerResource}Data.price
        };
        ${pluralResource}.push(new${resourceName});
        return new${resourceName};
    }

    // Update ${lowerResource}
    static update(id, ${lowerResource}Data) {
        const index = ${pluralResource}.findIndex(${lowerResource} => ${lowerResource}.id === id);
        if (index === -1) return null;
        
        ${pluralResource}[index] = {
            ...${pluralResource}[index],
            ...${lowerResource}Data,
            id // Preserve the ID
        };
        return ${pluralResource}[index];
    }

    // Delete ${lowerResource}
    static delete(id) {
        const index = ${pluralResource}.findIndex(${lowerResource} => ${lowerResource}.id === id);
        if (index === -1) return null;
        
        const deleted = ${pluralResource}[index];
        ${pluralResource}.splice(index, 1);
        return deleted;
    }
}

export default ${resourceName};
`;
    }
}
