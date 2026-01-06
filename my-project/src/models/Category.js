// In-memory data storage for Category
// In production, use a real database like MongoDB, PostgreSQL, etc.

let categorys = [
    { 
        id: '1', 
        name: 'Category 1', 
        description: 'Description 1',
        createdAt: new Date().toISOString()
    },
    { 
        id: '2', 
        name: 'Category 2', 
        description: 'Description 2',
        createdAt: new Date().toISOString()
    }
];

class Category {
    static getAll() {
        return categorys;
    }

    static getById(id) {
        return categorys.find(item => item.id === id);
    }

    static create(data) {
        const newItem = {
            id: Date.now().toString(),
            name: data.name,
            description: data.description || '',
            createdAt: new Date().toISOString()
        };
        categorys.push(newItem);
        return newItem;
    }

    static update(id, data) {
        const index = categorys.findIndex(item => item.id === id);
        if (index === -1) return null;

        categorys[index] = {
            ...categorys[index],
            ...data,
            id: categorys[index].id,
            updatedAt: new Date().toISOString()
        };
        return categorys[index];
    }

    static delete(id) {
        const index = categorys.findIndex(item => item.id === id);
        if (index === -1) return false;

        categorys.splice(index, 1);
        return true;
    }
}

export default Category;
