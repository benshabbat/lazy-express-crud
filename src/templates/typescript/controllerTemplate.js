// TypeScript controller template - HTTP layer
import { generateAllControllerMethods, generateControllerImports } from '../shared/controllerHelpers.js';

export function getControllerTemplateTS(resourceName, dbChoice) {
    const lowerResource = resourceName.toLowerCase();
    
    // Generate TypeScript-specific imports
    const imports = generateControllerImports(true);
    
    // Generate all CRUD methods using shared helper
    const methods = generateAllControllerMethods(resourceName, `${lowerResource}Service`, true);
    
    return `${imports}
import * as ${lowerResource}Service from '../services/${lowerResource}Service.js';

${methods}
`;
}
