import { Request, Response } from 'express';
import Dog from '../models/Dog.ts';
import mongoose from 'mongoose';

// GET all dogs
export const getAllDogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const items = await Dog.find();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching dogs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dogs'
        });
    }
};

// GET dog by id
export const getDogById = async (req: Request, res: Response): Promise<void> => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
            return;
        }
        const item = await Dog.findById(req.params.id);
        if (!item) {
            res.status(404).json({
                success: false,
                error: 'Dog not found'
            });
            return;
        }
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching dog:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dog'
        });
    }
};

// POST create dog
export const createDog = async (req: Request, res: Response): Promise<void> => {
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

        const newItem = await Dog.create({ name, description });
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating dog:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create dog'
        });
    }
};

// PUT update dog
export const updateDog = async (req: Request, res: Response): Promise<void> => {
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

        const updatedItem = await Dog.findByIdAndUpdate(
            req.params.id, 
            { name, description },
            { new: true, runValidators: true }
        );
        
        if (!updatedItem) {
            res.status(404).json({
                success: false,
                error: 'Dog not found'
            });
            return;
        }

        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating dog:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update dog'
        });
    }
};

// DELETE dog
export const deleteDog = async (req: Request, res: Response): Promise<void> => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
            return;
        }
        const deleted = await Dog.findByIdAndDelete(req.params.id);
        
        if (!deleted) {
            res.status(404).json({
                success: false,
                error: 'Dog not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Dog deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting dog:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete dog'
        });
    }
};
