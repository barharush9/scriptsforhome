import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Listing } from '../types/interfaces';

puppeteer.use(StealthPlugin());

const YAD2_URL = 'https://www.yad2.co.il/realestate/rent?maxPrice=4500&minRooms=2.5&imageOnly=1&priceOnly=1&property=1%2C3%2C5%2C6%2C7%2C25%2C39%2C49%2C51%2C11%2C32%2C55%2C31%2C43%2C4&multiCity=0229%2C2620&zoom=13';

export async function scrapeYad2Listings(): Promise<Listing[]> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    // Add random delay before navigation
    await new Promise(res => setTimeout(res, 2000 + Math.random() * 3000));

    // Do random window size
    const width = 1000 + Math.floor(Math.random() * 600);
    const height = 700 + Math.floor(Math.random() * 400);
    await page.setViewport({ width, height });

    // Do random mouse moves and scrolls before navigation
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      await page.mouse.move(x, y, { steps: 5 + Math.floor(Math.random() * 10) });
      if (Math.random() > 0.5) {
        await page.evaluate((scrollY) => window.scrollTo(0, scrollY), Math.floor(Math.random() * height));
      }
      await new Promise(res => setTimeout(res, 200 + Math.random() * 400));
    }

    // Rotate user-agent (add more if desired)
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0'
    ];
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(userAgent);

    // Add extra headers
    await page.setExtraHTTPHeaders({
      'accept-language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
      'sec-ch-ua': '"Chromium";v="120", "Not:A-Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'upgrade-insecure-requests': '1'
    });

    await page.goto(YAD2_URL, { waitUntil: 'networkidle2', timeout: 45000 });

    // Optionally, simulate mouse movement after navigation
    for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      await page.mouse.move(x, y, { steps: 5 + Math.floor(Math.random() * 10) });
      if (Math.random() > 0.5) {
        await page.evaluate((scrollY) => window.scrollTo(0, scrollY), Math.floor(Math.random() * height));
      }
      await new Promise(res => setTimeout(res, 200 + Math.random() * 400));
    }

    // Detect captcha page
    const pageContent = await page.content();
    if (pageContent.includes('ShieldSquare Captcha') || pageContent.includes('aperture.js') || pageContent.includes('hcaptcha')) {
      console.error('Yad2: Blocked by anti-bot/captcha page.');
      await browser.close();
      return [];
    }

    // Try multiple selectors for robustness
    let found = false;
    let selector = '';
    const selectors = [
      'ul.feed-list_feed__oXbRw li[data-testid]', // original
      'ul li[data-testid]', // fallback
      'li[data-testid]'
    ];
    for (const sel of selectors) {
      try {
        await page.waitForSelector(sel, { timeout: 15000 });
        selector = sel;
        found = true;
        break;
      } catch (e) {}
    }
    if (!found) {
      // Log page content for debugging
      const html = await page.content();
      console.error('Yad2: Could not find listings selector. Page HTML:', html.slice(0, 2000));
      await browser.close();
      return [];
    }

    const listings = await page.$$eval(selector, (items) =>
      items
        .filter(li => li.querySelector('a'))
        .map(li => {
          const linkEl = li.querySelector('a');
          const imgEl = li.querySelector('img[data-testid="image"]') || li.querySelector('img');
          const priceEl = li.querySelector('span[data-testid="price"]') || li.querySelector('span');
          const titleEl = li.querySelector('span.item-data-content_heading__tphH4') || li.querySelector('span');
          const infoLines = li.querySelectorAll('span.item-data-content_itemInfoLine__AeoPP');
          return {
            link: linkEl && linkEl.getAttribute('href') ? (linkEl.getAttribute('href')!.startsWith('http') ? linkEl.getAttribute('href') : 'https://www.yad2.co.il' + linkEl.getAttribute('href')) : null,
            image: imgEl && imgEl.getAttribute('src') ? imgEl.getAttribute('src') : null,
            price: priceEl && priceEl.textContent ? priceEl.textContent.trim() : null,
            title: titleEl && titleEl.textContent ? titleEl.textContent.trim() : null,
            address: infoLines && infoLines[0] && infoLines[0].textContent ? infoLines[0].textContent.trim() : null,
            details: infoLines && infoLines[1] && infoLines[1].textContent ? infoLines[1].textContent.trim() : null,
          };
        })
    );

    // Deduplicate by link
    const uniqueListings = Array.from(new Map(listings.filter(l => l.link).map(l => [l.link, l])).values());
    // Filter out unwanted projects ("פרויקט", "פרויקט חדש", "פרויקט במבצע")
    const filtered = uniqueListings.filter((l: any) => {
      const title = (l.title || '').trim();
      const desc = (l.details || '').trim();
      const isProject = /פרויקט(\s|$)|פרויקט חדש|פרויקט במבצע/.test(title) || /פרויקט(\s|$)|פרויקט חדש|פרויקט במבצע/.test(desc);
      return l.price && parseInt(l.price.replace(/[^\d]/g, '')) > 0 && !isProject;
    });
    const now = new Date();
    const processed: Listing[] = filtered.map((l: any) => ({
      title: l.title || '',
      rooms: l.details ? parseFloat((l.details.match(/(\d+(?:\.\d+)?)/) || [3])[0]) : 3,
      price: l.price ? parseInt(l.price.replace(/[^\d]/g, '')) : 0,
      description: l.details || l.title || '',
      datePosted: now,
      link: l.link,
      source: 'yad2',
      status: 'new',
      createdAt: now,
      images: l.image ? [l.image] : [],
      address: l.address || ''
    }));
    await browser.close();
    return processed;
  } catch (error) {
    console.error('Error scraping Yad2:', error);
    try { await browser.close(); } catch {}
    return [];
  }
}
