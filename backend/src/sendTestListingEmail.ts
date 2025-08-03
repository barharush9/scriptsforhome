
import dotenv from 'dotenv';
dotenv.config();
import { EmailNotificationService } from './services/emailNotificationService';

(async () => {
  const emailService = new EmailNotificationService();
  await emailService.sendNewListingsNotification({
    newListings: [
      {
        _id: 'demo',
        title: 'דירת דמו חדשה',
        rooms: 4,
        price: 2100000,
        description: 'דירה חדשה לדוגמה בגני תקווה',
        datePosted: new Date(),
        link: 'https://example.com/listing/123',
        source: 'yad2',
        status: 'new',
        createdAt: new Date(),
        address: 'רחוב הדגמה 1, גני תקווה',
        images: [],
      }
    ],
    totalCount: 1
  });
  console.log('Email sent (if config is correct)');
})();
