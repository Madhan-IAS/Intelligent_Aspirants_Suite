/**
 * Append Manual GS I Syllabus (Post-Independence Consolidation)
 * Run: node appendManualGS1PostIndependence.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const POST_IND_TOPICS = [
  // State Reorganization
  { title: "Post-Independence: Re-organisation of States & Constitutional Provisions", tags: ["Post-Independence", "Reorganization"], difficulty: "Medium" },
  { title: "Post-Independence: Accession of Princely States & Territorial Integration", tags: ["Post-Independence", "Integration"], difficulty: "Medium" },
  { title: "Post-Independence: Integration of French, Portuguese Territories & Sikkim", tags: ["Post-Independence", "Integration"], difficulty: "Medium" },
  { title: "Post-Independence: Rehabilitation of Refugees & Early Challenges", tags: ["Post-Independence", "Refugees"], difficulty: "Easy" },
  { title: "Post-Independence: Federal Crises, Regional Aspirations & Insurgencies", tags: ["Post-Independence", "Federalism"], difficulty: "Hard" },

  // Linguistic & Social Issues
  { title: "Post-Independence: Linguistic Regionalism & Language Policy of India", tags: ["Post-Independence", "Linguistic Issues"], difficulty: "Medium" },
  { title: "Post-Independence: Tribal Integration Policies, Issues & Status", tags: ["Post-Independence", "Tribal Issues"], difficulty: "Medium" },
  { title: "Post-Independence: Caste & Social Consolidation (Ambedkar Movement, SC Initiatives)", tags: ["Post-Independence", "Social Issues"], difficulty: "Medium" },
  { title: "Post-Independence: Issue of Manual Scavenging & Human Rights Emancipation", tags: ["Post-Independence", "Social Issues"], difficulty: "Easy" },
  { title: "Post-Independence: Secularism, Communalism Causes & Social Consolidation Impact", tags: ["Post-Independence", "Communalism"], difficulty: "Hard" },
  { title: "Post-Independence: Issue of Linguistic Minorities & Operational Inefficiencies", tags: ["Post-Independence", "Linguistic Issues"], difficulty: "Medium" },

  // Economic Development
  { title: "Post-Independence: Evolution of Economic Planning & Five-Year Plans", tags: ["Post-Independence", "Economy"], difficulty: "Hard" },
  { title: "Post-Independence: Land Reforms, Green Revolution & Post-Green Revolution Issues", tags: ["Post-Independence", "Agriculture"], difficulty: "Hard" },
  { title: "Post-Independence: Agrarian Movements & Agricultural Achievements since 1947", tags: ["Post-Independence", "Agriculture"], difficulty: "Medium" },
  { title: "Post-Independence: Industrial Development & Evolution of Public & Private Sectors", tags: ["Post-Independence", "Industry"], difficulty: "Medium" },
  { title: "Post-Independence: Industrial Policy Resolutions & Make in India Initiatives", tags: ["Post-Independence", "Industry"], difficulty: "Medium" },
  { title: "Post-Independence: New Economic Policy 1991 (LPG Reforms) & Economic Impact", tags: ["Post-Independence", "Economy"], difficulty: "Hard" },

  // Science, Tech & Skills
  { title: "Post-Independence: Science & Technology Policies & Institutional Frameworks", tags: ["Post-Independence", "S&T"], difficulty: "Medium" },
  { title: "Post-Independence: S&T in Pre-Reform vs Post-Reform Periods & Policy Initiatives", tags: ["Post-Independence", "S&T"], difficulty: "Hard" },
  { title: "Post-Independence: Skill Training & Skill India Development Agenda", tags: ["Post-Independence", "Development"], difficulty: "Easy" }
];

async function appendGS1PostIndependence() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS I Subject
    const subject = await Subject.findOne({ name: 'GS I' });
    if (!subject) {
      console.error('❌ Subject GS I not found. Please seed subjects first.');
      process.exit(1);
    }

    const topicsWithSubject = POST_IND_TOPICS.map(topic => ({
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
    console.log(`✅ Appended ${created.length} Post-Independence topics to GS I!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error appending GS I Post-Independence:', err.message);
    process.exit(1);
  }
}

appendGS1PostIndependence();
