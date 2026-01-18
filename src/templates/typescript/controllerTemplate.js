// TypeScript controller template - HTTP layer

export function getControllerTemplateTS(dbChoice) {
    return `import { Request, Response } from 'express';
import * as itemService from '../services/itemService.js';
import type { ApiResponse } from '../types/index.js';

// GET all items
export const getAllItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const items = await itemService.getAllItems();
        res.json({
            success: true,
            count: items.length,
            data: items
        } as ApiResponse);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch items'
        } as ApiResponse);
    }
};

// GET item by id
export const getItemById = async (req: Request, res: Response): Promise<void> => {
    try {
        const item = await itemService.getItemById(req.params.id);
        res.json({
            success: true,
            data: item
        } as ApiResponse);
    } catch (error) {
        console.error('Error fetching item:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch item';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        } as ApiResponse);
    }
};

// POST create item
export const createItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const newItem = await itemService.createItem(req.body);
        res.status(201).json({
            success: true,
            data: newItem
        } as ApiResponse);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create item'
        } as ApiResponse);
    }
};

// PUT update item
export const updateItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedItem = await itemService.updateItem(req.params.id, req.body);
        res.json({
            success: true,
            data: updatedItem
        } as ApiResponse);
    } catch (error) {
        console.error('Error updating item:', error);
        const message = error instanceof Error ? error.message : 'Failed to update item';
        const statusCode = message.includes('Invalid ID') ? 400 : 
                          message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: message
        } as ApiResponse);
    }
};

// DELETE item
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
    try {
        await itemService.deleteItem(req.params.id);
        res.json({
            success: true,
            message: 'Item deleted successfully'
        } as ApiResponse);
    } catch (error) {
        console.error('Error deleting item:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete item';
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
