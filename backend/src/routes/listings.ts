import express, { Request, Response } from 'express';
import { ListingService } from '../services/listingService';
import { getJobManager } from '../cron/scrapeJob';

const router = express.Router();
const listingService = new ListingService();

// Get all listings
router.get('/', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    
    let listings;
    if (status) {
      listings = await listingService.getListingsByStatus(status);
    } else {
      listings = await listingService.getAllListings();
    }
    
    res.json({
      success: true,
      data: listings,
      count: listings.length
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listings'
    });
  }
});

// Update listing status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['new', 'called', 'visited', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: new, called, visited, rejected'
      });
    }

    const updatedListing = await listingService.updateListingStatus(id, status);
    
    if (!updatedListing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    res.json({
      success: true,
      data: updatedListing
    });
  } catch (error) {
    console.error('Error updating listing status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update listing status'
    });
  }
});

// Get recent listings
router.get('/recent', async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string || '24');
    const listings = await listingService.getRecentListings(hours);
    
    res.json({
      success: true,
      data: listings,
      count: listings.length,
      hours
    });
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent listings'
    });
  }
});

router.get('/recent/:hours', async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.params.hours || '24');
    const listings = await listingService.getRecentListings(hours);
    
    res.json({
      success: true,
      data: listings,
      count: listings.length,
      hours
    });
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent listings'
    });
  }
});

// Manual scrape trigger
router.post('/scrape', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Starting manual scrape...');
    
    // Import scraper directly for immediate execution
    const { MadlanScraper } = await import('../scrapers/madlanScraper');
    const scraper = new MadlanScraper();
    
    // Initialize and scrape
    await scraper.init();
    const listings = await scraper.scrapeListings();
    
    console.log(`📊 Scraped ${listings.length} listings`);
    
    if (listings.length > 0) {
      const result = await listingService.bulkCreateListings(listings);
      console.log(`✅ Saved ${result.created} new listings, ${result.duplicates} duplicates`);
      
      return res.json({
        success: true,
        message: 'Scraping completed successfully',
        data: {
          totalScraped: listings.length,
          newListings: result.created,
          duplicates: result.duplicates,
          errors: result.errors
        }
      });
    } else {
      return res.json({
        success: true,
        message: 'Scraping completed but no listings found',
        data: {
          totalScraped: 0,
          newListings: 0,
          duplicates: 0,
          errors: 0
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Manual scrape failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scrape listings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Load demo data endpoint
router.post('/demo', async (req: Request, res: Response) => {
  try {
    await listingService.loadDemoData();
    res.json({
      success: true,
      message: 'Demo data loaded successfully'
    });
  } catch (error) {
    console.error('Error loading demo data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load demo data'
    });
  }
});

// Get statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [total, newListings, called, visited, rejected] = await Promise.all([
      listingService.getAllListings(),
      listingService.getListingsByStatus('new'),
      listingService.getListingsByStatus('called'),
      listingService.getListingsByStatus('visited'),
      listingService.getListingsByStatus('rejected')
    ]);

    const recent24h = await listingService.getRecentListings(24);

    res.json({
      success: true,
      data: {
        total: total.length,
        byStatus: {
          new: newListings.length,
          called: called.length,
          visited: visited.length,
          rejected: rejected.length
        },
        recent24h: recent24h.length
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

export default router;
