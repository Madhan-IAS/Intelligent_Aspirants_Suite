/**
 * Detailed GS I audit
 */
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

async function main() {
  await mongoose.connect(MONGO_URI);
  
  const gs1 = await Subject.findOne({ name: 'GS I' });
  const topics = await Topic.find({ subjectId: gs1._id }).lean();
  
  console.log(`GS I total: ${topics.length}`);
  
  const tagGroups = {};
  topics.forEach(t => {
    const tag = (t.tags && t.tags.length > 0) ? t.tags.join(', ') : 'No Tag';
    if (!tagGroups[tag]) tagGroups[tag] = [];
    tagGroups[tag].push(t.title);
  });
  
  for (const tag of Object.keys(tagGroups).sort()) {
    const titles = tagGroups[tag];
    console.log(`\n[${tag}]: ${titles.length} topics`);
    titles.forEach(t => console.log(`  - ${t}`));
  }

  process.exit(0);
}

main();
