#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { connectDB } from '../db/connection';
import { ScrapeJobManager } from '../cron/scrapeJob';

// Load environment variables
dotenv.config();

async function runScraper(): Promise<void> {
  console.log('🚀 Starting manual scraper...');
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Create job manager and run scraping
    const jobManager = new ScrapeJobManager();
    const result = await jobManager.executeScrapeJob();

    console.log('📊 Scraping completed!');
    console.log('Results:', {
      totalScraped: result.totalScraped,
      newListings: result.newListings,
      errors: result.errors.length,
      timestamp: result.timestamp
    });

    if (result.errors.length > 0) {
      console.log('❌ Errors:', result.errors);
    }

  } catch (error) {
    console.error('❌ Scraper failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the scraper
runScraper();
