// Auth Routes template
// Same for both JavaScript and TypeScript

/**
 * Generate auth routes template
 * @returns {string} Auth routes template code
 */
export function getAuthRoutesTemplate() {
    return `import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);

export default router;
`;
}
