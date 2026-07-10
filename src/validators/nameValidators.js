// Name validation utilities
import { SECURITY_LIMITS, RESERVED_NAMES, checkDangerousPatterns } from '../config/security.js';

/**
 * Validate resource name (PascalCase for models/resources)
 * @param {string} name - Resource name to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateResourceName(name) {
    // Check length (prevent DoS)
    if (!name || name.length < SECURITY_LIMITS.MIN_RESOURCE_NAME_LENGTH || 
        name.length > SECURITY_LIMITS.MAX_RESOURCE_NAME_LENGTH) {
        throw new Error(`Resource name must be between ${SECURITY_LIMITS.MIN_RESOURCE_NAME_LENGTH} and ${SECURITY_LIMITS.MAX_RESOURCE_NAME_LENGTH} characters`);
    }
    
    // Check for dangerous patterns
    checkDangerousPatterns(name);
    
    // Check for valid PascalCase pattern
    const validPattern = /^[A-Z][a-zA-Z0-9]*$/;
    if (!validPattern.test(name)) {
        throw new Error('Resource name must be in PascalCase (e.g., User, ProductItem)');
    }
    // Prevent reserved JavaScript/TypeScript keywords and Node.js globals
    if (RESERVED_NAMES.resources.includes(name.toLowerCase())) {
        throw new Error(`"${name}" is a reserved keyword and cannot be used as a resource name`);
    }
    
    return true;
}

/**
 * Validate project name for npm package naming conventions
 * @param {string} name - Project name to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateProjectName(name) {
    // Check length (prevent DoS)
    if (!name || name.length < SECURITY_LIMITS.MIN_PROJECT_NAME_LENGTH ||
        name.length > SECURITY_LIMITS.MAX_PROJECT_NAME_LENGTH) {
        throw new Error(`Project name must be between ${SECURITY_LIMITS.MIN_PROJECT_NAME_LENGTH} and ${SECURITY_LIMITS.MAX_PROJECT_NAME_LENGTH} characters.`);
    }

    // Check for dangerous patterns
    checkDangerousPatterns(name);

    // Check for valid characters (alphanumeric, dash, underscore)
    const validPattern = /^[a-zA-Z0-9_-]+$/;

    if (!validPattern.test(name)) {
        throw new Error('Project name can only contain letters, numbers, dashes, and underscores.');
    }

    // Prevent reserved names
    if (RESERVED_NAMES.projects.includes(name.toLowerCase())) {
        throw new Error(`"${name}" is a reserved name and cannot be used.`);
    }

    // Prevent starting with dot (hidden files)
    if (name.startsWith('.')) {
        throw new Error('Project name cannot start with a dot.');
    }

    return true;
}
