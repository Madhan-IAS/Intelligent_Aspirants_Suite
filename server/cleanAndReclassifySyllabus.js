const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

// Clean title string from control characters & garbage bullet markers
const cleanTitle = (str) => {
  if (!str) return '';
  return str
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // remove control chars like \u0019, \u0007, \x19
    .replace(/^[\u2022\u2023\u25E6\u2043\u2219\u0007\u0019\u000e-]+\s*/, '')
    .trim();
};

// Re-classification rules based on subject and title keywords
const classifyTopic = (subjectName, title) => {
  const t = title.toLowerCase();

  if (subjectName === 'GS I') {
    // 1. Indian Culture
    if (t.includes('theatre') || t.includes('puppetry') || t.includes('dance') || t.includes('music') ||
        t.includes('sculpture') || t.includes('architecture') || t.includes('painting') || t.includes('craft') ||
        t.includes('literature') || t.includes('temple') || t.includes('stupa') || t.includes('cave') || t.includes('art')) {
      return 'Indian Culture';
    }
    // 2. Ancient History
    if (t.includes('vedic') || t.includes('harapp') || t.includes('indus valley') || t.includes('maurya') ||
        t.includes('gupta') || t.includes('chola') || t.includes('sangam') || t.includes('buddhism') ||
        t.includes('jainism') || t.includes('ancient') || t.includes('pre-historic') || t.includes('stone age')) {
      return 'Ancient History';
    }
    // 3. Medieval History
    if (t.includes('delhi sultanate') || t.includes('mughal') || t.includes('vijaynagar') || t.includes('maratha') ||
        t.includes('bhakti') || t.includes('sufi') || t.includes('bahmani') || t.includes('medieval') ||
        t.includes('aurangzeb') || t.includes('akbar') || t.includes('chhatrapati') || t.includes('deccan')) {
      return 'Medieval History';
    }
    // 4. World History
    if (t.includes('world war') || t.includes('industrial revolution') || t.includes('french revolution') ||
        t.includes('american revolution') || t.includes('russian revolution') || t.includes('colonization') ||
        t.includes('decolonization') || t.includes('nazism') || t.includes('fascism') || t.includes('cold war') ||
        t.includes('redraw of national boundaries') || t.includes('world history')) {
      return 'World History';
    }
    // 5. Post-Independence Consolidation
    if (t.includes('princely states') || t.includes('reorganisation of states') || t.includes('tribal consolidation') ||
        t.includes('jp movement') || t.includes('shastri') || t.includes('indira Gandhi') || t.includes('emergency 1975') ||
        t.includes('post-independence') || t.includes('post independence')) {
      return 'Post-Independence Consolidation';
    }
    // 6. Modern History
    if (t.includes('non-cooperation') || t.includes('civil disobedience') || t.includes('quit india') ||
        t.includes('swaraj') || t.includes('freedom struggle') || t.includes('british rule') ||
        t.includes('east india company') || t.includes('1857') || t.includes('inc') || t.includes('congress') ||
        t.includes('gandhi') || t.includes('nehru report') || t.includes('simon commission') || t.includes('khilafat') ||
        t.includes('revolutionary') || t.includes('partition') || t.includes('modern history')) {
      return 'Modern History';
    }
    // 7. Physical Geography of India
    if (t.includes('physiography of india') || t.includes('himalaya') || t.includes('peninsular rivers') ||
        t.includes('indian monsoon') || t.includes('soils of india') || t.includes('drainage system of india')) {
      return 'Physical Geography of India';
    }
    // 8. Human Geography
    if (t.includes('population') || t.includes('demographic') || t.includes('migration') ||
        t.includes('settlement') || t.includes('urbanization') || t.includes('human geography')) {
      return 'Human Geography';
    }
    // 9. Economic Geography
    if (t.includes('natural resources') || t.includes('mineral') || t.includes('industries') ||
        t.includes('location of industries') || t.includes('economic geography') || t.includes('resources')) {
      return 'Economic Geography';
    }
    // 10. Indian Society
    if (t.includes('society') || t.includes('caste') || t.includes('women') || t.includes('poverty') ||
        t.includes('globalization') || t.includes('communalism') || t.includes('secularism') ||
        t.includes('regionalism') || t.includes('social empowerment') || t.includes('diversity')) {
      return 'Indian Society';
    }
    // Default GS I fallback
    return 'Physical Geography';
  }

  if (subjectName === 'GS II') {
    // 1. International Relations
    if (t.includes('international') || t.includes('foreign policy') || t.includes('diplomacy') ||
        t.includes('neighborhood') || t.includes('quad') || t.includes('brics') || t.includes('g20') ||
        t.includes('sco') || t.includes('asean') || t.includes('saarc') || t.includes('un ') ||
        t.includes('wto') || t.includes('diaspora') || t.includes('bilateral') || t.includes('treaty') ||
        t.includes('china') || t.includes('usa') || t.includes('russia') || t.includes('pakistan') ||
        t.includes('bangladesh') || t.includes('sri lanka') || t.includes('nepal') || t.includes('iran') ||
        t.includes('israel') || t.includes('trade agreement')) {
      return 'International Relations';
    }
    // 2. Governance
    if (t.includes('governance') || t.includes('transparency') || t.includes('accountability') ||
        t.includes('e-governance') || t.includes('citizen charter') || t.includes('civil services') ||
        t.includes('ngo') || t.includes('shg') || t.includes('development processes') ||
        t.includes('development industry') || t.includes('rti') || t.includes('good governance')) {
      return 'Governance';
    }
    // 3. Social Justice
    if (t.includes('scheme') || t.includes('welfare') || t.includes('vulnerable') ||
        t.includes('health') || t.includes('education') || t.includes('hunger') ||
        t.includes('human resources') || t.includes('social justice') || t.includes('tribal sub plan') ||
        t.includes('startup india') || t.includes('skill development') || t.includes('social sector')) {
      return 'Social Justice';
    }
    // 4. Polity
    return 'Polity';
  }

  if (subjectName === 'GS III') {
    // 1. Agriculture
    if (t.includes('agriculture') || t.includes('crop') || t.includes('irrigation') ||
        t.includes('farming') || t.includes('msp') || t.includes('pds') || t.includes('subsid') ||
        t.includes('food processing') || t.includes('land reform') || t.includes('fertilizer') ||
        t.includes('seed') || t.includes('maize') || t.includes('cultivation') || t.includes('production pattern')) {
      return 'Agriculture';
    }
    // 2. Environment & Ecology
    if (t.includes('environment') || t.includes('ecology') || t.includes('biodiversity') ||
        t.includes('pollution') || t.includes('climate change') || t.includes('mangrove') ||
        t.includes('wetland') || t.includes('national park') || t.includes('sanctuary') ||
        t.includes('conservation') || t.includes('eia') || t.includes('forest')) {
      return 'Environment & Ecology';
    }
    // 3. Science & Technology
    if (t.includes('science') || t.includes('technology') || t.includes('isro') ||
        t.includes('space') || t.includes('biotech') || t.includes('nanotech') ||
        t.includes('robotics') || t.includes('ipr') || t.includes('patent') ||
        t.includes('computer') || t.includes('it ') || t.includes('indigenization')) {
      return 'Science & Technology';
    }
    // 4. Disaster Management
    if (t.includes('disaster') || t.includes('cyclone') || t.includes('earthquake') ||
        t.includes('tsunami') || t.includes('flood') || t.includes('landslide') ||
        t.includes('ndrf') || t.includes('sendai')) {
      return 'Disaster Management';
    }
    // 5. Internal Security
    if (t.includes('security') || t.includes('extremism') || t.includes('naxal') ||
        t.includes('cyber') || t.includes('money laundering') || t.includes('border') ||
        t.includes('warfare') || t.includes('defence') || t.includes('military') ||
        t.includes('terrorism') || t.includes('forces')) {
      return 'Internal Security';
    }
    // 6. Indian Economy
    return 'Indian Economy';
  }

  if (subjectName === 'GS IV') {
    return 'Ethics, Integrity & Aptitude (GS-IV)';
  }

  if (subjectName === 'Sociology') {
    if (t.includes('paper ii') || t.includes('paper 2') || t.includes('indian society') || t.includes('indology') || t.includes('caste')) {
      return 'Sociology Paper II';
    }
    return 'Sociology Paper I';
  }

  return subjectName;
};

