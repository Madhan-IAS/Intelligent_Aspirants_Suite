/**
 * Find duplicate/old placeholder topics in GS III
 */
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

async function main() {
  await mongoose.connect(MONGO_URI);
  
  // Check for old placeholder topics with broad tags
  const gs3 = await Subject.findOne({ name: 'GS III' });
  
  // Old tags that are placeholders (not the granular ones)
  const oldTags = ['Environment', 'Science & Tech', 'Security', 'Industry', 'Infrastructure'];
  
  for (const tag of oldTags) {
    const count = await Topic.countDocuments({ subjectId: gs3._id, tags: tag });
    if (count > 0) {
      const topics = await Topic.find({ subjectId: gs3._id, tags: tag }).lean();
      console.log(`\n[OLD TAG: "${tag}"] - ${count} topics (SHOULD BE REMOVED):`);
      topics.forEach(t => console.log(`  - ${t.title} [Tags: ${t.tags.join(', ')}]`));
    }
  }

  // Also check GS II for old placeholder tags
  const gs2 = await Subject.findOne({ name: 'GS II' });
  const gs2OldTags = ['Polity', 'Governance', 'Social Justice', 'International Relations'];
  
  // Check if the original PDF-seeded topics still exist alongside the new ones
  console.log('\n\n=== GS II TAG ANALYSIS ===');
  for (const tag of gs2OldTags) {
    const topics = await Topic.find({ subjectId: gs2._id, tags: tag }).lean();
    // Check for multi-tag topics (old ones had 2 tags like ['Polity', 'Constitution'])
    const multiTag = topics.filter(t => t.tags.length > 1);
    console.log(`[${tag}]: ${topics.length} total, ${multiTag.length} multi-tag (old format)`);
    if (multiTag.length > 0 && multiTag.length <= 10) {
      multiTag.forEach(t => console.log(`  OLD: ${t.title} [${t.tags.join(', ')}]`));
    }
  }

  // Check GS IV for old tags
  const gs4 = await Subject.findOne({ name: 'GS IV' });
  const gs4Topics = await Topic.find({ subjectId: gs4._id }).lean();
  const gs4MultiTag = gs4Topics.filter(t => t.tags.length > 1);
  console.log(`\n=== GS IV: ${gs4Topics.length} total, ${gs4MultiTag.length} multi-tag ===`);

  process.exit(0);
}

main();
