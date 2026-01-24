// TypeScript controller template - HTTP layer

export function getControllerTemplateTS(resourceName, dbChoice) {
    const lowerResource = resourceName.toLowerCase();
    const pluralResource = lowerResource + 's';
    
    return `import { Request, Response } from 'express';
import * as ${lowerResource}Service from '../services/${lowerResource}Service.js';
import type { ApiResponse } from '../types/index.js';

// GET all ${pluralResource}
export const getAll${resourceName}s = async (req: Request, res: Response): Promise<void> => {
    try {
        const ${pluralResource} = await ${lowerResource}Service.getAll${resourceName}s();
        res.json({
            success: true,
            count: ${pluralResource}.length,
            data: ${pluralResource}
        } as ApiResponse);
    } catch (error) {
        console.error('Error fetching ${pluralResource}:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch ${pluralResource}'
        } as ApiResponse);
    }
};

// GET ${lowerResource} by id
export const get${resourceName}ById = async (req: Request, res: Response): Promise<void> => {
    try {
        const ${lowerResource} = await ${lowerResource}Service.get${resourceName}ById(req.params.id);
        res.json({
            success: true,
            data: ${lowerResource}
        } as ApiResponse);
    } catch (error) {
        console.error('Error fetching ${lowerResource}:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch ${lowerResource}';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        } as ApiResponse);
    }
};

// POST create ${lowerResource}
export const create${resourceName} = async (req: Request, res: Response): Promise<void> => {
    try {
        const new${resourceName} = await ${lowerResource}Service.create${resourceName}(req.body);
        res.status(201).json({
            success: true,
            data: new${resourceName}
        } as ApiResponse);
    } catch (error) {
        console.error('Error creating ${lowerResource}:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create ${lowerResource}'
        } as ApiResponse);
    }
};

// PUT update ${lowerResource}
export const update${resourceName} = async (req: Request, res: Response): Promise<void> => {
    try {
        const updated${resourceName} = await ${lowerResource}Service.update${resourceName}(req.params.id, req.body);
        res.json({
            success: true,
            data: updated${resourceName}
        } as ApiResponse);
    } catch (error) {
        console.error('Error updating ${lowerResource}:', error);
        const message = error instanceof Error ? error.message : 'Failed to update ${lowerResource}';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        } as ApiResponse);
    }
};

// DELETE ${lowerResource}
export const delete${resourceName} = async (req: Request, res: Response): Promise<void> => {
    try {
        await ${lowerResource}Service.delete${resourceName}(req.params.id);
        res.json({
            success: true,
            message: '${resourceName} deleted successfully'
        } as ApiResponse);
    } catch (error) {
        console.error('Error deleting ${lowerResource}:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete ${lowerResource}';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        } as ApiResponse);
    }
};
`;
}
