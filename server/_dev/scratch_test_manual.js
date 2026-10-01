const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

// Manually defined starting lines for each section (ordered chronologically as they appear in the PDF)
const SECTIONS = [
  { name: 'Ancient History', line: 1 },
  { name: 'Medieval History', line: 138 },
  { name: 'Modern History', line: 381 },
  { name: 'Post-Independence Consolidation', line: 402 },
  { name: 'World History', line: 538 },
  { name: 'Indian Culture', line: 638 },
  { name: 'Physical Geography', line: 835 },
  { name: 'Physical Geography of India', line: 1452 },
  { name: 'Human Geography', line: 1453 },
  { name: 'Economic Geography', line: 1598 },
  { name: 'Indian Society', line: 2009 },
  { name: 'Polity', line: 2211 },
  { name: 'Governance', line: 2651 },
  { name: 'Social Justice', line: 2998 },
  { name: 'International Relations', line: 3267 },
  { name: 'Indian Economy', line: 3570 }, // Basic Economy / Economy / Industry / Infrastructure
  // Wait, does Agriculture come inside Economy or is it after/before?
  // Let's check where Agriculture is: line 3850.
  // In the PDF, Agriculture is between Economy and Industry!
  // So:
  // - Economy starts at 3570
  // - Agriculture starts at 3850
  // - Industry/Infrastructure starts at 4038 (which belongs back to Indian Economy!)
  // - Science & Technology starts at 4338
  // - Environment & Ecology starts at 4816
  // - Internal Security starts at 5269
  // - Disaster Management starts at 5400
  // - Ethics, Integrity & Aptitude (GS-IV) starts at 5472
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

    // Get all checkbox topics
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

    // Map each topic to a section based on its line index
    const counts = {};
    const sectionTopics = {};
    SECTIONS.forEach(s => {
      counts[s.name] = 0;
      sectionTopics[s.name] = [];
    });
    // Add sections that are split or handled differently
    counts['Agriculture'] = 0;
    sectionTopics['Agriculture'] = [];
    counts['Industry & Infrastructure'] = 0; // we'll map to Economy or keep separate
    sectionTopics['Industry & Infrastructure'] = [];
    counts['Science & Technology'] = 0;
    sectionTopics['Science & Technology'] = [];
    counts['Environment & Ecology'] = 0;
    sectionTopics['Environment & Ecology'] = [];
    counts['Internal Security'] = 0;
    sectionTopics['Internal Security'] = [];
    counts['Disaster Management'] = 0;
    sectionTopics['Disaster Management'] = [];
    counts['Ethics, Integrity & Aptitude (GS-IV)'] = 0;
    sectionTopics['Ethics, Integrity & Aptitude (GS-IV)'] = [];

    topics.forEach(t => {
      const idx = t.lineIndex;
      let mappedSection = '';

      if (idx >= 1 && idx < 138) {
        mappedSection = 'Ancient History';
      } else if (idx >= 138 && idx < 381) {
        mappedSection = 'Medieval History';
      } else if (idx >= 381 && idx < 402) {
        mappedSection = 'Modern History';
      } else if (idx >= 402 && idx < 538) {
        mappedSection = 'Post-Independence Consolidation';
      } else if (idx >= 538 && idx < 638) {
        mappedSection = 'World History';
      } else if (idx >= 638 && idx < 835) {
        mappedSection = 'Indian Culture';
      } else if (idx >= 835 && idx < 1452) {
        mappedSection = 'Physical Geography';
      } else if (idx >= 1452 && idx < 1453) {
        mappedSection = 'Physical Geography of India';
      } else if (idx >= 1453 && idx < 1598) {
        mappedSection = 'Human Geography';
      } else if (idx >= 1598 && idx < 2009) {
        mappedSection = 'Economic Geography';
      } else if (idx >= 2009 && idx < 2211) {
        mappedSection = 'Indian Society';
      } else if (idx >= 2211 && idx < 2651) {
        mappedSection = 'Polity';
      } else if (idx >= 2651 && idx < 2998) {
        mappedSection = 'Governance';
      } else if (idx >= 2998 && idx < 3267) {
        mappedSection = 'Social Justice';
      } else if (idx >= 3267 && idx < 3570) {
        mappedSection = 'International Relations';
      } else if (idx >= 3570 && idx < 3850) {
        mappedSection = 'Indian Economy';
      } else if (idx >= 3850 && idx < 4038) {
        mappedSection = 'Agriculture';
      } else if (idx >= 4038 && idx < 4338) {
        mappedSection = 'Indian Economy'; // Industry & Infrastructure goes to Indian Economy
      } else if (idx >= 4338 && idx < 4816) {
        mappedSection = 'Science & Technology';
      } else if (idx >= 4816 && idx < 5269) {
        mappedSection = 'Environment & Ecology';
      } else if (idx >= 5269 && idx < 5400) {
        mappedSection = 'Internal Security';
      } else if (idx >= 5400 && idx < 5472) {
        mappedSection = 'Disaster Management';
      } else if (idx >= 5472) {
        mappedSection = 'Ethics, Integrity & Aptitude (GS-IV)';
      }

      if (mappedSection) {
        counts[mappedSection]++;
        sectionTopics[mappedSection].push(t);
      }
    });

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
    console.log('COMPARISON: ACTUAL VS TARGET COUNTS');
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
    console.log(`TOTALS                                   | Actual: ${totalActual} | Target: ${totalTarget} | Diff: ${totalActual - totalTarget}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
