import { db } from '../server.js';

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
            `UPDATE items SET ${updates.join(', ')} WHERE id = ?`,
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
        await db.query(`
            CREATE TABLE IF NOT EXISTS items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
    }
}

export default Item;
