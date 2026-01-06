import User from '../models/User.js';
import mongoose from 'mongoose';

// GET all users
export const getAllUsers = async (req, res) => {
    try {
        const items = await User.find();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
};

// GET user by id
export const getUserById = async (req, res) => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        const item = await User.findById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user'
        });
    }
};

// POST create user
export const createUser = async (req, res) => {
    try {
        const { name, description } = req.body;
        
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

        const newItem = await User.create({ name, description });
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create user'
        });
    }
};

// PUT update user
export const updateUser = async (req, res) => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        const { name, description } = req.body;
        
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

        const updatedItem = await User.findByIdAndUpdate(
            req.params.id, 
            { name, description },
            { new: true, runValidators: true }
        );
        
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user'
        });
    }
};

// DELETE user
export const deleteUser = async (req, res) => {
    try {
        // Security: Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        const deleted = await User.findByIdAndDelete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user'
        });
    }
};
