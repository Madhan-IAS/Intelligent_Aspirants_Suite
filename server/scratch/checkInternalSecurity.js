const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const gs3 = await Subject.findOne({ name: 'GS III' });
  if (!gs3) {
    console.log('GS III not found!');
    process.exit(1);
  }
  console.log(`GS III ID: ${gs3._id}`);

  const totalTopics = await Topic.countDocuments({ subjectId: gs3._id });
  console.log(`Total topics under GS III: ${totalTopics}`);

  const securityTopics = await Topic.find({ subjectId: gs3._id }).lean();
  console.log(`Total topics retrieved under GS III: ${securityTopics.length}`);

  // Group using the exact getTopicSection logic:
  const sections = {
    'Economy': 0,
    'Agriculture & Food Processing': 0,
    'Industry & Infrastructure': 0,
    'Science & Technology': 0,
    'Environment & Biodiversity': 0,
    'Internal Security': 0,
    'Disaster Management': 0,
    'Other': 0
  };

  const getTopicSection = (topic) => {
    const tags = topic.tags || [];
    if (tags.some(t => t.toLowerCase().includes('agriculture') || t.toLowerCase().includes('food processing') || t.toLowerCase().includes('farming') || t.toLowerCase().includes('animal'))) return 'Agriculture & Food Processing';
    if (tags.some(t => t.toLowerCase().includes('industry') || t.toLowerCase().includes('infrastructure') || t.toLowerCase().includes('transport') || t.toLowerCase().includes('road') || t.toLowerCase().includes('port') || t.toLowerCase().includes('railway') || t.toLowerCase().includes('telecom') || t.toLowerCase().includes('energy') || t.toLowerCase().includes('power'))) return 'Industry & Infrastructure';
    if (tags.some(t => t.toLowerCase().includes('economy') || t.toLowerCase().includes('economic') || t.toLowerCase().includes('fiscal') || t.toLowerCase().includes('tax') || t.toLowerCase().includes('budget') || t.toLowerCase().includes('bank') || t.toLowerCase().includes('monetary') || t.toLowerCase().includes('finance') || t.toLowerCase().includes('investment'))) return 'Economy';
    if (tags.some(t => t.toLowerCase().includes('science') || t.toLowerCase() === 's&t' || t.toLowerCase().includes('technology'))) return 'Science & Technology';
    if (tags.some(t => t.toLowerCase().includes('environment') || t.toLowerCase().includes('ecology') || t.toLowerCase().includes('biodiversity'))) return 'Environment & Biodiversity';
    if (tags.some(t => t.toLowerCase().includes('security') || t.toLowerCase().includes('internal'))) return 'Internal Security';
    if (tags.some(t => t.toLowerCase().includes('disaster'))) return 'Disaster Management';
    return 'Other';
  };

  const securityList = [];

  for (const topic of securityTopics) {
    const sec = getTopicSection(topic);
    sections[sec] = (sections[sec] || 0) + 1;
    if (sec === 'Internal Security') {
      securityList.push(topic);
    }
  }

  console.log('Sections breakdown under GS III:', sections);
  console.log(`Number of topics mapped to Internal Security: ${securityList.length}`);
  console.log('Titles of mapped Internal Security topics (first 10):');
  securityList.slice(0, 10).forEach(t => console.log(`- ${t.title} [Tags: ${t.tags.join(', ')}]`));

  process.exit(0);
}

main();
