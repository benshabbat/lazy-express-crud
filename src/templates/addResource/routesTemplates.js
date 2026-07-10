// Routes template for adding new resources

/**
 * Generate routes template for a new resource
 * @param {string} resourceName - Resource name (e.g., 'Product', 'User')
 * @param {string} ext - File extension ('js' or 'ts'), kept for call-signature
 *   consistency with other addResource templates. Not used for import paths:
 *   those always use '.js' (required by NodeNext module resolution even in TS projects).
 * @returns {string} Routes template code
 */
export function getRoutesTemplate(resourceName, ext = 'js') {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    // Note: Import specifiers always use '.js', even in TypeScript projects
    // (Node's NodeNext module resolution requires this - it maps to the compiled output).
    const controllerFileName = `${resourceLower}Controller.js`;

    return `import express from 'express';
import * as ${resourceLower}Controller from '../controllers/${controllerFileName}';

const router = express.Router();

// GET all ${resourcePlural}
router.get('/', ${resourceLower}Controller.getAll${resourceName}s);

// GET ${resourceLower} by id
router.get('/:id', ${resourceLower}Controller.get${resourceName}ById);

// POST create new ${resourceLower}
router.post('/', ${resourceLower}Controller.create${resourceName});

// PUT update ${resourceLower}
router.put('/:id', ${resourceLower}Controller.update${resourceName});

// DELETE ${resourceLower}
router.delete('/:id', ${resourceLower}Controller.delete${resourceName});

export default router;
`;
}
