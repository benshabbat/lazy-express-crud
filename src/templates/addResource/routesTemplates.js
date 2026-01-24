// Routes template for adding new resources

/**
 * Generate routes template for a new resource
 * @param {string} resourceName - Resource name (e.g., 'Product', 'User')
 * @param {string} ext - File extension ('js' or 'ts')
 * @returns {string} Routes template code
 */
export function getRoutesTemplate(resourceName, ext = 'js') {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    const controllerFileName = `${resourceLower}Controller.${ext}`;
    
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
