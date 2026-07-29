const fs = require('fs');
try {
  const content = fs.readFileSync('temp_extracted/word/document.xml', 'utf8');
  const paragraphs = content.match(/<w:p[^>]*>.*?<\/w:p>/g) || [];
  const result = paragraphs.map(p => {
    const tMatches = p.match(/<w:t[^>]*>.*?<\/w:t>/g) || [];
    return tMatches.map(t => {
      // Extract text content inside <w:t> tags (handling attributes if any)
      const startIdx = t.indexOf('>') + 1;
      const endIdx = t.lastIndexOf('<');
      return t.substring(startIdx, endIdx);
    }).join('');
  }).join('\n');

  fs.writeFileSync('extracted_docx_content.txt', result, 'utf8');
  console.log('Docx content extracted successfully to extracted_docx_content.txt!');
} catch (err) {
  console.error('Error during extraction:', err);
}
