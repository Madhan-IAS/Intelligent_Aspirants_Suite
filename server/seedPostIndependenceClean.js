const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const rawPostIndependenceList = [
  "Re-organisation of states",
  "Constitutional provisions related to State formation",
  "Factors that lead to the merger of States",
  "Accession of the princely states",
  "Accession of States under France and Portuguese",
  "Accession of Sikkim",
  "Rehabilitation of the Refugees",
  "Federal crisis",
  "Regional aspirations, insurgencies and areas of tension",
  "Accommodation and national integration",
  "Linguistic Regionalism in India",
  "Constitutional position and language policy",
  "Language and regionalism",
  "Recent controversy due to rise of Hindi language",
  "Tribal Issue and Policy Consolidation",
  "Tribal Issues & Present Status",
  "Tribal Policy consolidation",
  "Problem of Caste and Social Consolidation",
  "Caste practices in India",
  "Ambedkar Movement",
  "Constitutional provisions",
  "Recent government initiatives for emancipation of Scheduled Castes",
  "Issues of Manual Scavenging",
  "Communalism & Social Consolidation",
  "Secularism",
  "Causes of Communalism in India",
  "Consequences of the communalism and social consolidation",
  "Issue of Linguistic Minorities",
  "Operational Inefficiency",
  "Government initiatives",
  "Overview of Economic Development Since Independence",
  "Planning in India",
  "Agriculture",
  "Journey through Five Year Plans",
  "Land Reforms",
  "Post Green Revolution Agricultural Issues",
  "Agrarian Movements",
  "Achievements in Agriculture since Independence",
  "Recent Challenges",
  "Industry",
  "Industrial development since independence",
  "Public sector since independence",
  "Sectoral Development",
  "Private Sector since Independence",
  "Industrial Policy since Independence",
  "Make in India",
  "New Economic Policy",
  "Impact of New Economic Policy",
  "Post-Independence Policy of Science and Technology",
  "India’s Policy in the Field of Science and Technology",
  "Institutional Framework for Science and Technology Development",
  "Science and Technology in Pre- Reform Period",
  "Impact of Economic Reform on the Science and Technology in India",
  "New Policy Initiatives in the S&T",
  "Agenda of the Skill Training"
];

async function seedCleanPostIndependence() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let gs1 = await Subject.findOne({ name: 'GS I' });
    if (!gs1) {
      gs1 = await Subject.create({ name: 'GS I', description: 'History, Art & Culture, Geography, and Indian Society' });
    }

    // Delete old Post-Independence Consolidation topics under GS I
    const deleteRes = await Topic.deleteMany({ subjectId: gs1._id, tags: 'Post-Independence Consolidation' });
    console.log(`🗑️ Deleted ${deleteRes.deletedCount} old Post-Independence Consolidation topics.`);

    // Deduplicate list
    const uniqueTitles = Array.from(new Set(rawPostIndependenceList.map(t => t.trim()))).filter(Boolean);

    const topicsToInsert = uniqueTitles.map(title => ({
      title,
      tags: ['Post-Independence Consolidation', 'GS I'],
      difficulty: 'Medium',
      subjectId: gs1._id,
      status: 'Pending',
      notes: {
        theory: '',
        definitions: '',
        examples: '',
        caseStudies: '',
        statistics: '',
        committeeReports: '',
        supremeCourtCases: '',
        governmentSchemes: '',
        wayForward: '',
        diagrams: '',
        mindMaps: '',
        currentAffairs: '',
        pyqs: '',
        valueAddition: ''
      }
    }));

    const inserted = await Topic.insertMany(topicsToInsert);
    console.log(`🎉 Successfully seeded ${inserted.length} clean Post-Independence Consolidation topics under GS I!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Post-Independence Consolidation:', err);
    process.exit(1);
  }
}

seedCleanPostIndependence();
