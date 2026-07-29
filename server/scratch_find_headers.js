const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function findHeaders() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    console.log('Total lines:', lines.length);

    // Let's print lines that look like main headers (fully uppercase, short, no checkbox)
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.length > 3 && trimmed.length < 50 && !line.includes(String.fromCharCode(61603))) {
        // Check if it is uppercase
        if (trimmed === trimmed.toUpperCase() && !trimmed.match(/^\d+$/) && !trimmed.includes('UPSC') && !trimmed.includes('WWW.')) {
          console.log(`Line ${index}: ${trimmed}`);
        }
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

findHeaders();
