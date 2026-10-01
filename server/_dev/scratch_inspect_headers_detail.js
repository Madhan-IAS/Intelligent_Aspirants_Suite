const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function inspectHeaders() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');

    // List of candidate main headers to find
    const candidates = [
      'ANCIENT HISTORY',
      'MEDIEVAL HISTORY',
      'MODERN HISTORY',
      'POST INDEPENDENCE',
      'WORLD HISTORY',
      'INDIAN CULTURE',
      'PHYSICAL GEOGRAPHY',
      'GEOGRAPHY',
      'PHYSICAL GEOGRAPHY OF INDIA',
      'HUMAN GEOGRAPHY',
      'ECONOMIC GEOGRAPHY',
      'INDIAN SOCIETY',
      'POLITY',
      'GOVERNANCE',
      'SOCIAL JUSTICE',
      'INTERNATIONAL RELATIONS',
      'BASIC ECONOMY',
      'ECONOMY',
      'AGRICULTURE',
      'INDUSTRY',
      'INFRASTRUCTURE',
      'SCIENCE & TECHNOLOGY',
      'ENVIRONMENT & ECOLOGY',
      'INTERNAL SECURITY',
      'DISASTER MANAGEMENT',
      'ETHICS, INTEGRITY & APTITUDE'
    ];

    lines.forEach((line, idx) => {
      const trimmed = line.trim().toUpperCase();
      candidates.forEach(cand => {
        if (trimmed === cand || (trimmed.includes(cand) && trimmed.length < 50 && !line.includes(String.fromCharCode(61603)))) {
          console.log(`Found candidate header at Line ${idx}: ${line.trim()}`);
          // Print 3 lines before and after
          for (let j = Math.max(0, idx - 2); j <= Math.min(lines.length - 1, idx + 2); j++) {
            console.log(`  [${j}] ${JSON.stringify(lines[j])}`);
          }
        }
      });
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

inspectHeaders();
