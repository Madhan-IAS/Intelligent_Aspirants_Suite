/**
 * Full Audit of all GS I-IV subjects
 * Run: node scratch/auditAllSubjects.js
 */
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB\n');

  const subjects = await Subject.find({}).lean();
  
  for (const sub of subjects) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`SUBJECT: ${sub.name} (ID: ${sub._id})`);
    console.log(`${'='.repeat(60)}`);
    
    const topics = await Topic.find({ subjectId: sub._id }).lean();
    console.log(`Total topics: ${topics.length}`);
    
    // Group by tags
    const tagGroups = {};
    topics.forEach(t => {
      const tag = (t.tags && t.tags.length > 0) ? t.tags[0] : 'No Tag';
      if (!tagGroups[tag]) tagGroups[tag] = [];
      tagGroups[tag].push(t.title);
    });
    
    console.log(`\nTag breakdown:`);
    const sortedTags = Object.keys(tagGroups).sort();
    for (const tag of sortedTags) {
      const titles = tagGroups[tag];
      console.log(`  [${tag}]: ${titles.length} topics`);
      // Print first 3 and last 3 titles
      if (titles.length <= 6) {
        titles.forEach(t => console.log(`    - ${t}`));
      } else {
        titles.slice(0, 3).forEach(t => console.log(`    - ${t}`));
        console.log(`    ... (${titles.length - 6} more) ...`);
        titles.slice(-3).forEach(t => console.log(`    - ${t}`));
      }
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('GRAND TOTAL');
  console.log(`${'='.repeat(60)}`);
  const allTopics = await Topic.countDocuments({});
  console.log(`Total topics across all subjects: ${allTopics}`);

  process.exit(0);
}

main();
