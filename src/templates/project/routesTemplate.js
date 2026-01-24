// Routes template for items endpoint

/**
 * Generate routes template for items
 * @returns {string} Routes template code
 */
export function getRoutesTemplate() {
    return `import express from 'express';
import * as itemController from '../controllers/itemController.js';

const router = express.Router();

// GET all items
router.get('/', itemController.getAllItems);

// GET item by id
router.get('/:id', itemController.getItemById);

// POST create new item
router.post('/', itemController.createItem);

// PUT update item
router.put('/:id', itemController.updateItem);

// DELETE item
router.delete('/:id', itemController.deleteItem);

export default router;
`;
}
