// Shared templates and utilities for lazy-express-crud
// This file re-exports from the new organized structure for backward compatibility

export { validatePath, isPathInProject, validateResourceName, validateProjectName } from './src/validators/index.js';
export { sanitizeError } from './src/utils/index.js';
export { getControllerTemplate, getServiceTemplate, getModelTemplate } from './src/templates/javascript/index.js';
