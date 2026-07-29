/**
 * Parse "Full Syllabus of UPSC.pdf", split by section, and use Gemini to extract
 * a fully detailed, granular breakdown of GS I, II, III, and IV.
 * Run: node seedDetailedSyllabus.js
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

async function seedDetailed() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing.');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    console.log('Parsing PDF...');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    console.log(`Total lines in PDF: ${lines.length}`);

    // Split text based on inspected line numbers
    const gs1Text = lines.slice(0, 2210).join('\n');
    const gs2Text = lines.slice(2211, 3636).join('\n');
    const gs3Text = lines.slice(3637, 5438).join('\n');
    const gs4Text = lines.slice(5439).join('\n');

    console.log('Splits computed:');
    console.log(`- GS I:   ${gs1Text.length} chars`);
    console.log(`- GS II:  ${gs2Text.length} chars`);
    console.log(`- GS III: ${gs3Text.length} chars`);
    console.log(`- GS IV:  ${gs4Text.length} chars`);

    const ai = new GoogleGenAI({});

    // Helper to request topics for a single subject
    const extractSubjectTopics = async (subjectName, subjectText) => {
      console.log(`⏳ Requesting Gemini extraction for ${subjectName}...`);
      const prompt = `
      You are an expert UPSC curriculum planner.
      We have extracted the raw text content for ${subjectName} from the official syllabus PDF.
      Your task is to extract EVERY SINGLE granular chapter, topic, and subtopic mentioned in this text.
      Do not summarize, do not skip, and do not limit the count. Make it an extremely detailed, step-by-step checklist.

      Raw Text Content:
      ${subjectText}

      Please output a strictly valid JSON array of objects. Do not use markdown backticks or block wrappers.
      Each object must look like this:
      {
        "title": "<Concise, clear subtopic title (max 80 chars)>",
        "tags": ["<Sub-area tag 1>", "<Sub-area tag 2>"],
        "difficulty": "<Easy, Medium, or Hard>"
      }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text);
      console.log(`✅ Extracted ${parsed.length} detailed topics for ${subjectName}`);
      return parsed;
    };

    // Run parallel Gemini API requests for all 4 papers
    const [gs1Topics, gs2Topics, gs3Topics, gs4Topics] = await Promise.all([
      extractSubjectTopics('GS I', gs1Text),
      extractSubjectTopics('GS II', gs2Text),
      extractSubjectTopics('GS III', gs3Text),
      extractSubjectTopics('GS IV', gs4Text)
    ]);

    // Clear existing subjects and topics
    await Subject.deleteMany({});
    await Topic.deleteMany({});
    console.log('Cleared all subjects and topics in MongoDB.');

    const subjectsToCreate = [
      { name: 'GS I', desc: 'History, Art & Culture, Geography, and Indian Society', source: gs1Topics },
      { name: 'GS II', desc: 'Governance, Constitution, Polity, Social Justice, and International Relations', source: gs2Topics },
      { name: 'GS III', desc: 'Technology, Economic Development, Bio-diversity, Environment, Security, and Disaster Management', source: gs3Topics },
      { name: 'GS IV', desc: 'Ethics, Integrity, and Aptitude', source: gs4Topics },
      { name: 'Sociology', desc: 'Sociology Optional: Paper I and Paper II', source: [] } // Leave Sociology empty for now
    ];

    for (const sub of subjectsToCreate) {
      const subjectDoc = await Subject.create({
        name: sub.name,
        description: sub.desc
      });
      console.log(`📚 Created Subject: ${sub.name}`);

      if (sub.source.length > 0) {
        const topicsToInsert = sub.source.map(topic => ({
          title: topic.title,
          tags: topic.tags || [sub.name],
          difficulty: topic.difficulty || 'Medium',
          subjectId: subjectDoc._id,
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

        const created = await Topic.insertMany(topicsToInsert);
        console.log(`   └ Seeded ${created.length} granular subtopics.`);
      } else {
        console.log(`   └ Left empty (to be seeded later).`);
      }
    }

    console.log('\n🎉 Fully detailed UPSC GS syllabus successfully seeded from PDF to database!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding detailed syllabus:', error);
    process.exit(1);
  }
}

seedDetailed();
