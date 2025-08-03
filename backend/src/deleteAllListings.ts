import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { ListingModel } from './models/Listing';

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const result = await ListingModel.deleteMany({});
    console.log(`Deleted ${result.deletedCount} listings.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error deleting listings:', err);
    process.exit(1);
  }
})();
