// Shared Service Helpers
// Reusable functions for service template generation

/**
 * Generate service method for getting all resources
 * @param {string} resourceName - Resource name (e.g., 'User', 'Product')
 * @param {string} dbChoice - Database choice (mongodb, mysql, memory)
 * @returns {string} Method code
 */
export function generateGetAllMethod(resourceName, dbChoice) {
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    
    return `// Get all ${resourcePlural}
export const getAll${resourceName}s = async () => {
    return ${isAsync ? 'await ' : ''}${resourceName}.${dbChoice === 'mongodb' ? 'find()' : 'getAll()'};
};`;
}

/**
 * Generate service method for getting resource by ID
 * @param {string} resourceName - Resource name
 * @param {string} dbChoice - Database choice
 * @param {boolean} isTypeScript - Whether to include TypeScript types
 * @returns {string} Method code
 */
export function generateGetByIdMethod(resourceName, dbChoice, isTypeScript = false) {
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    const resourceLower = resourceName.toLowerCase();
    const typeAnnotation = isTypeScript ? ': string' : '';
    
    return `// Get ${resourceLower} by id
export const get${resourceName}ById = async (id${typeAnnotation}) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }
    ` : ''}const ${resourceLower} = ${isAsync ? 'await ' : ''}${resourceName}.${dbChoice === 'mongodb' ? 'findById(id)' : 'getById(id)'};
    if (!${resourceLower}) {
        throw new Error('${resourceName} not found');
    }
    return ${resourceLower};
};`;
}

/**
 * Generate service method for creating a resource
 * @param {string} resourceName - Resource name
 * @param {string} dbChoice - Database choice
 * @param {boolean} isTypeScript - Whether to include TypeScript types
 * @param {Array<string>} fields - Fields to include (default: ['name', 'description', 'price'])
 * @returns {string} Method code
 */
export function generateCreateMethod(resourceName, dbChoice, isTypeScript = false, fields = ['name', 'description', 'price']) {
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    const resourceLower = resourceName.toLowerCase();
    const typeAnnotation = isTypeScript ? `: ${resourceName}Input` : '';
    const fieldsStr = fields.join(', ');
    
    // Generate validation for common fields
    const validations = [];
    if (fields.includes('name')) {
        validations.push(`    // Validation
    if (!name || typeof name !== 'string') {
        throw new Error('Name is required and must be a string');
    }
    if (name.length > 255) {
        throw new Error('Name must be less than 255 characters');
    }`);
    }
    if (fields.includes('description')) {
        validations.push(`    if (description && typeof description !== 'string') {
        throw new Error('Description must be a string');
    }
    if (description && description.length > 2000) {
        throw new Error('Description must be less than 2000 characters');
    }`);
    }
    
    const validationCode = validations.length > 0 ? validations.join('\n') : '    // Add your validation here';
    
    return `// Create new ${resourceLower}
export const create${resourceName} = async (data${typeAnnotation}) => {
    const { ${fieldsStr} } = data;
    
${validationCode}

    return ${isAsync ? 'await ' : ''}${resourceName}.create({ ${fieldsStr} });
};`;
}

/**
 * Generate service method for updating a resource
 * @param {string} resourceName - Resource name
 * @param {string} dbChoice - Database choice
 * @param {boolean} isTypeScript - Whether to include TypeScript types
 * @param {Array<string>} fields - Fields to include
 * @returns {string} Method code
 */
export function generateUpdateMethod(resourceName, dbChoice, isTypeScript = false, fields = ['name', 'description', 'price']) {
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    const resourceLower = resourceName.toLowerCase();
    const idType = isTypeScript ? ': string' : '';
    const dataType = isTypeScript ? `: Partial<${resourceName}Input>` : '';
    const fieldsStr = fields.join(', ');
    
    // Generate validation for optional fields
    const validations = [];
    if (fields.includes('name')) {
        validations.push(`    if (name !== undefined) {
        if (typeof name !== 'string' || name.length > 255) {
            throw new Error('Name must be a string with max 255 characters');
        }
    }`);
    }
    if (fields.includes('description')) {
        validations.push(`    if (description !== undefined) {
        if (typeof description !== 'string' || description.length > 2000) {
            throw new Error('Description must be a string with max 2000 characters');
        }
    }`);
    }
    
    const validationCode = validations.length > 0 ? validations.join('\n') : '    // Add your validation here';
    
    const updateLogic = dbChoice === 'mongodb' 
        ? `const updated${resourceName} = await ${resourceName}.findByIdAndUpdate(
        id,
        { ${fieldsStr} },
        { new: true, runValidators: true }
    );`
        : `const updated${resourceName} = ${isAsync ? 'await ' : ''}${resourceName}.update(id, { ${fieldsStr} });`;
    
    return `// Update ${resourceLower}
