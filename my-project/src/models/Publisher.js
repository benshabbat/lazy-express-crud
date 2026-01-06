// In-memory data storage for Publisher
// In production, use a real database like MongoDB, PostgreSQL, etc.

let publishers = [
    { 
        id: '1', 
        name: 'Publisher 1', 
        description: 'Description 1',
        createdAt: new Date().toISOString()
    },
    { 
        id: '2', 
        name: 'Publisher 2', 
        description: 'Description 2',
        createdAt: new Date().toISOString()
    }
];

class Publisher {
    static getAll() {
        return publishers;
    }

    static getById(id) {
        return publishers.find(item => item.id === id);
    }

    static create(data) {
        const newItem = {
            id: Date.now().toString(),
            name: data.name,
            description: data.description || '',
            createdAt: new Date().toISOString()
        };
        publishers.push(newItem);
        return newItem;
    }

    static update(id, data) {
        const index = publishers.findIndex(item => item.id === id);
        if (index === -1) return null;

        publishers[index] = {
            ...publishers[index],
            ...data,
            id: publishers[index].id,
            updatedAt: new Date().toISOString()
        };
        return publishers[index];
    }

    static delete(id) {
        const index = publishers.findIndex(item => item.id === id);
        if (index === -1) return false;

        publishers.splice(index, 1);
        return true;
    }
}

export default Publisher;
