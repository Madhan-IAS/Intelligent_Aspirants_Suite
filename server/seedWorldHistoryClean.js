const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const rawWorldHistoryList = [
  "Beginning of Modern Age",
  "Disintegration of the Feudal System",
  "Renaissance",
  "Humanism",
  "Art and Architecture",
  "Literature",
  "Science",
  "Reformation",
  "Explorations, Discovery, Trade",
  "Colonization – Rise of Nation State",
  "The English Revolution",
  "French Revolution",
  "Causes",
  "The revolution in France",
  "France under Napoleon",
  "Impact of revolution",
  "Significance of revolution",
  "Nationalism in Europe",
  "Rise of the nation-state system",
  "Unification of Italy",
  "Unification of Germany",
  "Colonialism and Imperialism",
  "Colonialism",
  "The age of Imperialism (1870-1914)",
  "Imperialism in Asia",
  "Analysis of Colonialism",
  "Emergence of USA",
  "Foundation of American Colonies",
  "The Independence of United States of America",
  "The American Revolutionary War",
  "What was the impact of American Revolution?",
  "Political Effects of the Revolution",
  "How did the American Revolution influence the French Revolution?",
  "US Civil War",
  "Impact of Civil War on USA",
  "Global Impact of US Civil War",
  "Impact on India",
  "World War-I",
  "Major causes of the war",
  "Course of the war",
  "Analysis of major events of the war",
  "Consequences of World War I",
  "Aftermath of World War I",
  "League of Nations",
  "Russian Revolution",
  "Major events in pre-revolution Russia",
  "Causes",
  "Course of revolution",
  "Consequences",
  "Aftermath of the war",
  "Post-Lenin Russia",
  "Inter-War Years (1919 To 1939)",
  "The Great Depression- an economic perspective",
  "Rise of Fascism in Italy",
  "Rise of Nazism in Germany",
  "Soviet Union (USSR)",
  "World War-II",
  "Foundations of the war",
  "Course of the war",
  "Aftermath of war",
  "Analysis of the war",
  "Decolonization phase",
  "Development In Middle East",
  "Democratic reforms in Middle East",
  "Arab nationalism",
  "Israel",
  "Cold War",
  "Reasons",
  "Development of Cold War (1945-1953)",
  "To what extent was there a thaw after 1953?",
  "Nuclear Arms Race and the Cuban Missile Crisis (1962)",
  "Post Cold-War World",
  "Global issues since 1991",
  "Integration of Europe",
  "European integration–a timeline",
  "Rise of global Islamic terrorism",
  "Rise of China",
  "Communism, Socialism and Capitalism",
  "Capitalism (concept, types and example)",
  "Communism (concept, types, example)",
  "Relevance of capitalism in present era",
  "Socialism"
];

async function seedCleanWorldHistory() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let gs1 = await Subject.findOne({ name: 'GS I' });
    if (!gs1) {
      gs1 = await Subject.create({ name: 'GS I', description: 'History, Art & Culture, Geography, and Indian Society' });
    }

    // Delete old World History topics under GS I
    const deleteRes = await Topic.deleteMany({ subjectId: gs1._id, tags: 'World History' });
    console.log(`🗑️ Deleted ${deleteRes.deletedCount} old World History topics.`);

    // Deduplicate list
    const uniqueTitles = Array.from(new Set(rawWorldHistoryList.map(t => t.trim()))).filter(Boolean);

    const topicsToInsert = uniqueTitles.map(title => ({
      title,
      tags: ['World History', 'GS I'],
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
    console.log(`🎉 Successfully seeded ${inserted.length} clean World History topics under GS I!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding World History:', err);
    process.exit(1);
  }
}

seedCleanWorldHistory();
