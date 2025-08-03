# 🏠 סורק דירות אוטומטי | Apartment Scanner

מערכת חכמה לחיפוש ומעקב אחר דירות להשכרה בגני תקווה וקרית אונו עם ממשק קנבן אינטראקטיבי.

## ✨ תכונות עיקריות

- 🔍 **סריקה אוטומטית** - חיפוש דירות באתרי יד2 ו-iHomes
- 🎯 **חיפוש ממוקד** - התמקדות בגני תקווה וקרית אונו
- 📋 **ממשק קנבן** - ניהול דירות עם גרירה ושחרור
- 📧 **התראות מייל** - עדכונים על דירות חדשות
- ⏰ **תזמון אוטומטי** - סריקה כל שעתיים
- 🎨 **ממשק יפה ומודרני** - עיצוב רספונסיבי בעברית

## 🚀 הפעלה מהירה

### דרישות מקדימות
- Node.js (גרסה 18 ומעלה)
- npm או yarn

### התקנה והפעלה

1. **הורדת הפרויקט**
```bash
git clone <repository-url>
cd scriptsforhome
```

2. **התקנת חבילות - Backend**
```bash
cd backend
npm install
```

3. **התקנת חבילות - Frontend**
```bash
cd ../frontend
npm install
```

4. **הפעלת הפרויקט**

בטרמינל נפרד להפעלת הBackend:
```bash
cd backend
npm run dev
```

בטרמינל נפרד להפעלת הFrontend:
```bash
cd frontend
npm run dev
```

### גישה למערכת
- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:3000
```env
MONGODB_URI=mongodb://localhost:27017/apartment_scanner
PORT=3000

# Optional: Email notifications
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NOTIFICATION_EMAIL=recipient@gmail.com
```

Build and start:
```bash
npm run build
npm start
# Or for development:
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. MongoDB Setup

Install MongoDB locally or use MongoDB Atlas:

```bash
# Local MongoDB (Windows)
# Download from https://www.mongodb.com/try/download/community

# Or use Docker
docker run -d -p 27017:27017 --name apartment-scanner-db mongo:latest
```

## 📊 Usage

### Web Interface

1. **View Listings**: Open `http://localhost:5173` to see the Kanban board
2. **Drag & Drop**: Move listings between status columns:
   - 🟡 **Not Contacted**: New listings
   - 🔵 **Called**: Contacted, awaiting response
   - 🟢 **Visited**: Physically visited
   - 🔴 **Rejected**: No longer interested
3. **Manual Scrape**: Click "🔍 Scrape Now" to trigger immediate scraping
4. **View Details**: Click "View Listing →" to open original post

### API Endpoints

- `GET /api/listings` - Get all listings
- `GET /api/listings?status=new` - Filter by status
- `PATCH /api/listings/:id/status` - Update listing status
- `POST /api/listings/scrape` - Trigger manual scrape
- `GET /api/listings/stats` - Get statistics
- `GET /api/health` - Health check

### Manual Scraping

```bash
cd backend
npm run scrape
```

## ⚙️ Configuration

### Scraping Settings

- **Locations**: Ganei Tikva (גני תקווה), Kiryat Ono (קריית אונו)
- **Minimum Rooms**: 2.5
- **Sources**: Yad2 (primary)
- **Frequency**: Every 4 hours (configurable)
- **Deduplication**: By URL and title

### Email Notifications

To enable email notifications:

1. Enable 2FA on your Gmail account
2. Generate an App Password
3. Add credentials to `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
NOTIFICATION_EMAIL=where-to-send@gmail.com
```

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev        # Start with auto-reload
npm run build      # Build TypeScript
npm run lint       # Run ESLint
npm run scrape     # Manual scrape test
```

### Frontend Development

```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Adding New Scrapers

1. Create scraper in `backend/src/scrapers/`
2. Implement the `ScrapedListing` interface
3. Add to scraping job in `backend/src/cron/scrapeJob.ts`

Example:
```typescript
export class NewSiteScraper {
  async scrapeListings(): Promise<Listing[]> {
    // Implementation
  }
}
```

## 🔧 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection
- Verify all dependencies installed: `npm install`
- Check port 3000 is available

**No listings found:**
- Check scraper selectors (websites may change)
- Verify network connectivity
- Check browser developer tools for errors

**Email notifications not working:**
- Verify Gmail App Password (not regular password)
- Check firewall/network restrictions
- Test with `npm run dev` and check logs

### Development Tips

- Use `npm run dev` for auto-reload during development
- Check browser DevTools console for errors
- Monitor backend logs for scraping issues
- Use MongoDB Compass to inspect database

## 📝 Legal & Ethics

⚠️ **Important**: This tool is for personal use only. Please:

- Respect website terms of service
- Don't overwhelm servers with requests
- Use reasonable delays between requests
- Only scrape publicly available data
- Consider contacting website owners for permission

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details.

## 🎯 Roadmap

- [ ] Add more real estate sources
- [ ] Advanced filtering (price range, floor, etc.)
- [ ] Apartment comparison features
- [ ] Map integration
- [ ] Mobile app
- [ ] WhatsApp notifications
- [ ] Machine learning for recommendation

---

**Built with ❤️ for apartment hunting in Israel** 🇮🇱
