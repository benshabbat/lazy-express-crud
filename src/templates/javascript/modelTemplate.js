// Shared Model Templates - JavaScript
// Database access layer

import { generateModel } from '../shared/modelHelpers.js';

/**
 * Generate JavaScript model template
 * @param {string} resourceName - Resource name (e.g., 'Product', 'User')
 * @param {string} dbChoice - Database choice (mongodb, mysql, memory)
 * @returns {string} Model template code
 */
export function getModelTemplate(resourceName, dbChoice) {
    return generateModel(resourceName, dbChoice, false);
}
