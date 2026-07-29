/**
 * Count actual subtopic lines in raw text (lines that aren't headers/footers/empty)
 */
const fs = require('fs');

const scripts = [
  { name: 'Polity (GS II)', file: 'seedPolityAsIs.js', dbCount: 284 },
  { name: 'Governance (GS II)', file: 'seedGovernanceAsIs.js', dbCount: 225 },
  { name: 'Social Justice (GS II)', file: 'seedSocialJusticeAsIs.js', dbCount: 168 },
  { name: 'Intl Relations (GS II)', file: 'seedInternationalRelationsAsIs.js', dbCount: 272 },
  { name: 'Society (GS I)', file: 'seedSocietyAsIs.js', dbCount: 59 },
  { name: 'Economy (GS III)', file: 'seedEconomyAsIs.js', dbCount: 242 },
  { name: 'Agri/Ind/Infra (GS III)', file: 'seedGSIIIThreePillars.js', dbCount: 208 },
  { name: 'Science & Tech (GS III)', file: 'seedScienceAndTechnologyAsIs.js', dbCount: 326 },
  { name: 'Environment (GS III)', file: 'seedEnvironmentAsIs.js', dbCount: 337 },
];

let totalRawLines = 0;
let totalDBCount = 0;
let totalDiff = 0;

console.log('Section                      | Raw Lines | In DB | Diff (lost to Gemini)');
console.log('-'.repeat(75));

scripts.forEach(s => {
  const content = fs.readFileSync(s.file, 'utf8');
  const rawMatch = content.match(/const RAW_[\w_]+\s*=\s*`([\s\S]*?)`;/);
  if (rawMatch) {
    const rawText = rawMatch[1];
    const lines = rawText.split('\n');
    const nonEmpty = lines.filter(l => l.trim().length > 0);
    
    // Filter out obvious headers/footers
    const contentLines = nonEmpty.filter(l => {
      const t = l.trim();
      if (t.match(/^UPSC SYLLABUS/)) return false;
      if (t.match(/^www\.iasscore/)) return false;
      if (t.match(/^\d+\s*$/)) return false;
      if (t.match(/^\d+\s+UPSC/)) return false;
      if (t === 'POLITY') return false;
      if (t === 'GOVERNANCE') return false;
      if (t === 'SOCIAL JUSTICE') return false;
      if (t === 'ECONOMY') return false;
      if (t === 'AGRICULTURE') return false;
      if (t === 'INDUSTRY') return false;
      if (t === 'INFRASTRUCTURE') return false;
      if (t === 'CONTEMPORARY ISSUES') return false;
      if (t === 'BASIC ECONOMY') return false;
      if (t === 'INTERNAL SECURITY') return false;
      return true;
    });
    
    // Many lines are continuation lines (part of multi-line subtopics)
    // A "new subtopic" line typically starts with a special char or capital letter after bullet
    // Continuation lines start with lowercase
    let subtopicCount = 0;
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i].trim();
      // Check if this is a new bullet point (starts with the  marker or similar)
      const firstChar = line.charAt(0);
      const firstCharCode = firstChar.charCodeAt(0);
      
      // If the first char is a special character (non-alphanumeric, non-space), it's a bullet
      if (firstCharCode < 48 || (firstCharCode > 57 && firstCharCode < 65) || firstCharCode > 127) {
        subtopicCount++;
      }
    }
    
    const diff = subtopicCount - s.dbCount;
    console.log(`${s.name.padEnd(28)} | ${String(subtopicCount).padStart(9)} | ${String(s.dbCount).padStart(5)} | ${diff > 0 ? '+' : ''}${diff}`);
    totalRawLines += subtopicCount;
    totalDBCount += s.dbCount;
    totalDiff += diff;
  }
});

// Add offline scripts (no loss)
const offlineItems = [
  { name: 'Internal Security (GS III)', count: 96 },
  { name: 'Disaster Mgmt (GS III)', count: 38 },
  { name: 'Ethics & Integrity (GS IV)', count: 152 },
  { name: 'Attitude & Aptitude (GS IV)', count: 26 },
  { name: 'Case Studies (GS IV)', count: 7 },
];

offlineItems.forEach(s => {
  console.log(`${s.name.padEnd(28)} | ${String(s.count).padStart(9)} | ${String(s.count).padStart(5)} | 0`);
  totalRawLines += s.count;
  totalDBCount += s.count;
});

// GS I from PDF (no raw text from user)
const gs1Items = [
  { name: 'GS I (from PDF, no raw text)', count: 640 },
];
gs1Items.forEach(s => {
  console.log(`${s.name.padEnd(28)} | ${String('N/A').padStart(9)} | ${String(s.count).padStart(5)} | N/A`);
  totalDBCount += s.count;
});

console.log('-'.repeat(75));
console.log(`${'TOTAL'.padEnd(28)} | ${String(totalRawLines).padStart(9)} | ${String(totalDBCount).padStart(5)} | ${totalDiff > 0 ? '+' : ''}${totalDiff}`);
console.log(`\nUser expected: 3455`);
console.log(`Currently in DB: 3051`);
console.log(`Gap: 404`);
