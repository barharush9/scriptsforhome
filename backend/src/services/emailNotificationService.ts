import nodemailer from 'nodemailer';
import { Listing, EmailNotificationData } from '../types/interfaces';

export class EmailNotificationService {
  private transporter: any;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      }
    });
  }

  async sendNewListingsNotification(data: EmailNotificationData): Promise<boolean> {
    try {
      if (!process.env.EMAIL_USER || !process.env.NOTIFICATION_EMAIL || !process.env.EMAIL_PASSWORD) {
        console.log('Email configuration missing, skipping notification');
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***SET***' : '***MISSING***');
        console.log('NOTIFICATION_EMAIL:', process.env.NOTIFICATION_EMAIL);
        return false;
      }

      const htmlContent = this.generateEmailHTML(data);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL,
        subject: `🏠 ${data.totalCount} דירות חדשות נמצאו!`,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions, (err: Error | null, info: any) => {
        if (err) {
          console.error('❌ Error sending email notification (callback):', err);
        } else {
          console.log('✅ Email sent:', info.response);
        }
      });
      console.log(`✅ Email notification attempted for ${data.totalCount} new listings`);
      return true;
    } catch (error) {
      console.error('❌ Error sending email notification (catch):', error);
      return false;
    }
  }

  private generateEmailHTML(data: EmailNotificationData): string {
    const { newListings, totalCount } = data;

    let listingsHTML = '';
    newListings.forEach(listing => {
      listingsHTML += `
        <div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px;">
          <h3 style="color: #2563eb; margin: 0 0 10px 0;">
            <a href="${listing.link}" target="_blank" style="text-decoration: none; color: #2563eb;">
              ${listing.title}
            </a>
          </h3>
          <div style="margin: 5px 0;">
            <strong>חדרים:</strong> ${listing.rooms} |
            <strong>מחיר:</strong> ₪${listing.price.toLocaleString()} |
            <strong>מקור:</strong> ${listing.source.toUpperCase()}
          </div>
          ${listing.address ? `<div style="margin: 5px 0;"><strong>כתובת:</strong> ${listing.address}</div>` : ''}
          <div style="margin: 5px 0; color: #666;">
            <strong>תאריך:</strong> ${listing.datePosted.toLocaleDateString('he-IL')}
          </div>
          <div style="margin: 10px 0 0 0;">
            <a href="${listing.link}" target="_blank" 
               style="background: #2563eb; color: white; padding: 8px 16px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              צפייה במודעה
            </a>
          </div>
        </div>
      `;
    });

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>דירות חדשות</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">🏠 דירות חדשות למכירה</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">נמצאו ${totalCount} דירות חדשות!</p>
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #495057; margin: 0 0 15px 0;">🔍 קריטריונים:</h2>
          <ul style="margin: 0; padding-right: 20px;">
            <li>אזורים: גני תקווה, קריית אונו</li>
            <li>מינימום: 2.5 חדרים</li>
            <li>רק מודעות שהועלו לאחרונה</li>
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 10px;">
            📋 רשימת הדירות (${totalCount})
          </h2>
          ${listingsHTML}
        </div>

        <div style="background: #e9ecef; padding: 15px; border-radius: 8px; text-align: center; margin-top: 30px;">
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            📧 הודעה זו נשלחה אוטומטית על ידי מערכת סריקת הדירות<br>
            🕐 זמן הסריקה: ${new Date().toLocaleString('he-IL')}
          </p>
        </div>
      </body>
      </html>
    `;
  }

  async testEmailConfiguration(): Promise<boolean> {
    try {
      if (!process.env.EMAIL_USER || !process.env.NOTIFICATION_EMAIL) {
        console.log('Email configuration missing');
        return false;
      }

      const testData: EmailNotificationData = {
        newListings: [{
          _id: 'test',
          title: 'דירת בדיקה',
          rooms: 3,
          price: 5000,
          description: 'זהו טסט של מערכת השליחה',
          datePosted: new Date(),
          link: 'https://example.com',
          source: 'yad2',
          status: 'new',
          createdAt: new Date()
        }],
        totalCount: 1
      };

      await this.sendNewListingsNotification(testData);
      return true;
    } catch (error) {
      console.error('Email test failed:', error);
      return false;
    }
  }
}
