const { PDFParse } = require('pdf-parse');
const { readFile } = require('node:fs/promises');
const path = require('path');

const SECTIONS = [
  { id: 'ancient', name: 'Ancient History', gs: 'GS I', keywords: ['stone age', 'palaeolithic', 'mesolithic', 'neolithic', 'chalcolithic', 'iron age', 'harappa', 'indus valley', 'vedic', 'aryan', 'upanishad', 'mahajanapadas', 'mauryan', 'asoka', 'post-mauryan', 'kushanas', 'satavahanas', 'gupta', 'harsha', 'sangam', 'cholas', 'pallavas', 'chalukyas', 'pre historic', 'fa-hien', 'pre history', 'monarchy', 'varna system', 'buddhism', 'jainism', 'magadha'] },
  { id: 'medieval', name: 'Medieval History', gs: 'GS I', keywords: ['delhi sultanate', 'slave dynasty', 'khalji', 'tughlaq', 'sayyid', 'lodi', 'vijayanagara', 'bahmani', 'mughal', 'babur', 'humayun', 'akbar', 'jahangir', 'shah jahan', 'aurangzeb', 'maratha', 'shivaji', 'bhakti', 'sufism', 'rajput', 'ghazni', 'ghori', 'sher shah', 'mansabdari', 'jagirdari', 'land revenue system'] },
  { id: 'modern', name: 'Modern History', gs: 'GS I', keywords: ['east india company', 'battle of plassey', 'battle of buxar', 'carnatic war', 'anglo-mysore', 'anglo-maratha', 'anglo-sikh', 'revolt of 1857', 'social reform', 'raja ram mohan', 'satyashodhak', 'national congress', 'inc', 'moderate', 'extremist', 'partition of bengal', 'swadeshi', 'home rule', 'non-cooperation', 'civil disobedience', 'quit india', 'gandhi', 'nehru', 'subhash chandra', 'independence act', 'colonialism', 'drain of wealth', 'viceroy', 'governor general'] },
  { id: 'post_independence', name: 'Post-Independence Consolidation', gs: 'GS I', keywords: ['princely states', 'partition of india', 'refugee', 'integration of states', 'reorganisation of states', 'nehruvian', 'five-year plan', 'indo-pak', 'sino-indian', 'lal bahadur shastri', 'indira gandhi', 'emergency 1975', 'jp movement', 'green revolution', 'white revolution', 'land reforms', 'coalition politics', 'economic reforms 1991', 'nationalisation of banks'] },
  { id: 'world', name: 'World History', gs: 'GS I', keywords: ['industrial revolution', 'american revolution', 'french revolution', 'unification of germany', 'unification of italy', 'world war i', 'treaty of versailles', 'league of nations', 'russian revolution', 'lenin', 'stalin', 'fascism', 'nazism', 'hitler', 'mussolini', 'great depression', 'world war ii', 'united nations', 'cold war', 'decolonisation', 'soviet union', 'disintegration of ussr', 'korean war', 'vietnam war', 'apartheid'] },
  { id: 'culture', name: 'Indian Culture', gs: 'GS I', keywords: ['temple architecture', 'rock-cut', 'sculpture', 'mauryan art', 'gupta art', 'painting', 'mural', 'miniature painting', 'music', 'hindustani', 'carnatic', 'dance', 'classical dance', 'folk dance', 'theatre', 'puppet', 'pottery', 'literature', 'sanskrit literature', 'sangam literature', 'buddhist literature', 'philosophy', 'six schools', 'martial arts', 'calendar', 'fairs', 'festivals', 'unesco heritage'] },
  { id: 'phys_geo', name: 'Physical Geography', gs: 'GS I', keywords: ['geomorphology', 'climatology', 'oceanography', 'continental drift', 'plate tectonics', 'sea floor spreading', 'earthquake', 'volcano', 'tsunami', 'landform', 'weathering', 'erosion', 'wind', 'glacier', 'atmosphere', 'insolation', 'temperature inversion', 'pressure belts', 'wind system', 'monsoon', 'cyclone', 'jet stream', 'ocean relief', 'salinity', 'ocean currents', 'tides', 'coral reef', 'el nino', 'la nina', 'soil formation', 'biomes'] },
  { id: 'india_geo', name: 'Physical Geography of India', gs: 'GS I', keywords: ['physiography of india', 'himalayas', 'peninsular plateau', 'coastal plains', 'islands of india', 'drainage system of india', 'ganga', 'indus', 'brahmaputra', 'peninsular rivers', 'climate of india', 'monsoon in india', 'western disturbances', 'soils of india', 'natural vegetation of india', 'forests of india', 'himalayan ecology', 'western ghats'] },
  { id: 'human_geo', name: 'Human Geography', gs: 'GS I', keywords: ['demography', 'population growth', 'population distribution', 'demographic transition', 'sex ratio', 'literacy', 'migration', 'push and pull factors', 'rural settlement', 'urban settlement', 'urbanisation', 'slums', 'smart cities', 'human development index', 'hdi'] },
  { id: 'econ_geo', name: 'Economic Geography', gs: 'GS I', keywords: ['natural resources', 'iron ore', 'coal', 'petroleum', 'natural gas', 'bauxite', 'copper', 'manganese', 'mineral resource', 'industrial location', 'weber model', 'iron and steel industry', 'cotton textile', 'petrochemical', 'information technology industry', 'shipping', 'railways in india', 'national highways', 'inland waterways', 'ports of india', 'pipelines', 'air transport', 'special economic zone', 'sez'] },
  { id: 'society', name: 'Indian Society', gs: 'GS I', keywords: ['salient features of indian society', 'diversity of india', 'caste system', 'joint family', 'patriarchy', 'globalisation on indian society', 'women empowerment', 'child marriage', 'elderly population', 'communalism', 'regionalism', 'secularism', 'linguistic diversity', 'tribals in india', 'scheduled castes', 'social empowerment', 'poverty and developmental issues'] },
  { id: 'polity', name: 'Polity', gs: 'GS II', keywords: ['constitution', 'preamble', 'fundamental rights', 'dpsp', 'fundamental duties', 'amendment', 'basic structure', 'federalism', 'centre-state relations', 'inter-state', 'emergency provisions', 'president of india', 'vice-president', 'prime minister', 'cabinet', 'parliament', 'lok sabha', 'rajya sabha', 'speaker', 'governor', 'chief minister', 'state legislature', 'supreme court', 'high court', 'judicial review', 'judicial activism', 'pil', 'panchayati raj', 'municipalities', 'election commission', 'upsc', 'finance commission', 'cag', 'attorney general', 'niti aayog', 'national commission for sc', 'constitutional bodies', 'statutory bodies', 'representation of people act', 'rpa'] },
  { id: 'governance', name: 'Governance', gs: 'GS II', keywords: ['good governance', 'e-governance', 'citizen charter', 'right to information', 'rti', 'accountability', 'transparency', 'civil services in a democracy', 'administrative reforms', 'second arc', 'self help groups', 'shg', 'ngo', 'donor agencies', 'charities', 'institutional reforms', 'citizen participation', 'ombudsman', 'lokpal', 'lokayukta'] },
  { id: 'social_justice', name: 'Social Justice', gs: 'GS II', keywords: ['welfare schemes', 'vulnerable sections', 'minorities', 'scheduled tribes', 'disabled', 'lgbtq', 'senior citizens', 'healthcare in india', 'education policy', 'primary education', 'higher education', 'human resource development', 'skill development', 'poverty', 'hunger', 'malnutrition', 'food security', 'social security', 'universal basic income'] },
  { id: 'ir', name: 'International Relations', gs: 'GS II', keywords: ['foreign policy', 'india-pakistan', 'india-china', 'india-us', 'india-nepal', 'india-bhutan', 'india-bangladesh', 'india-sri lanka', 'india-maldives', 'india-afghanistan', 'act east', 'look west', 'diaspora', 'bilateral', 'regional groupings', 'saarc', 'asean', 'brics', 'g20', 'quad', 'sco', 'united nations', 'unsc', 'wto', 'imf', 'world bank', 'who', 'nuclear non-proliferation', 'npt', 'ctbt'] },
  { id: 'economy', name: 'Indian Economy', gs: 'GS III', keywords: ['economic growth', 'gdp', 'inflation', 'cpi', 'wpi', 'budgeting', 'fiscal policy', 'monetary policy', 'rbi', 'banking sector', 'npa', 'insolvency', 'taxation', 'gst', 'direct tax', 'indirect tax', 'inclusive growth', 'unemployment', 'planning in india', 'liberalisation', 'privatisation', 'globalisation', 'industrial policy', 'infrastructure', 'energy sector', 'power sector', 'renewable energy', 'ports', 'airports', 'investment models', 'public private partnership', 'ppp', 'capital market', 'fdi', 'fpi', 'external debt', 'balance of payments'] },
  { id: 'agriculture', name: 'Agriculture', gs: 'GS III', keywords: ['cropping pattern', 'irrigation', 'drip irrigation', 'sprinkler', 'major crops', 'agricultural marketing', 'apmc', 'e-nam', 'farm subsidy', 'direct benefit transfer', 'msp', 'minimum support price', 'pds', 'public distribution system', 'buffer stock', 'food security', 'food processing', 'mega food parks', 'cold chain', 'supply chain management', 'land reforms in india', 'animal husbandry', 'rearing', 'poultry', 'fisheries', 'horticulture', 'organic farming'] },
  { id: 'environment', name: 'Environment & Ecology', gs: 'GS III', keywords: ['biodiversity conservation', 'national parks', 'wildlife sanctuaries', 'biosphere reserves', 'endangered species', 'red list', 'climate change', 'global warming', 'greenhouse gas', 'kyoto protocol', 'paris agreement', 'unfccc', 'cop', 'pollution', 'air pollution', 'water pollution', 'solid waste management', 'plastic waste', 'e-waste', 'environmental impact assessment', 'eia', 'forest conservation act', 'wildlife protection act', 'national green tribunal', 'ngt', 'sustainable development goals', 'sdg'] },
  { id: 'science_tech', name: 'Science & Technology', gs: 'GS III', keywords: ['indigenisation of technology', 'information technology', 'computers', 'supercomputers', 'semiconductors', 'space technology', 'isro', 'satellites', 'gslv', 'pslv', 'nano technology', 'bio technology', 'dna technology', 'cloning', 'stem cell', 'intellectual property rights', 'ipr', 'patents', 'robotics', 'artificial intelligence', 'machine learning', 'nuclear energy', 'laser', 'defence technology', 'missiles', 'drdo', 'health and diseases', 'physics developments', 'chemistry developments', 'biology developments', 'stem cells'] },
  { id: 'disaster', name: 'Disaster Management', gs: 'GS III', keywords: ['disaster preparedness', 'disaster mitigation', 'earthquake management', 'tsunami preparedness', 'landslide mitigation', 'flood management', 'drought management', 'cyclone management', 'forest fire control', 'industrial disasters', 'chemical disaster', 'nuclear reactor safety', 'disaster management act 2005', 'ndma', 'sdma', 'sendai framework', 'disaster insurance', 'disaster resilient infrastructure', 'cdri'] },
  { id: 'security', name: 'Internal Security', gs: 'GS III', keywords: ['extremism', 'naxalism', 'left wing extremism', 'insurgency in northeast', 'terrorism', 'cross border terrorism', 'money laundering', 'black money', 'cyber security', 'cyber attacks', 'cyber warfare', 'social media regulation', 'border management', 'coastal security', 'security forces', 'capf', 'crpf', 'bsf', 'cisf', 'itbp', 'nsg', 'raw', 'intelligence bureau', 'ib', 'nia', 'uapa', 'afspa'] },
  { id: 'ethics', name: 'Ethics, Integrity & Aptitude (GS-IV)', keywords: ['essence of ethics', 'dimensions of ethics', 'consequences of ethics', 'human values', 'lessons from reformers', 'role of family', 'attitude', 'cognitive component', 'affective component', 'behavioural component', 'persuasion', 'aptitude', 'foundational values for civil service', 'integrity', 'impartiality', 'non-partisanship', 'objectivity', 'dedication to public service', 'empathy', 'tolerance', 'compassion', 'emotional intelligence', 'moral thinkers', 'philosophers', 'ethics in administration', 'laws rules regulations', 'ethical dilemma', 'accountability', 'probity', 'citizen charter', 'work culture', 'quality of service delivery', 'utilisation of public funds', 'corruption', 'case study', 'case studies', 'applied ethics', 'euthanasia', 'surrogacy', 'abortion'] }
];

