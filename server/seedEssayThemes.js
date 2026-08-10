/**
 * seedEssayThemes.js — Seed UPSC essay themes with SPECTRUM dimension tags
 */
require('dotenv').config();
const mongoose = require('mongoose');
const EssayTheme = require('./models/EssayTheme');

const THEMES = [
    {
        title: 'Water disputes between States in federal India',
        category: 'Political',
        spectrumDimensions: ['Polity & Governance', 'Environment & Geography', 'Society'],
        sampleAngles: ['Constitutional framework (Article 262)', 'River water tribunals', 'Inter-state council mechanism', 'Environmental flow requirements', 'Cooperative federalism approach'],
        difficulty: 'Hard', year: 2024
    },
    {
        title: 'Artificial Intelligence: A Boon or a Bane for Governance',
        category: 'Science & Tech',
        spectrumDimensions: ['Technology & Science', 'Polity & Governance', 'Ethics & Integrity', 'Economy'],
        sampleAngles: ['AI in public service delivery', 'Ethical concerns and bias', 'Employment displacement', 'Digital India mission', 'Responsible AI frameworks'],
        difficulty: 'Medium'
    },
    {
        title: 'Not all who wander are lost',
        category: 'Philosophical',
        spectrumDimensions: ['Society', 'Culture & History', 'Ethics & Integrity'],
        sampleAngles: ['Journey of self-discovery', 'Exploration vs aimlessness', 'Historical explorers and scientists', 'Non-linear career paths', 'Administrative perspective on unconventional solutions'],
        difficulty: 'Medium'
    },
    {
        title: 'Climate change is not just an environmental issue, it is a development issue',
        category: 'Environment',
        spectrumDimensions: ['Environment & Geography', 'Economy', 'International Relations', 'Society', 'Technology & Science'],
        sampleAngles: ['Paris Agreement obligations', 'Climate justice and equity', 'Green economy transition', 'Agricultural impact', 'Migration and displacement', 'Renewable energy potential'],
        difficulty: 'Hard', year: 2023
    },
    {
        title: 'A society that has more justice is a society that needs less charity',
        category: 'Social',
        spectrumDimensions: ['Society', 'Polity & Governance', 'Ethics & Integrity', 'Economy'],
        sampleAngles: ['Social justice vs philanthropy', 'Welfare state model', 'Rawlsian theory of justice', 'Constitutional provisions for equality', 'Gandhian trusteeship'],
        difficulty: 'Hard'
    },
    {
        title: 'The enemy of good is the best',
        category: 'Philosophical',
        spectrumDimensions: ['Ethics & Integrity', 'Polity & Governance'],
        sampleAngles: ['Perfectionism vs pragmatism', 'Policy implementation challenges', 'Incremental reform', 'Administrative decision-making', 'Voltaire\'s maxim'],
        difficulty: 'Medium'
    },
    {
        title: 'Digital divide and inclusive growth',
        category: 'Economic',
        spectrumDimensions: ['Technology & Science', 'Economy', 'Society'],
        sampleAngles: ['Rural-urban divide', 'BharatNet project', 'Digital literacy', 'E-governance inclusion', 'Financial inclusion through fintech'],
        difficulty: 'Medium'
    },
    {
        title: 'Women empowerment: Issues and challenges',
        category: 'Social',
        spectrumDimensions: ['Society', 'Polity & Governance', 'Economy', 'Ethics & Integrity'],
        sampleAngles: ['Constitutional rights', 'Economic participation', 'Political representation', 'Social barriers', 'Legal frameworks', 'Education and health'],
        difficulty: 'Medium', year: 2022
    },
    {
        title: 'India\'s role in shaping the global order in the 21st century',
        category: 'Political',
        spectrumDimensions: ['International Relations', 'Economy', 'Technology & Science', 'Culture & History'],
        sampleAngles: ['G20 presidency', 'QUAD and Indo-Pacific', 'Soft power diplomacy', 'Tech leadership', 'Climate leadership', 'South-South cooperation'],
        difficulty: 'Hard'
    },
    {
        title: 'History is a great teacher, but has very few students',
        category: 'Philosophical',
        spectrumDimensions: ['Culture & History', 'Society', 'Ethics & Integrity', 'Polity & Governance'],
        sampleAngles: ['Lessons from partition', 'Economic crises patterns', 'Democratic backsliding globally', 'Pandemic preparedness', 'Civilizational wisdom'],
        difficulty: 'Medium'
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await EssayTheme.deleteMany({});
        console.log('Cleared existing essay themes');

        await EssayTheme.insertMany(THEMES);
        console.log(`Seeded ${THEMES.length} essay themes`);

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
