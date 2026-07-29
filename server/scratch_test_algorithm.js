const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function testParsingAlgorithm() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    console.log('Total lines:', lines.length);

    const topics = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if this line is a checkbox item
      if (line.includes(String.fromCharCode(61603))) {
        // Extract title part
        let title = line.replace(String.fromCharCode(61603), '')
                         .replace(/\u0004/g, '')
                         .replace(/\u0014/g, '')
                         .replace(/\t/g, ' ')
                         .trim();

        // Lookahead for continuation lines
        let nextIdx = i + 1;
        while (nextIdx < lines.length) {
          const nextLine = lines[nextIdx];
          const nextTrimmed = nextLine.trim();

          // Break conditions for continuation
          if (nextTrimmed.length === 0) break;
          if (nextLine.includes(String.fromCharCode(61603))) break;
          if (nextLine.includes('\u0004') || nextLine.includes('\u0014')) break;
          
          // If it looks like a header (all caps, no lowercase letters)
          if (nextTrimmed === nextTrimmed.toUpperCase() && nextTrimmed.match(/[A-Z]/)) {
            // Check if it is a short title like "Characteristics" or a main section header
            // If it is long or has common words, it might not be a header.
            // But let's check if it's one of the known section headers:
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

          // Filter out PDF page footers/headers
          if (nextTrimmed.includes('UPSC SYLLABUS') || nextTrimmed.includes('www.iasscore.in') || nextTrimmed.match(/^\d+$/)) {
            nextIdx++;
            continue;
          }

          // Append to title
          title += ' ' + nextTrimmed;
          nextIdx++;
        }

        // Clean extra spaces from title
        title = title.replace(/\s+/g, ' ').trim();
        topics.push({ originalLine: i, title });
        i = nextIdx;
      } else {
        i++;
      }
    }

    console.log('Total extracted topics:', topics.length);
    console.log('\nFirst 35 topics (Ancient History):');
    topics.slice(0, 35).forEach((t, index) => {
      console.log(`${index + 1}. [Line ${t.originalLine}] ${t.title}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

testParsingAlgorithm();
