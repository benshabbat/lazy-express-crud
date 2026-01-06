import express from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

// GET all categorys
router.get('/', categoryController.getAllCategorys);

// GET category by id
router.get('/:id', categoryController.getCategoryById);

// POST create new category
router.post('/', categoryController.createCategory);

// PUT update category
router.put('/:id', categoryController.updateCategory);

// DELETE category
router.delete('/:id', categoryController.deleteCategory);

export default router;
