// Controller templates for adding new resources
// Supports both JavaScript and TypeScript
import { generateAllControllerMethods, generateControllerImports } from '../shared/controllerHelpers.js';

/**
 * Generate Controller template for a new resource
 * @param {string} resourceName - Resource name (e.g., "User")
 * @param {string} modelFileName - Model file name
 * @param {boolean} isTypeScript - Whether this is a TypeScript project
 * @returns {string} Controller template code
 */
export function getControllerTemplate(resourceName, modelFileName, isTypeScript) {
    const resourceLower = resourceName.toLowerCase();
    const serviceFileName = modelFileName.replace(/\.(js|ts)$/, 'Service.$1');
    
    // Generate TypeScript imports if needed
    const typeImports = isTypeScript ? generateControllerImports(true) + '\n' : '';
    
    // Generate all CRUD methods using shared helper
    const methods = generateAllControllerMethods(resourceName, `${resourceLower}Service`, isTypeScript);
    
    return `${typeImports}import * as ${resourceLower}Service from '../services/${serviceFileName}';

${methods}
`;
}
