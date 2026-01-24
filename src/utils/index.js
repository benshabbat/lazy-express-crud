// Utils Index
// Central export for all utility functions

export { sanitizeError } from './errorUtils.js';

// Re-export validators for convenience
export { 
    validatePath,
    isPathInProject 
} from '../validators/pathValidators.js';

export { 
    validateProjectName,
    validateResourceName 
} from '../validators/nameValidators.js';

// Project utilities
export {
    readPackageJson,
    isTypeScriptProject,
    detectDatabase,
    isExpressProject,
    getProjectExtension,
    getProjectConfig,
    hasCrudStructure
} from './projectUtils.js';

// Prompt utilities
export {
    prompt,
    promptChoice,
    promptLanguage,
    promptDatabase,
    promptConfirm
} from './promptUtils.js';

// File utilities
export {
    ensureDirectory,
    createDirectories,
    writeFile,
    writeFiles,
    readFileSafe,
    fileExists,
    updateServerWithRoute,
    generateResourceTypes,
    updateTypesWithResource,
    copyFile
} from './fileUtils.js';
