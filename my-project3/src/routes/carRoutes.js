import express from 'express';
import * as carController from '../controllers/carController.js';

const router = express.Router();

// GET all cars
router.get('/', carController.getAllCars);

// GET car by id
router.get('/:id', carController.getCarById);

// POST create new car
router.post('/', carController.createCar);

// PUT update car
router.put('/:id', carController.updateCar);

// DELETE car
router.delete('/:id', carController.deleteCar);

export default router;
