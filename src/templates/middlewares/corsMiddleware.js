// CORS middleware templates

/**
 * Generate CORS middleware template
 * @returns {string} CORS middleware code
 */
export function getCorsMiddlewareTemplate() {
    return `import cors from 'cors';

// CORS configuration with whitelist
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (process.env.NODE_ENV === 'production') {
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        } else {
            // Development: allow all origins
            callback(null, true);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

export const corsMiddleware = cors(corsOptions);
`;
}

/**
 * Generate TypeScript CORS middleware template
 * @returns {string} TypeScript CORS middleware code
 */
export function getCorsMiddlewareTemplateTS() {
    return `import cors, { CorsOptions } from 'cors';

// CORS configuration with whitelist
const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (process.env.NODE_ENV === 'production') {
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        } else {
            // Development: allow all origins
            callback(null, true);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

export const corsMiddleware = cors(corsOptions);
`;
}
