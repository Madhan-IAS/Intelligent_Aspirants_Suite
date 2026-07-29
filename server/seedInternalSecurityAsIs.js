/**
 * Seed Internal Security Syllabus (GS III) Offline (Bypassing Gemini Quota)
 * Run: node seedInternalSecurityAsIs.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const CLEANED_TOPICS = [
  "Internal Security Challenges",
  "Social Diversity as Issues of Security",
  "Challenges from within Neighbours as Issue of Security Threat",
  "Non-State Actors as Issue of Security Threat",
  "Global Indices and Measurement of Vulnerability of a State Towards such Non-State Actors",
  "Law and Order vs. Internal Security",
  "Terrorism Threat to India",
  "Changing face of Terrorism",
  "Terror Threats Faced by India",
  "Broader Framework to Deal with Terrorism",
  "Drawbacks in Intelligence Infrastructure",
  "Organized Crime",
  "Types of Organized Crime",
  "Problems in controlling organized crimes",
  "Drug trafficking in India",
  "Combating organized crimes",
  "Linkage of Terrorism and Organized Crime in India",
  "Linkage between Development and Spread of Extremism",
  "Stated Purpose of the Naxal Movement",
  "Covid 19 and Naxalism",
  "Why naxalism got huge support from common man?",
  "Why naxalism is biggest threat to internal security?",
  "Insurgency in North-East",
  "Issues & Conflicts",
  "Assam Insurgency",
  "Resolving the Bodo Issue",
  "Security Challenges in Border Areas",
  "Challenges to Border Management",
  "Issues Faced in Border Management",
  "Community Participation for Border Management",
  "Basics of Cyber Security",
  "Types of Cyber Crimes",
  "Impact and Steps needed",
  "Recent Incident: Ransomware",
  "India’s Cyber Security Infrastructure",
  "The National Cyber Security Policy of India 2013",
  "Cyber Warfare",
  "Factors Contributing/Aggravating Rise of Cyber Attack",
  "Recent Initiatives for Tackling Cyber Warfare",
  "Social Media and Internal Security Threat",
  "Regulation of Social Media in India for Internal Security",
  "Challenges in Monitoring Social Media",
  "Steps Needed",
  "Money Laundering",
  "Meaning of Money Laundering",
  "Harmful Effects of Money Laundering",
  "Steps taken by the Government",
  "Black Money in India",
  "Parallel Economy in India",
  "Police Reforms in India",
  "The Organisational Structure",
  "Duties and Responsibilities of the Police",
  "Centre’s Role in Policing",
  "Traditional Security Challenges",
  "What are the various measures taken by Government to curb Black Money?",
  "Impact of demonetisation on black money",
  "Police we Want in 21st Century",
  "Various Security Forces and their Mandate",
  "Criticisms",
  "Non-Traditional Security Challenges (NTS)",
  "Recommendations for Police Reforms",
  "Assam Rifles",
  "Border Security Force (BSF)",
  "Indo-Tibetan Border Police",
  "Central Industrial Security Force (CISF)",
  "Central Reserve Police Force",
  "National Security Guard",
  "Integrated theatre commands",
  "National Maritime Security Coordinator",
  "Issues with Paramilitary Forces",
  "Drug trafficking and Narcoterrorism emerge as a national threat for India",
  "Growing insurgency in different states of India",
  "De-Radicalization in India",
  "Contemporary challenges in terrorism like religious indoctrination via social media",
  "Left Wing Extremism and Insurgency in J&K",
  "Technological Dependence on Other Nations and its impact on India’s technological security",
  "Modernisation Fund for Defence and Internal Security",
  "The Dark Web and associated Regulatory Challenges",
  "Coastal Security challenges for India",
  "Police Reform with Respect to Cyber Security",
  "India’s National Cyber Security Strategy",
  "Big-Techs & weaponisation of Internet",
  "India’s Coastal Security & its significance",
  "AFSPA and the ‘debate’ on its need",
  "Integration of Central Agencies with CCTNS",
  "Inter-operable Criminal Justice System (ICJS)",
  "Crypto currency and National Security",
  "Terrorism, the biggest violator of ‘human rights’",
  "Medical devices and cyber-attack threats",
  "Exclusive Economic Zone and India’s Maritime Governance",
  "Role of CAPF (paramilitary forces) in internal security",
  "Frequent changes in anti-terror laws",
  "Smart Fencing (Border Management)",
  "Insurgency in North East",
  "Money Laundering",
  "Drug abuse problem in border areas"
];

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS III Subject
    const subject = await Subject.findOne({ name: 'GS III' });
    if (!subject) {
      console.error('❌ Subject GS III not found.');
      process.exit(1);
    }

    console.log(`Seeding ${CLEANED_TOPICS.length} pre-cleaned Internal Security topics...`);

    // Delete any existing Internal Security topics under GS III
    const deleteRes = await Topic.deleteMany({
      subjectId: subject._id,
      tags: 'Internal Security'
    });
    console.log(`Deleted ${deleteRes.deletedCount} old Internal Security topics.`);

    const topicsToInsert = CLEANED_TOPICS.map(title => ({
      title: title.trim(),
      tags: ["Internal Security"],
      difficulty: "Medium",
      subjectId: subject._id,
      status: 'Pending',
      notes: {
        theory: '',
        definitions: '',
        examples: '',
        caseStudies: '',
        statistics: '',
        committeeReports: '',
        supremeCourtCases: '',
        governmentSchemes: '',
        wayForward: '',
        diagrams: '',
        mindMaps: '',
        currentAffairs: '',
        pyqs: '',
        valueAddition: ''
      }
    }));

    const inserted = await Topic.insertMany(topicsToInsert);
    console.log(`✅ Successfully seeded all ${inserted.length} Internal Security topics!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
