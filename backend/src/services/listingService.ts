import { ListingModel, ListingDocument } from '../models/Listing';
import { Listing } from '../types/interfaces';
import { inMemoryStore } from './inMemoryStore';

export class ListingService {
  private useInMemoryStore = false;
  private hasInitializedDemo = false;

  private async ensureConnection(): Promise<void> {
    if (this.useInMemoryStore) {
      // Don't auto-initialize demo data anymore
      return;
    }

    try {
      // Test MongoDB connection with a simple operation
      await ListingModel.findOne().limit(1);
    } catch (error) {
      console.warn('MongoDB not available, switching to in-memory store');
      this.useInMemoryStore = true;
      // Start with empty in-memory store for real scraping
    }
  }
  
  async getAllListings(): Promise<Listing[]> {
    await this.ensureConnection();
    
    if (this.useInMemoryStore) {
      return inMemoryStore.getAllListings();
    }

    try {
      const listings = await ListingModel.find().sort({ createdAt: -1 });
      return listings.map(this.documentToListing);
    } catch (error) {
      console.error('Error fetching listings:', error);
      this.useInMemoryStore = true;
      return this.getAllListings();
    }
  }

  async getListingsByStatus(status: string): Promise<Listing[]> {
    await this.ensureConnection();
    
    if (this.useInMemoryStore) {
      return inMemoryStore.getListingsByStatus(status);
    }

    try {
      const listings = await ListingModel.find({ status }).sort({ createdAt: -1 });
      return listings.map(this.documentToListing);
    } catch (error) {
      console.error('Error fetching listings by status:', error);
      this.useInMemoryStore = true;
      return this.getListingsByStatus(status);
    }
  }

  async createListing(listingData: Omit<Listing, '_id' | 'createdAt'>): Promise<Listing> {
    await this.ensureConnection();
    
    if (this.useInMemoryStore) {
      return inMemoryStore.createListing(listingData);
    }

    try {
      const listing = new ListingModel(listingData);
      const savedListing = await listing.save();
      return this.documentToListing(savedListing);
    } catch (error) {
      console.error('Error creating listing:', error);
      this.useInMemoryStore = true;
      return this.createListing(listingData);
    }
  }

  async updateListingStatus(id: string, status: Listing['status']): Promise<Listing | null> {
    await this.ensureConnection();
    
    if (this.useInMemoryStore) {
      return inMemoryStore.updateListingStatus(id, status);
    }

    try {
      const updatedListing = await ListingModel.findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true }
      );
      
      return updatedListing ? this.documentToListing(updatedListing) : null;
    } catch (error) {
      console.error('Error updating listing status:', error);
      this.useInMemoryStore = true;
      return this.updateListingStatus(id, status);
    }
  }

  async checkIfListingExists(link: string): Promise<boolean> {
    await this.ensureConnection();
    
    if (this.useInMemoryStore) {
      return inMemoryStore.checkIfListingExists(link);
    }

    try {
      const existingListing = await ListingModel.findOne({ link });
      return !!existingListing;
    } catch (error) {
      console.error('Error checking if listing exists:', error);
      this.useInMemoryStore = true;
      return this.checkIfListingExists(link);
    }
  }

  async bulkCreateListings(listings: Omit<Listing, '_id' | 'createdAt'>[]): Promise<{ 
    created: number; 
    duplicates: number; 
    errors: number; 
  }> {
    await this.ensureConnection();
    
    if (this.useInMemoryStore) {
      return inMemoryStore.bulkCreateListings(listings);
    }

    let created = 0;
    let duplicates = 0;
    let errors = 0;

    for (const listing of listings) {
      try {
        const exists = await this.checkIfListingExists(listing.link);
        
        if (exists) {
          duplicates++;
          continue;
        }

        await this.createListing(listing);
        created++;
      } catch (error) {
        console.error('Error in bulk create:', error);
        errors++;
      }
    }

    return { created, duplicates, errors };
  }

  async loadDemoData(): Promise<void> {
    await this.ensureConnection();
    
    if (this.useInMemoryStore && !this.hasInitializedDemo) {
      await inMemoryStore.initializeDemoData();
      this.hasInitializedDemo = true;
      console.log('✅ Demo data loaded');
    }
  }

  async getRecentListings(hours: number = 24): Promise<Listing[]> {
    await this.ensureConnection();
    
    if (this.useInMemoryStore) {
      return inMemoryStore.getRecentListings(hours);
    }

    try {
      const cutoffDate = new Date(Date.now() - (hours * 60 * 60 * 1000));
      const listings = await ListingModel.find({
        createdAt: { $gte: cutoffDate }
      }).sort({ createdAt: -1 });
      
      return listings.map(this.documentToListing);
    } catch (error) {
      console.error('Error fetching recent listings:', error);
      this.useInMemoryStore = true;
      return this.getRecentListings(hours);
    }
  }

  async deleteOldListings(days: number = 30): Promise<number> {
    await this.ensureConnection();
    
    if (this.useInMemoryStore) {
      return inMemoryStore.deleteOldListings(days);
    }

    try {
      const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
      const result = await ListingModel.deleteMany({
        createdAt: { $lt: cutoffDate }
      });
      
      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error deleting old listings:', error);
      this.useInMemoryStore = true;
      return this.deleteOldListings(days);
    }
  }

  private documentToListing(doc: ListingDocument): Listing {
    return {
      _id: doc._id?.toString(),
      title: doc.title,
      rooms: doc.rooms,
      price: doc.price,
      description: doc.description,
      datePosted: doc.datePosted,
      link: doc.link,
      source: doc.source,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      images: doc.images,
      address: doc.address,
      floor: doc.floor,
      furnished: doc.furnished
    };
  }
}
