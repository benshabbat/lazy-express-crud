import { Request, Response } from 'express';
import Cat from '../models/Cat.ts';
import mongoose from 'mongoose';

// GET all cats
export const getAllCats = async (req: Request, res: Response): Promise<void> => {
    try {
        const items = await Cat.find();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching cats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cats'
        });
    }
};

// GET cat by id
export const getCatById = async (req: Request, res: Response): Promise<void> => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
            return;
        }
        const item = await Cat.findById(req.params.id);
        if (!item) {
            res.status(404).json({
                success: false,
                error: 'Cat not found'
            });
            return;
        }
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching cat:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cat'
        });
    }
};

// POST create cat
export const createCat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;
        
        // Input validation
        if (!name || typeof name !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Name is required and must be a string'
            });
            return;
        }

        if (name.length > 255) {
            res.status(400).json({
                success: false,
                error: 'Name must be less than 255 characters'
            });
            return;
        }

        if (description && typeof description !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Description must be a string'
            });
            return;
        }

        if (description && description.length > 2000) {
            res.status(400).json({
                success: false,
                error: 'Description must be less than 2000 characters'
            });
            return;
        }

        const newItem = await Cat.create({ name, description });
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating cat:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create cat'
        });
    }
};

// PUT update cat
export const updateCat = async (req: Request, res: Response): Promise<void> => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
            return;
        }
        const { name, description } = req.body;
        
        // Input validation
        if (name !== undefined) {
            if (typeof name !== 'string' || name.length > 255) {
                res.status(400).json({
                    success: false,
                    error: 'Name must be a string with max 255 characters'
                });
                return;
            }
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || description.length > 2000) {
                res.status(400).json({
                    success: false,
                    error: 'Description must be a string with max 2000 characters'
                });
                return;
            }
        }

        const updatedItem = await Cat.findByIdAndUpdate(
            req.params.id, 
            { name, description },
            { new: true, runValidators: true }
        );
        
        if (!updatedItem) {
            res.status(404).json({
                success: false,
                error: 'Cat not found'
            });
            return;
        }

        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating cat:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update cat'
        });
    }
};

// DELETE cat
export const deleteCat = async (req: Request, res: Response): Promise<void> => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
            return;
        }
        const deleted = await Cat.findByIdAndDelete(req.params.id);
        
        if (!deleted) {
            res.status(404).json({
                success: false,
                error: 'Cat not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Cat deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting cat:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete cat'
        });
    }
};