async function cleanAndReclassify() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const subjects = await Subject.find({});
    console.log(`Found ${subjects.length} Subjects.`);

    let totalCleaned = 0;
    let totalReclassified = 0;

    for (const sub of subjects) {
      console.log(`\n🔄 Processing Subject: ${sub.name}...`);
      const topics = await Topic.find({ subjectId: sub._id });

      for (const topic of topics) {
        let updated = false;

        // 1. Clean Title
        const newTitle = cleanTitle(topic.title);
        if (newTitle !== topic.title) {
          topic.title = newTitle;
          updated = true;
          totalCleaned++;
        }

        // 2. Determine target section tag
        const targetTag = classifyTopic(sub.name, topic.title);

        // Standardize tags array: [targetTag, sub.name]
        const newTags = Array.from(new Set([targetTag, sub.name]));
        if (JSON.stringify(newTags) !== JSON.stringify(topic.tags)) {
          topic.tags = newTags;
          updated = true;
          totalReclassified++;
        }

        if (updated) {
          await topic.save();
        }
      }
      console.log(`   └ Updated topics for ${sub.name}.`);
    }

    console.log('\n========================================');
    console.log(`🎉 RE-CLASSIFICATION COMPLETE!`);
    console.log(`   - Total Titles Cleaned: ${totalCleaned}`);
    console.log(`   - Total Topics Re-tagged: ${totalReclassified}`);
    console.log('========================================');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during re-classification:', err);
    process.exit(1);
  }
}

cleanAndReclassify();
