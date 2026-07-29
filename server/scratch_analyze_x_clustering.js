const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    console.log('Page | Width | Checkbox X Coordinates');
    console.log('-------------------------------------');

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const width = viewport.width;
      const textContent = await page.getTextContent();
      const items = textContent.items;

      const checkboxXs = [];
      items.forEach(item => {
        if (item.str && item.str.includes(String.fromCharCode(61603))) {
          checkboxXs.push(Math.round(item.transform[4]));
        }
      });

      if (checkboxXs.length > 0) {
        checkboxXs.sort((a, b) => a - b);
        console.log(`Page ${String(pageNum).padStart(2)} | ${Math.round(width)} | min: ${checkboxXs[0]}, max: ${checkboxXs[checkboxXs.length - 1]} | Xs: [${checkboxXs.join(', ')}]`);
      } else {
        console.log(`Page ${String(pageNum).padStart(2)} | ${Math.round(width)} | No checkboxes`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
