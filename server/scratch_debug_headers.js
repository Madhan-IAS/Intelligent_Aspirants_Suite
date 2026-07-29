const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

const TRUE_HEADERS = [
  'ANCIENT HISTORY',
  'MEDIEVAL HISTORY',
  'MODERN HISTORY',
  'POST INDEPENDENCE CONSOLIDATION',
  'WORLD HISTORY',
  'INDIAN CULTURE',
  'PHYSICAL GEOGRAPHY',
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

async function main() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    console.log('Total lines in PDF:', lines.length);

    // Let's find the exact line index of the true headers (ignoring inline references)
    const headerLines = [];
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      // Match exactly (case insensitive) and make sure it has no lowercase letters
      if (TRUE_HEADERS.includes(trimmed.toUpperCase()) && trimmed === trimmed.toUpperCase()) {
        headerLines.push({ lineIndex: idx, text: trimmed });
      }
    });

    console.log('\n--- True Headers Found ---');
    headerLines.forEach(h => console.log(`Line ${String(h.lineIndex).padStart(4)}: ${h.text}`));

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
