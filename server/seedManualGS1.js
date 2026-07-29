/**
 * Seed Manual GS I Syllabus (Ancient & Medieval History)
 * Run: node seedManualGS1.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const GS1_TOPICS = [
  // Pre Historic Cultures
  { title: "Ancient History: Sources & Periodization of Pre-History", tags: ["Ancient History", "Pre-History"], difficulty: "Medium" },
  { title: "Ancient History: Stone Age (Palaeolithic, Mesolithic, Neolithic)", tags: ["Ancient History", "Pre-History"], difficulty: "Medium" },
  { title: "Ancient History: Chalcolithic & Iron Age (Impact of Iron)", tags: ["Ancient History", "Pre-History"], difficulty: "Medium" },
  { title: "Ancient History: Pastoral & Farming Communities (Neolithic & Chalcolithic)", tags: ["Ancient History", "Pre-History"], difficulty: "Medium" },

  // Indus Valley Civilization
  { title: "Ancient History: Indus Valley Civilization - Origin & Major Cities", tags: ["Ancient History", "IVC"], difficulty: "Medium" },
  { title: "Ancient History: IVC Town Planning, Art, & Architecture", tags: ["Ancient History", "IVC"], difficulty: "Medium" },
  { title: "Ancient History: IVC Economy, Trade, Agriculture & Domestication", tags: ["Ancient History", "IVC"], difficulty: "Medium" },
  { title: "Ancient History: IVC Society, Religion, Script, & Burial Systems", tags: ["Ancient History", "IVC"], difficulty: "Medium" },
  { title: "Ancient History: Decline of Harappan Culture", tags: ["Ancient History", "IVC"], difficulty: "Easy" },

  // Vedic Society
  { title: "Ancient History: Aryan Culture & Rig Vedic Period", tags: ["Ancient History", "Vedic"], difficulty: "Medium" },
  { title: "Ancient History: Vedic Texts, Upanishads & Literature", tags: ["Ancient History", "Vedic"], difficulty: "Hard" },
  { title: "Ancient History: Later Vedic Phase - Polity, Economy & Varna System", tags: ["Ancient History", "Vedic"], difficulty: "Hard" },
  { title: "Ancient History: Vedic Religion, Philosophy & Thought", tags: ["Ancient History", "Vedic"], difficulty: "Hard" },

  // Pre-Mauryan Period
  { title: "Ancient History: Sixteen Mahajanapadas & Rise of Magadha", tags: ["Ancient History", "Pre-Mauryan"], difficulty: "Medium" },
  { title: "Ancient History: Gana Sanghas, Urban Centres & Evolution of Coins", tags: ["Ancient History", "Pre-Mauryan"], difficulty: "Medium" },
  { title: "Ancient History: Pre-Mauryan Dynasties (Haryanka, Shishunaga, Nanda)", tags: ["Ancient History", "Pre-Mauryan"], difficulty: "Medium" },

  // Jainism & Buddhism
  { title: "Ancient History: Rise & Philosophy of Jainism", tags: ["Ancient History", "Religions"], difficulty: "Medium" },
  { title: "Ancient History: Rise, Philosophy & Councils of Buddhism", tags: ["Ancient History", "Religions"], difficulty: "Medium" },

  // Mauryan Empire
  { title: "Ancient History: Mauryan Empire - Chandragupta, Bindusara & Sources", tags: ["Ancient History", "Maurya"], difficulty: "Medium" },
  { title: "Ancient History: Ashoka, Inscriptions, Edicts & Dhamma", tags: ["Ancient History", "Maurya"], difficulty: "Hard" },
  { title: "Ancient History: Mauryan Administration, Economy & Society", tags: ["Ancient History", "Maurya"], difficulty: "Hard" },
  { title: "Ancient History: Mauryan Art, Architecture & Decline of Empire", tags: ["Ancient History", "Maurya"], difficulty: "Medium" },

  // Post-Mauryan
  { title: "Ancient History: Post-Mauryan Invaders (Indo-Greeks, Shakas, Parthians, Kushanas)", tags: ["Ancient History", "Post-Maurya"], difficulty: "Hard" },
  { title: "Ancient History: Kanishka & Spread of Mahayana Buddhism", tags: ["Ancient History", "Post-Maurya"], difficulty: "Medium" },
  { title: "Ancient History: Indigenous Post-Mauryan Dynasties (Satavahanas, Shungas, Kanvas)", tags: ["Ancient History", "Post-Maurya"], difficulty: "Medium" },
  { title: "Ancient History: Post-Mauryan Schools of Art (Gandhara, Mathura, Amaravati)", tags: ["Ancient History", "Post-Maurya", "Art"], difficulty: "Hard" },

  // Guptas
  { title: "Ancient History: Gupta Empire - Sources, Political History & Consolidation", tags: ["Ancient History", "Gupta"], difficulty: "Medium" },
  { title: "Ancient History: Gupta Administration, Land Revenue & Economy", tags: ["Ancient History", "Gupta"], difficulty: "Hard" },
  { title: "Ancient History: Golden Age of Art, Science, Literature & Fa-hien Account", tags: ["Ancient History", "Gupta"], difficulty: "Medium" },

  // Harshavardhana
  { title: "Ancient History: Harshavardhana - Conquests, Administration & Society", tags: ["Ancient History", "Harsha"], difficulty: "Medium" },
  { title: "Ancient History: Huen Tsang Account & Nalanda University", tags: ["Ancient History", "Harsha"], difficulty: "Medium" },

  // Sangam Period
  { title: "Ancient History: Sangam Literature & Assembly", tags: ["Ancient History", "Sangam"], difficulty: "Hard" },
  { title: "Ancient History: South Indian Dynasties (Cholas, Cheras, Pandyas)", tags: ["Ancient History", "Sangam"], difficulty: "Medium" },
  { title: "Ancient History: Sangam Polity, Economy & Foreign Roman Trade", tags: ["Ancient History", "Sangam"], difficulty: "Hard" },

  // Contacts with Rest of Asia
  { title: "Ancient History: Indias Contacts with Southeast Asia & Chinese Silk Route", tags: ["Ancient History", "Foreign Trade"], difficulty: "Medium" },

  // Early Medieval Dynasties
  { title: "Medieval History: Northern Dynasties (Pratiharas, Palas, Senas & Tripartite Conflict)", tags: ["Medieval History", "Dynasties"], difficulty: "Hard" },
  { title: "Medieval History: Southern Dynasties (Pallavas, Chalukyas, Rashtrakutas)", tags: ["Medieval History", "Dynasties"], difficulty: "Hard" },
  { title: "Medieval History: Rise of Rajputs & Indian Feudalism", tags: ["Medieval History", "Feudalism"], difficulty: "Hard" },
  { title: "Medieval History: Early Medieval Administration, Economy & Culture", tags: ["Medieval History", "Society"], difficulty: "Hard" }
];

async function seedGS1Manual() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create GS I Subject
    let subject = await Subject.findOne({ name: 'GS I' });
    if (!subject) {
      subject = await Subject.create({
        name: 'GS I',
        description: 'History, Art & Culture, Geography, and Indian Society'
      });
      console.log('📚 Created Subject GS I.');
    }

    // Delete existing topics for GS I
    const deleteRes = await Topic.deleteMany({ subjectId: subject._id });
    console.log(`Deleted ${deleteRes.deletedCount} existing topics for GS I.`);

    const topicsWithSubject = GS1_TOPICS.map(topic => ({
      ...topic,
      subjectId: subject._id,
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

    const created = await Topic.insertMany(topicsWithSubject);
    console.log(`✅ Seeded ${created.length} granular Ancient & Medieval History topics for GS I!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding manual GS I:', err.message);
    process.exit(1);
  }
}

seedGS1Manual();
