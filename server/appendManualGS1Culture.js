/**
 * Append Manual GS I Syllabus (Indian Culture)
 * Run: node appendManualGS1Culture.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const CULTURE_TOPICS = [
  // Sculptural Art & Ancient Architecture
  { title: "Indian Culture: Evolution of Sculptural Art (Harappan to Modern Indian)", tags: ["Culture", "Sculptures"], difficulty: "Medium" },
  { title: "Indian Culture: Ancient Architecture - Harappan & Mauryan Styles", tags: ["Culture", "Architecture"], difficulty: "Medium" },
  { title: "Indian Culture: Temple Architecture - Nagara Style (Odisha, Khajuraho, Gujarat, Rajasthan)", tags: ["Culture", "Architecture"], difficulty: "Hard" },
  { title: "Indian Culture: Temple Architecture - Dravida Style (Pallava, Chola, Pandya, Nayaka)", tags: ["Culture", "Architecture"], difficulty: "Hard" },
  { title: "Indian Culture: Temple Architecture - Vesara Style, Hoysala & Rashtrakuta Styles", tags: ["Culture", "Architecture"], difficulty: "Hard" },

  // Medieval & Modern Architecture
  { title: "Indian Culture: Indo-Islamic Architecture (Delhi Sultanate, Provincial, Mughal Styles)", tags: ["Culture", "Architecture"], difficulty: "Hard" },
  { title: "Indian Culture: Rajput, Sikh, & Regional Styles of Architecture", tags: ["Culture", "Architecture"], difficulty: "Medium" },
  { title: "Indian Culture: Modern Architecture (European, Indo-Saracenic & Post-Independence)", tags: ["Culture", "Architecture"], difficulty: "Medium" },

  // Paintings & Pottery
  { title: "Indian Culture: Tradition of Indian Paintings (Mural, Miniature & Deccan Schools)", tags: ["Culture", "Paintings"], difficulty: "Hard" },
  { title: "Indian Culture: Rajput, Pahari, Southern & Modern Schools of Painting", tags: ["Culture", "Paintings"], difficulty: "Hard" },
  { title: "Indian Culture: Pottery Traditions of India (OCP, BRW, PGW, NBPW)", tags: ["Culture", "Pottery"], difficulty: "Medium" },

  // Music, Dance & Martial Arts
  { title: "Indian Culture: Indian Classical & Folk Music (Carnatic, Hindustani & Instruments)", tags: ["Culture", "Music"], difficulty: "Hard" },
  { title: "Indian Culture: Indian Dances (Classical Forms, Folk Dances & Ashta Nayika)", tags: ["Culture", "Dances"], difficulty: "Medium" },
  { title: "Indian Culture: Traditional Martial Arts of India & Puppetry (String, Shadow, Rod, Glove)", tags: ["Culture", "Performing Arts"], difficulty: "Medium" },

  // Theatre & Cinema
  { title: "Indian Culture: Indian Theatre (Sanskrit, Regional, Modern & Renaissance)", tags: ["Culture", "Theatre"], difficulty: "Medium" },
  { title: "Indian Culture: History & Classification of Indian Cinema", tags: ["Culture", "Cinema"], difficulty: "Easy" },

  // Religions & Philosophies
  { title: "Indian Culture: Major Religions in India (Hinduism, Buddhism, Jainism, Sikhism, Islam, Christianity, Zoroastrianism, Judaism)", tags: ["Culture", "Religions"], difficulty: "Medium" },
  { title: "Indian Culture: Six Schools of Classical Indian Philosophy (Orthodox & Heterodox)", tags: ["Culture", "Philosophies"], difficulty: "Hard" },
  { title: "Indian Culture: Bhakti Movement (Saints, Vaishnava Acharyas & Maharashtra Dharma)", tags: ["Culture", "Bhakti Sufi"], difficulty: "Hard" },
  { title: "Indian Culture: Sufism in India - Silsilas, Teachings & Influence", tags: ["Culture", "Bhakti Sufi"], difficulty: "Medium" },

  // Languages & Literature
  { title: "Indian Culture: Classical Languages & Literature (Sanskrit, Pali, Prakrit, Tamil)", tags: ["Culture", "Literature"], difficulty: "Hard" },
  { title: "Indian Culture: Medieval & Modern Vernacular Literature (Telugu, Kannada, Malayalam, Bengali, Hindi, Urdu, Persian)", tags: ["Culture", "Literature"], difficulty: "Hard" },

  // Miscellaneous & S&T
  { title: "Indian Culture: Science & Technology in Ancient India (Mathematics, Astronomy, Medicine)", tags: ["Culture", "S&T"], difficulty: "Medium" },
  { title: "Indian Culture: UNESCO World Heritage Sites (Cultural & Natural) in India", tags: ["Culture", "Heritage"], difficulty: "Medium" },
  { title: "Indian Culture: Indian Universities of Ancient India (Nalanda, Taxila, Vikramshila)", tags: ["Culture", "Heritage"], difficulty: "Easy" },
  { title: "Indian Culture: Fairs, Festivals, Handicrafts & Calendar Systems (Eras) of India", tags: ["Culture", "Fairs Festivals"], difficulty: "Medium" },
  { title: "Indian Culture: Legal Provisions & Institutions for Protection of Heritage", tags: ["Culture", "Governance"], difficulty: "Hard" }
];

async function appendGS1Culture() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS I Subject
    const subject = await Subject.findOne({ name: 'GS I' });
    if (!subject) {
      console.error('❌ Subject GS I not found. Please seed subjects first.');
      process.exit(1);
    }

    const topicsWithSubject = CULTURE_TOPICS.map(topic => ({
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
    console.log(`✅ Appended ${created.length} Culture topics to GS I!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error appending GS I Culture:', err.message);
    process.exit(1);
  }
}

appendGS1Culture();
