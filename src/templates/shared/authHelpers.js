/**
 * Shared authentication helpers for generated templates
 * Eliminates duplicate JWT, password hashing, and auth logic
 */

/**
 * JWT token helpers
 */
export const jwtHelpers = {
    /**
     * Generate JWT configuration constants
     * @returns {string} JWT config code
     */
    generateConfig: () => {
        return `const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';`;
    },

    /**
     * Generate JWT token generation function
     * @param {boolean} isTypeScript - TypeScript flag
     * @returns {string} Token generation code
     */
    generateTokenFunction: (isTypeScript = false) => {
        if (isTypeScript) {
            return `/**
 * Generate JWT token for user
 * @param userId - User ID to encode in token
 * @returns JWT token string
 */
function generateToken(userId: string): string {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}`;
        }

        return `/**
 * Generate JWT token for user
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 */
function generateToken(userId) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}`;
    },

    /**
     * Generate JWT token verification middleware
     * @param {boolean} isTypeScript - TypeScript flag
     * @returns {string} Verification middleware code
     */
    generateVerificationMiddleware: (isTypeScript = false) => {
        const typeImport = isTypeScript ? `import { Request, Response, NextFunction } from 'express';\n` : '';
        const typeAnnotations = isTypeScript 
            ? '(req: Request, res: Response, next: NextFunction)' 
            : '(req, res, next)';

        return `${typeImport}/**
 * Verify JWT token from request header
 * Middleware to protect routes
 */
export const verifyToken = ${typeAnnotations} => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                error: 'No token provided' 
            });
        }

        const token = authHeader.substring(7);

        // Security: Input validation
        if (!token || typeof token !== 'string' || token.length > 500) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid token' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET)${isTypeScript ? ' as { id: string }' : ''};
        ${isTypeScript ? 'req.userId = decoded.id;' : 'req.userId = decoded.id;'}
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ 
            success: false,
            error: 'Invalid or expired token' 
        });
    }
};`;
    }
};

/**
 * Password hashing helpers
 */
export const passwordHelpers = {
    /**
     * Generate password hashing code
     * @returns {string} Hashing code
     */
    generateHashCode: () => {
        return `    // Hash password with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);`;
    },

    /**
     * Generate password comparison code
     * @returns {string} Comparison code
     */
    generateCompareCode: () => {
        return `    // Compare password with hashed password
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    if (!isMatch) {
        throw new Error('Invalid password');
    }`;
    },

    /**
     * Generate complete password hashing function
     * @param {boolean} isTypeScript - TypeScript flag
     * @returns {string} Hash function code
     */
    generateHashFunction: (isTypeScript = false) => {
        const typeAnnotation = isTypeScript ? ': Promise<string>' : '';
        const paramTypes = isTypeScript ? 'password: string' : 'password';

        return `/**
 * Hash password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
async function hashPassword(${paramTypes})${typeAnnotation} {
    // Hash password with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}`;
    },

    /**
     * Generate complete password comparison function
     * @param {boolean} isTypeScript - TypeScript flag
     * @returns {string} Compare function code
     */
    generateCompareFunction: (isTypeScript = false) => {
        const typeAnnotation = isTypeScript ? ': Promise<boolean>' : '';
        const paramTypes = isTypeScript ? 'plainPassword: string, hashedPassword: string' : 'plainPassword, hashedPassword';

        return `/**
 * Compare plain password with hashed password
 * @param plainPassword - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match
 */
async function comparePassword(${paramTypes})${typeAnnotation} {
    return await bcrypt.compare(plainPassword, hashedPassword);
}`;
    }
};

/**
 * User validation helpers
 */
export const userValidationHelpers = {
    /**
     * Generate user input validation for registration
     * @returns {string} Validation code
     */
    generateRegistrationValidation: () => {
        return `    // Security: Input validation
    if (!userData.email || typeof userData.email !== 'string' || userData.email.length > 255) {
        throw new Error('Invalid email');
    }
    
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
    }
    
    if (!userData.password || typeof userData.password !== 'string' || 
        userData.password.length < 6 || userData.password.length > 128) {
        throw new Error('Password must be between 6 and 128 characters');
    }
    
    if (!userData.username || typeof userData.username !== 'string' || userData.username.length > 100) {
        throw new Error('Invalid username');
    }`;
    },

    /**
     * Generate login validation
     * @returns {string} Validation code
     */
    generateLoginValidation: () => {
        return `    // Security: Input validation
    if (!credentials.email || typeof credentials.email !== 'string' || credentials.email.length > 255) {
        throw new Error('Invalid email');
    }
    
    if (!credentials.password || typeof credentials.password !== 'string' || credentials.password.length > 128) {
        throw new Error('Invalid password');
    }`;
    }
};

/**
 * Generate complete auth controller methods
 * @param {boolean} isTypeScript - TypeScript flag
 * @returns {Object} Auth controller methods
 */
export function generateAuthControllerMethods(isTypeScript = false) {
    const typeAnnotations = isTypeScript ? {
        req: 'req: Request',
        res: 'res: Response',
        returnType: ': Promise<void>'
    } : {
        req: 'req',
        res: 'res',
        returnType: ''
    };

    return {
        register: `/**
 * Register new user
 * @route POST /api/auth/register
 */
export const register = async (${typeAnnotations.req}, ${typeAnnotations.res})${typeAnnotations.returnType} => {
    try {
        const user = await userService.registerUser(req.body);
        
        // Generate token
        const token = generateToken(user.id);
        
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
            return res.status(409).json({
                success: false,
                error: error.message
            });
        }
        
        if (error.message.includes('Invalid') || error.message.includes('required')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to register user'
        });
    }
};`,

        login: `/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = async (${typeAnnotations.req}, ${typeAnnotations.res})${typeAnnotations.returnType} => {
    try {
        const user = await userService.loginUser(req.body);
        
        // Generate token
        const token = generateToken(user.id);
        
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to login'
        });
    }
};`,

        getProfile: `/**
 * Get user profile
 * @route GET /api/auth/profile
 */
export const getProfile = async (${typeAnnotations.req}, ${typeAnnotations.res})${typeAnnotations.returnType} => {
    try {
        const user = await userService.getUserById(${isTypeScript ? '(req as any).userId' : 'req.userId'});
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile'
        });
    }
};`
    };
}

/**
 * Generate auth routes template
 * @param {string} ext - File extension ('js' or 'ts')
 * @returns {string} Routes code
 */
export function generateAuthRoutes(ext = 'js') {
    return `import express from 'express';
import * as authController from '../controllers/authController.${ext}';
import { verifyToken } from '../middlewares/authMiddleware.${ext}';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);

export default router;`;
}
