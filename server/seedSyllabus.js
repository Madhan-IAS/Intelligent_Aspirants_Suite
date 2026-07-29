/**
 * Seed standard UPSC CSE Syllabus (GS I, II, III, IV and Sociology Optional)
 * Run: node seedSyllabus.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const SYLLABUS_DATA = {
  'GS I': {
    description: 'History, Art & Culture, Geography, and Indian Society',
    topics: [
      { title: 'Art & Culture: Ancient to Modern Times', tags: ['Art & Culture', 'History'], difficulty: 'Medium' },
      { title: 'Modern Indian History: Mid-18th Century to Present', tags: ['Modern History'], difficulty: 'Hard' },
      { title: 'Freedom Struggle: Stages & Key Contributors', tags: ['Modern History', 'Freedom Struggle'], difficulty: 'Hard' },
      { title: 'Post-Independence Consolidation & Reorganization', tags: ['Modern History', 'Post-Independence'], difficulty: 'Medium' },
      { title: 'World History: Industrial Revolution & World Wars', tags: ['World History'], difficulty: 'Hard' },
      { title: 'Salient Features of Indian Society & Diversity', tags: ['Indian Society'], difficulty: 'Easy' },
      { title: 'Role of Women & Women Organizations', tags: ['Indian Society', 'Social Issues'], difficulty: 'Easy' },
      { title: 'Effects of Globalization on Indian Society', tags: ['Indian Society', 'Globalization'], difficulty: 'Medium' },
      { title: 'Social Empowerment, Communalism, Regionalism, Secularism', tags: ['Indian Society', 'Social Issues'], difficulty: 'Medium' },
      { title: 'Salient Features of World Physical Geography', tags: ['Geography', 'Physical Geography'], difficulty: 'Hard' },
      { title: 'Distribution of Key Natural Resources Across World', tags: ['Geography', 'Resources'], difficulty: 'Medium' },
      { title: 'Geophysical Phenomena: Earthquakes, Tsunamis, Volcanism, Cyclones', tags: ['Geography', 'Geophysical'], difficulty: 'Hard' }
    ]
  },
  'GS II': {
    description: 'Governance, Constitution, Polity, Social Justice, and International Relations',
    topics: [
      { title: 'Indian Constitution: Evolution, Features, Amendments, Basic Structure', tags: ['Polity', 'Constitution'], difficulty: 'Hard' },
      { title: 'Functions & Responsibilities of the Union and States', tags: ['Polity', 'Federalism'], difficulty: 'Hard' },
      { title: 'Separation of Powers & Dispute Redressal Mechanisms', tags: ['Polity', 'Governance'], difficulty: 'Medium' },
      { title: 'Comparison of Indian Constitutional Scheme with Other Countries', tags: ['Polity', 'Comparison'], difficulty: 'Hard' },
      { title: 'Parliament & State Legislatures: Structure, Conduct of Business', tags: ['Polity', 'Legislature'], difficulty: 'Medium' },
      { title: 'Executive & Judiciary: Structure, Organization & Functioning', tags: ['Polity', 'Judiciary'], difficulty: 'Medium' },
      { title: 'Salient Features of Representation of People Act', tags: ['Polity', 'Elections'], difficulty: 'Hard' },
      { title: 'Constitutional, Statutory, Regulatory & Quasi-Judicial Bodies', tags: ['Polity', 'Bodies'], difficulty: 'Medium' },
      { title: 'Government Policies & Interventions for Development', tags: ['Governance', 'Policies'], difficulty: 'Easy' },
      { title: 'Welfare Schemes for Vulnerable Sections (Centre & States)', tags: ['Social Justice', 'Schemes'], difficulty: 'Medium' },
      { title: 'Issues Relating to Development of Health, Education, Human Resources', tags: ['Social Justice', 'HR'], difficulty: 'Medium' },
      { title: 'Issues Relating to Poverty and Hunger', tags: ['Social Justice', 'Poverty'], difficulty: 'Easy' },
      { title: 'Important Aspects of Governance, Transparency & Accountability', tags: ['Governance', 'E-Gov'], difficulty: 'Medium' },
      { title: 'Role of Civil Services in a Democracy', tags: ['Governance', 'Civil Services'], difficulty: 'Medium' },
      { title: 'India and its Neighborhood Relations', tags: ['IR', 'Neighborhood'], difficulty: 'Medium' },
      { title: 'Bilateral, Regional & Global Groupings involving India', tags: ['IR', 'Groupings'], difficulty: 'Hard' },
      { title: 'Effect of Policies of Developed Countries on Indias Interests', tags: ['IR'], difficulty: 'Hard' },
      { title: 'Important International Institutions & Agencies', tags: ['IR', 'Agencies'], difficulty: 'Easy' }
    ]
  },
  'GS III': {
    description: 'Technology, Economic Development, Bio-diversity, Environment, Security, and Disaster Management',
    topics: [
      { title: 'Indian Economy: Mobilization of Resources, Growth & Employment', tags: ['Economy', 'Growth'], difficulty: 'Hard' },
      { title: 'Inclusive Growth & Issues Arising From It', tags: ['Economy', 'Growth'], difficulty: 'Easy' },
      { title: 'Government Budgeting & Fiscal Policy', tags: ['Economy', 'Budget'], difficulty: 'Hard' },
      { title: 'Major Cropping Patterns, Irrigation Systems & Farm Subsidies', tags: ['Agriculture', 'Economy'], difficulty: 'Hard' },
      { title: 'PDS: Objectives, Limitations, Buffer Stocks & Food Security', tags: ['Agriculture', 'PDS'], difficulty: 'Medium' },
      { title: 'Food Processing & Allied Industries in India', tags: ['Economy', 'Food Processing'], difficulty: 'Medium' },
      { title: 'Land Reforms in India', tags: ['Agriculture', 'Land Reforms'], difficulty: 'Medium' },
      { title: 'Effects of Liberalization on the Economy & Industrial Policy', tags: ['Economy', 'Liberalization'], difficulty: 'Medium' },
      { title: 'Infrastructure: Energy, Ports, Roads, Airports, Railways', tags: ['Economy', 'Infrastructure'], difficulty: 'Medium' },
      { title: 'Investment Models (PPP, BOT, etc.)', tags: ['Economy', 'Investment'], difficulty: 'Hard' },
      { title: 'Science & Technology: Indigenization of Technology', tags: ['S&T', 'Technology'], difficulty: 'Medium' },
      { title: 'Awareness in IT, Space, Computers, Robotics, Nano-tech, Bio-tech', tags: ['S&T', 'Emerging Tech'], difficulty: 'Hard' },
      { title: 'Conservation, Environmental Pollution & Degradation, EIA', tags: ['Environment', 'EIA'], difficulty: 'Medium' },
      { title: 'Disaster and Disaster Management', tags: ['Disasters', 'Management'], difficulty: 'Medium' },
      { title: 'Linkages Between Development and Spread of Extremism', tags: ['Security', 'Extremism'], difficulty: 'Medium' },
      { title: 'Role of External State & Non-State Actors in Internal Security', tags: ['Security', 'External Threat'], difficulty: 'Hard' },
      { title: 'Challenges to Internal Security Through Communication Networks & Cyber Security', tags: ['Security', 'Cyber'], difficulty: 'Hard' },
      { title: 'Security Forces & Agencies and Their Mandates', tags: ['Security', 'Forces'], difficulty: 'Easy' }
    ]
  },
  'GS IV': {
    description: 'Ethics, Integrity, and Aptitude',
    topics: [
      { title: 'Ethics & Human Interface: Essence, Determinants & Consequences', tags: ['Ethics', 'Values'], difficulty: 'Medium' },
      { title: 'Attitude: Content, Structure, Function, Influence on Behavior', tags: ['Ethics', 'Attitude'], difficulty: 'Medium' },
      { title: 'Aptitude & Foundational Values for Civil Services', tags: ['Ethics', 'Aptitude'], difficulty: 'Hard' },
      { title: 'Emotional Intelligence: Concept, Utilities & Administration Application', tags: ['Ethics', 'EI'], difficulty: 'Medium' },
      { title: 'Contributions of Moral Thinkers and Philosophers (India & World)', tags: ['Ethics', 'Thinkers'], difficulty: 'Hard' },
      { title: 'Public/Civil Service Values and Ethics in Public Administration', tags: ['Ethics', 'Governance'], difficulty: 'Hard' },
      { title: 'Probity in Governance: Concept of Public Service & Transparency', tags: ['Ethics', 'Probity'], difficulty: 'Medium' },
      { title: 'Ethics Case Studies', tags: ['Ethics', 'Case Studies'], difficulty: 'Hard' }
    ]
  },
  'Sociology': {
    description: 'Sociology Optional: Paper I (Fundamentals) and Paper II (Indian Society)',
    topics: [
      { title: 'Sociology Optional: The Discipline & Relation with Other Sciences', tags: ['Sociology Paper I', 'Discipline'], difficulty: 'Easy' },
      { title: 'Sociology Optional: Sociology as Science, Research Methods & Analysis', tags: ['Sociology Paper I', 'Research Methods'], difficulty: 'Hard' },
      { title: 'Sociology Optional: Karl Marx (Historical Materialism, Alienation, Class Struggle)', tags: ['Sociology Paper I', 'Marx'], difficulty: 'Hard' },
      { title: 'Sociology Optional: Emile Durkheim (Division of Labour, Suicide, Religion)', tags: ['Sociology Paper I', 'Durkheim'], difficulty: 'Hard' },
      { title: 'Sociology Optional: Max Weber (Social Action, Authority, Protestant Ethic)', tags: ['Sociology Paper I', 'Weber'], difficulty: 'Hard' },
      { title: 'Sociology Optional: Talcott Parsons & Robert K Merton (Functionalism)', tags: ['Sociology Paper I', 'Parsons', 'Merton'], difficulty: 'Medium' },
      { title: 'Sociology Optional: Mead & Symbolic Interactionism', tags: ['Sociology Paper I', 'Mead'], difficulty: 'Medium' },
      { title: 'Sociology Optional: Stratification, Equality, Exclusion, Mobility', tags: ['Sociology Paper I', 'Stratification'], difficulty: 'Hard' },
      { title: 'Sociology Optional: Work & Economic Life (Pre-industrial, Formal/Informal)', tags: ['Sociology Paper I', 'Economy'], difficulty: 'Medium' },
      { title: 'Sociology Optional: Politics & Society (Power, Nation, State, Protest)', tags: ['Sociology Paper I', 'Politics'], difficulty: 'Medium' },
      { title: 'Sociology Optional: Religion & Society (Theories, Types, Secularization)', tags: ['Sociology Paper I', 'Religion'], difficulty: 'Medium' },
      { title: 'Sociology Optional: Systems of Kinship (Family, Marriage, Gender)', tags: ['Sociology Paper I', 'Kinship'], difficulty: 'Easy' },
      { title: 'Sociology Optional: Social Change in Modern Society (Theories, Development)', tags: ['Sociology Paper I', 'Social Change'], difficulty: 'Medium' },
      { title: 'Sociology Optional: Introducing Indian Society (Indology, Structural-Functionalism)', tags: ['Sociology Paper II', 'Indian Society'], difficulty: 'Medium' },
      { title: 'Sociology Optional: Caste System, Tribes, Social Classes in India', tags: ['Sociology Paper II', 'Caste'], difficulty: 'Hard' },
      { title: 'Sociology Optional: Agrarian Social Structure & Land Reforms in India', tags: ['Sociology Paper II', 'Agrarian'], difficulty: 'Medium' },
      { title: 'Sociology Optional: Social Movements in Modern India', tags: ['Sociology Paper II', 'Movements'], difficulty: 'Hard' },
      { title: 'Sociology Optional: Population Dynamics & Challenges in India', tags: ['Sociology Paper II', 'Demographics'], difficulty: 'Easy' }
    ]
  }
};

async function seedSyllabus() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing subjects and topics first
    await Subject.deleteMany({});
    await Topic.deleteMany({});
    console.log('Cleared existing subjects and topics.\n');

    for (const [subjectName, subjectInfo] of Object.entries(SYLLABUS_DATA)) {
      // 1. Create Subject
      const subject = await Subject.create({
        name: subjectName,
        description: subjectInfo.description
      });
      console.log(`📚 Created Subject: ${subject.name}`);

      // 2. Prepare and insert topics under this subject
      const topicsWithSubject = subjectInfo.topics.map(topic => ({
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

      const createdTopics = await Topic.insertMany(topicsWithSubject);
      console.log(`   └ Seeded ${createdTopics.length} topics.`);
    }

    console.log('\n✅ UPSC CSE & Sociology syllabus successfully seeded to the database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding syllabus:', err.message);
    process.exit(1);
  }
}

seedSyllabus();
