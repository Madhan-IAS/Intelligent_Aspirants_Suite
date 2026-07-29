/**
 * Seed Disaster Management Syllabus (GS III) Offline (Bypassing Gemini Quota)
 * Run: node seedDisasterManagementAsIs.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const CLEANED_TOPICS = [
  "Types of disasters",
  "India’s vulnerability profile",
  "Earthquakes",
  "Tsunamis",
  "Landslides",
  "Flood",
  "Drought",
  "Epidemics",
  "Nuclear Reactor explosion",
  "Dam collapse",
  "Gas Leakage",
  "Oil Spill",
  "Volcanic Eruption",
  "Forest fires",
  "Management of disasters",
  "Community management",
  "Government initiatives to tackle disasters",
  "National disaster management act, 2005",
  "Global framework for disaster risk reduction",
  "Disaster Insurance",
  "Role of media in disaster management",
  "Gender implications of disasters",
  "Disaster management cycle",
  "Role of NGOs in disaster management",
  "Pre disaster preparation",
  "Role of Science and Technology in Disaster Management",
  "Pandemic preparedness fund",
  "Disaster Induced Displacement",
  "Urban Flood Management (to tackle frequent floods)",
  "Disaster Risk Financing (G20)",
  "India’s increasing climate vulnerability demands urgent disaster preparedness",
  "India achieving Atmanirbharta in Disaster Management",
  "India’s Disaster Management Model through Turkiye’s case study",
  "India’s Disaster Management: Joshimath Crisis",
  "Prime Minister’s Ten Point Agenda on Disaster Risk Reduction",
  "The Sendai Framework For Disaster Risk Reduction",
  "Disaster Resilience- CDRI",
  "National Policy on disaster management"
];

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS III Subject
    const subject = await Subject.findOne({ name: 'GS III' });
    if (!subject) {
      console.error('❌ Subject GS III not found.');
      process.exit(1);
    }

    console.log(`Seeding ${CLEANED_TOPICS.length} pre-cleaned Disaster Management topics...`);

    // Delete any existing Disaster Management topics under GS III
    const deleteRes = await Topic.deleteMany({
      subjectId: subject._id,
      tags: 'Disaster Management'
    });
    console.log(`Deleted ${deleteRes.deletedCount} old Disaster Management topics.`);

    const topicsToInsert = CLEANED_TOPICS.map(title => ({
      title: title.trim(),
      tags: ["Disaster Management"],
      difficulty: "Medium",
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

    const inserted = await Topic.insertMany(topicsToInsert);
    console.log(`✅ Successfully seeded all ${inserted.length} Disaster Management topics!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
