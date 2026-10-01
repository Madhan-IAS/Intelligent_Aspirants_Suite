const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function checkEthics() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    console.log('Total lines:', lines.length);

    // Look for lines containing "case study" or similar under line 5472
    for (let i = 5472; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('case') || line.toLowerCase().includes('study') || line.toLowerCase().includes('studies')) {
        console.log(`Line ${i}: ${line.trim()}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkEthics();
