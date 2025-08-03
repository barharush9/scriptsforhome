// סקריפט להוספת דירות דמו למונגו
// מריץ ב-node.js (יש לוודא חיבור למונגו)

const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'apartment-scanner';
const COLLECTION = 'listings';

const demoListings = [
  {
    _id: new ObjectId(),
    title: 'דירת 3 חדרים ברחוב הרצל',
    rooms: 3,
    price: 4800,
    description: 'דירה משופצת, קומה 2, קרובה לפארק',
    datePosted: new Date(),
    link: 'https://example.com/1',
    source: 'yad2',
    status: 'new',
    createdAt: new Date(),
    images: [],
    address: 'הרצל 10, גני תקווה',
    notes: 'מתאימה לזוג',
  },
  {
    _id: new ObjectId(),
    title: 'דירת 2.5 חדרים ברחוב העצמאות',
    rooms: 2.5,
    price: 3800,
    description: 'קומה 1, מרפסת שמש, חניה',
    datePosted: new Date(),
    link: 'https://example.com/2',
    source: 'madlan',
    status: 'called',
    createdAt: new Date(),
    images: [],
    address: 'העצמאות 5, קריית אונו',
    notes: '',
  },
  {
    _id: new ObjectId(),
    title: 'דירת 4 חדרים ברחוב הגפן',
    rooms: 4,
    price: 6300,
    description: 'מרווחת, קומה 3, מעלית',
    datePosted: new Date(),
    link: 'https://example.com/3',
    source: 'yad2',
    status: 'visited',
    createdAt: new Date(),
    images: [],
    address: 'הגפן 12, גני תקווה',
    notes: 'צריך לבדוק רעש',
  },
  {
    _id: new ObjectId(),
    title: 'דירת 3.5 חדרים ברחוב הרימון',
    rooms: 3.5,
    price: 5400,
    description: 'משופצת, קומה 4, נוף פתוח',
    datePosted: new Date(),
    link: 'https://example.com/4',
    source: 'madlan',
    status: 'saved',
    createdAt: new Date(),
    images: [],
    address: 'הרימון 8, קריית אונו',
    notes: '',
  },
  {
    _id: new ObjectId(),
    title: 'דירת 2 חדרים ברחוב השקמה',
    rooms: 2,
    price: 3200,
    description: 'קומה קרקע, מתאימה לסטודנטים',
    datePosted: new Date(),
    link: 'https://example.com/5',
    source: 'yad2',
    status: 'rejected',
    createdAt: new Date(),
    images: [],
    address: 'השקמה 3, גני תקווה',
    notes: 'יקר מידי',
  },
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const res = await db.collection(COLLECTION).insertMany(demoListings);
    console.log(`Inserted ${res.insertedCount} demo listings.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main();
