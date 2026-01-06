import Publisher from '../models/Publisher.js';

// GET all publishers
export const getAllPublishers = async (req, res) => {
    try {
        const items = Publisher.getAll();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching publishers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch publishers'
        });
    }
};

// GET publisher by id
export const getPublisherById = async (req, res) => {
    try {
        const item = Publisher.getById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Publisher not found'
            });
        }
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching publisher:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch publisher'
        });
    }
};

// POST create publisher
export const createPublisher = async (req, res) => {
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

        const newItem = Publisher.create({ name, description });
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        console.error('Error creating publisher:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create publisher'
        });
    }
};

// PUT update publisher
export const updatePublisher = async (req, res) => {
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

        const updatedItem = Publisher.update(req.params.id, { name, description });
        
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                error: 'Publisher not found'
            });
        }

        res.json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating publisher:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update publisher'
        });
    }
};

// DELETE publisher
export const deletePublisher = async (req, res) => {
    try {
        const deleted = Publisher.delete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Publisher not found'
            });
        }

        res.json({
            success: true,
            message: 'Publisher deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting publisher:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete publisher'
        });
    }
};
