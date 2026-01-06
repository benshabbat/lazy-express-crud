import Car from '../models/Car.js';

// GET all cars
export const getAllCars = async (req, res) => {
    try {
        const items = await Car.find();
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

// GET car by id
export const getCarById = async (req, res) => {
    try {
        const item = await Car.findById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
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

// POST create car
export const createCar = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }

        const newItem = await Car.create({ name, description });
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

// PUT update car
export const updateCar = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updatedItem = await Car.findByIdAndUpdate(
            req.params.id, 
            { name, description },
            { new: true, runValidators: true }
        );
        
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
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

// DELETE car
export const deleteCar = async (req, res) => {
    try {
        const deleted = await Car.findByIdAndDelete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        res.json({
            success: true,
            message: 'Car deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
