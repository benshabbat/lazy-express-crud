// Service templates for adding new resources
// Business logic layer with validation

/**
 * Generate Service template for a new resource
 * @param {string} resourceName - Resource name (e.g., "User")
 * @param {string} dbChoice - Database choice: 'mongodb', 'mysql', or 'memory'
 * @param {string} modelFileName - Model file name
 * @param {boolean} isTypeScript - Whether this is a TypeScript project
 * @returns {string} Service template code
 */
export function getServiceTemplate(resourceName, dbChoice, modelFileName, isTypeScript) {
    if (isTypeScript) {
        return getServiceTemplateTS(resourceName, dbChoice, modelFileName);
    }
    
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    
    return `import ${resourceName} from '../models/${modelFileName}';
${dbChoice === 'mongodb' ? "import mongoose from 'mongoose';\n" : ''}
// Get all ${resourcePlural}
export const getAll${resourceName}s = async () => {
    return ${isAsync ? 'await ' : ''}${resourceName}.${dbChoice === 'mongodb' ? 'find()' : 'getAll()'};
};

// Get ${resourceLower} by id
export const get${resourceName}ById = async (id) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    const item = ${isAsync ? 'await ' : ''}${resourceName}.${dbChoice === 'mongodb' ? 'findById(id)' : 'getById(id)'};
    if (!item) {
        throw new Error('${resourceName} not found');
    }
    return item;
};

// Create new ${resourceLower}
export const create${resourceName} = async (data) => {
    const { name, description } = data;
    
    // Validation
    if (!name || typeof name !== 'string') {
        throw new Error('Name is required and must be a string');
    }
    if (name.length > 255) {
        throw new Error('Name must be less than 255 characters');
    }
    if (description && typeof description !== 'string') {
        throw new Error('Description must be a string');
    }
    if (description && description.length > 2000) {
        throw new Error('Description must be less than 2000 characters');
    }

    return ${isAsync ? 'await ' : ''}${resourceName}.create({ name, description });
};

// Update ${resourceLower}
export const update${resourceName} = async (id, data) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    
    const { name, description } = data;
    
    // Validation
    if (name !== undefined) {
        if (typeof name !== 'string' || name.length > 255) {
            throw new Error('Name must be a string with max 255 characters');
        }
    }
    if (description !== undefined) {
        if (typeof description !== 'string' || description.length > 2000) {
            throw new Error('Description must be a string with max 2000 characters');
        }
    }

    ${dbChoice === 'mongodb' ? 
        `const updatedItem = await ${resourceName}.findByIdAndUpdate(
        id, 
        { name, description },
        { new: true, runValidators: true }
    );` : 
        `const updatedItem = ${isAsync ? 'await ' : ''}${resourceName}.update(id, { name, description });`
    }
    
    if (!updatedItem) {
        throw new Error('${resourceName} not found');
    }
    return updatedItem;
};

// Delete ${resourceLower}
export const delete${resourceName} = async (id) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    
    ${dbChoice === 'mongodb' ? 
        `const deleted = await ${resourceName}.findByIdAndDelete(id);
    
    if (!deleted) {` : 
        `const deleted = ${isAsync ? 'await ' : ''}${resourceName}.delete(id);
    
    if (!deleted) {`
    }
        throw new Error('${resourceName} not found');
    }
    
    return true;
};
`;
}

/**
 * Generate TypeScript Service template
 * @param {string} resourceName - Resource name
 * @param {string} dbChoice - Database choice
 * @param {string} modelFileName - Model file name
 * @returns {string} TypeScript Service template
 */
function getServiceTemplateTS(resourceName, dbChoice, modelFileName) {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    
    return `import ${resourceName} from '../models/${modelFileName}';
${dbChoice === 'mongodb' ? "import mongoose from 'mongoose';\n" : ''}
// Get all ${resourcePlural}
export const getAll${resourceName}s = async () => {
    return ${isAsync ? 'await ' : ''}${resourceName}.${dbChoice === 'mongodb' ? 'find()' : 'getAll()'};
};

// Get ${resourceLower} by id
export const get${resourceName}ById = async (id: string) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    const item = ${isAsync ? 'await ' : ''}${resourceName}.${dbChoice === 'mongodb' ? 'findById(id)' : 'getById(id)'};
    if (!item) {
        throw new Error('${resourceName} not found');
    }
    return item;
};

// Create new ${resourceLower}
export const create${resourceName} = async (data: any) => {
    const { name, description } = data;
    
    // Validation
    if (!name || typeof name !== 'string') {
        throw new Error('Name is required and must be a string');
    }
    if (name.length > 255) {
        throw new Error('Name must be less than 255 characters');
    }
    if (description && typeof description !== 'string') {
        throw new Error('Description must be a string');
    }
    if (description && description.length > 2000) {
        throw new Error('Description must be less than 2000 characters');
    }

    return ${isAsync ? 'await ' : ''}${resourceName}.create({ name, description });
};

// Update ${resourceLower}
export const update${resourceName} = async (id: string, data: any) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    
    const { name, description } = data;
    
    // Validation
    if (name !== undefined) {
        if (typeof name !== 'string' || name.length > 255) {
            throw new Error('Name must be a string with max 255 characters');
        }
    }
    if (description !== undefined) {
        if (typeof description !== 'string' || description.length > 2000) {
            throw new Error('Description must be a string with max 2000 characters');
        }
    }

    ${dbChoice === 'mongodb' ? 
        `const updatedItem = await ${resourceName}.findByIdAndUpdate(
        id, 
        { name, description },
        { new: true, runValidators: true }
    );` : 
        `const updatedItem = ${isAsync ? 'await ' : ''}${resourceName}.update(id, { name, description });`
    }
    
    if (!updatedItem) {
        throw new Error('${resourceName} not found');
    }
    return updatedItem;
};

// Delete ${resourceLower}
export const delete${resourceName} = async (id: string) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    
    ${dbChoice === 'mongodb' ? 
        `const deleted = await ${resourceName}.findByIdAndDelete(id);
    
    if (!deleted) {` : 
        `const deleted = ${isAsync ? 'await ' : ''}${resourceName}.delete(id);
    
    if (!deleted) {`
    }
        throw new Error('${resourceName} not found');
    }
    
    return true;
};
`;
}
