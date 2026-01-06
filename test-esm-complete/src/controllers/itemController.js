import Item from '../models/Item.js';
import mongoose from 'mongoose';

// GET all items
export const getAllItems = async (req, res) => {
    try {
        const items = await Item.find();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch items'
        });
    }
};

// GET item by id
export const getItemById = async (req, res) => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Item not found'
            });
        }
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch item'
        });
    }
};

// POST create item
export const createItem = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        
        // Input validation
        if (!name || typeof name !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Name is required and must be a string'
            });
        }

        if (name.length > 255) {
            return res.status(400).json({
                success: false,
                error: 'Name must be less than 255 characters'
            });
        }

        if (description && typeof description !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Description must be a string'
            });
        }

        if (description && description.length > 2000) {
            return res.status(400).json({
                success: false,
                error: 'Description must be less than 2000 characters'
            });
        }

        const newItem = await Item.create({ name, description, price });
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create item'
        });
    }
};

// PUT update item
export const updateItem = async (req, res) => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        const { name, description, price } = req.body;
        
        // Input validation
        if (name !== undefined) {
            if (typeof name !== 'string' || name.length > 255) {
                return res.status(400).json({
                    success: false,
                    error: 'Name must be a string with max 255 characters'
                });
            }
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || description.length > 2000) {
                return res.status(400).json({
                    success: false,
                    error: 'Description must be a string with max 2000 characters'
                });
            }
        }

        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id, 
            { name, description, price },
            { new: true, runValidators: true }
        );
        
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                error: 'Item not found'
            });
        }

        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update item'
        });
    }
};

// DELETE item
export const deleteItem = async (req, res) => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        const deleted = await Item.findByIdAndDelete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Item not found'
            });
        }

        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete item'
        });
    }
};
