const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function main() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes('human geography')) {
        console.log(`Line ${idx}: ${JSON.stringify(line)}`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
