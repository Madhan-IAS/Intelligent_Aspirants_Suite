/**
 * Seed script — Ancient India Master Mind Map
 * Run: node seedMindMapAncientIndia.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const MindMap = require('./models/MindMap');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const ancientIndiaMindMaps = [

    // ── I. PREHISTORIC & EARLY INDIA ──────────────────────────────
    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Prehistory — Palaeolithic to Iron Age',
        description: 'Complete overview of prehistoric India covering Palaeolithic, Mesolithic, Neolithic, Chalcolithic, and Megalithic/Iron Age phases with UPSC dimensions.',
        content: `PREHISTORY
├── Palaeolithic
├── Mesolithic
├── Neolithic
├── Chalcolithic
└── Megalithic / Iron Age
    └─→ Agriculture → Iron → Settlements → Early states

WHO → Communities / early human groups
WHEN → Prehistoric phases
CAPITAL → —
EXPANSION → Settlement expansion
DEFEATED WHOM → —
ADMINISTRATION → Tribal / chiefdom beginnings
ECONOMY → Hunting → pastoralism → agriculture
SOCIETY → Kinship → tribes → settled communities
RELIGION → Animism / burial practices
ART → Rock paintings / megaliths
LITERATURE → —
SCIENCE → Stone tools → metallurgy → iron
SOURCES → Archaeology
SITES → Bhimbetka, Burzahom, Mehrgarh, Inamgaon`,
        tags: ['Ancient India', 'Prehistory', 'Palaeolithic', 'Mesolithic', 'Neolithic', 'Chalcolithic', 'Iron Age', 'GS I'],
        sortOrder: 1
    },

    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Harappan Civilization — Indus Valley',
        description: 'Comprehensive mind map of the Indus Valley / Harappan Civilization covering Early, Mature, and Late phases with all major sites and UPSC dimensions.',
        content: `HARAPPAN CIVILIZATION
├── Early → Mature → Late Harappan
├── Harappa
├── Mohenjo-daro
├── Dholavira
├── Lothal
├── Kalibangan
└── Rakhigarhi

Urbanism → Drainage → Craft → Trade
Religion → Burials → Seals → Script
Decline / Transformation

WHO → Urban Harappan communities
WHEN → c. 2600–1900 BCE (Mature phase)
CAPITAL → No confirmed capital
EXPANSION → Indus–Saraswati / wider interaction zone
DEFEATED WHOM → —
ADMINISTRATION → Planned urban governance
ECONOMY → Agriculture → crafts → trade
SOCIETY → Urban / occupational differentiation
RELIGION → Rituals → burials → figurines
ART → Seals → bronze → terracotta → pottery
LITERATURE → Undeciphered script
SCIENCE → Drainage → metallurgy → weights & measures
SOURCES → Archaeology
SITES → Harappa, Mohenjo-daro, Dholavira, Lothal, Kalibangan, Rakhigarhi`,
        tags: ['Ancient India', 'Harappan', 'Indus Valley', 'Mohenjo-daro', 'Dholavira', 'Lothal', 'GS I'],
        sortOrder: 2
    },

    // ── II. VEDIC AGE ─────────────────────────────────────────────
    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Vedic Age — Early & Later Vedic Period',
        description: 'Complete mind map of the Vedic Age covering Early Vedic (Rigvedic) and Later Vedic periods with society, polity, economy, religion, and literature.',
        content: `VEDIC AGE
├── EARLY VEDIC
│   └─→ Rigvedic society → Sabha / Samiti
└── LATER VEDIC
    └─→ Agriculture → Iron → Territorial states

Vedic Literature → Brahmanas → Upanishads

WHO → Vedic tribes / kingdoms
WHEN → c. 1500–600 BCE (broad framework)
CAPITAL → Changing tribal / territorial centres
EXPANSION → Punjab → Ganga-Yamuna region
DEFEATED WHOM → Inter-tribal conflicts
ADMINISTRATION → Sabha → Samiti → kingship
ECONOMY → Pastoralism → agriculture → iron
SOCIETY → Varna formation → patriarchy
RELIGION → Vedic → Upanishadic thought
ART → Pottery / early iron-age material culture
LITERATURE → Vedas → Brahmanas → Aranyakas → Upanishads
SCIENCE → Early astronomy / mathematics / metallurgy
SOURCES → Vedic texts + archaeology
SITES → Painted Grey Ware zone`,
        tags: ['Ancient India', 'Vedic Age', 'Rigveda', 'Upanishads', 'Early Vedic', 'Later Vedic', 'GS I'],
        sortOrder: 3
    },

    // ── III. SECOND URBANIZATION & MAHAJANAPADAS ──────────────────
    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Mahajanapadas — Second Urbanization',
        description: '16 Mahajanapadas, monarchies vs republics (gana-sanghas), rise of Buddhism & Jainism, and the second urbanization of India.',
        content: `MAHAJANAPADAS
├── 16 Mahajanapadas
├── Monarchies
└── Ganas / Sanghas

WHO → Mahajanapada rulers / gana-sanghas
WHEN → c. 6th century BCE
CAPITAL → Rajagriha, Shravasti, Kaushambi, etc.
EXPANSION → Ganga valley
DEFEATED WHOM → Inter-state competition
ADMINISTRATION → Monarchy + republican systems
ECONOMY → Agriculture → trade → coinage
SOCIETY → Urbanisation / merchant groups
RELIGION → Buddhism / Jainism / Brahmanical traditions
ART → Early Buddhist / urban material culture
LITERATURE → Buddhist / Jain texts
SCIENCE → Iron technology
SOURCES → Buddhist, Jain, Brahmanical texts
SITES → Rajgir, Vaishali, Sravasti, Kaushambi`,
        tags: ['Ancient India', 'Mahajanapadas', 'Second Urbanization', 'Republics', 'GS I'],
        sortOrder: 4
    },

    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Buddhism — Life, Philosophy & Spread',
        description: 'Complete mind map of Buddhism covering Buddha\'s life, Four Noble Truths, Eightfold Path, councils, schools (Theravada/Mahayana/Vajrayana), and spread.',
        content: `BUDDHISM
├── Buddha → life & places
├── Four Noble Truths
├── Eightfold Path
├── Middle Path
├── Councils
├── Theravada
├── Mahayana
├── Vajrayana
├── Literature
├── Spread
└── Art & Architecture`,
        tags: ['Ancient India', 'Buddhism', 'Buddha', 'Mahayana', 'Theravada', 'GS I'],
        sortOrder: 5
    },

    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Jainism — Mahavira, Philosophy & Schools',
        description: 'Complete mind map of Jainism covering Mahavira, Triratna, Five Vows, Digambara/Svetambara schools, councils, literature, and art.',
        content: `JAINISM
├── Mahavira
├── Triratna
├── Five Vows
├── Digambara
├── Svetambara
├── Councils
├── Literature
├── Spread
└── Art & Architecture`,
        tags: ['Ancient India', 'Jainism', 'Mahavira', 'Digambara', 'Svetambara', 'GS I'],
        sortOrder: 6
    },

    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Magadha — Haryanka, Shishunaga & Nanda Dynasties',
        description: 'Rise of Magadha through three dynasties: Haryanka (Bimbisara, Ajatashatru), Shishunaga, and Nanda (Mahapadma Nanda, Dhana Nanda).',
        content: `MAGADHA
│
├── HARYANKA
│   ├── Bimbisara
│   │   └─→ expansion through conquest + marriage alliances
│   └── Ajatashatru
│       └─→ defeated Vajji Confederacy
│
├── SHISHUNAGA
│   └─→ succeeded Haryankas
│
└── NANDA
    ├── Mahapadma Nanda
    │   └─→ succeeded / supplanted Shishunagas
    └── Dhana Nanda
        └─→ overthrown by Chandragupta Maurya

WHO → Haryanka → Shishunaga → Nanda
WHEN → 6th–4th century BCE
CAPITAL → Rajagriha → Pataliputra
EXPANSION → Ganga valley
DEFEATED WHOM → Vajji; rival Mahajanapadas
ADMINISTRATION → Monarchical state
ECONOMY → Agriculture → taxation → trade
SOCIETY → Urbanisation
RELIGION → Buddhism / Jainism / Brahmanical traditions
ART → Early stupas / urban culture
LITERATURE → Buddhist / Jain traditions
SCIENCE → Iron technology
SOURCES → Buddhist / Jain / Brahmanical texts
SITES → Rajgir, Pataliputra, Vaishali`,
        tags: ['Ancient India', 'Magadha', 'Haryanka', 'Shishunaga', 'Nanda', 'Bimbisara', 'Ajatashatru', 'GS I'],
        sortOrder: 7
    },

    // ── IV. MAURYAN IMPERIAL AGE ──────────────────────────────────
    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Maurya Empire — Chandragupta to Ashoka',
        description: 'Complete Mauryan dynasty mind map: Chandragupta Maurya, Bindusara, Ashoka (Kalinga War, Dhamma, Edicts), Later Mauryas, with full UPSC dimensions.',
        content: `MAURYA  c. 322–185 BCE
│
├── Chandragupta Maurya
│   ├─→ overthrew Nandas
│   ├─→ defeated Seleucus I
│   └─→ Pataliputra
│
├── Bindusara
│   └─→ consolidated empire
│
├── Ashoka
│   ├─→ Kalinga War
│   ├─→ Dhamma
│   ├─→ Rock & Pillar Edicts
│   └─→ Buddhist patronage
│
└── Later Mauryas
    ├── Dasharatha
    └── Brihadratha
        └─→ killed by Pushyamitra Shunga

SOURCES / CULTURE
→ Arthashastra | Megasthenes | Ashokan Edicts
→ Mauryan pillars | Stupas | Barabar caves

WHO → Chandragupta → Bindusara → Ashoka → Later Mauryas
WHEN → c. 322–185 BCE
CAPITAL → Pataliputra
EXPANSION → Pan-Indian empire
DEFEATED WHOM → Nandas → Seleucus → Kalinga
ADMINISTRATION → Centralised bureaucracy → provinces → officials
ECONOMY → Agriculture → taxation → trade → guilds
SOCIETY → Varna / occupational groups / urban society
RELIGION → Buddhism + Brahmanical traditions → Dhamma
ART → Pillars → stupas → Barabar caves
LITERATURE → Arthashastra / Buddhist literature
SCIENCE → Metallurgy → engineering → irrigation
SOURCES → Arthashastra → Megasthenes → Edicts
SITES → Pataliputra → Sanchi → Sarnath → Dhauli → Barabar`,
        tags: ['Ancient India', 'Maurya', 'Chandragupta', 'Ashoka', 'Arthashastra', 'Dhamma', 'GS I'],
        sortOrder: 8
    },

    // ── V. POST-MAURYAN INDIA ─────────────────────────────────────
    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Shunga & Kanva Dynasties — Post-Mauryan North India',
        description: 'Shunga dynasty (Pushyamitra Shunga, Agnimitra) and Kanva dynasty after the fall of the Mauryas.',
        content: `SHUNGA
├── Pushyamitra Shunga
│   └─→ overthrew Mauryas
├── Agnimitra
└── Later Shungas
    └─→ replaced by Kanvas

KANVA
├── Vasudeva Kanva
├── Bhumimitra
└── Later Kanvas
    └─→ decline of Kanva power`,
        tags: ['Ancient India', 'Shunga', 'Kanva', 'Post-Mauryan', 'Pushyamitra', 'GS I'],
        sortOrder: 9
    },

    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Indo-Greeks & Shakas — Foreign Rulers in India',
        description: 'Indo-Greek rulers (Demetrius, Menander/Milinda) and Shaka/Western Kshatrapa rulers (Nahapana, Rudradaman I).',
        content: `INDO-GREEKS
├── Demetrius
└── Menander (Milinda)
    ├─→ Indo-Greek expansion
    └─→ Milindapanha

SHAKAS / WESTERN KSHATRAPAS
├── Nahapana
│   └─→ defeated by Gautamiputra Satakarni
└── Rudradaman I
    ├─→ Junagadh Inscription
    └─→ defeated Satavahana ruler in conflict`,
        tags: ['Ancient India', 'Indo-Greeks', 'Shakas', 'Menander', 'Rudradaman', 'Post-Mauryan', 'GS I'],
        sortOrder: 10
    },

    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Kushan Empire — Kanishka & Silk Route',
        description: 'Complete Kushan dynasty from Kujula Kadphises to Vasudeva I. Kanishka\'s empire, Mahayana Buddhism, Gandhara & Mathura art schools.',
        content: `KUSHANS
├── Kujula Kadphises
├── Vima Kadphises
├── Kanishka
│   ├─→ major imperial expansion
│   ├─→ Mahayana association
│   └─→ Gandhara / Mathura
├── Huvishka
└── Vasudeva I
    └─→ later decline

WHO → Kushan rulers
WHEN → c. 1st–3rd century CE
CAPITAL → Purushapura / Mathura
EXPANSION → North-West → Central Asia → North India
DEFEATED WHOM → Regional rivals
ADMINISTRATION → Imperial / provincial
ECONOMY → Silk Route → long-distance trade → coinage
SOCIETY → Cosmopolitan / commercial
RELIGION → Buddhism + diverse traditions
ART → Gandhara + Mathura
LITERATURE → Buddhist traditions
SCIENCE → Astronomy / medicine / exchange
SOURCES → Coins / inscriptions / Chinese accounts
SITES → Purushapura → Mathura`,
        tags: ['Ancient India', 'Kushans', 'Kanishka', 'Gandhara', 'Mathura', 'Silk Route', 'GS I'],
        sortOrder: 11
    },

    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Satavahanas — Deccan Power & Roman Trade',
        description: 'Satavahana dynasty from Simuka to Yajna Sri Satakarni. Gautamiputra Satakarni defeating Nahapana, Amaravati, Prakrit inscriptions, Roman trade.',
        content: `SATAVAHANAS
├── Simuka
├── Satakarni I
├── Gautamiputra Satakarni
│   └─→ defeated Nahapana
├── Vashishthiputra Pulumavi
└── Yajna Sri Satakarni
    └─→ later revival

SATAVAHANA FEATURES
→ Deccan | Pratishthana | Amaravati
→ Roman trade | Guilds | Prakrit inscriptions

WHO → Satavahana rulers
WHEN → c. 1st century BCE–3rd century CE
CAPITAL → Pratishthana
EXPANSION → Deccan
DEFEATED WHOM → Nahapana
ADMINISTRATION → Regional / feudatory elements
ECONOMY → Agriculture → guilds → Roman trade
SOCIETY → Matronymics / occupational groups
RELIGION → Buddhism + Brahmanical traditions
ART → Amaravati
LITERATURE → Prakrit
SCIENCE → Irrigation / craft technology
SOURCES → Nasik / Nanaghat inscriptions → coins
SITES → Pratishthana → Amaravati → Nasik`,
        tags: ['Ancient India', 'Satavahanas', 'Gautamiputra', 'Amaravati', 'Deccan', 'Roman Trade', 'GS I'],
        sortOrder: 12
    },

    // ── VI. SANGAM AGE ────────────────────────────────────────────
    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Sangam Age — Cheras, Cholas & Pandyas',
        description: 'Tamilakam and the three Sangam dynasties: Cheras, Cholas, Pandyas. Sangam literature, Tolkappiyam, maritime trade, and Roman contacts.',
        content: `TAMILAKAM
├── CHERAS
├── CHOLAS
└── PANDYAS

→ Sangam Literature
→ Tolkappiyam
→ Agriculture | Trade | Warfare
→ Roman / Maritime trade

WHO → Three Tamil dynasties
WHEN → Early historic period
CAPITAL → Regional centres
EXPANSION → Tamilakam
DEFEATED WHOM → Inter-dynastic warfare
ADMINISTRATION → Kings / chiefs
ECONOMY → Agriculture → ports → maritime trade
SOCIETY → Clan / occupational groups
RELIGION → Indigenous + Brahmanical influences
ART → Hero stones / material culture
LITERATURE → Sangam corpus → Tolkappiyam
SCIENCE → Agriculture / maritime knowledge
SOURCES → Sangam literature → archaeology
SITES → Puhar → Madurai → Korkai → Muziris`,
        tags: ['Ancient India', 'Sangam', 'Cheras', 'Cholas', 'Pandyas', 'Tamilakam', 'GS I'],
        sortOrder: 13
    },

    // ── VII. GUPTA CLASSICAL AGE ──────────────────────────────────
    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Gupta Empire — Golden Age of India',
        description: 'Complete Gupta dynasty: Sri Gupta to Skandagupta. Samudragupta\'s campaigns, Chandragupta II (Vikramaditya), Kalidasa, Aryabhata, classical art & temples.',
        content: `GUPTA  c. 4th–6th century CE
│
├── Sri Gupta
├── Ghatotkacha
├── Chandragupta I
│   └─→ imperial foundation
│
├── Samudragupta
│   ├─→ North Indian campaigns
│   ├─→ Southern campaigns
│   └─→ Allahabad Pillar Inscription
│
├── Chandragupta II
│   ├─→ defeated Western Kshatrapas
│   └─→ Vikramaditya
│
├── Kumaragupta I
└── Skandagupta
    └─→ resisted Hunas

GUPTA AGE
→ Sanskrit literature → Kalidasa
→ Mathematics / Astronomy → Aryabhata
→ Medicine → Ayurveda traditions
→ Art → Classical sculpture
→ Temple architecture
→ Gold coinage
→ Fa-Hien

WHO → Gupta rulers
WHEN → c. 4th–6th century CE
CAPITAL → Pataliputra / Ujjain
EXPANSION → North India
DEFEATED WHOM → Western Kshatrapas → Hunas resisted
ADMINISTRATION → Provinces → local administration → feudatories
ECONOMY → Agriculture → trade → guilds → gold coinage
SOCIETY → Varna / jati differentiation
RELIGION → Brahmanical revival + Buddhism + Jainism
ART → Sculpture → temples → paintings
LITERATURE → Kalidasa → Sanskrit literature
SCIENCE → Aryabhata → mathematics / astronomy
SOURCES → Inscriptions → coins → Fa-Hien
SITES → Udayagiri → Deogarh → Sarnath`,
        tags: ['Ancient India', 'Gupta', 'Samudragupta', 'Chandragupta II', 'Kalidasa', 'Aryabhata', 'Golden Age', 'GS I'],
        sortOrder: 14
    },

    // ── VIII. POST-GUPTA / EARLY MEDIEVAL TRANSITION ──────────────
    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Harshavardhana & Pushyabhuti Dynasty',
        description: 'Pushyabhuti/Vardhana dynasty: Prabhakaravardhana, Rajyavardhana, Harshavardhana. North Indian consolidation, checked by Pulakeshin II, Xuanzang.',
        content: `PUSHYABHUTI / VARDHANA
├── Prabhakaravardhana
├── Rajyavardhana
└── Harshavardhana
    ├─→ North Indian consolidation
    ├─→ checked by Pulakeshin II
    ├─→ Harshacharita → Bana
    └─→ Xuanzang

WHO → Harshavardhana
WHEN → 7th century CE
CAPITAL → Thanesar → Kannauj
EXPANSION → Northern India
DEFEATED WHOM → Regional rivals; checked by Pulakeshin II
ADMINISTRATION → Monarchy / feudatories
ECONOMY → Agriculture → land grants
SOCIETY → Varna / regional elites
RELIGION → Buddhism + Brahmanical traditions
ART → Religious architecture
LITERATURE → Harshacharita → Bana
SCIENCE → Knowledge centres
SOURCES → Xuanzang → Bana
SITES → Kannauj → Nalanda`,
        tags: ['Ancient India', 'Harshavardhana', 'Pushyabhuti', 'Xuanzang', 'Post-Gupta', 'GS I'],
        sortOrder: 15
    },

    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Regional Kingdoms — Pallavas, Chalukyas, Palas, Pratiharas, Rashtrakutas',
        description: 'Post-Gupta regional powers: Pallavas (Mahabalipuram), Chalukyas (Pulakeshin II), Palas (Nalanda), Gurjara-Pratiharas, Rashtrakutas (Ellora/Kailasa).',
        content: `PALLAVAS
├── Kanchipuram
└── Mahabalipuram
    └─→ rock-cut + structural temples

CHALUKYAS
├── Badami Chalukyas
├── Pulakeshin II
│   └─→ checked Harsha
└── Deccan architecture

PALAS
└─→ Eastern India
    └─→ Buddhism / Nalanda–Vikramashila tradition

GURJARA-PRATIHARAS
└─→ Western / Northern India

RASHTRAKUTAS
└─→ Deccan
    └─→ Ellora / Kailasa Temple`,
        tags: ['Ancient India', 'Pallavas', 'Chalukyas', 'Palas', 'Pratiharas', 'Rashtrakutas', 'Ellora', 'GS I'],
        sortOrder: 16
    },

    // ── IX. EVIDENCE & MEMORY LAYER ───────────────────────────────
    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: 'Sources — Inscriptions, Coins, Foreign Accounts & Sites',
        description: 'All major historical sources for Ancient India: Ashokan Edicts, Junagadh, Allahabad Pillar, coins (punch-marked to Gupta gold), foreign accounts (Megasthenes to Xuanzang), and key archaeological sites.',
        content: `INSCRIPTIONS
├── Ashokan Edicts
├── Hathigumpha
├── Junagadh
├── Allahabad Pillar
├── Nasik
├── Nanaghat
├── Aihole
└── Mehrauli Iron Pillar

COINS
├── Punch-marked
├── Indo-Greek
├── Kushan
├── Satavahana
└── Gupta gold

FOREIGN ACCOUNTS
├── Megasthenes
├── Pliny
├── Periplus
├── Fa-Hien
└── Xuanzang

MAJOR SITES / MAP
├── Harappan sites
├── Buddhist sites
├── Jain sites
├── Mauryan sites
├── Sangam centres
├── Gupta sites
└── Early Medieval temples

MASTER CHRONOLOGY
PREHISTORY → HARAPPAN → VEDIC → MAHAJANAPADAS → MAGADHA
→ MAURYA → POST-MAURYAN → SANGAM → GUPTA → POST-GUPTA
→ HARSHA → EARLY MEDIEVAL → MEDIEVAL INDIA`,
        tags: ['Ancient India', 'Sources', 'Inscriptions', 'Coins', 'Archaeology', 'Foreign Accounts', 'Chronology', 'GS I'],
        sortOrder: 17
    },

    // ── CROSS-CUTTING MASTER THEMATIC MAP ─────────────────────────
    {
        paper: 'GS I',
        subject: 'Ancient India',
        title: '🔒 Cross-Cutting Thematic Master Map — All Periods',
        description: 'Comprehensive cross-cutting thematic map spanning the entire Ancient India timeline. Covers Polity, Economy, Society, Religion, Literature, Art & Architecture, Science & Technology, and Sources.',
        content: `CROSS-CUTTING MAP — RUNS THROUGH THE ENTIRE TIMELINE

POLITY
→ Tribe → Chiefdom → Mahajanapada → Empire
→ Monarchy + Republics
→ Centralisation → Regionalisation

ECONOMY
→ Agriculture → Iron technology → Urbanisation
→ Guilds → Coinage
→ Inland + Maritime trade → Roman trade
→ Land grants

SOCIETY
→ Varna → Jati
→ Family / Kinship → Women
→ Slavery / Labour → Guilds / Occupational groups

RELIGION & PHILOSOPHY
→ Vedic tradition → Upanishadic thought
→ Buddhism → Jainism
→ Brahmanical / Puranic traditions → Bhakti developments

LITERATURE
→ Vedas → Upanishads → Epics
→ Buddhist / Jain texts → Sangam literature
→ Sanskrit literature → Kalidasa / Bana

ART & ARCHITECTURE
→ Harappan → Mauryan pillars
→ Stupa / Chaitya / Vihara
→ Gandhara / Mathura / Amaravati
→ Rock-cut architecture → Gupta temples
→ Pallava / Chalukya architecture

SCIENCE & TECHNOLOGY
→ Metallurgy → Mathematics → Astronomy
→ Medicine → Irrigation → Urban engineering

SOURCES
→ Archaeology → Inscriptions → Coins
→ Literary sources → Foreign travellers

MAP / SITES
→ Harappan sites → Buddhist sites → Mauryan sites
→ Gupta sites → Sangam centres → Major temple / cave sites`,
        tags: ['Ancient India', 'Cross-Cutting', 'Polity', 'Economy', 'Society', 'Religion', 'Art', 'Science', 'Master Map', 'GS I'],
        sortOrder: 18
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Remove any existing Ancient India mind maps to avoid duplicates on re-run
        const deleted = await MindMap.deleteMany({ paper: 'GS I', subject: 'Ancient India' });
        console.log(`🗑️  Cleared ${deleted.deletedCount} existing Ancient India mind maps`);

        const result = await MindMap.insertMany(ancientIndiaMindMaps);
        console.log(`🧠 Seeded ${result.length} Ancient India mind maps successfully!`);

        result.forEach((mm, i) => {
            console.log(`   ${i + 1}. ${mm.title}`);
        });

        console.log('\n✅ Ancient India master mind map seeding complete!');
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

seed();
