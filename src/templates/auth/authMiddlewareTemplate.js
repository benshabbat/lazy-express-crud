// Auth Middleware template with JWT verification
// Supports both JavaScript and TypeScript

/**
 * Generate auth middleware template with JWT verification
 * @param {boolean} isTypeScript - Whether to generate TypeScript code
 * @returns {string} Auth middleware template code
 */
export function getAuthMiddlewareTemplate(isTypeScript) {
    if (isTypeScript) {
        return `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Security: JWT secret should be in .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export function authMiddleware(req: Request & { userId?: string }, res: Response, next: NextFunction): void {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Security: Input validation
    if (!token || typeof token !== 'string' || token.length > 500) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Add user id to request
    req.userId = decoded.id;
    
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token expired' });
      return;
    }
    
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    
    res.status(401).json({ message: 'Authentication failed' });
  }
}
`;
    }
    
    // JavaScript version
    return `import jwt from 'jsonwebtoken';

// Security: JWT secret should be in .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Security: Input validation
    if (!token || typeof token !== 'string' || token.length > 500) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user id to request
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(401).json({ message: 'Authentication failed' });
  }
}
`;
}