export const update${resourceName} = async (id${idType}, data${dataType}) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }
    ` : ''}const { ${fieldsStr} } = data;
    
    // Validation
${validationCode}

    ${updateLogic}
    
    if (!updated${resourceName}) {
        throw new Error('${resourceName} not found');
    }
    return updated${resourceName};
};`;
}

/**
 * Generate service method for deleting a resource
 * @param {string} resourceName - Resource name
 * @param {string} dbChoice - Database choice
 * @param {boolean} isTypeScript - Whether to include TypeScript types
 * @returns {string} Method code
 */
export function generateDeleteMethod(resourceName, dbChoice, isTypeScript = false) {
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    const resourceLower = resourceName.toLowerCase();
    const typeAnnotation = isTypeScript ? ': string' : '';
    
    const deleteLogic = dbChoice === 'mongodb'
        ? `const deleted = await ${resourceName}.findByIdAndDelete(id);`
        : `const deleted = ${isAsync ? 'await ' : ''}${resourceName}.delete(id);`;
    
    return `// Delete ${resourceLower}
export const delete${resourceName} = async (id${typeAnnotation}) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }
    ` : ''}${deleteLogic}
    
    if (!deleted) {
        throw new Error('${resourceName} not found');
    }
    return deleted;
};`;
}

/**
 * Generate complete service template with all CRUD methods
 * @param {string} resourceName - Resource name
 * @param {string} dbChoice - Database choice
 * @param {boolean} isTypeScript - Whether to include TypeScript types
 * @param {Array<string>} fields - Fields to include in create/update
 * @returns {string} Complete service code
 */
export function generateServiceMethods(resourceName, dbChoice, isTypeScript = false, fields = ['name', 'description', 'price']) {
    const methods = [
        generateGetAllMethod(resourceName, dbChoice),
        generateGetByIdMethod(resourceName, dbChoice, isTypeScript),
        generateCreateMethod(resourceName, dbChoice, isTypeScript, fields),
        generateUpdateMethod(resourceName, dbChoice, isTypeScript, fields),
        generateDeleteMethod(resourceName, dbChoice, isTypeScript)
    ];
    
    return methods.join('\n\n');
}

/**
 * Generate service imports
 * @param {string} resourceName - Resource name
 * @param {string} modelFileName - Model file name (without extension)
 * @param {string} dbChoice - Database choice
 * @param {boolean} isTypeScript - Whether this is TypeScript
 * @returns {string} Import statements
 */
export function generateServiceImports(resourceName, modelFileName, dbChoice, isTypeScript = false) {
    const imports = [`import ${resourceName} from '../models/${modelFileName}';`];
    
    if (dbChoice === 'mongodb') {
        imports.push("import mongoose from 'mongoose';");
    }
    
    if (isTypeScript) {
        // Import from separate types file for the resource
        imports.push(`import type { ${resourceName}Input } from '../types/${resourceName}.types.js';`);
    }
    
    return imports.join('\n');
}
