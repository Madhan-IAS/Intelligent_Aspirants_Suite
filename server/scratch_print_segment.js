const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function printSegment() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    for (let i = 12; i <= 25; i++) {
      console.log(`Line ${i}: ${JSON.stringify(lines[i])} (Ends with checkbox: ${lines[i].includes(String.fromCharCode(61603))})`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

printSegment();
