import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import itemRoutes from './routes/itemRoutes.js';
import mongoose from 'mongoose';


const app = express();
const PORT = process.env.PORT || 3000;

import mongoose from 'mongoose';

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-secure');
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

connectDB();

// Security Middleware
app.use(helmet()); // Security headers

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
// Production: configure with specific origins
// app.use(cors({ origin: 'https://yourdomain.com' }));
app.use(cors()); // Development: allows all origins

// Body parser middleware
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Don't expose error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Something went wrong!' 
        : err.message;
    
    res.status(err.status || 500).json({ 
        error: errorMessage 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
