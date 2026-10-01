const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;
    console.log('Total pages:', pdf.numPages);

    // Let's examine Page 9 (which contains line 402, Post-Independence, etc.)
    // Note: page numbering is 1-indexed, so let's find which page has "POST INDEPENDENCE"
    // Let's search pages for "POST INDEPENDENCE CONSOLIDATION"
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = textContent.items;
      const text = items.map(item => item.str).join(' ');
      if (text.includes('POST INDEPENDENCE CONSOLIDATION')) {
        console.log(`\nFound "POST INDEPENDENCE CONSOLIDATION" on Page ${pageNum}`);
        console.log('Sample text items with coordinates:');
        items.slice(0, 30).forEach((item, idx) => {
          // transform is [scaleX, skewY, skewX, scaleY, translateX, translateY]
          const x = item.transform[4];
          const y = item.transform[5];
          console.log(`  [Item ${idx}] x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, text: ${JSON.stringify(item.str)}`);
        });
        break;
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
