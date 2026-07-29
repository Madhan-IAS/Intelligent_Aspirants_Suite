/**
 * Database Reset Script
 * Clears ALL collections in the UPSC KMS database so everything starts from zero.
 * The user account is preserved but all content data is wiped clean.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

async function resetDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      const name = col.name;
      // Keep the users collection intact (preserve login accounts)
      if (name === 'users') {
        console.log(`⏭  Skipped: ${name} (user accounts preserved)`);
        continue;
      }
      await db.collection(name).deleteMany({});
      console.log(`🗑  Cleared: ${name}`);
    }

    console.log('\n✅ Database reset complete. All content data has been cleared to zero.');
    console.log('   User accounts are preserved — you can still log in.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting database:', err.message);
    process.exit(1);
  }
}

resetDatabase();
