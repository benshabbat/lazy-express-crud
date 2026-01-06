import express from 'express';
import * as popController from '../controllers/popController.js';

const router = express.Router();

// GET all pops
router.get('/', popController.getAllPops);

// GET pop by id
router.get('/:id', popController.getPopById);

// POST create new pop
router.post('/', popController.createPop);

// PUT update pop
router.put('/:id', popController.updatePop);

// DELETE pop
router.delete('/:id', popController.deletePop);

export default router;
