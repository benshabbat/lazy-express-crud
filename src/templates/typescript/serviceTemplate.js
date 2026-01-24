// TypeScript service template - Business logic layer

import { generateServiceImports, generateServiceMethods } from '../shared/serviceHelpers.js';

export function getServiceTemplateTS(resourceName, dbChoice) {
    const modelFileName = `${resourceName}.js`;
    const imports = generateServiceImports(resourceName, modelFileName, dbChoice, true);
    const methods = generateServiceMethods(resourceName, dbChoice, true);
    
    return `${imports}

${methods}
`;
}
