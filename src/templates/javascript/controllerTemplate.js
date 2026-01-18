// Shared Controller Template - JavaScript
// HTTP handling only, delegates business logic to service layer

/**
 * Generate JavaScript controller template
 * @param {string} dbChoice - Database choice (mongodb, mysql, memory)
 * @returns {string} Controller template code
 */
export function getControllerTemplate(dbChoice) {
    return `import * as itemService from '../services/itemService.js';

// GET all items
export const getAllItems = async (req, res) => {
    try {
        const items = await itemService.getAllItems();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch items'
        });
    }
};

// GET item by id
export const getItemById = async (req, res) => {
    try {
        const item = await itemService.getItemById(req.params.id);
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching item:', error);
        const message = error.message || 'Failed to fetch item';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        });
    }
};

// POST create item
export const createItem = async (req, res) => {
    try {
        const newItem = await itemService.createItem(req.body);
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create item'
        });
    }
};

// PUT update item
export const updateItem = async (req, res) => {
    try {
        const updatedItem = await itemService.updateItem(req.params.id, req.body);
        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating item:', error);
        const message = error.message || 'Failed to update item';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        });
    }
};

// DELETE item
export const deleteItem = async (req, res) => {
    try {
        await itemService.deleteItem(req.params.id);
        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        const message = error.message || 'Failed to delete item';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        });
    }
};
`;
}
