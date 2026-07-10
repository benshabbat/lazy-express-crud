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
    // Note: the actual service file is always named with a lowercase resource
    // prefix (e.g. 'productService.js'), and import specifiers always use '.js'
    // even in TypeScript projects (required by NodeNext module resolution).
    // Deriving this from modelFileName (e.g. 'Product.ts') would produce a
    // wrong, case-mismatched, wrong-extension path like 'ProductService.ts'.
    const serviceFileName = `${resourceLower}Service.js`;

    // Generate TypeScript imports if needed
    const typeImports = isTypeScript ? generateControllerImports(true) + '\n' : '';
    
    // Generate all CRUD methods using shared helper
    const methods = generateAllControllerMethods(resourceName, `${resourceLower}Service`, isTypeScript);
    
    return `${typeImports}import * as ${resourceLower}Service from '../services/${serviceFileName}';

${methods}
`;
}
