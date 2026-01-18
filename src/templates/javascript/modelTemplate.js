// Shared Model Templates - JavaScript
// Database access layer

/**
 * Generate JavaScript model template
 * @param {string} dbChoice - Database choice (mongodb, mysql, memory)
 * @returns {string} Model template code
 */
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
