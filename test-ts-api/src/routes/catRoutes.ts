import express from 'express';
import * as catController from '../controllers/catController.ts';

const router = express.Router();

// GET all cats
router.get('/', catController.getAllCats);

// GET cat by id
router.get('/:id', catController.getCatById);

// POST create new cat
router.post('/', catController.createCat);

// PUT update cat
router.put('/:id', catController.updateCat);

// DELETE cat
router.delete('/:id', catController.deleteCat);

export default router;
