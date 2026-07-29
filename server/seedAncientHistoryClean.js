const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const rawAncientHistoryList = [
  "Pre Historic Cultures in India",
  "Sources of Pre History",
  "Periodization of Indian Pre History",
  "Stone Age",
  "Palaeolithic (2 million BC – 10,000 BC)",
  "Mesolithic (10,000 BC – 8,000 BC)",
  "Neolithic (8000 BC – 4000 BC)",
  "Chalcolithic Age (4000 BC – 1500 BC)",
  "Iron Age (1500 BC-200 BC)",
  "Impact of Iron",
  "Pastoral & Farming Communities",
  "Neolithic Phase",
  "Chalcolithic Phase",
  "Early Iron Phase",
  "Geographical Distribution and Characteristics",
  "Indus Valley Civilization",
  "Harappan civilisation or Indus Valley Civilisation",
  "Major Cities Town Planning",
  "Harappan Internal & Foreign Trade",
  "Agriculture",
  "Domestication of animals",
  "Crafts",
  "Weights and Measures",
  "Script and Language",
  "Harappan Society",
  "Harappan Religion",
  "Harappan Economy",
  "Harappan Burial System",
  "Harappan Art & Architecture",
  "Decline of Harappan Culture",
  "Vedic Society",
  "Original Home of Aryans",
  "Features of Aryan Culture",
  "Vedic Texts & Upanishad",
  "Sources for Reconstructing Vedic Society and Culture",
  "Geography of the Rig Vedic Period & Geography of the later Vedic Phases",
  "Economic Conditions",
  "Political Organisation and Evolution of Monarchy",
  "Social Organisation and Varna System",
  "Religion and Thought",
  "Pre Mauryan-Period",
  "Age of 2nd Urbanisation",
  "Formation of states",
  "The Sixteen Mahajanapadas",
  "Gana Sangha or Republics",
  "Rise of urban centres",
  "Evolution of Coins",
  "Haryanka dynasty",
  "Shishunaga dynasty",
  "Nanda dynasty",
  "Growth of Janism & Buddhism",
  "Jainism",
  "Buddhism",
  "The Mauryan Empire",
  "Chandragupta and Bindusara",
  "The Arthasastra",
  "Megasthenes",
  "Ashoka and His Successors",
  "Ashoka’s Inscriptions and Sites",
  "Ashoka’a Dhamma",
  "Mauryan Administration, Economy, Society and Art",
  "Decline of Maurya",
  "Post-Mauryan India (BC 200-AD 300)",
  "Arrival of Indo-Greeks, Shakas, Parthians & Kushana",
  "Commercial Contacts with the Outside World",
  "Satavahanas and Other Indigenous Dynasties",
  "Society: Evolution of Jatis",
  "Sangam Texts-and Society",
  "Schools of Art: Gandhara; Mathura ; Amravati",
  "Imperial Guptas",
  "Sources of Gupta Rule",
  "Political history of Guptas",
  "Fa-hien Arrival",
  "Gupta Administration",
  "Development of Art & Culture",
  "Gupta Empire: Period of Golden Age",
  "Economic Conditions",
  "Urban centres in Gupta period",
  "Harshavardana",
  "Sources for Harsha’s Period",
  "Early life of Harsha",
  "Harsha’s Administration",
  "Important Officials of the empire",
  "Economy under Harsha",
  "Huen Tsang Arrival",
  "Society",
  "Religion",
  "India’s Contacts with Rest of Asia",
  "Propagation of Buddhism abroad",
  "India’s contacts with Roman empire",
  "Trade and Chinese silk route",
  "Reign of Kanishka",
  "Spread of Indian culture to SE Asia",
  "Sangam Period (South Indian Dynasties)",
  "Sangam Literature",
  "South Indian Dynasties",
  "Cholas",
  "Cheras",
  "Pandyas",
  "Sangam Polity, Society and Culture",
  "Economy of Sangam Period",
  "Foreign Dynasties",
  "Commercial Contacts with the Outside World",
  "Schools of Art"
];

async function seedCleanAncientHistory() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let gs1 = await Subject.findOne({ name: 'GS I' });
    if (!gs1) {
      gs1 = await Subject.create({ name: 'GS I', description: 'History, Art & Culture, Geography, and Indian Society' });
    }

    // Delete existing Ancient History topics under GS I
    const deleteRes = await Topic.deleteMany({ subjectId: gs1._id, tags: 'Ancient History' });
    console.log(`🗑️ Deleted ${deleteRes.deletedCount} old Ancient History topics.`);

    // Deduplicate list
    const uniqueTitles = Array.from(new Set(rawAncientHistoryList.map(t => t.trim()))).filter(Boolean);

    const topicsToInsert = uniqueTitles.map(title => ({
      title,
      tags: ['Ancient History', 'GS I'],
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
    console.log(`🎉 Successfully seeded ${inserted.length} clean Ancient History topics under GS I!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Ancient History:', err);
    process.exit(1);
  }
}

seedCleanAncientHistory();
