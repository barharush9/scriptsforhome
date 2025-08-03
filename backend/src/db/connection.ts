import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/apartment_scanner';
    
    // Set connection options with timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Continuing without database - some features may not work');
    console.log('💡 To set up MongoDB: https://www.mongodb.com/try/download/community');
    // Don't throw error, continue without database for demo purposes
  }
};
