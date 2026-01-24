// Auth Middleware template with JWT verification
// Supports both JavaScript and TypeScript
import { jwtHelpers } from '../shared/authHelpers.js';

/**
 * Generate auth middleware template with JWT verification
 * @param {boolean} isTypeScript - Whether to generate TypeScript code
 * @returns {string} Auth middleware template code
 */
export function getAuthMiddlewareTemplate(isTypeScript) {
    if (isTypeScript) {
        return `import jwt from 'jsonwebtoken';

${jwtHelpers.generateConfig()}

${jwtHelpers.generateVerificationMiddleware(true)}
`;
    }
    
    // JavaScript version
    return `import jwt from 'jsonwebtoken';

${jwtHelpers.generateConfig()}

${jwtHelpers.generateVerificationMiddleware(false)}
`;
}

