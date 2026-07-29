const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const Subject = require('../models/Subject');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const gs3 = await Subject.findOne({ name: 'GS III' });
  
  // Delete old placeholder topics with stale tags
  const r1 = await Topic.deleteMany({ subjectId: gs3._id, tags: 'Environment' });
  console.log('Deleted old Environment placeholders:', r1.deletedCount);
  
  const r2 = await Topic.deleteMany({ subjectId: gs3._id, tags: 'Science & Tech' });
  console.log('Deleted old Science & Tech placeholders:', r2.deletedCount);
  
  // Delete Security+Internal tagged topics (old broad ones)
  const oldSecTopics = await Topic.find({ subjectId: gs3._id, tags: { $all: ['Security', 'Internal'] } });
  console.log('Found old Security/Internal topics:', oldSecTopics.length);
  for (const t of oldSecTopics) {
    await Topic.deleteOne({ _id: t._id });
    console.log('  Deleted:', t.title);
  }
  
  const total = await Topic.countDocuments({});
  console.log('\nNew total topics in DB:', total);
  
  process.exit(0);
}

main();
