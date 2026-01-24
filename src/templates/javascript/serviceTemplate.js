// Shared Service Template - JavaScript
// Business logic layer with validation

import { generateServiceImports, generateServiceMethods } from '../shared/serviceHelpers.js';

/**
 * Generate JavaScript service template
 * @param {string} resourceName - Resource name (e.g., 'Product', 'User')
 * @param {string} dbChoice - Database choice (mongodb, mysql, memory)
 * @returns {string} Service template code
 */
export function getServiceTemplate(resourceName, dbChoice) {
    const modelFileName = `${resourceName}.js`;
    const imports = generateServiceImports(resourceName, modelFileName, dbChoice, false);
    const methods = generateServiceMethods(resourceName, dbChoice, false);
    
    return `${imports}

${methods}
`;
}
