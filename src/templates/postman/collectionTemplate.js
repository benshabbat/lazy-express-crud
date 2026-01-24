// Postman collection template

/**
 * Generate Postman collection item for a resource
 * @param {string} resourceName - Resource name (e.g., 'Product', 'User')
 * @returns {object} Postman collection item
 */
export function getResourceCollectionItem(resourceName) {
    const baseName = resourceName.toLowerCase();
    const routePath = baseName + 's';
    
    return {
        name: resourceName,
        item: [
            {
                name: `Get All ${resourceName}s`,
                request: {
                    method: 'GET',
                    header: [],
                    url: {
                        raw: `{{baseUrl}}/api/${routePath}`,
                        host: ['{{baseUrl}}'],
                        path: ['api', routePath]
                    },
                    description: `Retrieve all ${routePath} from the database`
                },
                response: []
            },
            {
                name: `Get ${resourceName} by ID`,
                request: {
                    method: 'GET',
                    header: [],
                    url: {
                        raw: `{{baseUrl}}/api/${routePath}/:id`,
                        host: ['{{baseUrl}}'],
                        path: ['api', routePath, ':id'],
                        variable: [
                            {
                                key: 'id',
                                value: '1',
                                description: `${resourceName} ID`
                            }
                        ]
                    },
                    description: `Retrieve a specific ${baseName} by its ID`
                },
                response: []
            },
            {
                name: `Create ${resourceName}`,
                request: {
                    method: 'POST',
                    header: [
                        {
                            key: 'Content-Type',
                            value: 'application/json'
                        }
                    ],
                    body: {
                        mode: 'raw',
                        raw: `{\n  "name": "New ${resourceName}",\n  "description": "${resourceName} description"\n}`
                    },
                    url: {
                        raw: `{{baseUrl}}/api/${routePath}`,
                        host: ['{{baseUrl}}'],
                        path: ['api', routePath]
                    },
                    description: `Create a new ${baseName}`
                },
                response: []
            },
            {
                name: `Update ${resourceName}`,
                request: {
                    method: 'PUT',
                    header: [
                        {
                            key: 'Content-Type',
                            value: 'application/json'
                        }
                    ],
                    body: {
                        mode: 'raw',
                        raw: `{\n  "name": "Updated ${resourceName}",\n  "description": "Updated description"\n}`
                    },
                    url: {
                        raw: `{{baseUrl}}/api/${routePath}/:id`,
                        host: ['{{baseUrl}}'],
                        path: ['api', routePath, ':id'],
                        variable: [
                            {
                                key: 'id',
                                value: '1',
                                description: `${resourceName} ID`
                            }
                        ]
                    },
                    description: `Update an existing ${baseName} by ID`
                },
                response: []
            },
            {
                name: `Delete ${resourceName}`,
                request: {
                    method: 'DELETE',
                    header: [],
                    url: {
                        raw: `{{baseUrl}}/api/${routePath}/:id`,
                        host: ['{{baseUrl}}'],
                        path: ['api', routePath, ':id'],
                        variable: [
                            {
                                key: 'id',
                                value: '1',
                                description: `${resourceName} ID`
                            }
                        ]
                    },
                    description: `Delete a ${baseName} by ID`
                },
                response: []
            }
        ]
    };
}

/**
 * Generate health check collection item
 * @returns {object} Health check Postman collection item
 */
export function getHealthCheckItem() {
    return {
        name: 'Health Check',
        request: {
            method: 'GET',
            header: [],
            url: {
                raw: '{{baseUrl}}/',
                host: ['{{baseUrl}}'],
                path: ['']
            },
            description: 'Check API health and view available endpoints'
        },
        response: []
    };
}

/**
 * Generate complete Postman collection
 * @param {string} projectName - Project name
 * @param {Array<object>} collectionItems - Array of collection items
 * @returns {object} Complete Postman collection
 */
export function getPostmanCollection(projectName, collectionItems) {
    return {
        info: {
            name: projectName,
            description: `Complete CRUD API collection for ${projectName}`,
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: collectionItems,
        variable: [
            {
                key: 'baseUrl',
                value: 'http://localhost:3000',
                type: 'string'
            }
        ]
    };
}
