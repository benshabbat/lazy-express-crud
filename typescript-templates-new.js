// Backward compatibility layer for typescript-templates.js
// Re-exports all TypeScript templates from the new organized structure

export {
    getTsConfigTemplate,
    getTypesTemplate,
    getServerTemplateTS,
    getDatabaseConfigTemplateTS,
    getRoutesTemplateTS,
    getControllerTemplateTS,
    getServiceTemplateTS,
    getModelTemplateTS
} from './src/templates/typescript/index.js';
