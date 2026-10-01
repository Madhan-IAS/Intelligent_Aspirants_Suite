const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    const pageNum = 2;
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items;

    console.log(`Items on Page ${pageNum}:`);
    items.forEach((item, idx) => {
      if (!item.str || item.str.trim() === '') return;
      const x = Math.round(item.transform[4]);
      const y = Math.round(item.transform[5]);
      console.log(`Item ${String(idx).padStart(3)} | X: ${String(x).padStart(3)} | Y: ${String(y).padStart(3)} | Text: "${item.str}"`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
