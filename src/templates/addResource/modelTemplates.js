// Model templates for adding new resources
// Supports both JavaScript and TypeScript, with MongoDB, MySQL, and In-Memory storage

import { generateModel } from '../shared/modelHelpers.js';

/**
 * Generate Model template for a new resource
 * @param {string} resourceName - Resource name (e.g., "User")
 * @param {string} dbChoice - Database choice: 'mongodb', 'mysql', or 'memory'
 * @param {string} ext - File extension: 'js' or 'ts'
 * @param {boolean} isTypeScript - Whether this is a TypeScript project
 * @returns {string} Model template code
 */
export function getModelTemplate(resourceName, dbChoice, ext, isTypeScript) {
    // For addResource, we only use name and description (no price)
    const fields = [
        { name: 'name', type: 'String', required: true, trim: true, maxlength: 255, tsType: 'string', displayName: 'Name' },
        { name: 'description', type: 'String', trim: true, maxlength: 2000, tsType: 'string', default: '' }
    ];
    
    return generateModel(resourceName, dbChoice, isTypeScript, { fields });
}
