/**
 * Append Manual GS I Syllabus (Modern History)
 * Run: node appendManualGS1Modern.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const MODERN_TOPICS = [
  // Before 1857
  { title: "Modern History: Decline of Mughals & Rise of 18th Century Regional Powers", tags: ["Modern History", "Pre-1857"], difficulty: "Medium" },
  { title: "Modern History: Advent of Europeans & British Conquest of India", tags: ["Modern History", "Pre-1857"], difficulty: "Medium" },
  { title: "Modern History: Wars of Conquest - Carnatic Wars & Battles of Plassey & Buxar", tags: ["Modern History", "Pre-1857"], difficulty: "Hard" },
  { title: "Modern History: Expansion - Anglo-Mysore & Anglo-Punjab Wars", tags: ["Modern History", "Pre-1857"], difficulty: "Medium" },
  { title: "Modern History: British Administration & Land Revenue Policies Before 1857", tags: ["Modern History", "Pre-1857"], difficulty: "Hard" },
  { title: "Modern History: British Economic Policy & Drain of Wealth Theory", tags: ["Modern History", "Pre-1857", "Economy"], difficulty: "Hard" },

  // Revolt of 1857
  { title: "Modern History: Revolt of 1857 - Causes, Key Leaders & Suppression", tags: ["Modern History", "1857 Revolt"], difficulty: "Medium" },
  { title: "Modern History: Revolt of 1857 - Nature, Impact & Consequences", tags: ["Modern History", "1857 Revolt"], difficulty: "Medium" },

  // Early Nationalism (1858-1905)
  { title: "Modern History: Rise of Early Nationalism & Indian National Congress Foundation", tags: ["Modern History", "Early Nationalists"], difficulty: "Medium" },
  { title: "Modern History: Moderate & Extremist Ideologies in National Movement", tags: ["Modern History", "Early Nationalists"], difficulty: "Medium" },
  { title: "Modern History: Partition of Bengal & Swadeshi Movement (1905-1908)", tags: ["Modern History", "Swadeshi"], difficulty: "Hard" },
  { title: "Modern History: Morley-Minto Reforms & Government of India Act 1909", tags: ["Modern History", "Acts"], difficulty: "Hard" },
  { title: "Modern History: First World War & Home Rule League Movement", tags: ["Modern History", "Home Rule"], difficulty: "Medium" },

  // Struggle for Swaraj (1917-1939)
  { title: "Modern History: Montagu-Chelmsford Reforms & Government of India Act 1919", tags: ["Modern History", "Acts"], difficulty: "Hard" },
  { title: "Modern History: Emergence of Mahatma Gandhi & Rowlatt Satyagraha", tags: ["Modern History", "Gandhian Phase"], difficulty: "Medium" },
  { title: "Modern History: Khilafat & Non-Cooperation Movement (NCM)", tags: ["Modern History", "Gandhian Phase"], difficulty: "Hard" },
  { title: "Modern History: Swarajists, No-Changers & Socialist Trends in 1920s", tags: ["Modern History", "Swaraj Party"], difficulty: "Hard" },
  { title: "Modern History: Revolutionary Activism Phase II (HRA, HSRA, Chittagong)", tags: ["Modern History", "Revolutionary"], difficulty: "Hard" },
  { title: "Modern History: Simon Commission Boycott & Nehru Report (1928)", tags: ["Modern History", "Swaraj"], difficulty: "Medium" },
  { title: "Modern History: Civil Disobedience Movement & Dandi March", tags: ["Modern History", "Gandhian Phase"], difficulty: "Hard" },
  { title: "Modern History: Round Table Conferences & Poona Pact (1930-1932)", tags: ["Modern History", "Swaraj"], difficulty: "Hard" },
  { title: "Modern History: Government of India Act 1935 & 1937 Provincial Elections", tags: ["Modern History", "Acts"], difficulty: "Hard" },
  { title: "Modern History: Tripuri Session (1939) & Subhas Chandra Bose Rift", tags: ["Modern History", "Swaraj"], difficulty: "Medium" },

  // Towards Freedom (1940-1947)
  { title: "Modern History: August Offer (1940) & Individual Satyagraha (1940-41)", tags: ["Modern History", "Freedom struggle"], difficulty: "Medium" },
  { title: "Modern History: Cripps Mission & Quit India Movement (1942)", tags: ["Modern History", "Freedom struggle"], difficulty: "Hard" },
  { title: "Modern History: Wavell Plan, Shimla Conference & Cabinet Mission Plan", tags: ["Modern History", "Freedom struggle"], difficulty: "Hard" },
  { title: "Modern History: Mountbatten Plan, Partition of India & Indian Independence Act", tags: ["Modern History", "Partition"], difficulty: "Hard" },
  { title: "Modern History: Popular Movements in Princely States (AISPC)", tags: ["Modern History", "States"], difficulty: "Medium" },

  // Social & Popular Movements
  { title: "Modern History: Socio-Religious Reform Movements (Indian Renaissance)", tags: ["Modern History", "Reforms"], difficulty: "Hard" },
  { title: "Modern History: Civil Rebellions & Tribal Movements during British Rule", tags: ["Modern History", "Rebellions"], difficulty: "Hard" },
  { title: "Modern History: Peasant Movements & Working-Class Struggles", tags: ["Modern History", "Rebellions"], difficulty: "Medium" },
  { title: "Modern History: Left & Communist Trends in National Movement", tags: ["Modern History", "Socialist"], difficulty: "Medium" },
  { title: "Modern History: Growth of Communalism & Two-Nation Theory", tags: ["Modern History", "Communalism"], difficulty: "Hard" },

  // Development & Key Figures
  { title: "Modern History: Development of Press & Education under British Rule", tags: ["Modern History", "Development"], difficulty: "Hard" },
  { title: "Modern History: Role of Women in the Freedom Struggle", tags: ["Modern History", "Social Issues"], difficulty: "Medium" },
  { title: "Modern History: Contributions of Key Personalities in Indian National Movement", tags: ["Modern History", "Personalities"], difficulty: "Medium" },
  { title: "Modern History: Major Congress Sessions, Resolutions & Leaders", tags: ["Modern History", "INC"], difficulty: "Medium" },
  { title: "Modern History: Chronology of Governor-Generals & Viceroys of India", tags: ["Modern History", "Viceroys"], difficulty: "Hard" },
  { title: "Modern History: Important Newspapers, Journals & Literature during Struggle", tags: ["Modern History", "Development"], difficulty: "Medium" }
];

async function appendGS1Modern() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS I Subject
    const subject = await Subject.findOne({ name: 'GS I' });
    if (!subject) {
      console.error('❌ Subject GS I not found. Please seed subjects first.');
      process.exit(1);
    }

    const topicsWithSubject = MODERN_TOPICS.map(topic => ({
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
    console.log(`✅ Appended ${created.length} granular Modern History topics to GS I!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error appending GS I Modern:', err.message);
    process.exit(1);
  }
}

appendGS1Modern();
