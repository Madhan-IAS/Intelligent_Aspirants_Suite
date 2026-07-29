const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

async function seedFullSyllabus() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const filePath = path.join(__dirname, '../Full Syllabus.txt');
    if (!fs.existsSync(filePath)) {
      console.error('❌ Full Syllabus.txt not found at:', filePath);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const rawLines = fileContent.split('\n');

    let currentPaper = 'GS I';
    let currentSubject = 'History & Culture';
    let currentChapter = 'Ancient History';
    let currentHeading = 'Pre Historic Cultures';

    let pendingTitleText = '';
    const topicsToInsert = [];

    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i].trim();
      if (!line || line.includes('www.iasscore.in') || line.includes('UPSC SYLLABUS') || line.startsWith('Page ')) continue;

      // Section markers mapping
      if (line.includes('ANCIENT HISTORY')) { currentPaper = 'GS I'; currentSubject = 'History & Culture'; currentChapter = 'Ancient History'; currentHeading = 'Pre Historic Cultures'; pendingTitleText = ''; continue; }
      if (line.includes('MEDIEVAL HISTORY')) { currentPaper = 'GS I'; currentSubject = 'History & Culture'; currentChapter = 'Medieval History'; currentHeading = 'Early Medieval Dynasties'; pendingTitleText = ''; continue; }
      if (line.includes('MODERN HISTORY')) { currentPaper = 'GS I'; currentSubject = 'History & Culture'; currentChapter = 'Modern History'; currentHeading = 'Scenario before 1857'; pendingTitleText = ''; continue; }
      if (line.includes('POST INDEPENDENCE CONSOLIDATION')) { currentPaper = 'GS I'; currentSubject = 'History & Culture'; currentChapter = 'Post-Independence Consolidation'; currentHeading = 'Re-organisation of states'; pendingTitleText = ''; continue; }
      if (line.includes('WORLD HISTORY')) { currentPaper = 'GS I'; currentSubject = 'History & Culture'; currentChapter = 'World History'; currentHeading = 'Beginning of Modern Age'; pendingTitleText = ''; continue; }
      if (line.includes('INDIAN CULTURE')) { currentPaper = 'GS I'; currentSubject = 'History & Culture'; currentChapter = 'Indian Culture'; currentHeading = 'Sculptural Art in India'; pendingTitleText = ''; continue; }

      if (line.includes('PHYSICAL GEOGRAPHY OF INDIA')) { currentPaper = 'GS I'; currentSubject = 'Geography'; currentChapter = 'Physical Geography of India'; currentHeading = 'Physiography of India'; pendingTitleText = ''; continue; }
      if (line.includes('PHYSICAL GEOGRAPHY')) { currentPaper = 'GS I'; currentSubject = 'Geography'; currentChapter = 'Physical Geography'; currentHeading = 'General Geography'; pendingTitleText = ''; continue; }
      if (line.includes('HUMAN GEOGRAPHY')) { currentPaper = 'GS I'; currentSubject = 'Geography'; currentChapter = 'Human Geography'; currentHeading = 'Demography'; pendingTitleText = ''; continue; }
      if (line.includes('ECONOMIC GEOGRAPHY')) { currentPaper = 'GS I'; currentSubject = 'Geography'; currentChapter = 'Economic Geography'; currentHeading = 'Agriculture & Land Use'; pendingTitleText = ''; continue; }
      if (line.includes('INDIAN SOCIETY')) { currentPaper = 'GS I'; currentSubject = 'Indian Society'; currentChapter = 'Indian Society'; currentHeading = 'Salient features of Indian society'; pendingTitleText = ''; continue; }

      if (line.includes('POLITY')) { currentPaper = 'GS II'; currentSubject = 'Polity & Constitution'; currentChapter = 'Polity'; currentHeading = 'Historical Evolution & Features'; pendingTitleText = ''; continue; }
      if (line.includes('GOVERNANCE') && line.includes('SOCIAL JUSTICE')) { currentPaper = 'GS II'; currentSubject = 'Governance & Social Justice'; currentChapter = 'Governance'; currentHeading = 'Government Policies & Interventions'; pendingTitleText = ''; continue; }
      if (line.includes('SOCIAL JUSTICE')) { currentPaper = 'GS II'; currentSubject = 'Governance & Social Justice'; currentChapter = 'Social Justice'; currentHeading = 'Welfare Schemes for Vulnerable Sections'; pendingTitleText = ''; continue; }
      if (line.includes('INTERNATIONAL RELATIONS')) { currentPaper = 'GS II'; currentSubject = 'International Relations'; currentChapter = 'International Relations'; currentHeading = 'Indian Foreign Policy'; pendingTitleText = ''; continue; }

      if (line.includes('BASIC ECONOMY') || (line === 'ECONOMY')) { currentPaper = 'GS III'; currentSubject = 'Indian Economy'; currentChapter = 'Economy'; currentHeading = 'Planning & Growth'; pendingTitleText = ''; continue; }
      if (line === 'AGRICULTURE') { currentPaper = 'GS III'; currentSubject = 'Agriculture'; currentChapter = 'Agriculture'; currentHeading = 'Role of Agriculture in Economy'; pendingTitleText = ''; continue; }
      if (line === 'INDUSTRY') { currentPaper = 'GS III'; currentSubject = 'Infrastructure & Industry'; currentChapter = 'Industry'; currentHeading = 'Industrial Policy & Growth'; pendingTitleText = ''; continue; }
      if (line === 'INFRASTRUCTURE') { currentPaper = 'GS III'; currentSubject = 'Infrastructure & Industry'; currentChapter = 'Infrastructure'; currentHeading = 'Transport & Energy Pipelines'; pendingTitleText = ''; continue; }
      if (line.includes('SCIENCE & TECHNOLOGY')) { currentPaper = 'GS III'; currentSubject = 'Science & Technology'; currentChapter = 'Science & Technology'; currentHeading = 'Chemistry, Physics & Biology'; pendingTitleText = ''; continue; }
      if (line.includes('ENVIRONMENT & ECOLOGY') || line.includes('ENVIRONMENT')) { currentPaper = 'GS III'; currentSubject = 'Environment & Ecology'; currentChapter = 'Environment & Ecology'; currentHeading = 'Ecology & Biodiversity'; pendingTitleText = ''; continue; }
      if (line.includes('INTERNAL SECURITY')) { currentPaper = 'GS III'; currentSubject = 'Internal Security'; currentChapter = 'Internal Security'; currentHeading = 'Internal Security Challenges'; pendingTitleText = ''; continue; }
      if (line.includes('DISASTER MANAGEMENT')) { currentPaper = 'GS III'; currentSubject = 'Disaster Management'; currentChapter = 'Disaster Management'; currentHeading = 'Disaster Mitigation & Frameworks'; pendingTitleText = ''; continue; }

      if (line.includes('ETHICS, INTEGRITY')) { currentPaper = 'GS IV'; currentSubject = 'Ethics, Integrity & Aptitude'; currentChapter = 'Ethics, Integrity & Aptitude'; currentHeading = 'Ethics & Human Interface'; pendingTitleText = ''; continue; }

      if (line.includes('')) { pendingTitleText = ''; continue; }

      if (line.includes('')) {
        let fullTitle = (pendingTitleText + ' ' + line.replace(//g, '')).trim();
        pendingTitleText = '';
        if (fullTitle) {
          topicsToInsert.push({
            paper: currentPaper,
            subjectName: currentSubject,
            chapter: currentChapter,
            heading: currentHeading,
            title: fullTitle,
            tags: [currentChapter, currentHeading]
          });
        }
      } else {
        // Line without box symbol could be part of wrapped topic title or a new heading
        if (line.length > 0 && line.length < 90) {
          if (pendingTitleText) {
            pendingTitleText += ' ' + line;
          } else {
            // Check if next lines contain checkbox symbol
            let hasBoxAhead = false;
            for (let j = i + 1; j < Math.min(i + 5, rawLines.length); j++) {
              if (rawLines[j].includes('')) { hasBoxAhead = true; break; }
            }
            if (hasBoxAhead) {
              pendingTitleText = line;
            } else {
              currentHeading = line;
            }
          }
        }
      }
    }

    console.log(`Parsed ${topicsToInsert.length} clean topics from Full Syllabus.txt.`);

    // Auto create or find subjects for GS I, GS II, GS III, GS IV
    const paperIds = {};
    for (const paperName of ['GS I', 'GS II', 'GS III', 'GS IV']) {
      let subj = await Subject.findOne({ name: paperName });
      if (!subj) {
        subj = await Subject.create({ name: paperName, description: `${paperName} Syllabus Module` });
      }
      paperIds[paperName] = subj._id;
    }

    // Wipe existing topics to avoid duplicate clumsiness
    console.log('🧹 Wiping existing topics in MongoDB...');
    await Topic.deleteMany({});

    console.log('🌱 Seeding fresh clean topics into MongoDB...');
    const documents = topicsToInsert.map(t => ({
      subjectId: paperIds[t.paper],
      paper: t.paper,
      subjectName: t.subjectName,
      chapter: t.chapter,
      heading: t.heading,
      title: t.title,
      tags: t.tags,
      difficulty: 'Medium',
      status: 'Pending',
      completed: false,
      notes: { theory: '' }
    }));

    await Topic.insertMany(documents);
    console.log(`🎉 SUCCESS! Successfully seeded ${documents.length} clean topics into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedFullSyllabus();
