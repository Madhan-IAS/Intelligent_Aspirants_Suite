const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

// Defined list of key headers we want to track in the PDF
// If we encounter a line matching one of these (trimmed, uppercase, or special check),
// we update our "current section" tracker.
const HEADER_DEFINITIONS = [
  { header: 'ANCIENT HISTORY', section: 'Ancient History', gs: 'GS I' },
  { header: 'MEDIEVAL HISTORY', section: 'Medieval History', gs: 'GS I' },
  { header: 'MODERN HISTORY', section: 'Modern History', gs: 'GS I' },
  { header: 'POST INDEPENDENCE CONSOLIDATION', section: 'Post-Independence Consolidation', gs: 'GS I' },
  { header: 'WORLD HISTORY', section: 'World History', gs: 'GS I' },
  { header: 'INDIAN CULTURE', section: 'Indian Culture', gs: 'GS I' },
  { header: 'PHYSICAL GEOGRAPHY', section: 'Physical Geography', gs: 'GS I' },
  { header: 'PHYSICAL GEOGRAPHY OF INDIA', section: 'Physical Geography of India', gs: 'GS I' },
  { header: 'HUMAN GEOGRAPHY', section: 'Human Geography', gs: 'GS I' },
  { header: 'ECONOMIC GEOGRAPHY', section: 'Economic Geography', gs: 'GS I' },
  { header: 'INDIAN SOCIETY', section: 'Indian Society', gs: 'GS I' },
  { header: 'POLITY', section: 'Polity', gs: 'GS II' },
  { header: 'GOVERNANCE', section: 'Governance', gs: 'GS II' },
  { header: 'SOCIAL JUSTICE', section: 'Social Justice', gs: 'GS II' },
  { header: 'INTERNATIONAL RELATIONS', section: 'International Relations', gs: 'GS II' },
  { header: 'BASIC ECONOMY', section: 'Indian Economy', gs: 'GS III' },
  { header: 'ECONOMY', section: 'Indian Economy', gs: 'GS III' },
  { header: 'AGRICULTURE', section: 'Agriculture', gs: 'GS III' },
  { header: 'INDUSTRY', section: 'Indian Economy', gs: 'GS III' }, // Industry & Infrastructure are part of Indian Economy in user's table
  { header: 'INFRASTRUCTURE', section: 'Indian Economy', gs: 'GS III' },
  { header: 'SCIENCE & TECHNOLOGY', section: 'Science & Technology', gs: 'GS III' },
  { header: 'CHEMISTRY', section: 'Science & Technology', gs: 'GS III' },
  { header: 'PHYSICS', section: 'Science & Technology', gs: 'GS III' },
  { header: 'BIOLOGY', section: 'Science & Technology', gs: 'GS III' },
  { header: 'ENVIRONMENT & ECOLOGY', section: 'Environment & Ecology', gs: 'GS III' },
  { header: 'INTERNAL SECURITY', section: 'Internal Security', gs: 'GS III' },
  { header: 'DISASTER MANAGEMENT', section: 'Disaster Management', gs: 'GS III' },
  { header: 'ETHICS, INTEGRITY & APTITUDE', section: 'Ethics, Integrity & Aptitude (GS-IV)', gs: 'GS IV' }
];

async function main() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    console.log('Total lines:', lines.length);

    let currentSection = 'Ancient History';
    let currentGs = 'GS I';
    
    // Grouped topics
    const groups = {};
    HEADER_DEFINITIONS.forEach(h => {
      groups[h.section] = [];
    });

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if this line is a header
      const matchingHeader = HEADER_DEFINITIONS.find(h => {
        // Strict case-insensitive match for exact title or subset
        const hClean = h.header.toUpperCase();
        const tClean = trimmed.toUpperCase();
        return tClean === hClean || tClean.startsWith(hClean + ' ') || tClean.endsWith(' ' + hClean) || tClean.includes('\t' + hClean);
      });

      if (matchingHeader) {
        currentSection = matchingHeader.section;
        currentGs = matchingHeader.gs;
        console.log(`[Header transition] Line ${i}: ${trimmed} -> section: ${currentSection} (${currentGs})`);
      }

      // Check if this line is a checkbox item
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
          
          // Stop if we hit a main uppercase section header
          const nextIsHeader = HEADER_DEFINITIONS.some(h => nextTrimmed.toUpperCase() === h.header.toUpperCase());
          if (nextIsHeader) break;

          if (nextTrimmed.includes('UPSC SYLLABUS') || nextTrimmed.includes('www.iasscore.in') || nextTrimmed.match(/^\d+$/)) {
            nextIdx++;
            continue;
          }
          title += ' ' + nextTrimmed;
          nextIdx++;
        }
        title = title.replace(/\s+/g, ' ').trim();
        
        if (title.length > 0) {
          groups[currentSection].push({ lineIndex: i, title });
        }
        i = nextIdx;
      } else {
        i++;
      }
    }

    console.log('\n======================================');
    console.log('SUMMARY OF EXTRACTED TOPICS BY SECTION');
    console.log('======================================');
    
    let grandTotal = 0;
    HEADER_DEFINITIONS.forEach(h => {
      // Avoid printing duplicate headers pointing to same section multiple times
      if (groups[h.section]) {
        console.log(`${h.section.padEnd(40)}: ${groups[h.section].length} topics`);
        grandTotal += groups[h.section].length;
        // Delete to prevent double printing
        delete groups[h.section];
      }
    });

    console.log('--------------------------------------');
    console.log(`Grand Total extracted: ${grandTotal} topics`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
