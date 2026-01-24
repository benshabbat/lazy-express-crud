// Error handling middleware templates

/**
 * Generate error handler middleware template
 * @returns {string} Error handler middleware code
 */
export function getErrorHandlerTemplate() {
    return `// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Don't expose error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Something went wrong!' 
        : err.message;
    
    res.status(err.status || 500).json({ 
        error: errorMessage 
    });
};

// 404 handler
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
};
`;
}

/**
 * Generate TypeScript error handler middleware template
 * @returns {string} TypeScript error handler middleware code
 */
export function getErrorHandlerTemplateTS() {
    return `import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    status?: number;
}

// Global error handling middleware
export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
    console.error(err.stack);
    
    // Don't expose error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Something went wrong!' 
        : err.message;
    
    res.status(err.status || 500).json({ 
        error: errorMessage 
    });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        error: 'Route not found'
    });
};
`;
}
