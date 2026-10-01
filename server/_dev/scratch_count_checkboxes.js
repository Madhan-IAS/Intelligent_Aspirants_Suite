const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function testCheckboxCount() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    console.log('Reading:', pdfPath);
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    console.log('Total lines:', lines.length);

    // Let's find how many lines contain the checkbox symbol
    // Checkbox symbol is '' or \uF06F or similar
    const checkboxLines = [];
    lines.forEach((line, index) => {
      if (line.includes('') || line.includes('\uf06f') || line.includes('\u25a1') || line.includes('')) {
        checkboxLines.push({ index, text: line.trim() });
      }
    });

    console.log('Found checkbox lines:', checkboxLines.length);
    console.log('Sample of first 20 checkbox lines:');
    checkboxLines.slice(0, 20).forEach(l => console.log(`Line ${l.index}: ${l.text}`));

    console.log('Sample of last 20 checkbox lines:');
    checkboxLines.slice(-20).forEach(l => console.log(`Line ${l.index}: ${l.text}`));

  } catch (error) {
    console.error('Error:', error);
  }
}

testCheckboxCount();
