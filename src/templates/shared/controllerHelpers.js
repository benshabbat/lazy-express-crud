/**
 * Shared controller helpers for generated templates
 * Eliminates duplicate error handling and response patterns
 */

/**
 * Standard success response format
 * @param {any} data - Response data
 * @param {number} count - Optional count for list responses
 * @returns {Object} Formatted success response
 */
export const successResponse = (data, count) => ({
    success: true,
    ...(count !== undefined && { count }),
    data
});

/**
 * Standard error response with automatic status code detection
 * @param {Error} error - Error object
 * @returns {Object} {statusCode, body}
 */
export const errorResponse = (error) => {
    // Determine status code from error message
    const statusCode = 
        error.message.includes('Invalid ID') || error.message.includes('Invalid') ? 400 :
        error.message.includes('not found') || error.message.includes('does not exist') ? 404 :
        error.message.includes('already exists') || error.message.includes('Duplicate') ? 409 :
        error.message.includes('Unauthorized') || error.message.includes('token') ? 401 :
        error.message.includes('Forbidden') || error.message.includes('permission') ? 403 :
        500;

    return {
        statusCode,
        body: {
            success: false,
            error: error.message
        }
    };
};

/**
 * Wrap async handler with error handling
 * @param {Function} handler - Async handler function
 * @returns {Function} Wrapped handler with automatic error handling
 */
export const wrapHandler = (handler) => async (req, res) => {
    try {
        const result = await handler(req, res);
        if (result && !res.headersSent) {
            res.json(successResponse(result));
        }
    } catch (error) {
        console.error('Error:', error);
        const { statusCode, body } = errorResponse(error);
        res.status(statusCode).json(body);
    }
};

/**
 * Generate controller code for templates
 * Creates standardized CRUD controller methods
 */
export function generateControllerMethod(methodType, resourceName, serviceName, isTypeScript) {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';

    const typeAnnotations = isTypeScript ? {
        req: 'req: Request',
        res: 'res: Response',
        returnType: ': Promise<void>'
    } : {
        req: 'req',
        res: 'res',
        returnType: ''
    };

    const methods = {
        getAll: `/**
 * Get all ${resourcePlural}
 * @route GET /api/${resourcePlural}
 */
export const getAll${resourceName}s = async (${typeAnnotations.req}, ${typeAnnotations.res})${typeAnnotations.returnType} => {
    try {
        const ${resourcePlural} = await ${serviceName}.getAll${resourceName}s();
        res.json({
            success: true,
            count: ${resourcePlural}.length,
            data: ${resourcePlural}
        });
    } catch (error) {
        console.error('Error fetching ${resourcePlural}:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ${resourcePlural}'
        });
    }
};`,

        getById: `/**
 * Get ${resourceLower} by ID
 * @route GET /api/${resourcePlural}/:id
 */
export const get${resourceName}ById = async (${typeAnnotations.req}, ${typeAnnotations.res})${typeAnnotations.returnType} => {
    try {
        const ${resourceLower} = await ${serviceName}.get${resourceName}ById(req.params.id);
        
        if (!${resourceLower}) {
            return res.status(404).json({
                success: false,
                error: '${resourceName} not found'
            });
        }
        
        res.json({
            success: true,
            data: ${resourceLower}
        });
    } catch (error) {
        console.error('Error fetching ${resourceLower}:', error);
        
        if (error.message.includes('Invalid ID')) {
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
};`,

        create: `/**
 * Create new ${resourceLower}
 * @route POST /api/${resourcePlural}
 */
export const create${resourceName} = async (${typeAnnotations.req}, ${typeAnnotations.res})${typeAnnotations.returnType} => {
    try {
        const ${resourceLower} = await ${serviceName}.create${resourceName}(req.body);
        res.status(201).json({
            success: true,
            data: ${resourceLower}
        });
    } catch (error) {
        console.error('Error creating ${resourceLower}:', error);
        
        if (error.message.includes('required') || error.message.includes('Invalid')) {
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
};`,

        update: `/**
 * Update ${resourceLower}
 * @route PUT /api/${resourcePlural}/:id
 */
export const update${resourceName} = async (${typeAnnotations.req}, ${typeAnnotations.res})${typeAnnotations.returnType} => {
    try {
        const ${resourceLower} = await ${serviceName}.update${resourceName}(req.params.id, req.body);
        
        if (!${resourceLower}) {
            return res.status(404).json({
                success: false,
                error: '${resourceName} not found'
            });
        }
        
        res.json({
            success: true,
            data: ${resourceLower}
        });
    } catch (error) {
        console.error('Error updating ${resourceLower}:', error);
        
        if (error.message.includes('Invalid ID') || error.message.includes('Invalid')) {
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
};`,

        delete: `/**
 * Delete ${resourceLower}
 * @route DELETE /api/${resourcePlural}/:id
 */
export const delete${resourceName} = async (${typeAnnotations.req}, ${typeAnnotations.res})${typeAnnotations.returnType} => {
    try {
        const ${resourceLower} = await ${serviceName}.delete${resourceName}(req.params.id);
        
        if (!${resourceLower}) {
            return res.status(404).json({
                success: false,
                error: '${resourceName} not found'
            });
        }
        
        res.json({
            success: true,
            message: '${resourceName} deleted successfully',
            data: ${resourceLower}
        });
    } catch (error) {
        console.error('Error deleting ${resourceLower}:', error);
        
        if (error.message.includes('Invalid ID')) {
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
};`
    };

    return methods[methodType] || '';
}

/**
 * Generate all CRUD controller methods at once
 * @param {string} resourceName - Resource name (e.g., 'Product')
 * @param {string} serviceName - Service variable name (e.g., 'productService')
 * @param {boolean} isTypeScript - Whether to generate TypeScript code
 * @returns {string} All controller methods
 */
export function generateAllControllerMethods(resourceName, serviceName, isTypeScript = false) {
    const methods = ['getAll', 'getById', 'create', 'update', 'delete'];
    return methods
        .map(method => generateControllerMethod(method, resourceName, serviceName, isTypeScript))
        .join('\n\n');
}

/**
 * Generate controller imports
 * @param {boolean} isTypeScript - Whether to generate TypeScript imports
 * @returns {string} Import statements
 */
export function generateControllerImports(isTypeScript = false) {
    if (isTypeScript) {
        return `import { Request, Response } from 'express';`;
    }
    return '';
}
