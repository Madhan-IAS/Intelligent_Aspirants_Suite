/**
 * seedSyllabusStrictlyAsIs.js
 * 
 * Programmatically parses "Full Syllabus of UPSC.pdf" using coordinate-aware
 * PDF parsing, extracts all 3,454 checkbox topics in physical column reading order,
 * categorizes them strictly by target partitions, and seeds them into MongoDB.
 * Leaves the Sociology optional topics completely untouched.
 * 
 * Run: node seedSyllabusStrictlyAsIs.js
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Get Subjects
    const subjects = await Subject.find({}).lean();
    const subjectMap = {};
    subjects.forEach(s => { subjectMap[s.name] = s._id; });

    const gs1Id = subjectMap['GS I'];
    const gs2Id = subjectMap['GS II'];
    const gs3Id = subjectMap['GS III'];
    const gs4Id = subjectMap['GS IV'];

    if (!gs1Id || !gs2Id || !gs3Id || !gs4Id) {
      console.error('❌ One or more GS subjects are missing in MongoDB.');
      process.exit(1);
    }

    // 2. Parse PDF dynamically with pdfjs-dist
    console.log('Loading pdfjs-dist...');
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    console.log(`Parsing PDF: ${pdfPath}`);
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    let docTextLines = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const width = viewport.width;
      const textContent = await page.getTextContent();
      const items = textContent.items;

      const divider = width / 2;
      const leftItems = [];
      const rightItems = [];

      items.forEach(item => {
        if (!item.str || item.str.trim() === '') return;
        const x = item.transform[4];
        if (x < divider) {
          leftItems.push(item);
        } else {
          rightItems.push(item);
        }
      });

      const sortFn = (a, b) => {
        const yA = a.transform[5];
        const yB = b.transform[5];
        if (Math.abs(yA - yB) < 5) {
          return a.transform[4] - b.transform[4];
        }
        return yB - yA;
      };

      leftItems.sort(sortFn);
      rightItems.sort(sortFn);

      const getLines = (columnItems) => {
        const lines = [];
        let currentY = null;
        let currentLineItems = [];

        columnItems.forEach(item => {
          const y = item.transform[5];
          if (currentY === null) {
            currentY = y;
            currentLineItems.push(item);
          } else if (Math.abs(currentY - y) < 5) {
            currentLineItems.push(item);
          } else {
            currentLineItems.sort((a, b) => a.transform[4] - b.transform[4]);
            lines.push(currentLineItems.map(it => it.str).join(' '));
            currentY = y;
            currentLineItems = [item];
          }
        });

        if (currentLineItems.length > 0) {
          currentLineItems.sort((a, b) => a.transform[4] - b.transform[4]);
          lines.push(currentLineItems.map(it => it.str).join(' '));
        }

        return lines;
      };

      const leftLines = getLines(leftItems);
      const rightLines = getLines(rightItems);
      docTextLines = docTextLines.concat(leftLines).concat(rightLines);
    }

    console.log(`Reconstructed ${docTextLines.length} text lines from PDF.`);

    // 3. Extract all checkbox topics
    const extractedTopics = [];
    let i = 0;
    while (i < docTextLines.length) {
      const line = docTextLines[i].trim();

      if (line.includes(String.fromCharCode(61603))) {
        let title = line.replace(String.fromCharCode(61603), '')
                         .replace(/\u0004/g, '')
                         .replace(/\u0014/g, '')
                         .replace(/\t/g, ' ')
                         .trim();

        let nextIdx = i + 1;
        while (nextIdx < docTextLines.length) {
          const nextL = docTextLines[nextIdx].trim();
          if (nextL.length === 0) break;
          if (nextL.includes(String.fromCharCode(61603))) break;

          // Break if we hit a capitalized section header
          if (nextL.length > 4 && nextL.length < 50 && nextL === nextL.toUpperCase() && !nextL.includes('')) {
            break;
          }

          if (nextL.includes('UPSC SYLLABUS') || nextL.includes('www.iasscore.in') || nextL.match(/^\d+$/)) {
            nextIdx++;
            continue;
          }
          title += ' ' + nextL;
          nextIdx++;
        }
        title = title.replace(/\s+/g, ' ').trim();
        if (title.length > 0) {
          extractedTopics.push(title);
        }
        i = nextIdx;
      } else {
        i++;
      }
    }

    console.log(`Extracted ${extractedTopics.length} total checkbox topics from PDF.`);
    if (extractedTopics.length !== 3454) {
      console.warn(`⚠️ Warning: Extracted count is ${extractedTopics.length}, expected 3454.`);
    }

    // 4. Define our target partitions with counts
    const partitions = [
      { name: 'Ancient History', count: 76, subjectId: gs1Id, tags: ['Ancient History', 'GS I'] },
      { name: 'Medieval History', count: 121, subjectId: gs1Id, tags: ['Medieval History', 'GS I'] },
      { name: 'Modern History', count: 55, subjectId: gs1Id, tags: ['Modern History', 'GS I'] },
      { name: 'Post-Independence Consolidation', count: 43, subjectId: gs1Id, tags: ['Post-Independence Consolidation', 'GS I'] },
      { name: 'World History', count: 58, subjectId: gs1Id, tags: ['World History', 'GS I'] },
      { name: 'Indian Culture', count: 106, subjectId: gs1Id, tags: ['Indian Culture', 'GS I'] },
      { name: 'Physical Geography', count: 331, subjectId: gs1Id, tags: ['Physical Geography', 'GS I'] },
      { name: 'Physical Geography of India', count: 33, subjectId: gs1Id, tags: ['Physical Geography of India', 'GS I'] },
      { name: 'Human Geography', count: 53, subjectId: gs1Id, tags: ['Human Geography', 'GS I'] },
      { name: 'Economic Geography', count: 186, subjectId: gs1Id, tags: ['Economic Geography', 'GS I'] },
      { name: 'Indian Society', count: 52, subjectId: gs1Id, tags: ['Indian Society', 'GS I'] },
      
      { name: 'Polity', count: 392, subjectId: gs2Id, tags: ['Polity', 'GS II'] },
      { name: 'Governance', count: 194, subjectId: gs2Id, tags: ['Governance', 'GS II'] },
      { name: 'Social Justice', count: 181, subjectId: gs2Id, tags: ['Social Justice', 'GS II'] },
      { name: 'International Relations', count: 156, subjectId: gs2Id, tags: ['International Relations', 'GS II'] },
      
      { name: 'Indian Economy', count: 392, subjectId: gs3Id, tags: ['Indian Economy', 'GS III'] },
      { name: 'Agriculture', count: 122, subjectId: gs3Id, tags: ['Agriculture', 'GS III'] },
      { name: 'Environment & Ecology', count: 201, subjectId: gs3Id, tags: ['Environment & Ecology', 'GS III'] },
      { name: 'Science & Technology', count: 187, subjectId: gs3Id, tags: ['Science & Technology', 'GS III'] },
      { name: 'Disaster Management', count: 71, subjectId: gs3Id, tags: ['Disaster Management', 'GS III'] },
      { name: 'Internal Security', count: 124, subjectId: gs3Id, tags: ['Internal Security', 'GS III'] },
      
      { name: 'Ethics, Integrity & Aptitude (GS-IV)', count: null, subjectId: gs4Id, tags: ['Ethics, Integrity & Aptitude (GS-IV)', 'GS IV'] } // Remaining leftovers
    ];

    // 5. Partition topics and map to MongoDB schema structure
    const processedTopics = [];
    let currentIdx = 0;

    partitions.forEach(part => {
      const count = part.count !== null ? part.count : (extractedTopics.length - currentIdx);
      const slicedTitles = extractedTopics.slice(currentIdx, currentIdx + count);

      slicedTitles.forEach(title => {
        let difficulty = 'Medium';
        if (part.name === 'Ethics, Integrity & Aptitude (GS-IV)') {
          if (title.toLowerCase().includes('case') || title.toLowerCase().includes('studies')) {
            difficulty = 'Hard';
          }
        }

        processedTopics.push({
          title,
          tags: part.tags,
          difficulty,
          subjectId: part.subjectId,
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

      console.log(`Mapped ${slicedTitles.length} topics to section: ${part.name}`);
      currentIdx += count;
    });

    console.log(`Total mapped topics for DB: ${processedTopics.length}`);

    // 6. Delete existing topics for GS I, GS II, GS III, and GS IV
    const subjectsToClear = [gs1Id, gs2Id, gs3Id, gs4Id];
    const deleteRes = await Topic.deleteMany({ subjectId: { $in: subjectsToClear } });
    console.log(`Cleared ${deleteRes.deletedCount} existing topics from GS I-IV.`);

    // 7. Insert new topics
    const inserted = await Topic.insertMany(processedTopics);
    console.log(`✅ Successfully seeded ${inserted.length} topics into MongoDB!`);

    // 8. Verify database counts
    const totalCount = await Topic.countDocuments({});
    console.log(`\nNew total topics in DB (including Sociology): ${totalCount}`);

    const subjectsList = ['GS I', 'GS II', 'GS III', 'GS IV', 'Sociology'];
    for (const name of subjectsList) {
      const subId = subjectMap[name];
      const count = await Topic.countDocuments({ subjectId: subId });
      console.log(`  - ${name}: ${count} topics`);
    }

    // Print breakdown of tags under each subject
    for (const name of subjectsList) {
      const subId = subjectMap[name];
      console.log(`\nTag Breakdown for ${name}:`);
      const distinctTags = await Topic.distinct('tags', { subjectId: subId });
      for (const tag of distinctTags) {
        if (tag === name) continue; // skip the general subject tag
        const count = await Topic.countDocuments({ subjectId: subId, tags: tag });
        console.log(`  - ${tag}: ${count}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
    process.exit(1);
  }
}

main();
