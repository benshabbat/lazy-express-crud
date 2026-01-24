/**
 * Shared template helpers index
 * Central export point for all shared helpers
 * 
 * Usage:
 * import { validators, generateValidationCode } from '../shared/index.js';
 * import { successResponse, generateControllerMethod } from '../shared/index.js';
 * import { generateIdValidation, mongoHelpers } from '../shared/index.js';
 * import { jwtHelpers, passwordHelpers } from '../shared/index.js';
 */

// Validation helpers
export {
    validators,
    generateValidationCode,
    generateValidatorsCode
} from './validationHelpers.js';

// Controller helpers
export {
    successResponse,
    errorResponse,
    wrapHandler,
    generateControllerMethod,
    generateAllControllerMethods,
    generateControllerImports
} from './controllerHelpers.js';

// Service helpers
export {
    generateGetAllMethod,
    generateGetByIdMethod,
    generateCreateMethod,
    generateUpdateMethod,
    generateDeleteMethod,
    generateServiceMethods,
    generateServiceImports
} from './serviceHelpers.js';

// Database helpers
export {
    mongoHelpers,
    mysqlHelpers,
    memoryHelpers,
    generateIdValidation,
    generateDatabaseConnection,
    generateDbErrorHandling
} from './databaseHelpers.js';

// Auth helpers
export {
    jwtHelpers,
    passwordHelpers,
    userValidationHelpers,
    generateAuthControllerMethods,
    generateAuthRoutes
} from './authHelpers.js';
