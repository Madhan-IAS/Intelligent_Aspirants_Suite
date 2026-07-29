/**
 * Append Manual GS I Syllabus (Medieval History)
 * Run: node appendManualGS1Medieval.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const MEDIEVAL_TOPICS = [
  // Cholas & Southern Kingdoms
  { title: "Medieval History: Chola Empire - Political History & Administration", tags: ["Medieval History", "Cholas"], difficulty: "Hard" },
  { title: "Medieval History: Chola Literature, Education & South-East Asia Contacts", tags: ["Medieval History", "Cholas"], difficulty: "Medium" },
  { title: "Medieval History: Cheras & Yadavas (9th to 13th Century)", tags: ["Medieval History", "South India"], difficulty: "Medium" },

  // Early Muslim Invasions
  { title: "Medieval History: Early Muslim Invasions (Arab Conquest of Sindh, Ghazni, Ghori)", tags: ["Medieval History", "Invasions"], difficulty: "Medium" },

  // Delhi Sultanate
  { title: "Medieval History: Delhi Sultanate - Slave, Khalji, & Tughlaq Dynasties", tags: ["Medieval History", "Delhi Sultanate"], difficulty: "Hard" },
  { title: "Medieval History: Delhi Sultanate - Sayyid & Lodi Dynasties", tags: ["Medieval History", "Delhi Sultanate"], difficulty: "Medium" },
  { title: "Medieval History: Delhi Sultanate - Administration, Economy & Society", tags: ["Medieval History", "Delhi Sultanate"], difficulty: "Hard" },
  { title: "Medieval History: Delhi Sultanate - Decline, Mongol Attacks & Legal Systems", tags: ["Medieval History", "Delhi Sultanate"], difficulty: "Medium" },

  // Vijayanagar & Bahmani
  { title: "Medieval History: Vijayanagar Empire - Political History & Bahmani Conflicts", tags: ["Medieval History", "Vijayanagar"], difficulty: "Hard" },
  { title: "Medieval History: Vijayanagar Empire - Administration, Society, & Economy", tags: ["Medieval History", "Vijayanagar"], difficulty: "Hard" },

  // Mughal Advent & Babur/Humayun
  { title: "Medieval History: Babur - Timurids, Uzbek Conflicts, & Advent in India", tags: ["Medieval History", "Mughals"], difficulty: "Medium" },
  { title: "Medieval History: Battle of Panipat & Early Mughal Struggles (Afghans & Rana Sanga)", tags: ["Medieval History", "Mughals"], difficulty: "Medium" },
  { title: "Medieval History: Humayun - Tussle with Bahadur Shah & Gujarat/Bengal Campaigns", tags: ["Medieval History", "Mughals"], difficulty: "Hard" },

  // Sur Dynasty
  { title: "Medieval History: Sur Empire - Sher Shah Suri Rise, Reforms & Contributions", tags: ["Medieval History", "Sur Dynasty"], difficulty: "Medium" },

  // Akbar
  { title: "Medieval History: Akbar - Regency, Revolt & Early Expansion (1560-1576)", tags: ["Medieval History", "Akbar"], difficulty: "Medium" },
  { title: "Medieval History: Akbar - Rajput Relations & Composite Ruling Class", tags: ["Medieval History", "Akbar"], difficulty: "Hard" },
  { title: "Medieval History: Akbar - Central, Provincial & District Government Structure", tags: ["Medieval History", "Akbar"], difficulty: "Hard" },
  { title: "Medieval History: Akbar - Mansabdari, Dahsala & Land Revenue Systems", tags: ["Medieval History", "Akbar"], difficulty: "Hard" },
  { title: "Medieval History: Akbar - Religious Views, Ibadat Khana & Din-i-Ilahi", tags: ["Medieval History", "Akbar"], difficulty: "Medium" },

  // Mughal Deccan & Foreign Policy
  { title: "Medieval History: Mughal Expansion in Deccan (Berar, Khandesh, Ahmadnagar, Malik Ambar)", tags: ["Medieval History", "Mughals"], difficulty: "Hard" },
  { title: "Medieval History: Mughal Deccan Policy (Shah Jahan, Bijapur & Golconda Suzerainty)", tags: ["Medieval History", "Mughals"], difficulty: "Hard" },
  { title: "Medieval History: Mughal Foreign Policy (Uzbeks, Qandahar & Iran Relations)", tags: ["Medieval History", "Mughals"], difficulty: "Medium" },

  // Jahangir & Shah Jahan
  { title: "Medieval History: Jahangir - Consolidation, Nur Jahan Junta & Rebellions", tags: ["Medieval History", "Mughals"], difficulty: "Medium" },
  { title: "Medieval History: Shah Jahan - Consolidation, Expansion & Mansabdari changes", tags: ["Medieval History", "Mughals"], difficulty: "Medium" },

  // Aurangzeb & Rise of Marathas
  { title: "Medieval History: Aurangzeb - War of Succession & Expansion in North India", tags: ["Medieval History", "Aurangzeb"], difficulty: "Medium" },
  { title: "Medieval History: Aurangzeb - Religious Policies, Temples & Jizyah", tags: ["Medieval History", "Aurangzeb"], difficulty: "Hard" },
  { title: "Medieval History: Shivaji - Swarajya, Purandar Treaty & Agra Visit", tags: ["Medieval History", "Marathas"], difficulty: "Medium" },
  { title: "Medieval History: Shivaji - Swarajya Administration, Achievements & Maratha Rise", tags: ["Medieval History", "Marathas"], difficulty: "Hard" },
  { title: "Medieval History: Aurangzeb Deccan Campaigns - Maratha Conflicts & Jagirdari Crisis", tags: ["Medieval History", "Aurangzeb"], difficulty: "Hard" },

  // Mughal Life, Society & Economy
  { title: "Medieval History: Mughal Society - Rural Structure, Town Life & Standard of Living", tags: ["Medieval History", "Mughal Society"], difficulty: "Medium" },
  { title: "Medieval History: Mughal Economy - Inland, Overland & Overseas Trade (Foreign Companies)", tags: ["Medieval History", "Mughal Economy"], difficulty: "Hard" },
  { title: "Medieval History: Mughal Culture - Fine Arts, Architecture, Painting & Music", tags: ["Medieval History", "Mughal Culture"], difficulty: "Medium" },
  { title: "Medieval History: Mughal Era - Religion, Language, Literature & Science", tags: ["Medieval History", "Mughal Culture"], difficulty: "Medium" },

  // 18th Century Decline & Maratha Supremacy
  { title: "Medieval History: 18th Century - Bahadur Shah I, Jahandar Shah & Sayyid Brothers", tags: ["Medieval History", "Mughal Decline"], difficulty: "Hard" },
  { title: "Medieval History: 18th Century - Rise of Regional States & Foreign Invasions (1725-1748)", tags: ["Medieval History", "Mughal Decline"], difficulty: "Medium" },
  { title: "Medieval History: Maratha Bid for Supremacy - Nizam conflict, Gujarat, Malwa & Punjab", tags: ["Medieval History", "Marathas"], difficulty: "Hard" },
  { title: "Medieval History: Third Battle of Panipat (1761)", tags: ["Medieval History", "Marathas"], difficulty: "Medium" }
];

async function appendGS1Medieval() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS I Subject
    const subject = await Subject.findOne({ name: 'GS I' });
    if (!subject) {
      console.error('❌ Subject GS I not found. Please seed subjects first.');
      process.exit(1);
    }

    const topicsWithSubject = MEDIEVAL_TOPICS.map(topic => ({
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
    console.log(`✅ Appended ${created.length} granular Medieval History topics to GS I!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error appending GS I Medieval:', err.message);
    process.exit(1);
  }
}

appendGS1Medieval();
