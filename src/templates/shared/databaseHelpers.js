/**
 * Shared database helpers for generated templates
 * Eliminates duplicate database validation and utility code
 */

/**
 * MongoDB helpers for generated templates
 */
export const mongoHelpers = {
    /**
     * Validate MongoDB ObjectId format
     * @param {string} id - ID to validate
     * @throws {Error} If ID format is invalid
     * @returns {boolean} True if valid
     */
    validateObjectId: (id) => {
        // Check if mongoose is available (runtime check)
        if (typeof mongoose !== 'undefined' && mongoose.Types && mongoose.Types.ObjectId) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid ID format');
            }
        }
        return true;
    },

    /**
     * Generate ObjectId validation code for templates
     * @param {string} idVariable - Variable name containing the ID (default: 'id')
     * @returns {string} Validation code
     */
    generateIdValidation: (idVariable = 'id') => {
        return `    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(${idVariable})) {
        throw new Error('Invalid ID format');
    }`;
    }
};

/**
 * MySQL helpers for generated templates
 */
export const mysqlHelpers = {
    /**
     * Validate MySQL integer ID
     * @param {any} id - ID to validate
     * @throws {Error} If ID is invalid
     * @returns {boolean} True if valid
     */
    validateIntegerId: (id) => {
        const numId = parseInt(id, 10);
        if (isNaN(numId) || numId <= 0) {
            throw new Error('Invalid ID format');
        }
        return true;
    },

    /**
     * Generate integer ID validation code for templates
     * @param {string} idVariable - Variable name containing the ID
     * @returns {string} Validation code
     */
    generateIdValidation: (idVariable = 'id') => {
        return `    // Validate integer ID
    const numId = parseInt(${idVariable}, 10);
    if (isNaN(numId) || numId <= 0) {
        throw new Error('Invalid ID format');
    }`;
    },

    /**
     * Generate connection pool configuration
     * @returns {string} MySQL pool config code
     */
    generatePoolConfig: () => {
        return `const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'mydb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});`;
    }
};

/**
 * In-memory storage helpers
 */
export const memoryHelpers = {
    /**
     * Generate UUID-based ID validation
     * @param {string} idVariable - Variable name
     * @returns {string} Validation code
     */
    generateIdValidation: (idVariable = 'id') => {
        return `    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(${idVariable})) {
        throw new Error('Invalid ID format');
    }`;
    },

    /**
     * Generate UUID generation code
     * @returns {string} UUID generation code
     */
    generateUuidCode: () => {
        return `    // Generate UUID
    const id = crypto.randomUUID();`;
    }
};

/**
 * Generate ID validation code based on database choice
 * @param {string} dbChoice - Database type ('mongodb', 'mysql', 'memory')
 * @param {string} idVariable - Variable name containing ID
 * @returns {string} Database-specific validation code
 */
export function generateIdValidation(dbChoice, idVariable = 'id') {
    const generators = {
        mongodb: mongoHelpers.generateIdValidation,
        mysql: mysqlHelpers.generateIdValidation,
        memory: memoryHelpers.generateIdValidation
    };

    const generator = generators[dbChoice];
    return generator ? generator(idVariable) : '';
}

/**
 * Generate database connection code
 * @param {string} dbChoice - Database type
 * @param {boolean} isTypeScript - TypeScript flag
 * @returns {string} Connection code
 */
export function generateDatabaseConnection(dbChoice, isTypeScript = false) {
    if (dbChoice === 'mongodb') {
        return `import mongoose from 'mongoose';

// MongoDB Connection with security options
if (!process.env.MONGODB_HOST || !process.env.MONGODB_DATABASE) {
    console.error('❌ Missing MongoDB configuration');
    process.exit(1);
}

const connectDB = async ()${isTypeScript ? ': Promise<void>' : ''} => {
    try {
        const port = process.env.MONGODB_PORT || '27017';
        const hasAuth = process.env.MONGODB_USER && process.env.MONGODB_PASSWORD;
        
        const uri = hasAuth
            ? \`mongodb://\${process.env.MONGODB_USER}:\${process.env.MONGODB_PASSWORD}@\${process.env.MONGODB_HOST}:\${port}/\${process.env.MONGODB_DATABASE}\`
            : \`mongodb://\${process.env.MONGODB_HOST}:\${port}/\${process.env.MONGODB_DATABASE}\`;
        
        await mongoose.connect(uri, {
            ssl: process.env.NODE_ENV === 'production',
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectDB;`;
    }

    if (dbChoice === 'mysql') {
        return `import mysql from 'mysql2/promise';

// MySQL Connection Pool
if (!process.env.MYSQL_HOST || !process.env.MYSQL_DATABASE) {
    console.error('❌ Missing MySQL configuration');
    process.exit(1);
}

${mysqlHelpers.generatePoolConfig()}

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL connected successfully');
        connection.release();
    })
    .catch(error => {
        console.error('❌ MySQL connection error:', error);
        process.exit(1);
    });

export default pool;`;
    }

    return `// In-memory storage - no database connection needed
const storage = new Map();

export default storage;`;
}

/**
 * Generate error handling for database operations
 * @param {string} operation - Operation name ('find', 'insert', 'update', 'delete')
 * @param {string} resourceName - Resource name
 * @returns {string} Error handling code
 */
export function generateDbErrorHandling(operation, resourceName) {
    const messages = {
        find: `Failed to fetch ${resourceName}`,
        insert: `Failed to create ${resourceName}`,
        update: `Failed to update ${resourceName}`,
        delete: `Failed to delete ${resourceName}`
    };

    return `    } catch (error) {
        console.error('Database error:', error);
        throw new Error('${messages[operation] || 'Database operation failed'}');
    }`;
}
