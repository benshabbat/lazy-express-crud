import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import itemRoutes from './routes/itemRoutes.js';
import mongoose from 'mongoose';
import popRoutes from './routes/popRoutes.js';
import productRoutes from './routes/productRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import carRoutes from './routes/carRoutes.js';


const app = express();
const PORT = process.env.PORT || 3000;

import mongoose from 'mongoose';

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-project');
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to Express CRUD API',
        database: 'MongoDB',
        endpoints: {
            'GET /api/items': 'Get all items',
            'GET /api/items/:id': 'Get item by id',
            'POST /api/items': 'Create new item',
            'PUT /api/items/:id': 'Update item',
            'DELETE /api/items/:id': 'Delete item'
        }
    });
});

app.use('/api/items', itemRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pops', popRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