async function main() {
  try {
    const pdfPath = path.join(__dirname, '..', 'Full Syllabus of UPSC.pdf');
    const buffer = await readFile(pdfPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    const lines = text.split('\n');

    // Extract all checkbox topics
    const topics = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.includes(String.fromCharCode(61603))) {
        let title = line.replace(String.fromCharCode(61603), '')
                         .replace(/\u0004/g, '')
                         .replace(/\u0014/g, '')
                         .replace(/\t/g, ' ')
                         .trim();
        let nextIdx = i + 1;
        while (nextIdx < lines.length) {
          const nextLine = lines[nextIdx];
          const nextTrimmed = nextLine.trim();
          if (nextTrimmed.length === 0) break;
          if (nextLine.includes(String.fromCharCode(61603))) break;
          if (nextLine.includes('\u0004') || nextLine.includes('\u0014')) break;
          
          if (nextTrimmed.includes('UPSC SYLLABUS') || nextTrimmed.includes('www.iasscore.in') || nextTrimmed.match(/^\d+$/)) {
            nextIdx++;
            continue;
          }
          title += ' ' + nextTrimmed;
          nextIdx++;
        }
        title = title.replace(/\s+/g, ' ').trim();
        topics.push({ lineIndex: i, title });
        i = nextIdx;
      } else {
        i++;
      }
    }

    console.log('Total extracted topics:', topics.length);

    // Classify each topic using keyword matching with scoring
    const classifiedCount = {};
    SECTIONS.forEach(s => {
      classifiedCount[s.name] = 0;
    });

    topics.forEach((t, index) => {
      let bestSection = '';
      let maxScore = -1;
      const titleLower = t.title.toLowerCase();

      // First check if there is an exact or near match keyword
      SECTIONS.forEach(s => {
        let score = 0;
        s.keywords.forEach(kw => {
          if (titleLower.includes(kw)) {
            // Give higher weight to longer keyword matches
            score += kw.length;
          }
        });
        if (score > maxScore) {
          maxScore = score;
          bestSection = s.name;
        }
      });

      // Fallback: if no keyword matches, use a proximity fallback based on line index
      if (maxScore <= 0) {
        // Fallback ranges based on approximate line indices
        const idx = t.lineIndex;
        if (idx >= 0 && idx < 137) bestSection = 'Ancient History';
        else if (idx >= 137 && idx < 381) bestSection = 'Medieval History';
        else if (idx >= 381 && idx < 402) bestSection = 'Modern History';
        else if (idx >= 402 && idx < 538) bestSection = 'Post-Independence Consolidation';
        else if (idx >= 538 && idx < 638) bestSection = 'World History';
        else if (idx >= 638 && idx < 835) bestSection = 'Indian Culture';
        else if (idx >= 835 && idx < 1452) bestSection = 'Physical Geography';
        else if (idx >= 1452 && idx < 1453) bestSection = 'Physical Geography of India';
        else if (idx >= 1453 && idx < 1598) bestSection = 'Human Geography';
        else if (idx >= 1598 && idx < 2009) bestSection = 'Economic Geography';
        else if (idx >= 2009 && idx < 2211) bestSection = 'Indian Society';
        else if (idx >= 2211 && idx < 2651) bestSection = 'Polity';
        else if (idx >= 2651 && idx < 2998) bestSection = 'Governance';
        else if (idx >= 2998 && idx < 3267) bestSection = 'Social Justice';
        else if (idx >= 3267 && idx < 3570) bestSection = 'International Relations';
        else if (idx >= 3570 && idx < 3850) bestSection = 'Indian Economy';
        else if (idx >= 3850 && idx < 4038) bestSection = 'Agriculture';
        else if (idx >= 4038 && idx < 4338) bestSection = 'Indian Economy';
        else if (idx >= 4338 && idx < 4816) bestSection = 'Science & Technology';
        else if (idx >= 4816 && idx < 5269) bestSection = 'Environment & Ecology';
        else if (idx >= 5269 && idx < 5400) bestSection = 'Internal Security';
        else if (idx >= 5400 && idx < 5472) bestSection = 'Disaster Management';
        else bestSection = 'Ethics, Integrity & Aptitude (GS-IV)';
      }

      classifiedCount[bestSection]++;
    });

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

    console.log('\n======================================');
    console.log('KEYWORD CLASSIFIED VS TARGET COUNTS');
    console.log('======================================');
    Object.keys(userTargets).forEach(name => {
      const act = classifiedCount[name] || 0;
      const tar = userTargets[name];
      const diff = act - tar;
      const status = diff === 0 ? '✅ MATCH' : `❌ DIFF: ${diff > 0 ? '+' : ''}${diff}`;
      console.log(`${name.padEnd(40)} | Classified: ${String(act).padStart(3)} | Target: ${String(tar).padStart(3)} | ${status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
