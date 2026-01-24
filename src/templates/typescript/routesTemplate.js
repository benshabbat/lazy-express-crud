// TypeScript routes template

export function getRoutesTemplateTS(resourceName) {
    const lowerResource = resourceName.toLowerCase();
    const pluralResource = lowerResource + 's';
    
    return `import express from 'express';
import * as ${lowerResource}Controller from '../controllers/${lowerResource}Controller.js';

const router = express.Router();

// GET all ${pluralResource}
router.get('/', ${lowerResource}Controller.getAll${resourceName}s);

// GET ${lowerResource} by id
router.get('/:id', ${lowerResource}Controller.get${resourceName}ById);

// POST create new ${lowerResource}
router.post('/', ${lowerResource}Controller.create${resourceName});

// PUT update ${lowerResource}
router.put('/:id', ${lowerResource}Controller.update${resourceName});

// DELETE ${lowerResource}
router.delete('/:id', ${lowerResource}Controller.delete${resourceName});

export default router;
`;
}
