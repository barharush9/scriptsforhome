import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { Listing } from '../types/interfaces';
import { scrapeYad2Listings } from './yad2Scraper';

export class MadlanScraper {
  private browser: any = null;

  async init(): Promise<void> {
    puppeteer.use(StealthPlugin());
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrapeListings(): Promise<Listing[]> {
    // Scrape both Madlan and Yad2, merge results, and deduplicate by link
    const madlanListings = await this.scrapeMadlan();
    let yad2Listings: Listing[] = [];
    try {
      yad2Listings = await scrapeYad2Listings();
    } catch (err) {
      console.error('Error scraping Yad2:', err);
    }
    // Merge and deduplicate by link
    const allListings = [...madlanListings, ...yad2Listings];
    const uniqueListings = Array.from(new Map(allListings.map(l => [l.link, l])).values());
    return uniqueListings;
  }

  // Madlan scraping logic extracted to its own method
  private async scrapeMadlan(): Promise<Listing[]> {
    if (!this.browser) {
      await this.init();
    }
    const page = await this.browser.newPage();
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1280, height: 900 });
      const url = 'https://www.madlan.co.il/for-rent/%D7%92%D7%A0%D7%99-%D7%AA%D7%A7%D7%95%D7%95%D7%94-%D7%99%D7%A9%D7%A8%D7%90%D7%9C,%D7%A7%D7%A8%D7%99%D7%AA-%D7%90%D7%95%D7%A0%D7%95-%D7%99%D7%A9%D7%A8%D7%90%D7%9C?filters=_0-4500_2-6_________0-10000_______search-filter-top-bar&tracking_search_source=filter_apply&marketplace=residential';
      console.log(`Scraping: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
      await this.delay(4000 + Math.random() * 2000);

      // Extract listings (new Madlan structure)
      const listings = await page.evaluate(() => {
        const results: any[] = [];
        const cards = document.querySelectorAll('div[data-auto="listed-bulletin"]');
        cards.forEach(card => {
          try {
            const title = card.querySelector('[data-auto="property-address"]')?.textContent?.trim() || '';
            const priceText = card.querySelector('[data-auto="property-price"]')?.textContent?.replace(/[^\d]/g, '') || '';
            const price = priceText ? parseInt(priceText) : 0;
            const roomsText = card.querySelector('[data-auto="property-rooms"]')?.textContent || '';
            const roomsMatch = roomsText.match(/(\d+(?:\.\d+)?)/);
            const rooms = roomsMatch ? parseFloat(roomsMatch[1]) : 3;
            const desc = card.querySelector('[data-auto="property-address"]')?.textContent?.trim() || '';
            const link = card.querySelector('a[data-auto="listed-bulletin-clickable"]')?.getAttribute('href')
              ? 'https://www.madlan.co.il' + card.querySelector('a[data-auto="listed-bulletin-clickable"]')?.getAttribute('href')
              : '';
            const images = Array.from(card.querySelectorAll('img[data-auto="universal-card-image"]')).map(img => (img as HTMLImageElement).src);

            if (title && link && price > 1000) {
              results.push({
                title,
                rooms,
                price,
                description: desc || title,
                link,
                address: desc,
                images
              });
            }
          } catch (e) {}
        });
        return results;
      });

      // Filter out listings with price 0 or containing 'פרויקט'/'פרויקט חדש' in title or description
      const filtered = listings.filter((listing: any) => {
        const isProject = /פרויקט(\s|$)|פרויקט חדש/.test(listing.title || '') || /פרויקט(\s|$)|פרויקט חדש/.test(listing.description || '');
        return listing.price > 0 && !isProject;
      });
      // Convert to Listing format
      const processedListings: Listing[] = filtered.map((listing: any) => ({
        title: listing.title,
        rooms: listing.rooms,
        price: listing.price,
        description: listing.description,
        datePosted: new Date(),
        link: listing.link,
        source: 'madlan' as const,
        status: 'new' as const,
        createdAt: new Date(),
        images: listing.images,
        address: listing.address
      }));
      console.log(`Found ${processedListings.length} Madlan listings after filtering`);
      return processedListings;
    } catch (error) {
      console.error('Error scraping Madlan:', error);
      return [];
    } finally {
      await page.close();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
