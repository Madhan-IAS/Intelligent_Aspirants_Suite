const fs = require('fs');
const path = require('path');

// We will check for headers on single lines, or combined consecutive lines.
const HEADER_RULES = [
  { match: (l1, l2) => l1 === 'ANCIENT HISTORY', section: 'Ancient History' },
  { match: (l1, l2) => l1 === 'MEDIEVAL HISTORY', section: 'Medieval History' },
  { match: (l1, l2) => l1 === 'MODERN HISTORY', section: 'Modern History' },
  { match: (l1, l2) => l1 === 'POST INDEPENDENCE CONSOLIDATION', section: 'Post-Independence Consolidation' },
  { match: (l1, l2) => l1 === 'WORLD HISTORY', section: 'World History' },
  { match: (l1, l2) => l1 === 'INDIAN CULTURE', section: 'Indian Culture' },
  { match: (l1, l2) => l1 === 'PHYSICAL GEOGRAPHY', section: 'Physical Geography' },
  { match: (l1, l2) => l1 === 'PHYSICAL GEOGRAPHY OF INDIA', section: 'Physical Geography of India' },
  { match: (l1, l2) => l1 === 'HUMAN GEOGRAPHY', section: 'Human Geography' },
  { match: (l1, l2) => l1 === 'ECONOMIC GEOGRAPHY', section: 'Economic Geography' },
  { match: (l1, l2) => l1 === 'INDIAN SOCIETY', section: 'Indian Society' },
  { match: (l1, l2) => l1 === 'POLITY', section: 'Polity' },
  { match: (l1, l2) => l1 === 'GOVERNANCE' && l2 === '& SOCIAL JUSTICE', section: 'Governance' },
  { match: (l1, l2) => l1 === 'GOVERNANCE', section: 'Governance' },
  { match: (l1, l2) => l1 === 'SOCIAL JUSTICE', section: 'Social Justice' },
  { match: (l1, l2) => l1 === 'INTERNATIONAL' && l2 === 'RELATIONS', section: 'International Relations' },
  { match: (l1, l2) => l1 === 'BASIC ECONOMY' || l1 === 'ECONOMY', section: 'Indian Economy' },
  { match: (l1, l2) => l1 === 'AGRICULTURE', section: 'Agriculture' },
  { match: (l1, l2) => l1 === 'INDUSTRY', section: 'Indian Economy' },
  { match: (l1, l2) => l1 === 'INFRASTRUCTURE', section: 'Indian Economy' },
  { match: (l1, l2) => l1 === 'SCIENCE' && l2 === '& TECHNOLOGY', section: 'Science & Technology' },
  { match: (l1, l2) => l1 === 'ENVIRONMENT &' && l2 === 'ECOLOGY', section: 'Environment & Ecology' },
  { match: (l1, l2) => l1 === 'INTERNAL SECURITY', section: 'Internal Security' },
  { match: (l1, l2) => l1 === 'DISASTER' && l2 === 'MANAGEMENT', section: 'Disaster Management' },
  { match: (l1, l2) => l1 === 'ETHICS, INTEGRITY &' && l2 === 'APTITUDE', section: 'Ethics, Integrity & Aptitude (GS-IV)' }
];

async function main() {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
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

    console.log('Total reconstructed text lines:', docTextLines.length);

    // Extract checkbox topics using header transitions
    const topics = [];
    let currentSection = 'Ancient History';

    const counts = {};
    const uniqueSectionNames = [
      'Ancient History', 'Medieval History', 'Modern History',
      'Post-Independence Consolidation', 'World History', 'Indian Culture',
      'Physical Geography', 'Physical Geography of India', 'Human Geography',
      'Economic Geography', 'Indian Society', 'Polity', 'Governance',
      'Social Justice', 'International Relations', 'Indian Economy',
      'Agriculture', 'Environment & Ecology', 'Science & Technology',
      'Disaster Management', 'Internal Security', 'Ethics, Integrity & Aptitude (GS-IV)'
    ];
    uniqueSectionNames.forEach(name => {
      counts[name] = 0;
    });

    let i = 0;
    while (i < docTextLines.length) {
      const line = docTextLines[i].trim();
      const nextLine = (i + 1 < docTextLines.length) ? docTextLines[i + 1].trim() : '';

      // Check if this line (or pair of lines) is a header transition
      let matchedRule = null;
      for (const rule of HEADER_RULES) {
        if (rule.match(line, nextLine)) {
          matchedRule = rule;
          break;
        }
      }

      if (matchedRule) {
        currentSection = matchedRule.section;
        console.log(`Transitioning to [${currentSection}] at line ${i}: ${line} / ${nextLine}`);
        if (matchedRule.match.length === 2 && matchedRule.match(line, nextLine) && line !== 'GOVERNANCE') {
          // If rule matched two lines, skip the next line in processing
          i += 2;
          continue;
        }
        i++;
        continue;
      }

      // Check if it's a checkbox topic
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

          // Stop if the next line is a header
          const nextL2 = (nextIdx + 1 < docTextLines.length) ? docTextLines[nextIdx + 1].trim() : '';
          let nextIsHeader = false;
          for (const rule of HEADER_RULES) {
            if (rule.match(nextL, nextL2)) {
              nextIsHeader = true;
              break;
            }
          }
          if (nextIsHeader) break;

          if (nextL.includes('UPSC SYLLABUS') || nextL.includes('www.iasscore.in') || nextL.match(/^\d+$/)) {
            nextIdx++;
            continue;
          }
          title += ' ' + nextL;
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
    console.log('COLUMN-AWARE V2 ACTUAL VS TARGET COUNTS');
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
