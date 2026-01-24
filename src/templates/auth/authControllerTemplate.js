// Auth Controller templates with JWT token generation
// Supports both JavaScript and TypeScript
import { jwtHelpers, generateAuthControllerMethods } from '../shared/authHelpers.js';

/**
 * Generate auth controller template with JWT
 * @param {boolean} isTypeScript - Whether to generate TypeScript code
 * @returns {string} Auth controller template code
 */
export function getAuthControllerTemplate(isTypeScript) {
    // Generate auth controller methods using shared helper
    const methods = generateAuthControllerMethods(isTypeScript);
    
    if (isTypeScript) {
        return `import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

${jwtHelpers.generateConfig()}

${jwtHelpers.generateTokenFunction(true)}

${methods.register}

${methods.login}

${methods.getProfile}
`;
    }
    
    // JavaScript version
    return `import jwt from 'jsonwebtoken';
import User from '../models/User.js';

${jwtHelpers.generateConfig()}

${jwtHelpers.generateTokenFunction(false)}

${methods.register}

${methods.login}

${methods.getProfile}
`;
}
