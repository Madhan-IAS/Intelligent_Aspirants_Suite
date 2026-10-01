const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function main() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    
    // Extracted topics in sequential order
    const topics = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.includes(String.fromCharCode(61603))) {
        let title = line.replace(String.fromCharCode(61603), '')
                         .replace(/\u0004/g, '')
                         .replace(/\u0014/g, '')
                         .replace(/\t/g, ' ')
                         .trim();
        let nextIdx = i + 1;
        while (nextIdx < lines.length) {
          const nextLine = lines[nextIdx];
          const nextTrimmed = nextLine.trim();
          if (nextTrimmed.length === 0) break;
          if (nextLine.includes(String.fromCharCode(61603))) break;
          if (nextLine.includes('\u0004') || nextLine.includes('\u0014')) break;
          
          if (nextTrimmed === nextTrimmed.toUpperCase() && nextTrimmed.match(/[A-Z]/)) {
            const knownHeaders = [
              'ANCIENT HISTORY', 'MEDIEVAL HISTORY', 'MODERN HISTORY', 
              'POST INDEPENDENCE CONSOLIDATION', 'WORLD HISTORY', 'INDIAN CULTURE',
              'PHYSICAL GEOGRAPHY', 'GEOGRAPHY', 'PHYSICAL GEOGRAPHY OF INDIA',
              'HUMAN GEOGRAPHY', 'ECONOMIC GEOGRAPHY', 'INDIAN SOCIETY', 'POLITY',
              'GOVERNANCE', 'SOCIAL JUSTICE', 'INTERNATIONAL RELATIONS', 'BASIC ECONOMY',
              'ECONOMY', 'AGRICULTURE', 'INDUSTRY', 'INFRASTRUCTURE', 'CHEMISTRY',
              'PHYSICS', 'BIOLOGY', 'SCIENCE', 'ENVIRONMENT & ECOLOGY', 'INTERNAL SECURITY',
              'DISASTER MANAGEMENT', 'ETHICS, INTEGRITY & APTITUDE'
            ];
            if (knownHeaders.includes(nextTrimmed)) break;
          }
          if (nextTrimmed.includes('UPSC SYLLABUS') || nextTrimmed.includes('www.iasscore.in') || nextTrimmed.match(/^\d+$/)) {
            nextIdx++;
            continue;
          }
          title += ' ' + nextTrimmed;
          nextIdx++;
        }
        title = title.replace(/\s+/g, ' ').trim();
        topics.push({ lineIndex: i, title });
        i = nextIdx;
      } else {
        i++;
      }
    }

    console.log('Total extracted topics:', topics.length);

    // Target partitions in order of PDF
    // Let's list them in order of occurrence in the PDF:
    const partitions = [
      { name: 'Ancient History', count: 76 },
      { name: 'Medieval History', count: 121 },
      { name: 'Modern History', count: 55 },
      { name: 'Post-Independence Consolidation', count: 43 },
      { name: 'World History', count: 58 },
      { name: 'Indian Culture', count: 106 },
      { name: 'Physical Geography', count: 331 },
      { name: 'Physical Geography of India', count: 33 },
      { name: 'Human Geography', count: 53 },
      { name: 'Economic Geography', count: 186 },
      { name: 'Indian Society', count: 52 },
      { name: 'Polity', count: 392 },
      { name: 'Governance', count: 194 },
      { name: 'Social Justice', count: 181 },
      { name: 'International Relations', count: 156 },
      { name: 'Indian Economy', count: 392 },
      { name: 'Agriculture', count: 122 },
      { name: 'Environment & Ecology', count: 201 },
      { name: 'Science & Technology', count: 187 },
      { name: 'Disaster Management', count: 71 },
      { name: 'Internal Security', count: 124 },
      { name: 'Ethics, Integrity & Aptitude (GS-IV)', count: 221 }
    ];

    let currentIdx = 0;
    partitions.forEach((part, partIdx) => {
      const partTopics = topics.slice(currentIdx, currentIdx + part.count);
      console.log(`\n======================================================`);
      console.log(`Partition ${partIdx + 1}: ${part.name} (Expected count: ${part.count}, Actual: ${partTopics.length})`);
      if (partTopics.length > 0) {
        console.log(`  First: [Line ${partTopics[0].lineIndex}] ${partTopics[0].title}`);
        console.log(`  Last:  [Line ${partTopics[partTopics.length - 1].lineIndex}] ${partTopics[partTopics.length - 1].title}`);
      } else {
        console.log('  Empty partition');
      }
      currentIdx += part.count;
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
