import mongoose from "mongoose";

export async function connectDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB already connected');
            return;
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'realestate',
            bufferCommands: false
        });
        
        const connection = mongoose.connection;
        connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });

        connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error; // Re-throw the error to be handled by the API route
    }
}