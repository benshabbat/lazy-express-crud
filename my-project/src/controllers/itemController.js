import Item from '../models/Item.js';

// GET all items
export const getAllItems = async (req, res) => {
    try {
        const items = await Item.getAll();
        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// GET item by id
export const getItemById = async (req, res) => {
    try {
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// POST create item
export const createItem = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        
        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }

        const newItem = await Item.create({ name, description, price });
        res.status(201).json({
            success: true,
            data: newItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// PUT update item
export const updateItem = async (req, res) => {
    try {
        const { name, description, price } = req.body;
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// DELETE item
export const deleteItem = async (req, res) => {
    try {
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
