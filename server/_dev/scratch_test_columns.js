const fs = require('fs');
const path = require('path');

// Defined list of key headers in the PDF (in lowercase to do case-insensitive checks)
const HEADER_DEFINITIONS = [
  { header: 'ancient history', section: 'Ancient History' },
  { header: 'medieval history', section: 'Medieval History' },
  { header: 'modern history', section: 'Modern History' },
  { header: 'post independence consolidation', section: 'Post-Independence Consolidation' },
  { header: 'world history', section: 'World History' },
  { header: 'indian culture', section: 'Indian Culture' },
  { header: 'physical geography', section: 'Physical Geography' },
  { header: 'physical geography of india', section: 'Physical Geography of India' },
  { header: 'human geography', section: 'Human Geography' },
  { header: 'economic geography', section: 'Economic Geography' },
  { header: 'indian society', section: 'Indian Society' },
  { header: 'polity', section: 'Polity' },
  { header: 'governance', section: 'Governance' },
  { header: 'social justice', section: 'Social Justice' },
  { header: 'international relations', section: 'International Relations' },
  { header: 'basic economy', section: 'Indian Economy' },
  { header: 'economy', section: 'Indian Economy' },
  { header: 'agriculture', section: 'Agriculture' },
  { header: 'industry', section: 'Indian Economy' },
  { header: 'infrastructure', section: 'Indian Economy' },
  { header: 'science & technology', section: 'Science & Technology' },
  { header: 'chemistry', section: 'Science & Technology' },
  { header: 'physics', section: 'Science & Technology' },
  { header: 'biology', section: 'Science & Technology' },
  { header: 'environment & ecology', section: 'Environment & Ecology' },
  { header: 'internal security', section: 'Internal Security' },
  { header: 'disaster management', section: 'Disaster Management' },
  { header: 'ethics, integrity & aptitude', section: 'Ethics, Integrity & Aptitude (GS-IV)' }
];

async function main() {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;
    console.log('Total pages:', pdf.numPages);

    let docTextLines = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const width = viewport.width;
      const textContent = await page.getTextContent();
      const items = textContent.items;

      // Group items by column
      // We assume two columns: left column (x < width/2) and right column (x >= width/2)
      // Note: item.transform[4] is the raw x coordinate in PDF space.
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

      // Sort items inside each column from top to bottom
      // In PDF coordinates, y (item.transform[5]) increases from bottom to top, so we sort descending by y.
      // If y is close (same line), we sort ascending by x.
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

      // Now map items to lines
      // For each column, we group items that have the same y coordinate into a single line string.
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
            // Commit line
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

    console.log('Total reconstructed text lines:', docTextLines.length);

    // Now extract checkbox topics from reconstructed lines
    const topics = [];
    let currentSection = 'Ancient History';

    const counts = {};
    HEADER_DEFINITIONS.forEach(h => {
      counts[h.section] = 0;
    });
    // Ensure all sections exist in counts
    const uniqueSectionNames = [...new Set(HEADER_DEFINITIONS.map(h => h.section))];
    uniqueSectionNames.forEach(name => {
      counts[name] = 0;
    });

    let i = 0;
    while (i < docTextLines.length) {
      const line = docTextLines[i];
      const trimmed = line.trim();

      // Check if this line updates our current section
      const matchingHeader = HEADER_DEFINITIONS.find(h => {
        const hClean = h.header.toLowerCase();
        const tClean = trimmed.toLowerCase();
        return tClean === hClean || tClean.startsWith(hClean + ' ') || tClean.endsWith(' ' + hClean) || tClean.includes('  ' + hClean);
      });

      if (matchingHeader) {
        currentSection = matchingHeader.section;
      }

      if (line.includes(String.fromCharCode(61603))) {
        let title = line.replace(String.fromCharCode(61603), '')
                         .replace(/\u0004/g, '')
                         .replace(/\u0014/g, '')
                         .replace(/\t/g, ' ')
                         .trim();

        let nextIdx = i + 1;
        while (nextIdx < docTextLines.length) {
          const nextLine = docTextLines[nextIdx];
          const nextTrimmed = nextLine.trim();
          if (nextTrimmed.length === 0) break;
          if (nextLine.includes(String.fromCharCode(61603))) break;
          
          // Stop if the next line is a header
          const nextIsHeader = HEADER_DEFINITIONS.some(h => {
            const hClean = h.header.toLowerCase();
            const ntClean = nextTrimmed.toLowerCase();
            return ntClean === hClean || ntClean.startsWith(hClean + ' ') || ntClean.endsWith(' ' + hClean) || ntClean.includes('  ' + hClean);
          });
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
          counts[currentSection]++;
          topics.push({ section: currentSection, title });
        }
        i = nextIdx;
      } else {
        i++;
      }
    }

    const userTargets = {
      'Ancient History': 76,
      'Medieval History': 121,
      'Modern History': 55,
      'Post-Independence Consolidation': 43,
      'World History': 58,
      'Indian Culture': 106,
      'Physical Geography': 331,
      'Physical Geography of India': 33,
      'Human Geography': 53,
      'Economic Geography': 186,
      'Indian Society': 52,
      'Polity': 392,
      'Governance': 194,
      'Social Justice': 181,
      'International Relations': 156,
      'Indian Economy': 392,
      'Agriculture': 122,
      'Environment & Ecology': 201,
      'Science & Technology': 187,
      'Disaster Management': 71,
      'Internal Security': 124,
      'Ethics, Integrity & Aptitude (GS-IV)': 221
    };

    console.log('\n======================================');
    console.log('COLUMN-AWARE ACTUAL VS TARGET COUNTS');
    console.log('======================================');
    let totalActual = 0;
    let totalTarget = 0;
    Object.keys(userTargets).forEach(name => {
      const act = counts[name] || 0;
      const tar = userTargets[name];
      const diff = act - tar;
      const status = diff === 0 ? '✅ MATCH' : `❌ DIFF: ${diff > 0 ? '+' : ''}${diff}`;
      console.log(`${name.padEnd(40)} | Actual: ${String(act).padStart(3)} | Target: ${String(tar).padStart(3)} | ${status}`);
      totalActual += act;
      totalTarget += tar;
    });
    console.log('--------------------------------------');
    console.log(`TOTALS                                   | Actual: ${totalActual} | Target: ${totalTarget}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
