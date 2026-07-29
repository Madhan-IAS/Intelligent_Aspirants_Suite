const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const subjects = await Subject.find({});
    const subjectMap = {};
    subjects.forEach(s => { subjectMap[s._id.toString()] = s.name; });

    const topics = await Topic.find({});
    console.log(`Migrating ${topics.length} topics...`);

    let updatedCount = 0;

    for (const topic of topics) {
      const paperName = subjectMap[topic.subjectId?.toString()] || 'GS I';
      topic.paper = paperName;

      // Extract chapter from tags
      let chapter = 'General';
      if (topic.tags && topic.tags.length > 0) {
        const tagMatch = topic.tags.find(t => t !== paperName);
        if (tagMatch) chapter = tagMatch;
      }
      topic.chapter = chapter;

      // Determine Subject Name
      if (paperName === 'GS I') {
        if (['Ancient History', 'Medieval History', 'Modern History', 'Post-Independence Consolidation', 'World History', 'Indian Culture'].includes(chapter)) {
          topic.subjectName = 'History & Culture';
        } else if (['Physical Geography', 'Human Geography', 'Economic Geography', 'Physical Geography of India'].includes(chapter)) {
          topic.subjectName = 'Geography';
        } else if (['Indian Society'].includes(chapter)) {
          topic.subjectName = 'Indian Society';
        } else {
          topic.subjectName = 'History & Culture';
        }
      } else if (paperName === 'GS II') {
        if (chapter === 'International Relations') {
          topic.subjectName = 'International Relations';
        } else if (chapter === 'Governance' || chapter === 'Social Justice') {
          topic.subjectName = 'Governance & Social Justice';
        } else {
          topic.subjectName = 'Polity & Constitution';
        }
      } else if (paperName === 'GS III') {
        if (['Agriculture'].includes(chapter)) {
          topic.subjectName = 'Agriculture & Food Processing';
        } else if (['Environment & Ecology', 'Disaster Management'].includes(chapter)) {
          topic.subjectName = 'Environment & Disaster Management';
        } else if (['Science & Technology'].includes(chapter)) {
          topic.subjectName = 'Science & Technology';
        } else if (['Internal Security'].includes(chapter)) {
          topic.subjectName = 'Internal Security';
        } else {
          topic.subjectName = 'Indian Economy';
        }
      } else if (paperName === 'GS IV') {
        topic.subjectName = 'Ethics, Integrity & Aptitude';
      } else {
        topic.subjectName = paperName;
      }

      // Determine Heading based on title or chapter
      let heading = chapter;
      const t = topic.title;
      if (t.includes('Palaeolithic') || t.includes('Mesolithic') || t.includes('Neolithic') || t.includes('Stone Age') || t.includes('Pre History')) {
        heading = 'Pre Historic Cultures';
      } else if (t.includes('Harappan') || t.includes('Indus Valley')) {
        heading = 'Indus Valley Civilization';
      } else if (t.includes('Vedic') || t.includes('Aryan')) {
        heading = 'Vedic Society & Culture';
      } else if (t.includes('Mauryan') || t.includes('Arthasastra') || t.includes('Ashoka')) {
        heading = 'The Mauryan Empire';
      } else if (t.includes('Gupta')) {
        heading = 'Imperial Guptas';
      } else if (t.includes('Harsha')) {
        heading = 'Harshavardhana';
      } else if (t.includes('Sangam') || t.includes('Cholas') || t.includes('Cheras') || t.includes('Pandyas')) {
        heading = 'Sangam Period & South Indian Dynasties';
      } else if (t.includes('Sultanate') || t.includes('Slave Dynasty') || t.includes('Khalji') || t.includes('Tughlaq')) {
        heading = 'The Delhi Sultanate';
      } else if (t.includes('Mughal') || t.includes('Babur') || t.includes('Akbar') || t.includes('Shah Jahan') || t.includes('Aurangzeb')) {
        heading = 'Mughal Empire';
      } else if (t.includes('Revolt of 1857') || t.includes('1857')) {
        heading = 'Revolt of 1857';
      } else if (t.includes('Gandhi') || t.includes('Non-Cooperation') || t.includes('Swaraj') || t.includes('Civil Disobedience')) {
        heading = 'Freedom Struggle under Gandhi';
      }

      topic.heading = heading;
      topic.completed = (topic.status === 'Completed');

      await topic.save();
      updatedCount++;
    }

    console.log(`🎉 Successfully migrated ${updatedCount} topics to 6-level hierarchy!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
