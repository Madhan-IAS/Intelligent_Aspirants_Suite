/**
 * seedInterlinkages.js
 * 
 * Automatically seeds cross-dimensional SPECTRUM interlinkages between topics.
 * Maps subjectName → SPECTRUM dimension, then finds keyword overlaps across papers.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const Interlinkage = require('./models/Interlinkage');

// Map subjectName values to SPECTRUM dimensions
const SUBJECT_TO_DIMENSION = {
    // Society
    'Society': 'Society',
    'Social Issues': 'Society',
    'Social Justice': 'Society',
    'Sociology Paper I': 'Sociology',
    'Sociology Paper II': 'Sociology',
    // Polity & Governance
    'Polity': 'Polity & Governance',
    'Governance': 'Polity & Governance',
    'Constitution': 'Polity & Governance',
    // Economy
    'Economy': 'Economy',
    'Economic Development': 'Economy',
    'Infrastructure': 'Economy',
    // Culture & History
    'Art & Culture': 'Culture & History',
    'Ancient History': 'Culture & History',
    'Medieval History': 'Culture & History',
    'Modern History': 'Culture & History',
    'Post Independence': 'Culture & History',
    'World History': 'Culture & History',
    'Indian Culture': 'Culture & History',
    // Technology & Science
    'Science & Technology': 'Technology & Science',
    // International Relations
    'International Relations': 'International Relations',
    // Environment & Geography
    'Geography': 'Environment & Geography',
    'Physical Geography': 'Environment & Geography',
    'Human Geography': 'Environment & Geography',
    'Indian Geography': 'Environment & Geography',
    'Environment': 'Environment & Geography',
    'Disaster Management': 'Environment & Geography',
    'Ecology': 'Environment & Geography',
    'Biodiversity': 'Environment & Geography',
    // Ethics
    'Ethics': 'Ethics & Integrity',
    'Aptitude': 'Ethics & Integrity',
    'Integrity': 'Ethics & Integrity',
    // Internal Security
    'Internal Security': 'Polity & Governance',
};

// Common UPSC cross-cutting keywords that signal interlinkages
const CROSS_CUTTING_THEMES = [
    'agriculture', 'farmer', 'rural', 'urban', 'poverty', 'inequality',
    'climate', 'environment', 'pollution', 'sustainable', 'biodiversity',
    'governance', 'policy', 'reform', 'institution', 'administration',
    'technology', 'digital', 'innovation', 'cyber', 'artificial intelligence',
    'economy', 'growth', 'development', 'trade', 'fiscal', 'monetary',
    'health', 'education', 'welfare', 'nutrition', 'sanitation',
    'rights', 'justice', 'equality', 'gender', 'caste', 'tribe',
    'security', 'defence', 'border', 'terrorism', 'conflict',
    'migration', 'urbanization', 'globalization', 'demographic',
    'constitution', 'judiciary', 'parliament', 'federalism',
    'water', 'energy', 'resource', 'mineral', 'forest',
    'infrastructure', 'transport', 'communication',
    'international', 'bilateral', 'multilateral', 'diplomacy',
    'disaster', 'resilience', 'vulnerability',
    'ethics', 'integrity', 'accountability', 'transparency',
    'corruption', 'public service', 'civil service',
    'industry', 'manufacturing', 'employment', 'labour',
    'food', 'nutrition', 'hunger',
    'women', 'child', 'elderly', 'disability',
    'science', 'space', 'nuclear', 'biotechnology',
    'culture', 'heritage', 'tradition', 'religion',
    'media', 'press', 'communication',
];

function extractKeywords(text) {
    if (!text) return [];
    const lower = text.toLowerCase();
    return CROSS_CUTTING_THEMES.filter(kw => lower.includes(kw));
}

function getDimension(subjectName) {
    return SUBJECT_TO_DIMENSION[subjectName] || null;
}

function assessStrength(sharedKeywords) {
    if (sharedKeywords >= 3) return 'Strong';
    if (sharedKeywords >= 2) return 'Moderate';
    return 'Weak';
}

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear old interlinkages
        const cleared = await Interlinkage.deleteMany({});
        console.log(`🧹 Cleared ${cleared.deletedCount} existing interlinkages`);

        // Load all topics
        const allTopics = await Topic.find({}).select('title tags paper subjectName chapter');
        console.log(`📚 Loaded ${allTopics.length} topics`);

        // Build keyword index: topicId → keywords[]
        const topicKeywords = new Map();
        const topicDimensions = new Map();

        for (const topic of allTopics) {
            const titleKws = extractKeywords(topic.title);
            const chapterKws = extractKeywords(topic.chapter || '');
            const tagKws = (topic.tags || []).flatMap(t => extractKeywords(t));
            const allKws = [...new Set([...titleKws, ...chapterKws, ...tagKws])];
            topicKeywords.set(topic._id.toString(), allKws);
            topicDimensions.set(topic._id.toString(), getDimension(topic.subjectName));
        }

        // Build interlinkages — only across DIFFERENT dimensions
        const linksToInsert = [];
        const seenPairs = new Set();
        let skippedSameDimension = 0;

        for (let i = 0; i < allTopics.length; i++) {
            const source = allTopics[i];
            const sourceId = source._id.toString();
            const sourceKws = topicKeywords.get(sourceId);
            const sourceDim = topicDimensions.get(sourceId);

            if (!sourceDim || sourceKws.length === 0) continue;

            for (let j = i + 1; j < allTopics.length; j++) {
                const target = allTopics[j];
                const targetId = target._id.toString();
                const targetDim = topicDimensions.get(targetId);

                // Skip same dimension
                if (!targetDim || targetDim === sourceDim) {
                    skippedSameDimension++;
                    continue;
                }

                const targetKws = topicKeywords.get(targetId);
                if (targetKws.length === 0) continue;

                // Find shared keywords
                const shared = sourceKws.filter(kw => targetKws.includes(kw));
                if (shared.length < 2) continue; // Minimum 2 shared keywords for a connection

                const pairKey = [sourceId, targetId].sort().join('-');
                if (seenPairs.has(pairKey)) continue;
                seenPairs.add(pairKey);

                linksToInsert.push({
                    sourceTopicId: source._id,
                    targetTopicId: target._id,
                    dimension: targetDim, // The dimension of the target topic
                    strength: assessStrength(shared.length),
                    note: `Shared themes: ${shared.join(', ')}`
                });
            }

            // Progress log every 500 topics
            if (i > 0 && i % 500 === 0) {
                console.log(`  Processing topic ${i}/${allTopics.length} — ${linksToInsert.length} links found so far...`);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`  Total candidate links: ${linksToInsert.length}`);
        console.log(`  Skipped same-dimension pairs: ${skippedSameDimension}`);

        // Cap at reasonable amount and batch insert
        const MAX_LINKS = 15000;
        const toInsert = linksToInsert.length > MAX_LINKS
            ? linksToInsert.sort((a, b) => {
                const strengthOrder = { 'Strong': 0, 'Moderate': 1, 'Weak': 2 };
                return strengthOrder[a.strength] - strengthOrder[b.strength];
            }).slice(0, MAX_LINKS)
            : linksToInsert;

        if (toInsert.length > 0) {
            // Batch insert in chunks of 1000
            const CHUNK_SIZE = 1000;
            let inserted = 0;
            for (let c = 0; c < toInsert.length; c += CHUNK_SIZE) {
                const chunk = toInsert.slice(c, c + CHUNK_SIZE);
                await Interlinkage.insertMany(chunk, { ordered: false }).catch(err => {
                    // Ignore duplicate key errors
                    if (err.code !== 11000) throw err;
                });
                inserted += chunk.length;
                console.log(`  Inserted batch: ${inserted}/${toInsert.length}`);
            }
        }

        const finalCount = await Interlinkage.countDocuments();
        console.log(`\n🎉 SEEDING COMPLETE: ${finalCount} interlinkages in database`);

        // Show stats by dimension
        const dimStats = await Interlinkage.aggregate([
            { $group: { _id: '$dimension', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        console.log('\n📈 Interlinkages by SPECTRUM dimension:');
        dimStats.forEach(d => console.log(`  ${d._id}: ${d.count}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
