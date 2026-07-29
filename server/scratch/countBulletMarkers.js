/**
 * Count the actual  bullet markers in each raw text block
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
];

let totalBullets = 0;

scripts.forEach(s => {
  try {
    const content = fs.readFileSync(s.file, 'utf8');
    // Find all lines in raw text that start with  (after trimming)
    // The  character is the bullet used in the syllabus text
    const rawMatch = content.match(/const RAW_[\w_]+\s*=\s*`([\s\S]*?)`;/);
    if (rawMatch) {
      const rawText = rawMatch[1];
      const lines = rawText.split('\n');
      // Count lines that start with a bullet  (Unicode: various)
      // The raw text uses the  character (small filled square/diamond)
      let bulletCount = 0;
      lines.forEach(line => {
        const trimmed = line.trim();
        // Lines that are actual subtopic items (start with the bullet marker)
        if (trimmed.length > 0 && trimmed.charAt(0).charCodeAt(0) > 127) {
          // Non-ASCII first character = likely a bullet marker
          bulletCount++;
        }
      });
      console.log(s.name + ': ' + bulletCount + ' bullet-starting lines');
      totalBullets += bulletCount;
    }
  } catch (e) {
    console.log(s.name + ': ERROR');
  }
});

console.log('\nTotal bullet-starting lines from Gemini-cleaned scripts: ' + totalBullets);

// Now count from offline scripts (already exact)
const offlineScripts = [
  { name: 'Internal Security (GS III)', file: 'seedInternalSecurityAsIs.js', pattern: 'CLEANED_TOPICS' },
  { name: 'Disaster Mgmt (GS III)', file: 'seedDisasterManagementAsIs.js', pattern: 'CLEANED_TOPICS' },
  { name: 'Ethics (GS IV)', file: 'seedEthicsAsIs.js', pattern: 'TOPICS' },
];

let offlineTotal = 0;
offlineScripts.forEach(s => {
  const content = fs.readFileSync(s.file, 'utf8');
  const items = content.match(/"[^"]{3,}"/g) || [];
  // Filter out object keys
  const topicItems = items.filter(i => !i.match(/^"(title|tags|difficulty|status|theory|definitions|examples|caseStudies|statistics|committeeReports|supremeCourtCases|governmentSchemes|wayForward|diagrams|mindMaps|currentAffairs|pyqs|valueAddition|subjectId|notes|Medium|Hard|Easy|Pending|Internal Security|Disaster Management|Ethics & Integrity|Attitude & Aptitude|Case Studies)"$/));
  console.log(s.name + ': ' + topicItems.length + ' topic items');
  offlineTotal += topicItems.length;
});

console.log('\nTotal from offline scripts: ' + offlineTotal);
console.log('Combined total from all seeder raw inputs: ' + (totalBullets + offlineTotal));
