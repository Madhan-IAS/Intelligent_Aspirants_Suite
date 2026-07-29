const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function testCheckboxCount() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    console.log('Total lines in PDF:', lines.length);

    let checkboxCount = 0;
    const checkboxLines = [];
    lines.forEach((line, index) => {
      if (line.includes(String.fromCharCode(61603))) {
        checkboxCount++;
        checkboxLines.push({ index, text: line.trim() });
      }
    });

    console.log('Total lines containing checkbox (61603):', checkboxCount);
    console.log('\nSample checkbox lines:');
    checkboxLines.slice(0, 15).forEach(l => console.log(`  Line ${l.index}: ${l.text}`));

  } catch (error) {
    console.error('Error:', error);
  }
}

testCheckboxCount();
