// בדיקת תקינות נתונים במונגו עבור אפליקציית דירות
// מריץ ב-node.js (יש לוודא חיבור למונגו)

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'apartment-scanner';
const COLLECTION = 'listings';

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const listings = await db.collection(COLLECTION).find({}).toArray();
    console.log(`Total listings: ${listings.length}`);

    // בדוק ייחודיות _id
    const ids = new Set();
    let duplicateIds = 0;
    listings.forEach(l => {
      if (ids.has(l._id.toString())) duplicateIds++;
      ids.add(l._id.toString());
    });
    if (duplicateIds > 0) {
      console.log(`Duplicate _id found: ${duplicateIds}`);
    } else {
      console.log('All _id values are unique.');
    }

    // בדוק סטטוס חוקי
    const validStatuses = ['new', 'called', 'visited', 'saved', 'rejected'];
    const invalidStatus = listings.filter(l => !validStatuses.includes(l.status));
    if (invalidStatus.length > 0) {
      console.log('Listings with invalid status:', invalidStatus.map(l => ({ _id: l._id, status: l.status })));
    } else {
      console.log('All listings have valid status.');
    }

    // בדוק שיש הערות (notes) במידת הצורך
    const withNotes = listings.filter(l => l.notes && l.notes.trim() !== '');
    console.log(`Listings with notes: ${withNotes.length}`);

    // בדוק שיש דירות בכל עמודה
    validStatuses.forEach(status => {
      const count = listings.filter(l => l.status === status).length;
      console.log(`Status '${status}': ${count} listings`);
    });

    // דוגמה: הצג 3 דירות מכל עמודה
    validStatuses.forEach(status => {
      const examples = listings.filter(l => l.status === status).slice(0, 3);
      if (examples.length > 0) {
        console.log(`\nExamples for status '${status}':`);
        examples.forEach(l => console.log({ _id: l._id, title: l.title, notes: l.notes }));
      }
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main();
