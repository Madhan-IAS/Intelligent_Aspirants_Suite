const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

async function inspectPDF() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    console.log('--- Searching for Section Headers ---');
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (
        trimmed.match(/^(GENERAL STUDIES|GS|PAPER|SYLLABUS|HISTORY|POLITY|ECONOMY|ETHICS)/i) && 
        trimmed.length < 50
      ) {
        console.log(`Line ${i}: ${trimmed}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

inspectPDF();
