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
    for (let i = 1445; i <= 1465; i++) {
      console.log(`Line ${i}: ${JSON.stringify(lines[i])}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

printSegment();
