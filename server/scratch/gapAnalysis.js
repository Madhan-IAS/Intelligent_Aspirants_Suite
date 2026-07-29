/**
 * Compare raw input lines vs DB counts for each section
 */
const fs = require('fs');
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

async function main() {
  await mongoose.connect(MONGO_URI);

  // Get DB counts per tag
  const subjects = await Subject.find({}).lean();
  const subjectMap = {};
  subjects.forEach(s => { subjectMap[s.name] = s._id; });

  const sections = [
    { name: 'Polity', subject: 'GS II', tag: 'Polity' },
    { name: 'Governance', subject: 'GS II', tag: 'Governance' },
    { name: 'Social Justice', subject: 'GS II', tag: 'Social Justice' },
    { name: 'Intl Relations', subject: 'GS II', tag: 'International Relations' },
    { name: 'Economy', subject: 'GS III', tag: 'Economy' },
    { name: 'Agriculture', subject: 'GS III', tag: 'Agriculture' },
    { name: 'Industry', subject: 'GS III', tag: 'Industry' },
    { name: 'Infrastructure', subject: 'GS III', tag: 'Infrastructure' },
    { name: 'Science & Tech', subject: 'GS III', tag: 'Science & Technology' },
    { name: 'Environment', subject: 'GS III', tag: 'Environment & Biodiversity' },
    { name: 'Internal Security', subject: 'GS III', tag: 'Internal Security' },
    { name: 'Disaster Mgmt', subject: 'GS III', tag: 'Disaster Management' },
    { name: 'Ethics & Integrity', subject: 'GS IV', tag: 'Ethics & Integrity' },
    { name: 'Attitude & Aptitude', subject: 'GS IV', tag: 'Attitude & Aptitude' },
    { name: 'Case Studies', subject: 'GS IV', tag: 'Case Studies' },
  ];

  // Also count GS I sections
  const gs1Sections = [
    { name: 'Ancient History', subject: 'GS I', tag: 'Ancient' },
    { name: 'Medieval History', subject: 'GS I', tag: 'Medieval' },
    { name: 'Modern History', subject: 'GS I', tag: 'Modern' },
    { name: 'Post-Independence', subject: 'GS I', tag: 'Post' },
    { name: 'World History', subject: 'GS I', tag: 'World' },
    { name: 'Art & Culture', subject: 'GS I', tag: 'Culture' },
    { name: 'Geography', subject: 'GS I', tag: 'Geography' },
    { name: 'Society', subject: 'GS I', tag: 'Society' },
  ];

  console.log('SECTION                    | DB COUNT');
  console.log('---------------------------+---------');

  let grandTotal = 0;

  // GS I
  for (const sec of gs1Sections) {
    const subId = subjectMap[sec.subject];
    const count = await Topic.countDocuments({
      subjectId: subId,
      tags: { $regex: sec.tag, $options: 'i' }
    });
    console.log(`GS I: ${sec.name.padEnd(20)} | ${count}`);
    grandTotal += count;
  }

  // GS II, III, IV
  for (const sec of sections) {
    const subId = subjectMap[sec.subject];
    const count = await Topic.countDocuments({
      subjectId: subId,
      tags: sec.tag
    });
    console.log(`${sec.subject}: ${sec.name.padEnd(20)} | ${count}`);
    grandTotal += count;
  }

  // Old stale placeholders
  const gs3Id = subjectMap['GS III'];
  const oldEnv = await Topic.countDocuments({ subjectId: gs3Id, tags: 'Environment' });
  const oldST = await Topic.countDocuments({ subjectId: gs3Id, tags: 'Science & Tech' });
  const oldSec = await Topic.countDocuments({ subjectId: gs3Id, tags: 'Security' });
  console.log(`\nOLD PLACEHOLDERS (to delete):`);
  console.log(`  Environment (old): ${oldEnv}`);
  console.log(`  Science & Tech (old): ${oldST}`);
  console.log(`  Security (old): ${oldSec}`);

  const totalDB = await Topic.countDocuments({});
  console.log(`\nGrand total in DB: ${totalDB}`);
  console.log(`Sum from sections: ${grandTotal}`);
  console.log(`Expected by user: 3455`);
  console.log(`Gap: ${3455 - totalDB} topics`);

  process.exit(0);
}

main();
