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
    console.log('Total lines:', lines.length);

    // Let's find lines containing page numbers or iasscore.in
    lines.forEach((line, idx) => {
      if (line.includes('www.iasscore.in') || line.includes('UPSC SYLLABUS')) {
        console.log(`Line ${String(idx).padStart(4)}: ${line.trim()}`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
