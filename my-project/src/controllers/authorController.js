import Author from '../models/Author.js';

// GET all authors
export const getAllAuthors = async (req, res) => {
    try {
        const items = Author.getAll();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching authors:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch authors'
        });
    }
};

// GET author by id
export const getAuthorById = async (req, res) => {
    try {
        const item = Author.getById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Author not found'
            });
        }
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching author:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch author'
        });
    }
};

// POST create author
export const createAuthor = async (req, res) => {
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

        const newItem = Author.create({ name, description });
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating author:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create author'
        });
    }
};

// PUT update author
export const updateAuthor = async (req, res) => {
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

        const updatedItem = Author.update(req.params.id, { name, description });
        
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                error: 'Author not found'
            });
        }

        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating author:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update author'
        });
    }
};

// DELETE author
export const deleteAuthor = async (req, res) => {
    try {
        const deleted = Author.delete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Author not found'
            });
        }

        res.json({
            success: true,
            message: 'Author deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting author:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete author'
        });
    }
};
