import { ListingService } from '../services/listingService';
import type { Listing } from '../types/interfaces';

export async function createDemoData(): Promise<void> {
  const listingService = new ListingService();

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
      datePosted: new Date(Date.now() - 86400000), // 1 day ago
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
      datePosted: new Date(Date.now() - 172800000), // 2 days ago
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
      datePosted: new Date(Date.now() - 259200000), // 3 days ago
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
      datePosted: new Date(Date.now() - 345600000), // 4 days ago
      link: 'https://yad2.co.il/demo-listing-5',
      source: 'yad2',
      status: 'rejected',
      address: 'רחוב הגליל, גני תקווה',
      floor: 0,
      furnished: false
    }
  ];

  try {
    const result = await listingService.bulkCreateListings(demoListings);
    console.log(`✅ Created ${result.created} demo listings`);
    console.log(`ℹ️ Skipped ${result.duplicates} duplicates`);
    console.log(`❌ ${result.errors} errors`);
  } catch (error) {
    console.error('❌ Failed to create demo data:', error);
    console.log('ℹ️ This is likely because MongoDB is not connected');
  }
}
