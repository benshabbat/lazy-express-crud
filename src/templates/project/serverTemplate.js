// Express server template for JavaScript projects
// Includes security middleware, CORS, rate limiting, and error handling

/**
 * Generate Express server template
 * @param {string} resourceName - Resource name (e.g., 'Product', 'User')
 * @param {string} dbChoice - Database choice: 'mongodb', 'mysql', or 'memory'
 * @returns {string} Express server template code
 */
export function getServerTemplate(resourceName, dbChoice) {
    const lowerResource = resourceName.toLowerCase();
    const pluralResource = lowerResource + 's';
    
    return `import 'dotenv/config';
import express from 'express';
import ${lowerResource}Routes from './routes/${lowerResource}Routes.js';
import { securityHeaders, httpsRedirect, rateLimiter } from './middlewares/security.js';
import { corsMiddleware } from './middlewares/cors.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
${dbChoice === 'mongodb' ? "import connectDB from './config/database.js';\n" : ''}${dbChoice === 'mysql' ? "import db from './config/database.js';\n" : ''}
const app = express();
const PORT = process.env.PORT || 3000;

// Environment validation is done in database.js for MongoDB/MySQL
// For in-memory storage, no validation needed
${dbChoice === 'mongodb' ? '\n// Connect to MongoDB\nconnectDB();\n' : ''}${dbChoice === 'mysql' ? '\n// MySQL connection pool is ready\n// Import db in models: import db from \'../config/database.js\';\n' : ''}
// Security Middleware
app.use(securityHeaders);
app.use(httpsRedirect);
app.use(rateLimiter);

// CORS Middleware
app.use(corsMiddleware);

// Body parser middleware
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to Express CRUD API',
        database: '${dbChoice === 'mongodb' ? 'MongoDB' : dbChoice === 'mysql' ? 'MySQL' : 'In-Memory'}',
        endpoints: {
            'GET /api/${pluralResource}': 'Get all ${pluralResource}',
            'GET /api/${pluralResource}/:id': 'Get ${lowerResource} by id',
            'POST /api/${pluralResource}': 'Create new ${lowerResource}',
            'PUT /api/${pluralResource}/:id': 'Update ${lowerResource}',
            'DELETE /api/${pluralResource}/:id': 'Delete ${lowerResource}'
        }
    });
});

app.use('/api/${pluralResource}', ${lowerResource}Routes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(\`🚀 Server is running on http://localhost:\${PORT}\`);
    console.log(\`Environment: \${process.env.NODE_ENV || 'development'}\`);
});

export default app;
`;
}
