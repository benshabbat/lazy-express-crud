import express from 'express';
import * as publisherController from '../controllers/publisherController.js';

const router = express.Router();

// GET all publishers
router.get('/', publisherController.getAllPublishers);

// GET publisher by id
router.get('/:id', publisherController.getPublisherById);

// POST create new publisher
router.post('/', publisherController.createPublisher);

// PUT update publisher
router.put('/:id', publisherController.updatePublisher);

// DELETE publisher
router.delete('/:id', publisherController.deletePublisher);

export default router;
