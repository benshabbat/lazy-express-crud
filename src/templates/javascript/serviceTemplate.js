// Shared Service Template - JavaScript
// Business logic layer with validation

/**
 * Generate JavaScript service template
 * @param {string} resourceName - Resource name (e.g., 'Product', 'User')
 * @param {string} dbChoice - Database choice (mongodb, mysql, memory)
 * @returns {string} Service template code
 */
export function getServiceTemplate(resourceName, dbChoice) {
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    const lowerResource = resourceName.toLowerCase();
    const pluralResource = lowerResource + 's';
    
    return `import ${resourceName} from '../models/${resourceName}.js';
${dbChoice === 'mongodb' ? "import mongoose from 'mongoose';\n" : ''}
// Get all ${pluralResource}
export const getAll${resourceName}s = async () => {
    return ${isAsync ? 'await ' : ''}${resourceName}.${dbChoice === 'mongodb' ? 'find()' : 'getAll()'};
};

// Get ${lowerResource} by id
export const get${resourceName}ById = async (id) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    const ${lowerResource} = ${isAsync ? 'await ' : ''}${resourceName}.${dbChoice === 'mongodb' ? 'findById(id)' : 'getById(id)'};
    if (!${lowerResource}) {
        throw new Error('${resourceName} not found');
    }
    return ${lowerResource};
};

// Create new ${lowerResource}
export const create${resourceName} = async (data) => {
    const { name, description, price } = data;
    
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

    return ${isAsync ? 'await ' : ''}${resourceName}.create({ name, description, price });
};

// Update ${lowerResource}
export const update${resourceName} = async (id, data) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    const { name, description, price } = data;
    
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
        `const updated${resourceName} = await ${resourceName}.findByIdAndUpdate(
        id,
        { name, description, price },
        { new: true, runValidators: true }
    );` :
        `const updated${resourceName} = ${isAsync ? 'await ' : ''}${resourceName}.update(id, { name, description, price });`
    }
    
    if (!updated${resourceName}) {
        throw new Error('${resourceName} not found');
    }
    return updated${resourceName};
};

// Delete ${lowerResource}
export const delete${resourceName} = async (id) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }` : ''}
    ${dbChoice === 'mongodb' ? 
        `const deleted = await ${resourceName}.findByIdAndDelete(id);` : 
        `const deleted = ${isAsync ? 'await ' : ''}${resourceName}.delete(id);`
    }
    
    if (!deleted) {
        throw new Error('${resourceName} not found');
    }
    return deleted;
};
`;
}
