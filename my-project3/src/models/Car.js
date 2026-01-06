import { db } from '../server.js';

class Car {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM cars ORDER BY created_at DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM cars WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { name, description } = data;
        const [result] = await db.query(
            'INSERT INTO cars (name, description) VALUES (?, ?)',
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
            `UPDATE cars SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        if (result.affectedRows === 0) return null;
        return await Car.getById(id);
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM cars WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Helper method to initialize the table
    static async initTable() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS cars (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
    }
}

export default Car;
