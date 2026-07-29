/**
 * seedSociology.js
 * 
 * Clears and seeds the complete Sociology optional syllabus (Paper I and Paper II)
 * into MongoDB.
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const paper1Topics = [
  "Modernity and social changes in Europe and emergence of Sociology.",
  "Scope of the subject and comparison with other social sciences.",
  "Sociology and common sense.",
  "Science, scientific method, and critique.",
  "Major theoretical strands of research methodology.",
  "Positivism and its critique.",
  "Fact value and objectivity.",
  "Non-positivist methodologies.",
  "Qualitative and quantitative methods.",
  "Techniques of data collection.",
  "Variables, sampling, hypothesis, reliability, and validity.",
  "Karl Marx - Historical materialism, mode of production, alienation, class struggle.",
  "Emile Durkheim - Division of labour, social fact, suicide, religion and society.",
  "Max Weber - Social action, ideal types, authority, bureaucracy, protestant ethic and the spirit of capitalism.",
  "Talcott Parsons - Social system, pattern variables.",
  "Robert K. Merton - Latent and manifest functions, conformity and deviance, reference groups.",
  "Mead - Self and identity.",
  "Concepts - equality, inequality, hierarchy, exclusion, poverty, and deprivation.",
  "Theories of social stratification - Structural functionalist theory, Marxist theory, Weberian theory.",
  "Dimensions - Social stratification of class, status groups, gender, ethnicity and race.",
  "Social mobility - open and closed systems, types of mobility, sources and causes of mobility.",
  "Social organization of work in different types of society - slave society, feudal society, industrial capitalist society.",
  "Formal and informal organization of work.",
  "Labour and society.",
  "Sociological theories of power.",
  "Power elite, bureaucracy, pressure groups and political parties.",
  "Nation, state, citizenship, democracy, civil society, ideology.",
  "Protest, agitation, social movements, collective action, revolution.",
  "Sociological theories of religion.",
  "Types of religious practices: animism, monism, pluralism, sects, cults.",
  "Religion in modern society: religion and science, secularization, religious revivalism, fundamentalism.",
  "Family, household, marriage.",
  "Types and forms of family.",
  "Lineage and descent.",
  "Patriarchy and sexual division of labour.",
  "Contemporary trends.",
  "Sociological theories of social change.",
  "Development and dependency.",
  "Agents of social change.",
  "Education and social change.",
  "Science, technology, and social change."
];

const paper2Topics = [
  "Indology (G.S. Ghurye).",
  "Structural functionalism (M. N. Srinivas).",
  "Marxist sociology (A. R. Desai).",
  "Social background of Indian nationalism.",
  "Modernization of Indian tradition.",
  "Protests and movements during the colonial period.",
  "Social reforms.",
  "The idea of Indian village and village studies.",
  "Agrarian social structure— evolution of land tenure system, land reforms.",
  "Perspectives on the study of caste systems: G. S. Ghurye, M. N. Srinivas, Louis Dumont, Andre Beteille.",
  "Features of caste system.",
  "Untouchability-forms and perspectives.",
  "Definitional problems.",
  "Geographical spread.",
  "Colonial policies and tribes.",
  "Issues of integration and autonomy.",
  "Agrarian class structure.",
  "Industrial class structure.",
  "Middle classes in India.",
  "Lineage and descent in India.",
  "Types of kinship systems.",
  "Family and marriage in India.",
  "Household dimensions of the family.",
  "Patriarchy, entitlements, and sexual division of labour.",
  "Religious communities in India.",
  "Problems of religious minorities.",
  "Idea of development planning and mixed economy.",
  "Constitution, law, and social change.",
  "Education and social change.",
  "Programmes of rural development, Community Development Programme, cooperatives, poverty alleviation schemes.",
  "Green revolution and social change.",
  "Changing modes of production in Indian agriculture.",
  "Problems of rural labour, bondage, migration.",
  "Evolution of modern industry in India.",
  "Growth of urban settlements in India.",
  "Working class: structure, growth, class mobilization.",
  "Informal sector, child labour.",
  "Slums and deprivation in urban areas.",
  "Nation, democracy and citizenship.",
  "Political parties, pressure groups, social and political elite.",
  "Regionalism and decentralization of power.",
  "Secularization.",
  "Peasants and farmers' movements.",
  "Women’s movement.",
  "Backward classes & Dalit movements.",
  "Environmental movements.",
  "Ethnicity and Identity movements.",
  "Population size, growth, composition and distribution.",
  "Components of population growth: birth, death, migration.",
  "Population Policy and family planning.",
  "Emerging issues: ageing, sex ratios, child and infant mortality, reproductive health.",
  "Crisis of development: displacement, environmental problems and sustainability.",
  "Poverty, deprivation and inequalities.",
  "Violence against women.",
  "Caste conflicts.",
  "Ethnic conflicts, communalism, religious revivalism.",
  "Illiteracy and disparities in education."
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    let sociologySubject = await Subject.findOne({ name: 'Sociology' });
    if (!sociologySubject) {
      console.log('Sociology subject not found, creating it...');
      sociologySubject = await Subject.create({ name: 'Sociology', description: 'Sociology Optional Subject' });
    }

    const subjectId = sociologySubject._id;

    // Clear existing sociology topics
    const deleteRes = await Topic.deleteMany({ subjectId });
    console.log(`Deleted ${deleteRes.deletedCount} existing Sociology topics.`);

    const topicsToInsert = [];

    paper1Topics.forEach(title => {
      topicsToInsert.push({
        title,
        tags: ['Sociology Paper I', 'Sociology'],
        difficulty: 'Medium',
        subjectId,
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
      });
    });

    paper2Topics.forEach(title => {
      topicsToInsert.push({
        title,
        tags: ['Sociology Paper II', 'Sociology'],
        difficulty: 'Medium',
        subjectId,
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
      });
    });

    const inserted = await Topic.insertMany(topicsToInsert);
    console.log(`✅ Successfully seeded ${inserted.length} Sociology topics into MongoDB!`);
    console.log(`  - Sociology Paper I: ${paper1Topics.length} topics`);
    console.log(`  - Sociology Paper II: ${paper2Topics.length} topics`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
