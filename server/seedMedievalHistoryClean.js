const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const rawMedievalHistoryList = [
  "Major Dynasties (750-1200) of Early Medieval India",
  "The Pratiharas (8th to 10th Century)",
  "The Palas (8th to 11th Century)",
  "The Tripartite Conflict",
  "The Senas (11th to 12th Century)",
  "The Rajaputas",
  "Pallavas",
  "Chalukyas",
  "Rashtrakutas",
  "Indian Feudalism",
  "Administration",
  "Society and Culture",
  "Economy and the decline of Trade",
  "Cholas and Other South Indian Kingdoms",
  "Chola Rulers and Political History",
  "Chola Administration",
  "Socio-Economic Life",
  "Education and Literature",
  "The Cheras (9th to 12th Century)",
  "The Yadavas (12th to 13th Century)",
  "Contact with South-East Asia",
  "Early Muslim Invasions",
  "The Arab Conquest of Sindh",
  "Mahmud of Ghazni",
  "Muhammad Ghori",
  "The Delhi Sultanate (1206-1526 AD)",
  "Slave Dynasty",
  "Khalji Dynasty (1290-1320 AD)",
  "Tughlaq Dynasty (1320-1414 AD)",
  "Provincial Kingdoms and Resistance by Indian Chiefs",
  "Sayyid Dynasty",
  "Lodi Dynasty",
  "Attacks by Mongols and other Turks",
  "Administration",
  "Economy",
  "Urbanization",
  "Society and Culture",
  "Scientific Knowledge and legal System",
  "Challenges leading to the decline of the Sultanate",
  "Vijayanagar Empire",
  "Sources",
  "Political History",
  "Administration",
  "Social and Cultural Life",
  "Economic Condition",
  "Conflicts with the Bahmani Kingdom",
  "Central Asian Politics and the Advance of Babur towards India",
  "The Timurids",
  "The Timurid-Uzbek",
  "Uzbek-Iran Conflict and Babur",
  "Babur’s Advance towards India",
  "Struggle for Empire in North India (Afghans, Rajputs and Mughals)",
  "Struggle between Ibrahim Lodi and Babur, the Battle of Panipat",
  "Babur’s problems after the Battle of Panipat",
  "Struggle with Rana Sanga",
  "Problems of the Eastern Areas and the Afghans",
  "Babur’s Contribution and Significance of his Advent into India",
  "Struggle for Empire in North India",
  "Humayun and the Afghans",
  "Early Activities of Humayun, and the Tussle with Bahadur Shah",
  "The Gujarat Campaign",
  "The Bengal Campaign, and Struggle with Sher Khan",
  "The Establishment of the North Indian Empire",
  "The Surs dynasty",
  "Sher Shah’s Early Life",
  "Social and Political Background of Bihar and the Rise of Sher Shah to Power",
  "The Sur Empire (1540-56)",
  "Contributions of Sher Shah",
  "Consolidation and Expansion of the Empire - Akbar",
  "Conflict with the Afghans - Hemu",
  "Struggle with the Nobility",
  "Regency; Revolt of Uzbek Nobles",
  "Early Expansion of the Empire (1560-76) - Malwa, Garh-Katanga, Rajasthan, Gujarat, Eastern India",
  "Relations with the Rajputs - Growth of a Composite Ruling Class",
  "Rebellions, and Further Expansion of the Empire in the North West",
  "State and Government under Akbar",
  "Akbar’s Concept of Suzerainty",
  "Structure of Government, Central and Provincial - the Vikalat, the Central Ministries, Provincial Ministries",
  "Government, District and Local Government",
  "The Working of Government - the Ruler, Land-Revenue System, the Dahsala System, the Mansabdari System and the Army",
  "Akbar’s Religious Views",
  "Relations with the Ulama and Social Reforms",
  "The Early Phase (1556-73)",
  "The Second Phase (1573-80) - the Ibadat Khana",
  "Debates - the Mahzar - Breach with Orthodox Ulama",
  "Re-organisation of Madadd-i-Maash Grants",
  "Third or Final Phase - Din-i-Ilahi – State Policies & Religious Toleration",
  "The Deccan and the Mughals (Upto 1657)",
  "The Deccani States upto 1595",
  "Mughal Advance towards the Deccan",
  "Mughal Conquest of Berar, Khandesh and Parts of Ahmadnagar",
  "Rise of Malik Ambar, and Frustration of Mughal Attempt at Consolidation (1601-27)",
  "Extinction of Ahmadnagar, Acceptance of Mughal Suzerainty by Bijapur and Golconda",
  "Shah Jahan and the Deccan (1636-57)",
  "Cultural Contribution of the Deccani States",
  "Foreign Policy of the Mughals",
  "Akbar and the Uzbeks",
  "The Question of Qandahar and Relations with Iran",
  "Shah Jahan’s Balkh Campaign",
  "Mughal - Persian Relations - the Last Phase",
  "India in the First Half of the Seventeenth Century",
  "Jahangir’s Accession - his Early Difficulties",
  "Territorial Consolidation and Expansion of the Empire - Mewar, East India and Kangra",
  "Nur Jahan, and the Nur Jahan ‘Junta’",
  "The Rebellions of Shah Jahan, and the coup de main of Mahabat Khan",
  "Jahangir as a Ruler",
  "State and Religion in the First Half of the Seventeenth Century",
  "Shah Jahan - Consolidation and Expansion of the Empire",
  "Evolution of the Mughal Ruling Class and the Mansabdari System",
  "Aurangzeb - Religious Policies, North India and the Rajputs",
  "War of Succession",
  "Religious Policy: First Phase (1658-79)",
  "Reforms and Puritanical Measures",
  "Temples, Jizyah; Second Phase (1679-1707)",
  "Territorial Consolidation and Expansion of Empire - North India",
  "Popular Revolts - Jats, Satnamis, Afghans and Sikhs",
  "Breach with Marwar and Mewar",
  "Climax and Crisis of the Mughal Empire the Marathas and the Deccan",
  "Rise of the Marathas - Early reign of Shivaji",
  "Treaty of Purandar - the Agra Visit",
  "Shivaji’s Swarajya - Administration and Achievements",
  "Aurangzeb and the Deccani States (1658-87)",
  "Marathas and the Decean (1687-1707)",
  "Assessment of Aurangzeb and the Jagirdari Crisis",
  "Society-Structure and Growth",
  "Rural Society",
  "Towns and Town Life",
  "Artisans and Master-Craftsmen",
  "Women",
  "Servants and Slaves",
  "Standard of Living",
  "The Ruling Classes - Nobility, Rural Gentry",
  "The Middle Strata",
  "The Commercial Classes",
  "Economic Life-Patterns and Prospects",
  "Inland Trade",
  "Overseas Trade - Role of Foreign Trading Companies",
  "Position of Indian Merchants over-Land Trade",
  "The Mughal State and Commerce",
  "Trend of India’s Economy and Prospects during the First Half of the Eighteenth Century",
  "Religion, Fine Arts, Science and Technology",
  "Religion- Hindu Religion, Sikh Religion, Islam",
  "Fine Arts - Architecture, Painting, Language and Literature, Music",
  "Science and Technology",
  "Northern India in the First Half of the Eighteenth Century",
  "Bahadur Shah I, and the Beginning of the Struggle For Wizarat",
  "Rajput Affairs - Marathas and the Deccan - Accentuation of the Party Struggle",
  "Struggle for ‘New’ Wizarat: Zulfiqar Khan and Jahandar Shah (1712-13)",
  "The Sayyid Brothers’ Struggle for ‘New’ Wizarat",
  "The Sayyid ‘New’ Wizarat",
  "The Wizarat of M. Amin Khan and Nizam-ul-Mulk",
  "Rise of Regional States, Beginning of Foreign Invasions of India (1725-48)",
  "The Maratha Bid for Supremacy",
  "The Marathas and their Policy of Expansion",
  "The Marathas and Nizam-ul-Mulk",
  "The Maratha Advance into Gujarat and Malwa",
  "The Maratha Advance into Doab and Punjab",
  "First Phase (1741-52); Second Phase (1752-61)",
  "Third Battle of Panipat"
];

async function seedCleanMedievalHistory() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let gs1 = await Subject.findOne({ name: 'GS I' });
    if (!gs1) {
      gs1 = await Subject.create({ name: 'GS I', description: 'History, Art & Culture, Geography, and Indian Society' });
    }

    // Delete old Medieval History topics under GS I
    const deleteRes = await Topic.deleteMany({ subjectId: gs1._id, tags: 'Medieval History' });
    console.log(`🗑️ Deleted ${deleteRes.deletedCount} old Medieval History topics.`);

    // Deduplicate list
    const uniqueTitles = Array.from(new Set(rawMedievalHistoryList.map(t => t.trim()))).filter(Boolean);

    const topicsToInsert = uniqueTitles.map(title => ({
      title,
      tags: ['Medieval History', 'GS I'],
      difficulty: 'Medium',
      subjectId: gs1._id,
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
    console.log(`🎉 Successfully seeded ${inserted.length} clean Medieval History topics under GS I!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Medieval History:', err);
    process.exit(1);
  }
}

seedCleanMedievalHistory();
