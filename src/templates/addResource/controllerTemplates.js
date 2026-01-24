// Controller templates for adding new resources
// Supports both JavaScript and TypeScript

/**
 * Generate Controller template for a new resource
 * @param {string} resourceName - Resource name (e.g., "User")
 * @param {string} modelFileName - Model file name
 * @param {boolean} isTypeScript - Whether this is a TypeScript project
 * @returns {string} Controller template code
 */
export function getControllerTemplate(resourceName, modelFileName, isTypeScript) {
    if (isTypeScript) {
        return getControllerTemplateTS(resourceName, modelFileName);
    }
    
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    
    return `import * as ${resourceLower}Service from '../services/${modelFileName.replace('.js', 'Service.js')}';

// GET all ${resourcePlural}
export const getAll${resourceName}s = async (req, res) => {
    try {
        const items = await ${resourceLower}Service.getAll${resourceName}s();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching ${resourcePlural}:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ${resourcePlural}'
        });
    }
};

// GET ${resourceLower} by id
export const get${resourceName}ById = async (req, res) => {
    try {
        const item = await ${resourceLower}Service.get${resourceName}ById(req.params.id);
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching ${resourceLower}:', error);
        if (error.message === '${resourceName} not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        if (error.message === 'Invalid ID format') {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ${resourceLower}'
        });
    }
};

// POST create ${resourceLower}
export const create${resourceName} = async (req, res) => {
    try {
        const newItem = await ${resourceLower}Service.create${resourceName}(req.body);
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating ${resourceLower}:', error);
        if (error.message.includes('required') || error.message.includes('must be') || error.message.includes('Invalid')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create ${resourceLower}'
        });
    }
};

// PUT update ${resourceLower}
export const update${resourceName} = async (req, res) => {
    try {
        const updatedItem = await ${resourceLower}Service.update${resourceName}(req.params.id, req.body);
        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating ${resourceLower}:', error);
        if (error.message === '${resourceName} not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        if (error.message.includes('must be') || error.message.includes('Invalid')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update ${resourceLower}'
        });
    }
};

// DELETE ${resourceLower}
export const delete${resourceName} = async (req, res) => {
    try {
        await ${resourceLower}Service.delete${resourceName}(req.params.id);
        res.json({
            success: true,
            message: '${resourceName} deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting ${resourceLower}:', error);
        if (error.message === '${resourceName} not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        if (error.message === 'Invalid ID format') {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to delete ${resourceLower}'
        });
    }
};
`;
}

/**
 * Generate TypeScript Controller template
 * @param {string} resourceName - Resource name
 * @param {string} modelFileName - Model file name
 * @returns {string} TypeScript Controller template
 */
function getControllerTemplateTS(resourceName, modelFileName) {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    
    return `import { Request, Response } from 'express';
import * as ${resourceLower}Service from '../services/${modelFileName.replace('.ts', 'Service.ts')}';

// GET all ${resourcePlural}
export const getAll${resourceName}s = async (req: Request, res: Response): Promise<void> => {
    try {
        const items = await ${resourceLower}Service.getAll${resourceName}s();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching ${resourcePlural}:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ${resourcePlural}'
        });
    }
};

// GET ${resourceLower} by id
export const get${resourceName}ById = async (req: Request, res: Response): Promise<void> => {
    try {
        const item = await ${resourceLower}Service.get${resourceName}ById(req.params.id);
        res.json({
            success: true,
            data: item
        });
    } catch (error: any) {
        console.error('Error fetching ${resourceLower}:', error);
        if (error.message === '${resourceName} not found') {
            res.status(404).json({
                success: false,
                error: error.message
            });
            return;
        }
        if (error.message === 'Invalid ID format') {
            res.status(400).json({
                success: false,
                error: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ${resourceLower}'
        });
    }
};

// POST create ${resourceLower}
export const create${resourceName} = async (req: Request, res: Response): Promise<void> => {
    try {
        const newItem = await ${resourceLower}Service.create${resourceName}(req.body);
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error: any) {
        console.error('Error creating ${resourceLower}:', error);
        if (error.message.includes('required') || error.message.includes('must be') || error.message.includes('Invalid')) {
            res.status(400).json({
                success: false,
                error: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create ${resourceLower}'
        });
    }
};

// PUT update ${resourceLower}
export const update${resourceName} = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedItem = await ${resourceLower}Service.update${resourceName}(req.params.id, req.body);
        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error: any) {
        console.error('Error updating ${resourceLower}:', error);
        if (error.message === '${resourceName} not found') {
            res.status(404).json({
                success: false,
                error: error.message
            });
            return;
        }
        if (error.message.includes('must be') || error.message.includes('Invalid')) {
            res.status(400).json({
                success: false,
                error: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update ${resourceLower}'
        });
    }
};

// DELETE ${resourceLower}
export const delete${resourceName} = async (req: Request, res: Response): Promise<void> => {
    try {
        await ${resourceLower}Service.delete${resourceName}(req.params.id);
        res.json({
            success: true,
            message: '${resourceName} deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting ${resourceLower}:', error);
        if (error.message === '${resourceName} not found') {
            res.status(404).json({
                success: false,
                error: error.message
            });
            return;
        }
        if (error.message === 'Invalid ID format') {
            res.status(400).json({
                success: false,
                error: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to delete ${resourceLower}'
        });
    }
};
`;
}
