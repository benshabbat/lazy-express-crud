import Pop from '../models/Pop.js';

// GET all pops
export const getAllPops = async (req, res) => {
    try {
        const items = await Pop.getAll();
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

// GET pop by id
export const getPopById = async (req, res) => {
    try {
        const item = await Pop.getById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Pop not found'
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

// POST create pop
export const createPop = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }

        const newItem = await Pop.create({ name, description });
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

// PUT update pop
export const updatePop = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updatedItem = await Pop.update(req.params.id, { name, description });
        
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                error: 'Pop not found'
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

// DELETE pop
export const deletePop = async (req, res) => {
    try {
        const deleted = await Pop.delete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Pop not found'
            });
        }

        res.json({
            success: true,
            message: 'Pop deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
