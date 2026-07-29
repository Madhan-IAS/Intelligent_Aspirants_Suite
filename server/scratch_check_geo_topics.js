const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function checkGeoTopics() {
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

    const geoTopics = topics.filter(t => t.lineIndex >= 835 && t.lineIndex <= 2008);
    console.log('Total Geo topics extracted:', geoTopics.length);
    console.log('First 20 Geo topics:');
    geoTopics.slice(0, 20).forEach((t, idx) => console.log(`  ${idx+1}: [Line ${t.lineIndex}] ${t.title}`));
    console.log('\nLast 20 Geo topics:');
    geoTopics.slice(-20).forEach((t, idx) => console.log(`  ${idx+1}: [Line ${t.lineIndex}] ${t.title}`));

  } catch (error) {
    console.error('Error:', error);
  }
}

checkGeoTopics();
