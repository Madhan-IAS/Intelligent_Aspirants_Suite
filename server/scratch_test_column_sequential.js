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

    console.log('Total reconstructed text lines:', docTextLines.length);

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

          // Stop if the next line looks like a header (all uppercase, no checkbox)
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

    console.log('Total extracted topics in column-aware order:', topics.length);

    const userTargets = {
      'Ancient History': 76,
      'Medieval History': 121,
      'Modern History': 55,
      'Post-Independence Consolidation': 43,
      'World History': 58,
      'Indian Culture': 106,
      'Physical Geography': 331,
      'Physical Geography of India': 33,
      'Human Geography': 53,
      'Economic Geography': 186,
      'Indian Society': 52,
      'Polity': 392,
      'Governance': 194,
      'Social Justice': 181,
      'International Relations': 156,
      'Indian Economy': 392,
      'Agriculture': 122,
      'Environment & Ecology': 201,
      'Science & Technology': 187,
      'Disaster Management': 71,
      'Internal Security': 124,
      'Ethics, Integrity & Aptitude (GS-IV)': 221
    };

    let currentIndex = 0;
    Object.keys(userTargets).forEach(name => {
      const count = userTargets[name];
      const slice = topics.slice(currentIndex, currentIndex + count);
      console.log(`\n--- ${name} (Expected: ${count}, Got: ${slice.length}) ---`);
      if (slice.length > 0) {
        console.log(`First: ${slice[0]}`);
        console.log(`Last : ${slice[slice.length - 1]}`);
      } else {
        console.log('NO TOPICS');
      }
      currentIndex += count;
    });

    console.log('\nRemaining topics after partition:', topics.length - currentIndex);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
