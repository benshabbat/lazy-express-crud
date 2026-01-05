// In-memory data storage for Product
// In production, use a real database like MongoDB, PostgreSQL, etc.

let products = [
    { 
        id: '1', 
        name: 'Product 1', 
        description: 'Description 1',
        createdAt: new Date().toISOString()
    },
    { 
        id: '2', 
        name: 'Product 2', 
        description: 'Description 2',
        createdAt: new Date().toISOString()
    }
];

class Product {
    static getAll() {
        return products;
    }

    static getById(id) {
        return products.find(item => item.id === id);
    }

    static create(data) {
        const newItem = {
            id: Date.now().toString(),
            name: data.name,
            description: data.description || '',
            createdAt: new Date().toISOString()
        };
        products.push(newItem);
        return newItem;
    }

    static update(id, data) {
        const index = products.findIndex(item => item.id === id);
        if (index === -1) return null;

        products[index] = {
            ...products[index],
            ...data,
            id: products[index].id,
            updatedAt: new Date().toISOString()
        };
        return products[index];
    }

    static delete(id) {
        const index = products.findIndex(item => item.id === id);
        if (index === -1) return false;

        products.splice(index, 1);
        return true;
    }
}

export default Product;
