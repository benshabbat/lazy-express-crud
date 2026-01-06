import Category from '../models/Category.js';

// GET all categorys
export const getAllCategorys = async (req, res) => {
    try {
        const items = Category.getAll();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching categorys:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categorys'
        });
    }
};

// GET category by id
export const getCategoryById = async (req, res) => {
    try {
        const item = Category.getById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch category'
        });
    }
};

// POST create category
export const createCategory = async (req, res) => {
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

        const newItem = Category.create({ name, description });
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create category'
        });
    }
};

// PUT update category
export const updateCategory = async (req, res) => {
    try {
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

        const updatedItem = Category.update(req.params.id, { name, description });
        
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update category'
        });
    }
};

// DELETE category
export const deleteCategory = async (req, res) => {
    try {
        const deleted = Category.delete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete category'
        });
    }
};
