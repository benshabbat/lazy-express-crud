import Product from '../models/Product.js';

// GET all products
export const getAllProducts = async (req, res) => {
    try {
        const items = await Product.find();
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

// GET product by id
export const getProductById = async (req, res) => {
    try {
        const item = await Product.findById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
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

// POST create product
export const createProduct = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }

        const newItem = await Product.create({ name, description });
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

// PUT update product
export const updateProduct = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updatedItem = await Product.findByIdAndUpdate(
            req.params.id, 
            { name, description },
            { new: true, runValidators: true }
        );
        
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
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

// DELETE product
export const deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
