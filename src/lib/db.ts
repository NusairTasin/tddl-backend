import mongoose from "mongoose";

export async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!, {
            dbName: 'realestate',
            bufferCommands: false
        })
        const connection = mongoose.connection
        connection.on('connected', () => {
            console.log('MongoDB connected!')
        })
    } catch (error) {
        console.log(error)
    }
}