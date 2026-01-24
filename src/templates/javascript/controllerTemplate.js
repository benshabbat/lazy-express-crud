// Shared Controller Template - JavaScript
// HTTP handling only, delegates business logic to service layer
import { generateAllControllerMethods } from '../shared/controllerHelpers.js';

/**
 * Generate JavaScript controller template
 * @param {string} resourceName - Resource name (e.g., 'Product', 'User')
 * @param {string} dbChoice - Database choice (mongodb, mysql, memory)
 * @returns {string} Controller template code
 */
export function getControllerTemplate(resourceName, dbChoice) {
    const lowerResource = resourceName.toLowerCase();
    
    // Generate all CRUD methods using shared helper
    const methods = generateAllControllerMethods(resourceName, `${lowerResource}Service`, false);
    
    return `import * as ${lowerResource}Service from '../services/${lowerResource}Service.js';

${methods}
`;
}
