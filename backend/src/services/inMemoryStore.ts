import type { Listing } from '../types/interfaces';

// In-memory storage for demo purposes when MongoDB is not available
class InMemoryListingStore {
  private listings: Map<string, Listing> = new Map();
  private counter = 1;

  async getAllListings(): Promise<Listing[]> {
    return Array.from(this.listings.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getListingsByStatus(status: string): Promise<Listing[]> {
    const all = await this.getAllListings();
    return all.filter(listing => listing.status === status);
  }

  async createListing(listingData: Omit<Listing, '_id' | 'createdAt'>): Promise<Listing> {
    const id = `demo-${this.counter++}`;
    const listing: Listing = {
      ...listingData,
      _id: id,
      createdAt: new Date()
    };
    this.listings.set(id, listing);
    return listing;
  }

  async updateListingStatus(id: string, status: Listing['status']): Promise<Listing | null> {
    const listing = this.listings.get(id);
    if (!listing) return null;

    const updated = {
      ...listing,
      status,
      updatedAt: new Date()
    };
    this.listings.set(id, updated);
    return updated;
  }

  async checkIfListingExists(link: string): Promise<boolean> {
    return Array.from(this.listings.values()).some(listing => listing.link === link);
  }

  async bulkCreateListings(listings: Omit<Listing, '_id' | 'createdAt'>[]): Promise<{
    created: number;
    duplicates: number;
    errors: number;
  }> {
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
        errors++;
      }
    }

    return { created, duplicates, errors };
  }

  async getRecentListings(hours: number = 24): Promise<Listing[]> {
    const cutoffDate = new Date(Date.now() - (hours * 60 * 60 * 1000));
    const all = await this.getAllListings();
    return all.filter(listing => new Date(listing.createdAt) >= cutoffDate);
  }

  async deleteOldListings(days: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    const toDelete = Array.from(this.listings.values()).filter(
      listing => new Date(listing.createdAt) < cutoffDate
    );
    
    toDelete.forEach(listing => {
      if (listing._id) this.listings.delete(listing._id);
    });
    
    return toDelete.length;
  }

  // Initialize with demo data
  async initializeDemoData(): Promise<void> {
    const demoListings: Omit<Listing, '_id' | 'createdAt'>[] = [
      {
        title: 'דירת 3 חדרים מעולה בגני תקווה',
        rooms: 3,
        price: 6500,
        description: 'דירה מעולה, מרווחת ונוחה בלב גני תקווה',
        datePosted: new Date(),
        link: 'https://yad2.co.il/demo-listing-1',
        source: 'yad2',
        status: 'new',
        address: 'רחוב הרצל, גני תקווה',
        floor: 2,
        furnished: false
      },
      {
        title: 'דירת 2.5 חדרים קריית אונו',
        rooms: 2.5,
        price: 5800,
        description: 'דירה יפה בקריית אונו, קרוב לתחבורה ציבורית',
        datePosted: new Date(Date.now() - 86400000),
        link: 'https://yad2.co.il/demo-listing-2',
        source: 'yad2',
        status: 'new',
        address: 'שדרות ירושלים, קריית אונו',
        floor: 1,
        furnished: true
      },
      {
        title: 'דירת 4 חדרים גדולה גני תקווה',
        rooms: 4,
        price: 8200,
        description: 'דירה מעולה למשפחה, עם מרפסת גדולה',
        datePosted: new Date(Date.now() - 172800000),
        link: 'https://yad2.co.il/demo-listing-3',
        source: 'yad2',
        status: 'called',
        address: 'רחוב בן גוריון, גני תקווה',
        floor: 3,
        furnished: false
      },
      {
        title: 'דירת 3 חדרים מרוהטת קריית אונו',
        rooms: 3,
        price: 7200,
        description: 'דירה מרוהטת במלואה, מוכנה למגורים מיידיים',
        datePosted: new Date(Date.now() - 259200000),
        link: 'https://yad2.co.il/demo-listing-4',
        source: 'yad2',
        status: 'visited',
        address: 'רחוב סוקולוב, קריית אונו',
        floor: 4,
        furnished: true
      },
      {
        title: 'דירת 2.5 חדרים ישנה גני תקווה',
        rooms: 2.5,
        price: 4800,
        description: 'דירה זקוקה לשיפוצים, מחיר אטרקטיבי',
        datePosted: new Date(Date.now() - 345600000),
        link: 'https://yad2.co.il/demo-listing-5',
        source: 'yad2',
        status: 'rejected',
        address: 'רחוב הגליל, גני תקווה',
        floor: 0,
        furnished: false
      }
    ];

    await this.bulkCreateListings(demoListings);
    console.log('✅ Demo data initialized in memory');
  }
}

export const inMemoryStore = new InMemoryListingStore();
