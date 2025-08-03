import cron from 'node-cron';
import { MadlanScraper } from '../scrapers/madlanScraper';
import { ListingService } from '../services/listingService';
import { EmailNotificationService } from '../services/emailNotificationService';
import { ScrapeResult } from '../types/interfaces';

export class ScrapeJobManager {
  private madlanScraper: MadlanScraper;
  private listingService: ListingService;
  private emailService: EmailNotificationService;
  private isRunning: boolean = false;

  constructor() {
    this.madlanScraper = new MadlanScraper();
    this.listingService = new ListingService();
    this.emailService = new EmailNotificationService();
  }

  // Scrape both Madlan and Yad2, always, in a way that's transparent to the user
  async scrapeAll(): Promise<ScrapeResult> {
    return this.executeScrapeJob();
  }

  /**
   * Main scrape job: always scrapes both Madlan and Yad2, merges, dedupes, and uses anti-bot settings
   */
  async executeScrapeJob(): Promise<ScrapeResult> {
    if (this.isRunning) {
      return {
        newListings: 0,
        totalScraped: 0,
        errors: ['Scrape job already running'],
        timestamp: new Date()
      };
    }
    this.isRunning = true;
    const result: ScrapeResult = {
      newListings: 0,
      totalScraped: 0,
      errors: [],
      timestamp: new Date()
    };
    try {
      // --- Madlan ---
      const madlanListings = await this.madlanScraper['scrapeMadlan']();
      // --- Yad2 ---
      let yad2Listings: any[] = [];
      try {
        const { scrapeYad2Listings } = await import('../scrapers/yad2Scraper');
        // Add random delay before Yad2 to avoid bot detection
        await new Promise(res => setTimeout(res, 2000 + Math.random() * 2000));
        yad2Listings = await scrapeYad2Listings(); // The function itself should use random user-agent etc.
      } catch (err) {
        result.errors.push('Error scraping Yad2');
      }
      // --- Merge & dedupe ---
      const allListings = [...madlanListings, ...yad2Listings];
      const listings = Array.from(new Map(allListings.map(l => [l.link, l])).values());
      result.totalScraped = listings.length;
      // --- Save new listings ---
      const newListings = [];
      for (const listing of listings) {
        const exists = await this.listingService.checkIfListingExists(listing.link);
        if (!exists) {
          await this.listingService.createListing(listing);
          newListings.push(listing);
        }
      }
      result.newListings = newListings.length;
      // --- Email notification ---
      if (newListings.length > 0) {
        try {
          await this.emailService.sendNewListingsNotification({ newListings, totalCount: listings.length });
        } catch (emailErr) {
          result.errors.push('Email notification failed');
        }
      }
    } catch (error: any) {
      result.errors.push(error?.message || 'Unknown error');
    } finally {
      this.isRunning = false;
    }
    return result;
  }

  /**
   * Returns a random user agent string for anti-bot evasion
   */
  private getRandomUserAgent(): string {
    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  // (removed duplicate executeScrapeJob)
}

let jobManager: ScrapeJobManager;

export function startScrapeJob(): void {
  jobManager = new ScrapeJobManager();
  
  // Run every 4 hours
  const cronExpression = '0 */4 * * *';
  
  console.log(`⏰ Scheduling scrape job: ${cronExpression}`);
  
  cron.schedule(cronExpression, async () => {
    try {
      await jobManager.executeScrapeJob();
    } catch (error) {
      console.error('❌ Cron job execution failed:', error);
    }
  });

  // Run once on startup (after 1 minute delay)
  setTimeout(async () => {
    console.log('🎯 Running initial scrape job...');
    try {
      await jobManager.executeScrapeJob();
    } catch (error) {
      console.error('❌ Initial scrape job failed:', error);
    }
  }, 60000);
}

export function getJobManager(): ScrapeJobManager | undefined {
  return jobManager;
}
