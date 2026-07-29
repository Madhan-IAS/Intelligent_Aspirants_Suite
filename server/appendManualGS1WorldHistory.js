/**
 * Append Manual GS I Syllabus (World History)
 * Run: node appendManualGS1WorldHistory.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const WORLD_HIST_TOPICS = [
  // Modern Age & Renaissance
  { title: "World History: Disintegration of Feudalism & Advent of Modern Age", tags: ["World History", "Modern Age"], difficulty: "Medium" },
  { title: "World History: Renaissance - Humanism, Art, Science & Literature", tags: ["World History", "Renaissance"], difficulty: "Medium" },
  { title: "World History: Protestant Reformation & Religious Revolts in Europe", tags: ["World History", "Reformation"], difficulty: "Medium" },
  { title: "World History: Age of Explorations, Discovery, Trade & Rise of Nation-States", tags: ["World History", "Nation-State"], difficulty: "Medium" },
  { title: "World History: The English Revolution (Glorious Revolution)", tags: ["World History", "Revolutions"], difficulty: "Medium" },

  // French & American Revolutions
  { title: "World History: French Revolution - Causes, Key Events & Course", tags: ["World History", "French Revolution"], difficulty: "Hard" },
  { title: "World History: Rise & Fall of Napoleon Bonaparte & Napoleonic Wars", tags: ["World History", "French Revolution"], difficulty: "Hard" },
  { title: "World History: Impact & Global Significance of the French Revolution", tags: ["World History", "French Revolution"], difficulty: "Medium" },
  { title: "World History: American Revolution - Colonization, War of Independence & Impact", tags: ["World History", "American Revolution"], difficulty: "Hard" },
  { title: "World History: US Civil War - Causes, Course & Global Impact (including India)", tags: ["World History", "American History"], difficulty: "Hard" },

  // Nationalism & Imperialism
  { title: "World History: Rise of Nation-State System & Unification of Italy", tags: ["World History", "Unification"], difficulty: "Hard" },
  { title: "World History: Unification of Germany & Bismarckian Diplomacy", tags: ["World History", "Unification"], difficulty: "Hard" },
  { title: "World History: Colonialism & Age of Imperialism (1870-1914) in Asia & Africa", tags: ["World History", "Imperialism"], difficulty: "Hard" },

  // World War I & Russian Revolution
  { title: "World History: World War I - Causes, Major Events & Consequences", tags: ["World History", "WWI"], difficulty: "Hard" },
  { title: "World History: Aftermath of WWI & Paris Peace Conference (League of Nations)", tags: ["World History", "WWI"], difficulty: "Hard" },
  { title: "World History: Russian Revolution 1917 - Causes, Bolshevik Rise & Lenin Era", tags: ["World History", "Russian Revolution"], difficulty: "Hard" },
  { title: "World History: USSR under Stalin - Post-Lenin Consolidation & Industrialization", tags: ["World History", "Russian Revolution"], difficulty: "Medium" },

  // Inter-War & World War II
  { title: "World History: The Great Depression (1929) - Causes & Global Economic Impact", tags: ["World History", "Inter-War Years"], difficulty: "Medium" },
  { title: "World History: Rise of Fascism in Italy (Mussolini) & Nazism in Germany (Hitler)", tags: ["World History", "Inter-War Years"], difficulty: "Hard" },
  { title: "World History: World War II - Causes, Axis vs Allies & Major Events", tags: ["World History", "WWII"], difficulty: "Hard" },
  { title: "World History: Aftermath of WWII, Decolonization & Creation of United Nations", tags: ["World History", "WWII"], difficulty: "Hard" },

  // Middle East & Cold War
  { title: "World History: Middle East Developments - Arab Nationalism & Israel-Palestine Conflict", tags: ["World History", "Middle East"], difficulty: "Hard" },
  { title: "World History: Cold War - Origin, Evolution & Major Blocs (1945-1953)", tags: ["World History", "Cold War"], difficulty: "Hard" },
  { title: "World History: Cold War Thaw, Nuclear Arms Race & Cuban Missile Crisis (1962)", tags: ["World History", "Cold War"], difficulty: "Hard" },

  // Post-1991 World & Political Philosophies
  { title: "World History: Collapse of Soviet Union (1991) & Rise of Uni-polar/Multi-polar World", tags: ["World History", "Post-1991"], difficulty: "Hard" },
  { title: "World History: European Integration - Timeline & Creation of European Union", tags: ["World History", "Europe"], difficulty: "Medium" },
  { title: "World History: Rise of China & Global Islamic Terrorism", tags: ["World History", "Post-1991"], difficulty: "Medium" },
  { title: "World History: Capitalism - Core Concepts, History & Modern Relevance", tags: ["World History", "Ideologies"], difficulty: "Medium" },
  { title: "World History: Socialism & Communism - Concepts, Manifestations & Comparisons", tags: ["World History", "Ideologies"], difficulty: "Hard" }
];

async function appendGS1WorldHistory() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS I Subject
    const subject = await Subject.findOne({ name: 'GS I' });
    if (!subject) {
      console.error('❌ Subject GS I not found. Please seed subjects first.');
      process.exit(1);
    }

    const topicsWithSubject = WORLD_HIST_TOPICS.map(topic => ({
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
    console.log(`✅ Appended ${created.length} World History topics to GS I!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error appending GS I World History:', err.message);
    process.exit(1);
  }
}

appendGS1WorldHistory();
