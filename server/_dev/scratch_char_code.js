const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function checkCharCode() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    const line3 = lines[3];
    console.log('Line 3 length:', line3.length);
    console.log('Line 3 content:', JSON.stringify(line3));
    for (let i = 0; i < line3.length; i++) {
      console.log(`Char ${i}: ${line3[i]} (code: ${line3.charCodeAt(i)})`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkCharCode();
