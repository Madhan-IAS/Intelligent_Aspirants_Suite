const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      textContent.items.forEach(item => {
        if (item.str && item.str.includes('Pratihara')) {
          console.log(`Page ${pageNum} | X: ${item.transform[4]} | Y: ${item.transform[5]} | Text: "${item.str}"`);
        }
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
