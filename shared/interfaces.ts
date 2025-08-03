export interface Listing {
  _id?: string;
  title: string;
  rooms: number;
  price: number;
  description: string;
  datePosted: Date;
  link: string;
  source: 'yad2' | 'ihomes';
  status: 'new' | 'called' | 'visited' | 'rejected';
  createdAt: Date;
  updatedAt?: Date;
  images?: string[];
  address?: string;
  floor?: number;
  furnished?: boolean;
}

export interface ScrapeResult {
  newListings: number;
  totalScraped: number;
  errors: string[];
  timestamp: Date;
}

export interface EmailNotificationData {
  newListings: Listing[];
  totalCount: number;
}
