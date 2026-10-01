const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function testPartitionCounts() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    
    // Extracted topics with line numbers
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

    // Now categorize based on line indices
    const sections = [
      { name: 'Ancient History', start: 0, end: 137 },
      { name: 'Medieval History', start: 138, end: 380 },
      { name: 'Modern History', start: 381, end: 401 },
      { name: 'Post-Independence', start: 402, end: 537 },
      { name: 'World History', start: 538, end: 637 },
      { name: 'Indian Culture', start: 638, end: 834 },
      { name: 'Geography', start: 835, end: 2008 },
      { name: 'Indian Society', start: 2009, end: 2210 },
      { name: 'Polity', start: 2211, end: 2650 },
      { name: 'Governance & Social Justice', start: 2651, end: 3266 },
      { name: 'International Relations', start: 3267, end: 3569 },
      { name: 'Economy/Agri/Indra/Infra', start: 3570, end: 4324 },
      { name: 'Science & Technology', start: 4325, end: 4815 },
      { name: 'Environment & Ecology', start: 4816, end: 5268 },
      { name: 'Internal Security', start: 5269, end: 5399 },
      { name: 'Disaster Management', start: 5400, end: 5471 },
      { name: 'Ethics', start: 5472, end: 6000 }
    ];

    let categorizedTotal = 0;
    sections.forEach(sec => {
      const secTopics = topics.filter(t => t.lineIndex >= sec.start && t.lineIndex <= sec.end);
      console.log(`${sec.name.padEnd(30)}: start line ${String(sec.start).padStart(4)} | end line ${String(sec.end).padStart(4)} | count: ${secTopics.length}`);
      categorizedTotal += secTopics.length;
    });

    console.log('\nTotal categorized:', categorizedTotal);
    console.log('Grand total of topics:', topics.length);

  } catch (error) {
    console.error('Error:', error);
  }
}

testPartitionCounts();
