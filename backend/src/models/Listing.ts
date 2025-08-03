import mongoose, { Schema, Document } from 'mongoose';
import { Listing } from '../types/interfaces';

export interface ListingDocument extends Omit<Listing, '_id'>, Document {}

const listingSchema = new Schema<ListingDocument>({
  title: { type: String, required: true },
  rooms: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  datePosted: { type: Date, required: true },
  link: { type: String, required: true, unique: true },
  source: { 
    type: String, 
    required: true, 
    enum: ['yad2', 'ihomes'] 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['new', 'called', 'visited', 'rejected'],
    default: 'new'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  images: [{ type: String }],
  address: { type: String },
  floor: { type: Number },
  furnished: { type: Boolean }
});

// Update the updatedAt field before saving
listingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
listingSchema.index({ link: 1 });
listingSchema.index({ source: 1, datePosted: -1 });
listingSchema.index({ status: 1 });

export const ListingModel = mongoose.model<ListingDocument>('Listing', listingSchema);
