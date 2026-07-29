const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const rawModernHistoryList = [
  "Scenario before 1857",
  "Later Mughals & their Decline",
  "Regional powers in 18th Century",
  "Advent of Europeans in India",
  "The British conquest of India",
  "Carnatic Wars",
  "Battle of Plassey & Buxar",
  "Anglo-Mysore War",
  "Anglo Punjab War",
  "British Administration before 1857",
  "British Economic Policy",
  "Revolt of 1857",
  "Causes for revolt of 1857",
  "Leaders of revolt of 1857",
  "Suppression of revolt of 1857",
  "Nature of revolt of 1857",
  "Consequences of Revolt of 1857",
  "Early Nationalism",
  "Indian National Movement (1858-1905)",
  "Early Nationalists and Swadeshi Movement",
  "Government of India Act 1909",
  "Home rule league movement",
  "The struggle for Swaraj",
  "Montague’s statement – Aug 1917",
  "Emergence of Gandhi – as a mass leader",
  "Khilafat & Non-Cooperation Movement (NCM)",
  "Swaraj Party",
  "Revolutionary Terrorism Phase II (1920’s)",
  "Simon Commission and Nehru Report",
  "Intimation of freedom",
  "Civil Disobedience Movement",
  "Round Table Conference",
  "Poona Pact",
  "Government of India Act 1935",
  "Tripuri Session – 1939",
  "August Offer",
  "Individual Satyagarha 1940-41",
  "Towards Achievement of Freedom",
  "Popular struggles in the princely states",
  "2nd World War and Nationalist response",
  "Partition of India",
  "Rise of Communalism",
  "Wavell Plan",
  "Cabinet Mission Plan",
  "Mountbatten Plan",
  "During the freedom struggle",
  "Indian Renaissance/Socio-Religious Movement",
  "Civil Rebellions during British",
  "Tribal Movements during British Period",
  "Peasant’s Movement during British Period",
  "Working Class Movement (1850-1900)",
  "Growth of communalism",
  "Left and Communist trends in National Movement",
  "Press and Education during British Period",
  "Role of Women in Freedom Struggle",
  "Governor Generals of India",
  "Viceroys of India",
  "Important Persons",
  "Important Newspaper/Journals",
  "Congress Sessions"
];

async function seedCleanModernHistory() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let gs1 = await Subject.findOne({ name: 'GS I' });
    if (!gs1) {
      gs1 = await Subject.create({ name: 'GS I', description: 'History, Art & Culture, Geography, and Indian Society' });
    }

    // Delete old Modern History topics under GS I
    const deleteRes = await Topic.deleteMany({ subjectId: gs1._id, tags: 'Modern History' });
    console.log(`🗑️ Deleted ${deleteRes.deletedCount} old Modern History topics.`);

    // Deduplicate list
    const uniqueTitles = Array.from(new Set(rawModernHistoryList.map(t => t.trim()))).filter(Boolean);

    const topicsToInsert = uniqueTitles.map(title => ({
      title,
      tags: ['Modern History', 'GS I'],
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
    console.log(`🎉 Successfully seeded ${inserted.length} clean Modern History topics under GS I!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Modern History:', err);
    process.exit(1);
  }
}

seedCleanModernHistory();
