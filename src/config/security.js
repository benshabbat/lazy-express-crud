// Security configuration and constants

/**
 * Security limits and configurations
 */
export const SECURITY_LIMITS = {
    // File size limits
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_PACKAGE_JSON_SIZE: 1 * 1024 * 1024, // 1MB
    
    // Input length limits
    MAX_PROJECT_NAME_LENGTH: 214, // npm package name limit
    MIN_PROJECT_NAME_LENGTH: 1,
    MAX_RESOURCE_NAME_LENGTH: 100,
    MIN_RESOURCE_NAME_LENGTH: 1,
    
    // Rate limiting for generated code
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
    
    // Body parser limits
    JSON_LIMIT: '10mb',
    URLENCODED_LIMIT: '10mb',
};

/**
 * Reserved names that cannot be used
 */
export const RESERVED_NAMES = {
    projects: [
        'node_modules', '.git', '.env', 'package.json', 
        'package-lock.json', 'src', 'dist', 'build',
        'test', 'tests', '__tests__', 'coverage'
    ],
    
    resources: [
        'break', 'case', 'catch', 'class', 'const', 'continue',
        'debugger', 'default', 'delete', 'do', 'else', 'enum',
        'export', 'extends', 'false', 'finally', 'for', 'function',
        'if', 'import', 'in', 'instanceof', 'new', 'null', 'return',
        'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
        'var', 'void', 'while', 'with', 'yield', 'let', 'static',
        'implements', 'interface', 'package', 'private', 'protected',
        'public', 'await', 'async',
        // Node.js globals
        'process', 'global', 'console', 'Buffer', 'module',
        'exports', 'require', '__dirname', '__filename'
    ]
};

/**
 * Dangerous patterns to check for
 */
export const DANGEROUS_PATTERNS = {
    pathTraversal: /\.\.|\/|\\/,
    commandInjection: /[;&|`$()]/,
    sqlInjection: /['";\\-]/,
    nullBytes: /\x00/,
    controlChars: /[\x00-\x1F\x7F]/
};

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
};

/**
 * CORS allowed origins patterns
 */
export const CORS_DEFAULTS = {
    development: ['http://localhost:3000', 'http://localhost:5173'],
    allowedOriginsEnvVar: 'ALLOWED_ORIGINS'
};

/**
 * Validate input against security limits
 * @param {string} input - Input to validate
 * @param {string} type - Type of input (project, resource)
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateInputLength(input, type = 'project') {
    const limits = type === 'project' 
        ? { min: SECURITY_LIMITS.MIN_PROJECT_NAME_LENGTH, max: SECURITY_LIMITS.MAX_PROJECT_NAME_LENGTH }
        : { min: SECURITY_LIMITS.MIN_RESOURCE_NAME_LENGTH, max: SECURITY_LIMITS.MAX_RESOURCE_NAME_LENGTH };
    
    if (!input || input.length < limits.min || input.length > limits.max) {
        throw new Error(`${type} name must be between ${limits.min} and ${limits.max} characters`);
    }
    
    return true;
}

/**
 * Check for dangerous patterns in input
 * @param {string} input - Input to check
 * @returns {boolean} True if safe
 * @throws {Error} If dangerous pattern found
 */
export function checkDangerousPatterns(input) {
    if (DANGEROUS_PATTERNS.pathTraversal.test(input)) {
        throw new Error('Input contains path traversal patterns');
    }
    
    if (DANGEROUS_PATTERNS.nullBytes.test(input)) {
        throw new Error('Input contains null bytes');
    }
    
    if (DANGEROUS_PATTERNS.controlChars.test(input)) {
        throw new Error('Input contains control characters');
    }
    
    return true;
}
