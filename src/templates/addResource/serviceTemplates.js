// Service templates for adding new resources
// Business logic layer with validation

import { generateServiceImports, generateServiceMethods } from '../shared/serviceHelpers.js';

/**
 * Generate Service template for a new resource
 * @param {string} resourceName - Resource name (e.g., "User")
 * @param {string} dbChoice - Database choice: 'mongodb', 'mysql', or 'memory'
 * @param {string} modelFileName - Model file name
 * @param {boolean} isTypeScript - Whether this is a TypeScript project
 * @returns {string} Service template code
 */
export function getServiceTemplate(resourceName, dbChoice, modelFileName, isTypeScript) {
    // Note: import specifiers always use '.js', even in TypeScript projects
    // (Node's NodeNext module resolution requires this - it maps to the compiled output).
    const modelImportFileName = modelFileName.replace(/\.(js|ts)$/, '.js');
    const imports = generateServiceImports(resourceName, modelImportFileName, dbChoice, isTypeScript);
    // For addResource, we only use name and description (no price)
    const methods = generateServiceMethods(resourceName, dbChoice, isTypeScript, ['name', 'description']);
    
    return `${imports}

${methods}
`;
}
