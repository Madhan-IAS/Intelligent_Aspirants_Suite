const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function testParse() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    console.log('Reading:', pdfPath);
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    console.log('Extracted text successfully!');
    console.log('Total text length:', result.text.length);
    console.log('Sample text (first 1500 chars):');
    console.log(result.text.substring(0, 1500));
    await parser.destroy();
  } catch (error) {
    console.error('Error parsing PDF:', error);
  }
}

testParse();
