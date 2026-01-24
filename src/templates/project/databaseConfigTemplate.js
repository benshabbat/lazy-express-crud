// Database configuration templates for JavaScript projects
// Supports MongoDB and MySQL

/**
 * Generate database configuration template
 * @param {string} dbChoice - Database choice: 'mongodb' or 'mysql'
 * @returns {string} Database configuration template code
 */
export function getDatabaseConfigTemplate(dbChoice) {
    if (dbChoice === 'mongodb') {
        return `import mongoose from 'mongoose';

// MongoDB Connection with security options
if (!process.env.MONGODB_HOST || !process.env.MONGODB_DATABASE) {
    console.error('❌ Missing MongoDB configuration in .env file');
    console.error('Required: MONGODB_HOST, MONGODB_DATABASE');
    console.error('Optional: MONGODB_USER, MONGODB_PASSWORD, MONGODB_PORT');
    process.exit(1);
}

const connectDB = async () => {
    try {
        // Build MongoDB URI from components
        const port = process.env.MONGODB_PORT || '27017';
        const hasAuth = process.env.MONGODB_USER && process.env.MONGODB_PASSWORD;
        
        const uri = hasAuth
            ? \`mongodb://\${process.env.MONGODB_USER}:\${process.env.MONGODB_PASSWORD}@\${process.env.MONGODB_HOST}:\${port}/\${process.env.MONGODB_DATABASE}\`
            : \`mongodb://\${process.env.MONGODB_HOST}:\${port}/\${process.env.MONGODB_DATABASE}\`;
        
        await mongoose.connect(uri, {
            // Security: Use TLS/SSL in production
            ssl: process.env.NODE_ENV === 'production',
            // Timeout settings
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.error('Please check your MongoDB configuration in .env file');
        process.exit(1);
    }
};

export default connectDB;
`;
    } else if (dbChoice === 'mysql') {
        return `import mysql from 'mysql2/promise';

// MySQL Connection Pool
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    console.error('❌ Missing MySQL configuration in .env file');
    console.error('Required: DB_HOST, DB_USER, DB_NAME, DB_PASSWORD');
    process.exit(1);
}

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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
`;
    }
    return '';
}
