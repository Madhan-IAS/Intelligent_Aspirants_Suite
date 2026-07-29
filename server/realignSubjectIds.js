const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

async function realignSubjects() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const subjects = await Subject.find({});
    const gs1 = subjects.find(s => s.name === 'GS I');
    const gs2 = subjects.find(s => s.name === 'GS II');
    const gs3 = subjects.find(s => s.name === 'GS III');
    const gs4 = subjects.find(s => s.name === 'GS IV');

    if (!gs1 || !gs2 || !gs3 || !gs4) {
      console.error('❌ Could not find GS subjects.');
      process.exit(1);
    }

    let movedCount = 0;

    const allTopics = await Topic.find({});
    console.log(`Analyzing ${allTopics.length} total topics for subject re-assignment...`);

    for (const topic of allTopics) {
      const t = topic.title.toLowerCase();
      let targetSubjectId = topic.subjectId;
      let targetTags = [...topic.tags];

      // 1. Move Agriculture / Industry / Crops from GS II to GS III
      if (topic.subjectId.equals(gs2._id)) {
        if (t.includes('varieties') || t.includes('cultivation') || t.includes('production pattern') ||
            t.includes('maize') || t.includes('fertilizer') || t.includes('petroleum') ||
            t.includes('synthetic') || t.includes('industry:') || t.includes('wheat') ||
            t.includes('rice') || t.includes('cotton') || t.includes('jute')) {
          targetSubjectId = gs3._id;
          targetTags = ['Agriculture', 'GS III'];
        }
      }

      // 2. Move IR / Bilateral / Foreign Affairs from GS III to GS II
      if (topic.subjectId.equals(gs3._id)) {
        if (t.includes('shanghai cooperation') || t.includes('transport corridor') ||
            t.includes('china and central asia') || t.includes('india-mongolia') ||
            t.includes('india–uae') || t.includes('india-asean') || t.includes('indo-japan') ||
            t.includes('india-usa') || t.includes('brexit') || t.includes('india–germany') ||
            t.includes('visit to france') || t.includes('bilateral relationship') ||
            t.includes('uranium supply')) {
          targetSubjectId = gs2._id;
          targetTags = ['International Relations', 'GS II'];
        }
      }

      // 3. Move Security / Money Laundering from GS IV to GS III
      if (topic.subjectId.equals(gs4._id)) {
        if (t.includes('money laundering') || t.includes('internal security') ||
            t.includes('monitoring social media') || t.includes('social media in india')) {
          targetSubjectId = gs3._id;
          targetTags = ['Internal Security', 'GS III'];
        }
      }

      // Apply changes if moved
      if (!targetSubjectId.equals(topic.subjectId)) {
        topic.subjectId = targetSubjectId;
        topic.tags = targetTags;
        await topic.save();
        movedCount++;
      }
    }

    console.log('\n========================================');
    console.log(`🎉 SUBJECT REALIGNMENT COMPLETE!`);
    console.log(`   - Topics moved to correct GS Paper: ${movedCount}`);
    console.log('========================================');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during realignment:', err);
    process.exit(1);
  }
}

realignSubjects();
