import mongoose from 'mongoose';

// MongoDB Connection with security options
const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-ts-api', {
            // Security: Use TLS/SSL in production
            ssl: process.env.NODE_ENV === 'production',
            // Timeout settings
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.error('Please check your MONGODB_URI in .env file');
        process.exit(1);
    }
};

export default connectDB;
