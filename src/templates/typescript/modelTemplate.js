// TypeScript model template - Database access layer

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
