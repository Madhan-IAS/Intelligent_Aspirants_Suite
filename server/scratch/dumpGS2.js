const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

async function main() {
  await mongoose.connect(MONGO_URI);
  
  const gs2 = await Subject.findOne({ name: 'GS II' });
  const topics = await Topic.find({ subjectId: gs2._id }).sort({ tags: 1, title: 1 }).lean();
  
  console.log(`GS II total: ${topics.length}\n`);
  
  const tagGroups = {};
  topics.forEach(t => {
    const tag = (t.tags && t.tags.length > 0) ? t.tags[0] : 'No Tag';
    if (!tagGroups[tag]) tagGroups[tag] = [];
    tagGroups[tag].push(t.title);
  });
  
  for (const tag of Object.keys(tagGroups).sort()) {
    const titles = tagGroups[tag];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${tag}]: ${titles.length} topics`);
    console.log(`${'='.repeat(60)}`);
    titles.forEach((t, i) => console.log(`  ${i+1}. ${t}`));
  }

  process.exit(0);
}

main();
