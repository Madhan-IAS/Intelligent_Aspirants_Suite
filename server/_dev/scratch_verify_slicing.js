const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    let docTextLines = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const width = viewport.width;
      const textContent = await page.getTextContent();
      const items = textContent.items;

      const divider = width / 2;
      const leftItems = [];
      const rightItems = [];

      items.forEach(item => {
        if (!item.str || item.str.trim() === '') return;
        const x = item.transform[4];
        if (x < divider) {
          leftItems.push(item);
        } else {
          rightItems.push(item);
        }
      });

      const sortFn = (a, b) => {
        const yA = a.transform[5];
        const yB = b.transform[5];
        if (Math.abs(yA - yB) < 5) {
          return a.transform[4] - b.transform[4];
        }
        return yB - yA;
      };

      leftItems.sort(sortFn);
      rightItems.sort(sortFn);

      const getLines = (columnItems) => {
        const lines = [];
        let currentY = null;
        let currentLineItems = [];

        columnItems.forEach(item => {
          const y = item.transform[5];
          if (currentY === null) {
            currentY = y;
            currentLineItems.push(item);
          } else if (Math.abs(currentY - y) < 5) {
            currentLineItems.push(item);
          } else {
            currentLineItems.sort((a, b) => a.transform[4] - b.transform[4]);
            lines.push(currentLineItems.map(it => it.str).join(' '));
            currentY = y;
            currentLineItems = [item];
          }
        });

        if (currentLineItems.length > 0) {
          currentLineItems.sort((a, b) => a.transform[4] - b.transform[4]);
          lines.push(currentLineItems.map(it => it.str).join(' '));
        }

        return lines;
      };

      const leftLines = getLines(leftItems);
      const rightLines = getLines(rightItems);
      docTextLines = docTextLines.concat(leftLines).concat(rightLines);
    }

    // Extract all checkbox topics
    const topics = [];
    let i = 0;
    while (i < docTextLines.length) {
      const line = docTextLines[i].trim();

      if (line.includes(String.fromCharCode(61603))) {
        let title = line.replace(String.fromCharCode(61603), '')
                         .replace(/\u0004/g, '')
                         .replace(/\u0014/g, '')
                         .replace(/\t/g, ' ')
                         .trim();

        let nextIdx = i + 1;
        while (nextIdx < docTextLines.length) {
          const nextL = docTextLines[nextIdx].trim();
          if (nextL.length === 0) break;
          if (nextL.includes(String.fromCharCode(61603))) break;

          if (nextL.length > 4 && nextL.length < 50 && nextL === nextL.toUpperCase() && !nextL.includes('')) {
            break;
          }

          if (nextL.includes('UPSC SYLLABUS') || nextL.includes('www.iasscore.in') || nextL.match(/^\d+$/)) {
            nextIdx++;
            continue;
          }
          title += ' ' + nextL;
          nextIdx++;
        }
        title = title.replace(/\s+/g, ' ').trim();
        if (title.length > 0) {
          topics.push(title);
        }
        i = nextIdx;
      } else {
        i++;
      }
    }

    console.log(`Total topics extracted: ${topics.length}`);

    const partitions = [
      { name: 'Ancient History', count: 76 },
      { name: 'Medieval History', count: 121 },
      { name: 'Modern History', count: 55 },
      { name: 'Post-Independence Consolidation', count: 43 },
      { name: 'World History', count: 58 },
      { name: 'Indian Culture', count: 106 },
      { name: 'Physical Geography', count: 331 },
      { name: 'Physical Geography of India', count: 33 },
      { name: 'Human Geography', count: 53 },
      { name: 'Economic Geography', count: 186 },
      { name: 'Indian Society', count: 52 },
      { name: 'Polity', count: 392 },
      { name: 'Governance', count: 194 },
      { name: 'Social Justice', count: 181 },
      { name: 'International Relations', count: 156 },
      { name: 'Indian Economy', count: 392 },
      { name: 'Agriculture', count: 122 },
      { name: 'Environment & Ecology', count: 201 },
      { name: 'Science & Technology', count: 187 },
      { name: 'Disaster Management', count: 71 },
      { name: 'Internal Security', count: 124 },
      { name: 'Ethics, Integrity & Aptitude (GS-IV)', count: null } // consumes all leftovers
    ];

    let currentIdx = 0;
    partitions.forEach((part) => {
      const count = part.count !== null ? part.count : (topics.length - currentIdx);
      const sliced = topics.slice(currentIdx, currentIdx + count);
      console.log(`\n======================================================`);
      console.log(`${part.name}: count=${sliced.length}`);
      if (sliced.length > 0) {
        console.log(`  First: "${sliced[0]}"`);
        console.log(`  Last:  "${sliced[sliced.length - 1]}"`);
      }
      currentIdx += count;
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
