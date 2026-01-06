import { db } from '../server.js';

class Pop {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM pops ORDER BY created_at DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM pops WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { name, description } = data;
        const [result] = await db.query(
            'INSERT INTO pops (name, description) VALUES (?, ?)',
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
            `UPDATE pops SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        if (result.affectedRows === 0) return null;
        return await Pop.getById(id);
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM pops WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Helper method to initialize the table
    static async initTable() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS pops (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
    }
}

export default Pop;
