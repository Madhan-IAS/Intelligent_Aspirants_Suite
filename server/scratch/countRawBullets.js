/**
 * Count raw  bullets in each seeder script's raw text
 */
const fs = require('fs');

const scripts = [
  { name: 'Polity (GS II)', file: 'seedPolityAsIs.js' },
  { name: 'Governance (GS II)', file: 'seedGovernanceAsIs.js' },
  { name: 'Social Justice (GS II)', file: 'seedSocialJusticeAsIs.js' },
  { name: 'Intl Relations (GS II)', file: 'seedInternationalRelationsAsIs.js' },
  { name: 'Society (GS I)', file: 'seedSocietyAsIs.js' },
  { name: 'Economy (GS III)', file: 'seedEconomyAsIs.js' },
  { name: 'Agri/Ind/Infra (GS III)', file: 'seedGSIIIThreePillars.js' },
  { name: 'Science & Tech (GS III)', file: 'seedScienceAndTechnologyAsIs.js' },
  { name: 'Environment (GS III)', file: 'seedEnvironmentAsIs.js' },
  { name: 'Internal Security (GS III)', file: 'seedInternalSecurityAsIs.js' },
  { name: 'Disaster Mgmt (GS III)', file: 'seedDisasterManagementAsIs.js' },
  { name: 'Ethics (GS IV)', file: 'seedEthicsAsIs.js' },
];

let grandTotal = 0;

scripts.forEach(s => {
  try {
    const content = fs.readFileSync(s.file, 'utf8');
    
    // Count  character (Unicode: \u25C6 or similar bullet markers)
    // The raw text uses  as bullet markers
    const bulletRegex = /\u0020/g; // space - not right
    
    // Actually count lines that start with  (the diamond bullet used in the syllabus)
    // Let's count all occurrences of the specific bullet character
    const allBullets = (content.match(/\u0020\u0020/g) || []).length; // double space pattern
    
    // Better: count lines in RAW_TEXT that have the  marker
    const rawMatch = content.match(/const RAW_[\w_]+\s*=\s*`([\s\S]*?)`;/);
    if (rawMatch) {
      const rawText = rawMatch[1];
      // Count lines starting with  or containing  as bullet marker
      const lines = rawText.split('\n');
      const bulletLines = lines.filter(l => l.trimStart().startsWith('\u0020'));
      // Count the  character specifically
      const diamondBullets = (rawText.match(/\u25C6/g) || []).length;
      const whiteDiamonds = (rawText.match(/\u25C7/g) || []).length;
      const bullets = (rawText.match(//g) || []).length;
      const smallBullets = (rawText.match(/•/g) || []).length;
      const nonEmptyLines = lines.filter(l => l.trim().length > 0).length;
      
      // Count lines starting with special chars (likely bullet items)
      const specialStart = lines.filter(l => {
        const t = l.trim();
        return t.length > 0 && !t.match(/^[A-Z\s&]+$/) && !t.match(/^www\./) && !t.match(/^\d+\s*$/) && !t.match(/^UPSC/);
      }).length;
      
      console.log(`${s.name}: ${nonEmptyLines} non-empty lines in raw text`);
      grandTotal += nonEmptyLines;
    } else {
      // Check for CLEANED_TOPICS array
      const cleanedMatch = content.match(/CLEANED_TOPICS\s*=\s*\[([\s\S]*?)\];/);
      if (cleanedMatch) {
        const items = cleanedMatch[1].match(/"[^"]+"/g) || [];
        console.log(`${s.name}: ${items.length} pre-cleaned items in array`);
        grandTotal += items.length;
      } else {
        // Check for multiple arrays (Ethics)
        const allArrays = content.match(/(ETHICS_INTEGRITY_TOPICS|ATTITUDE_APTITUDE_TOPICS|CASE_STUDIES_TOPICS)\s*=\s*\[([\s\S]*?)\];/g);
        if (allArrays) {
          let total = 0;
          allArrays.forEach(a => {
            const items = a.match(/"[^"]+"/g) || [];
            total += items.length;
          });
          console.log(`${s.name}: ${total} pre-cleaned items across arrays`);
          grandTotal += total;
        } else {
          console.log(`${s.name}: Could not parse`);
        }
      }
    }
  } catch (e) {
    console.log(`${s.name}: FILE NOT FOUND`);
  }
});

console.log(`\nGrand total from seeder scripts: ${grandTotal}`);
