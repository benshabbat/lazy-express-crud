import mysql from 'mysql2/promise';

// MySQL Connection Pool
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test-mysql',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
db.getConnection()
    .then(connection => {
        console.log('✅ MySQL connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL connection error:', err);
        process.exit(1);
    });

export default db;
