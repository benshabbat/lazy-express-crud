// Shared Controller Template - JavaScript
// HTTP handling only, delegates business logic to service layer

/**
 * Generate JavaScript controller template
 * @param {string} resourceName - Resource name (e.g., 'Product', 'User')
 * @param {string} dbChoice - Database choice (mongodb, mysql, memory)
 * @returns {string} Controller template code
 */
export function getControllerTemplate(resourceName, dbChoice) {
    const lowerResource = resourceName.toLowerCase();
    const pluralResource = lowerResource + 's';
    
    return `import * as ${lowerResource}Service from '../services/${lowerResource}Service.js';

// GET all ${pluralResource}
export const getAll${resourceName}s = async (req, res) => {
    try {
        const ${pluralResource} = await ${lowerResource}Service.getAll${resourceName}s();
        res.json({
            success: true,
            count: ${pluralResource}.length,
            data: ${pluralResource}
        });
    } catch (error) {
        console.error('Error fetching ${pluralResource}:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch ${pluralResource}'
        });
    }
};

// GET ${lowerResource} by id
export const get${resourceName}ById = async (req, res) => {
    try {
        const ${lowerResource} = await ${lowerResource}Service.get${resourceName}ById(req.params.id);
        res.json({
            success: true,
            data: ${lowerResource}
        });
    } catch (error) {
        console.error('Error fetching ${lowerResource}:', error);
        const message = error.message || 'Failed to fetch ${lowerResource}';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        });
    }
};

// POST create ${lowerResource}
export const create${resourceName} = async (req, res) => {
    try {
        const new${resourceName} = await ${lowerResource}Service.create${resourceName}(req.body);
        res.status(201).json({
            success: true,
            data: new${resourceName}
        });
    } catch (error) {
        console.error('Error creating ${lowerResource}:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create ${lowerResource}'
        });
    }
};

// PUT update ${lowerResource}
export const update${resourceName} = async (req, res) => {
    try {
        const updated${resourceName} = await ${lowerResource}Service.update${resourceName}(req.params.id, req.body);
        res.json({
            success: true,
            data: updated${resourceName}
        });
    } catch (error) {
        console.error('Error updating ${lowerResource}:', error);
        const message = error.message || 'Failed to update ${lowerResource}';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        });
    }
};

// DELETE ${lowerResource}
export const delete${resourceName} = async (req, res) => {
    try {
        await ${lowerResource}Service.delete${resourceName}(req.params.id);
        res.json({
            success: true,
            message: '${resourceName} deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting ${lowerResource}:', error);
        const message = error.message || 'Failed to delete ${lowerResource}';
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
