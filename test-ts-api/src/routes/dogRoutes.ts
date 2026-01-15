import express from 'express';
import * as dogController from '../controllers/dogController.ts';

const router = express.Router();

// GET all dogs
router.get('/', dogController.getAllDogs);

// GET dog by id
router.get('/:id', dogController.getDogById);

// POST create new dog
router.post('/', dogController.createDog);

// PUT update dog
router.put('/:id', dogController.updateDog);

// DELETE dog
router.delete('/:id', dogController.deleteDog);

export default router;
