// TypeScript service template - Business logic layer

export function getServiceTemplateTS(dbChoice) {
    const isAsync = dbChoice === 'mongodb' || dbChoice === 'mysql';
    
    return `import Item from '../models/Item.js';
${dbChoice === 'mongodb' ? "import mongoose from 'mongoose';\n" : ''}import type { ItemInput } from '../types/index.js';

// Get all items
export const getAllItems = async () => {
    return ${isAsync ? 'await ' : ''}Item.${dbChoice === 'mongodb' ? 'find()' : 'getAll()'};
};

// Get item by id
export const getItemById = async (id: string) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }
    ` : ''}const item = ${isAsync ? 'await ' : ''}Item.${dbChoice === 'mongodb' ? 'findById(id)' : 'getById(id)'};
    if (!item) {
        throw new Error('Item not found');
    }
    return item;
};

// Create new item
export const createItem = async (data: ItemInput) => {
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

    return ${isAsync ? 'await ' : ''}Item.create({ name, description, price });
};

// Update item
export const updateItem = async (id: string, data: Partial<ItemInput>) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }
    ` : ''}const { name, description, price } = data;
    
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
        `const updatedItem = await Item.findByIdAndUpdate(
        id, 
        { name, description, price },
        { new: true, runValidators: true }
    );` : 
        `const updatedItem = ${isAsync ? 'await ' : ''}Item.update(id, { name, description, price });`
    }
    
    if (!updatedItem) {
        throw new Error('Item not found');
    }
    return updatedItem;
};

// Delete item
export const deleteItem = async (id: string) => {
    ${dbChoice === 'mongodb' ? `// Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }
    ` : ''}${dbChoice === 'mongodb' ? 
        `const deleted = await Item.findByIdAndDelete(id);` : 
        `const deleted = ${isAsync ? 'await ' : ''}Item.delete(id);`
    }
    
    if (!deleted) {
        throw new Error('Item not found');
    }
    return deleted;
};
`;
}
