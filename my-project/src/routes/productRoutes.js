import express from 'express';
import * as productController from '../controllers/productController.js';

const router = express.Router();

// GET all products
router.get('/', productController.getAllProducts);

// GET product by id
router.get('/:id', productController.getProductById);

// POST create new product
router.post('/', productController.createProduct);

// PUT update product
router.put('/:id', productController.updateProduct);

// DELETE product
router.delete('/:id', productController.deleteProduct);

export default router;
