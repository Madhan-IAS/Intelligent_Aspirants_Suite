/**
 * Parse "Full Syllabus of UPSC.pdf" using pdf-parse and extract
 * structured GS topics using the Gemini API.
 * Run: node seedSyllabusFromPDF.js
 */
const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');

const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

// Fallback Sociology topics (in case PDF does not contain Sociology optional syllabus)
const STANDARD_SOCIOLOGY_TOPICS = [
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
];

async function seedFromPDF() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY environment variable is missing.');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    console.log(`Parsing PDF file: ${pdfPath}`);
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const pdfText = result.text;
    await parser.destroy();

    console.log(`Extracted ${pdfText.length} characters from PDF. Consulting Gemini API...`);

    const ai = new GoogleGenAI({});
    const prompt = `
    You are an expert UPSC syllabus organizer.
    We have extracted the text content of a student's UPSC syllabus PDF file.
    Your task is to analyze this syllabus text and organize it into a structured list of chapters/topics for the following subjects:
    - "GS I" (History, Art & Culture, Indian Society, Geography)
    - "GS II" (Constitution, Polity, Governance, Social Justice, International Relations)
    - "GS III" (Economy, Agriculture, Science & Tech, Environment, Security, Disaster Management)
    - "GS IV" (Ethics, Integrity, Aptitude, Case Studies)
    - "Sociology" (Optional Paper I & II - only if explicitly present in the text)

    Syllabus Text:
    ${pdfText}

    Please output a strictly valid JSON object where the keys are the exact subject names ("GS I", "GS II", "GS III", "GS IV", "Sociology").
    The value for each key must be an array of objects representing the syllabus chapters/topics. Do not use markdown backticks or block wrappers.
    Example Structure:
    {
      "GS I": [
        { "title": "Ancient History: Indus Valley Civilization", "tags": ["Ancient History", "GS I"], "difficulty": "Medium" },
        ...
      ],
      ...
    }

    Note: Ensure each topic has a concise "title" (no more than 70 characters), a "tags" array of 1-3 tags, and a "difficulty" ("Easy", "Medium", or "Hard"). Limit to around 15-25 main topics per subject so that it remains high-yield and structured.
    `;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedSyllabus = JSON.parse(aiResponse.text);
    console.log('Gemini generated subject keys:', Object.keys(parsedSyllabus));

    // Clear existing subjects and topics
    await Subject.deleteMany({});
    await Topic.deleteMany({});
    console.log('Cleared existing subjects and topics in MongoDB.');

    // Save Subjects and Topics
    const subjectsToCreate = ['GS I', 'GS II', 'GS III', 'GS IV', 'Sociology'];
    const descriptions = {
      'GS I': 'History, Art & Culture, Geography, and Indian Society',
      'GS II': 'Governance, Constitution, Polity, Social Justice, and International Relations',
      'GS III': 'Technology, Economic Development, Bio-diversity, Environment, Security, and Disaster Management',
      'GS IV': 'Ethics, Integrity, and Aptitude',
      'Sociology': 'Sociology Optional: Paper I (Fundamentals) and Paper II (Indian Society)'
    };

    for (const name of subjectsToCreate) {
      const subject = await Subject.create({
        name,
        description: descriptions[name]
      });
      console.log(`📚 Created Subject: ${subject.name}`);

      let topicsSource = parsedSyllabus[name];
      if (name === 'Sociology' && (!topicsSource || topicsSource.length === 0)) {
        console.log('⚠️ Sociology optional not found in PDF. Using standard Sociology optional syllabus instead.');
        topicsSource = STANDARD_SOCIOLOGY_TOPICS;
      }

      if (topicsSource && topicsSource.length > 0) {
        const topicsWithSubject = topicsSource.map(topic => ({
          title: topic.title,
          tags: topic.tags || [name],
          difficulty: topic.difficulty || 'Medium',
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
        console.log(`   └ Seeded ${created.length} topics from syllabus.`);
      }
    }

    console.log('\n✅ UPSC Syllabus successfully parsed and seeded from PDF to database!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error processing syllabus from PDF:', error);
    process.exit(1);
  }
}

seedFromPDF();
