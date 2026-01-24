// Security middleware templates

/**
 * Generate security middleware template
 * @returns {string} Security middleware code
 */
export function getSecurityMiddlewareTemplate() {
    return `import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security headers middleware
export const securityHeaders = helmet();

// HTTPS enforcement middleware
export const httpsRedirect = (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(\`https://\${req.header('host')}\${req.url}\`);
        } else {
            next();
        }
    } else {
        next();
    }
};

// Rate limiting middleware
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
`;
}

/**
 * Generate TypeScript security middleware template
 * @returns {string} TypeScript security middleware code
 */
export function getSecurityMiddlewareTemplateTS() {
    return `import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Security headers middleware
export const securityHeaders = helmet();

// HTTPS enforcement middleware
export const httpsRedirect = (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.NODE_ENV === 'production') {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(\`https://\${req.header('host')}\${req.url}\`);
        } else {
            next();
        }
    } else {
        next();
    }
};

// Rate limiting middleware
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
`;
}
