import { Request, Response } from 'express';
import Item from '../models/Item.js';
import mongoose from 'mongoose';
import type { ApiResponse, ItemInput } from '../types/index.js';

// GET all items
export const getAllItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const items = await Item.find();
        res.json({
            success: true,
            count: items.length,
            data: items
        } as ApiResponse);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch items'
        } as ApiResponse);
    }
};

// GET item by id
export const getItemById = async (req: Request, res: Response): Promise<void> => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            } as ApiResponse);
            return;
        }
        const item = await Item.findById(req.params.id);
        if (!item) {
            res.status(404).json({
                success: false,
                error: 'Item not found'
            } as ApiResponse);
            return;
        }
        res.json({
            success: true,
            data: item
        } as ApiResponse);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch item'
        } as ApiResponse);
    }
};

// POST create item
export const createItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, price }: ItemInput = req.body;
        
        // Input validation
        if (!name || typeof name !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Name is required and must be a string'
            } as ApiResponse);
            return;
        }

        if (name.length > 255) {
            res.status(400).json({
                success: false,
                error: 'Name must be less than 255 characters'
            } as ApiResponse);
            return;
        }

        if (description && typeof description !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Description must be a string'
            } as ApiResponse);
            return;
        }

        if (description && description.length > 2000) {
            res.status(400).json({
                success: false,
                error: 'Description must be less than 2000 characters'
            } as ApiResponse);
            return;
        }

        const newItem = await Item.create({ name, description, price });
        res.status(201).json({
            success: true,
            data: newItem
        } as ApiResponse);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create item'
        } as ApiResponse);
    }
};

// PUT update item
export const updateItem = async (req: Request, res: Response): Promise<void> => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            } as ApiResponse);
            return;
        }
        const { name, description, price }: Partial<ItemInput> = req.body;
        
        // Input validation
        if (name !== undefined) {
            if (typeof name !== 'string' || name.length > 255) {
                res.status(400).json({
                    success: false,
                    error: 'Name must be a string with max 255 characters'
                } as ApiResponse);
                return;
            }
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || description.length > 2000) {
                res.status(400).json({
                    success: false,
                    error: 'Description must be a string with max 2000 characters'
                } as ApiResponse);
                return;
            }
        }

        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id, 
            { name, description, price },
            { new: true, runValidators: true }
        );
        
        if (!updatedItem) {
            res.status(404).json({
                success: false,
                error: 'Item not found'
            } as ApiResponse);
            return;
        }

        res.json({
            success: true,
            data: updatedItem
        } as ApiResponse);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update item'
        } as ApiResponse);
    }
};

// DELETE item
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            } as ApiResponse);
            return;
        }
        const deleted = await Item.findByIdAndDelete(req.params.id);
        
        if (!deleted) {
            res.status(404).json({
                success: false,
                error: 'Item not found'
            } as ApiResponse);
            return;
        }

        res.json({
            success: true,
            message: 'Item deleted successfully'
        } as ApiResponse);
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete item'
        } as ApiResponse);
    }
};
