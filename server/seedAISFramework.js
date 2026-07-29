const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const SUBJECT_PREFIXES = {
  // GS I
  'Ancient History': 'AH',
  'Medieval History': 'MH',
  'Modern History': 'MOD',
  'Post-Independence Consolidation': 'PIC',
  'World History': 'WH',
  'Indian Culture': 'CUL',
  'Physical Geography': 'PGEO',
  'Physical Geography of India': 'IGEO',
  'Human Geography': 'HGEO',
  'Economic Geography': 'EGEO',
  'Indian Society': 'SOC',

  // GS II
  'Polity': 'POL',
  'Governance': 'GOV',
  'Social Justice': 'SJ',
  'International Relations': 'IR',

  // GS III
  'Economy': 'ECO',
  'Agriculture': 'AGR',
  'Industry': 'IND',
  'Infrastructure': 'INF',
  'Science & Technology': 'ST',
  'Environment & Ecology': 'ENV',
  'Internal Security': 'SEC',
  'Disaster Management': 'DM',

  // GS IV
  'Ethics, Integrity & Aptitude': 'ETH',

  // Optionals
  'Sociology Paper I': 'SOC1',
  'Sociology Paper II': 'SOC2'
};

const MEDIEVAL_HISTORY_DATA = [
  {
    chapter: "Major Dynasties (750–1200 CE)",
    topics: [
      "The Pratiharas (8th–10th Century)",
      "The Palas (8th–11th Century)",
      "The Tripartite Conflict",
      "The Senas (11th–12th Century)",
      "The Rajputs",
      "Pallavas",
      "Chalukyas",
      "Rashtrakutas",
      "Indian Feudalism",
      "Administration",
      "Society and Culture",
      "Economy and the Decline of Trade"
    ]
  },
  {
    chapter: "Cholas and Other South Indian Kingdoms",
    topics: [
      "Chola Rulers and Political History",
      "Chola Administration",
      "Socio-Economic Life",
      "Education and Literature",
      "The Cheras (9th–12th Century)",
      "The Yadavas (12th–13th Century)",
      "Contact with South-East Asia"
    ]
  },
  {
    chapter: "Early Muslim Invasions",
    topics: [
      "The Arab Conquest of Sindh",
      "Mahmud of Ghazni",
      "Muhammad Ghori"
    ]
  },
  {
    chapter: "Delhi Sultanate (1206–1526 CE)",
    topics: [
      "Slave Dynasty",
      "Khalji Dynasty",
      "Tughlaq Dynasty",
      "Provincial Kingdoms and Resistance by Indian Chiefs",
      "Sayyid Dynasty",
      "Lodi Dynasty",
      "Attacks by Mongols and Other Turks",
      "Administration",
      "Economy",
      "Urbanization",
      "Society and Culture",
      "Scientific Knowledge and Legal System",
      "Challenges Leading to the Decline of the Sultanate"
    ]
  },
  {
    chapter: "Vijayanagara Empire",
    topics: [
      "Sources",
      "Political History",
      "Administration",
      "Social and Cultural Life",
      "Economic Condition",
      "Conflicts with the Bahmani Kingdom"
    ]
  },
  {
    chapter: "Central Asian Politics and the Advance of Babur towards India",
    topics: [
      "The Timurids",
      "Timurid–Uzbek Conflict",
      "Uzbek–Iran Conflict and Babur",
      "Babur's Advance towards India"
    ]
  },
  {
    chapter: "Struggle for Empire in North India (Afghans, Rajputs & Mughals)",
    topics: [
      "Ibrahim Lodi vs Babur – First Battle of Panipat",
      "Babur's Problems after Panipat",
      "Struggle with Rana Sanga",
      "Eastern Areas and the Afghans",
      "Babur's Contribution and Significance"
    ]
  },
  {
    chapter: "Humayun and the Afghans",
    topics: [
      "Early Activities of Humayun",
      "Tussle with Bahadur Shah",
      "Gujarat Campaign",
      "Bengal Campaign",
      "Struggle with Sher Khan"
    ]
  },
  {
    chapter: "Establishment of the North Indian Empire",
    topics: [
      "Sur Dynasty",
      "Sher Shah's Early Life",
      "Rise of Sher Shah",
      "Sur Empire (1540–56)",
      "Contributions of Sher Shah"
    ]
  },
  {
    chapter: "Consolidation and Expansion of the Empire – Akbar",
    topics: [
      "Conflict with Afghans – Hemu",
      "Struggle with the Nobility",
      "Regency and Revolt of Uzbek Nobles",
      "Early Expansion of the Empire (1560–76)",
      "Relations with the Rajputs",
      "Further Expansion in the North-West"
    ]
  },
  {
    chapter: "State and Government under Akbar",
    topics: [
      "Akbar's Concept of Suzerainty",
      "Structure of Government",
      "District and Local Government",
      "Land Revenue, Dahsala System & Mansabdari",
      "Army"
    ]
  },
  {
    chapter: "Akbar's Religious Views",
    topics: [
      "Relations with the Ulama and Social Reforms",
      "Early Phase (1556–73)",
      "Second Phase (1573–80) – Ibadat Khana",
      "Mahzar and Break with Orthodox Ulama",
      "Reorganisation of Madad-i-Maash Grants",
      "Din-i-Ilahi",
      "Religious Toleration"
    ]
  },
  {
    chapter: "The Deccan and the Mughals (up to 1657)",
    topics: [
      "Deccani States up to 1595",
      "Mughal Advance towards the Deccan",
      "Conquest of Berar, Khandesh & Ahmadnagar",
      "Rise of Malik Ambar",
      "Extinction of Ahmadnagar",
      "Bijapur & Golconda under Mughal Suzerainty",
      "Shah Jahan and the Deccan",
      "Cultural Contributions of the Deccani States"
    ]
  },
  {
    chapter: "Foreign Policy of the Mughals",
    topics: [
      "Akbar and the Uzbeks",
      "Qandahar and Iran",
      "Balkh Campaign",
      "Mughal–Persian Relations"
    ]
  },
  {
    chapter: "India in the First Half of the Seventeenth Century",
    topics: [
      "Jahangir's Accession",
      "Territorial Consolidation",
      "Nur Jahan Junta",
      "Mahabat Khan Coup",
      "Jahangir as a Ruler",
      "State and Religion",
      "Shah Jahan's Expansion",
      "Evolution of the Mansabdari System"
    ]
  },
  {
    chapter: "Aurangzeb – Religious Policies, North India & Rajputs",
    topics: [
      "War of Succession",
      "Religious Policy (1658–79)",
      "Puritanical Reforms",
      "Temples, Jizyah & Second Phase",
      "Expansion in North India",
      "Revolts (Jats, Satnamis, Afghans & Sikhs)",
      "Breach with Marwar & Mewar"
    ]
  },
  {
    chapter: "Climax and Crisis of the Mughal Empire",
    topics: [
      "Rise of the Marathas",
      "Treaty of Purandar",
      "Shivaji's Swarajya",
      "Aurangzeb and the Deccani States",
      "Marathas and the Deccan",
      "Jagirdari Crisis"
    ]
  },
  {
    chapter: "Society – Structure and Growth",
    topics: [
      "Rural Society",
      "Towns and Town Life",
      "Artisans and Master Craftsmen",
      "Women",
      "Servants and Slaves",
      "Standard of Living",
      "Ruling Classes",
      "Middle Strata",
      "Commercial Classes"
    ]
  },
  {
    chapter: "Economic Life – Patterns and Prospects",
    topics: [
      "Inland Trade",
      "Overseas Trade",
      "Mughal State and Commerce",
      "Trends in the Economy (18th Century)"
    ]
  },
  {
    chapter: "Religion, Fine Arts, Science & Technology",
    topics: [
      "Religion (Hinduism, Sikhism & Islam)",
      "Fine Arts (Architecture, Painting, Literature & Music)",
      "Science and Technology"
    ]
  },
  {
    chapter: "Northern India in the First Half of the Eighteenth Century",
    topics: [
      "Bahadur Shah I",
      "Struggle for Wizarat",
      "Zulfiqar Khan & Jahandar Shah",
      "Sayyid Brothers",
      "Sayyid Wizarat",
      "M. Amin Khan & Nizam-ul-Mulk",
      "Rise of Regional States & Foreign Invasions"
    ]
  },
  {
    chapter: "The Maratha Bid for Supremacy",
    topics: [
      "Maratha Policy of Expansion",
      "Marathas and Nizam-ul-Mulk",
      "Advance into Gujarat & Malwa",
      "Advance into Doab & Punjab",
      "Three Phases (1741–61)",
      "Third Battle of Panipat"
    ]
  }
];

const MODERN_HISTORY_DATA = [
  {
    chapter: "Scenario before 1857",
    topics: [
      "Later Mughals & their Decline",
      "Regional Powers in the 18th Century",
      "Advent of Europeans in India",
      "British Conquest of India",
      "Carnatic Wars",
      "Battle of Plassey & Battle of Buxar",
      "Anglo-Mysore Wars",
      "Anglo-Punjab Wars",
      "British Administration before 1857",
      "British Economic Policy"
    ]
  },
  {
    chapter: "Revolt of 1857",
    topics: [
      "Causes of the Revolt of 1857",
      "Leaders of the Revolt of 1857",
      "Suppression of the Revolt of 1857",
      "Nature of the Revolt of 1857",
      "Consequences of the Revolt of 1857"
    ]
  },
  {
    chapter: "Early Nationalism",
    topics: [
      "Indian National Movement (1858–1905)",
      "Early Nationalists and the Swadeshi Movement",
      "Government of India Act, 1909",
      "Home Rule League Movement"
    ]
  },
  {
    chapter: "The Struggle for Swaraj",
    topics: [
      "Montagu's Statement (August 1917)",
      "Emergence of Gandhi as a Mass Leader",
      "Khilafat & Non-Cooperation Movement",
      "Swaraj Party",
      "Revolutionary Terrorism (Phase II – 1920s)",
      "Simon Commission & Nehru Report"
    ]
  },
  {
    chapter: "Intimation of Freedom",
    topics: [
      "Civil Disobedience Movement",
      "Round Table Conferences",
      "Poona Pact",
      "Government of India Act, 1935",
      "Tripuri Session (1939)",
      "August Offer",
      "Individual Satyagraha (1940–41)"
    ]
  },
  {
    chapter: "Towards Achievement of Freedom",
    topics: [
      "Popular Struggles in the Princely States",
      "Second World War and Nationalist Response",
      "Partition of India",
      "Rise of Communalism",
      "Wavell Plan",
      "Cabinet Mission Plan",
      "Mountbatten Plan"
    ]
  },
  {
    chapter: "During the Freedom Struggle",
    topics: [
      "Indian Renaissance / Socio-Religious Reform Movements",
      "Civil Rebellions during British Rule",
      "Tribal Movements during British Rule",
      "Peasant Movements during British Rule",
      "Working Class Movement (1850–1900)",
      "Growth of Communalism",
      "Left and Communist Trends in the National Movement",
      "Press and Education during British Rule",
      "Role of Women in the Freedom Struggle",
      "Governor-Generals of India",
      "Viceroys of India",
      "Important Personalities",
      "Important Newspapers & Journals",
      "Congress Sessions"
    ]
  }
];

const POST_INDEPENDENCE_DATA = [
  {
    chapter: "Re-organisation of States",
    topics: [
      "Constitutional Provisions related to State Formation",
      "Factors that Led to the Merger of States",
      "Accession of the Princely States",
      "Accession of States under French and Portuguese Rule",
      "Accession of Sikkim",
      "Rehabilitation of Refugees",
      "Federal Crisis",
      "Regional Aspirations, Insurgencies and Areas of Tension",
      "Accommodation and National Integration"
    ]
  },
  {
    chapter: "Linguistic Regionalism in India",
    topics: [
      "Constitutional Position and Language Policy",
      "Language and Regionalism",
      "Recent Controversies due to the Rise of the Hindi Language"
    ]
  },
  {
    chapter: "Tribal Issues and Policy Consolidation",
    topics: [
      "Tribal Issues & Present Status",
      "Tribal Policy Consolidation"
    ]
  },
  {
    chapter: "Problem of Caste and Social Consolidation",
    topics: [
      "Caste Practices in India",
      "Ambedkar Movement",
      "Constitutional Provisions",
      "Recent Government Initiatives for the Emancipation of Scheduled Castes",
      "Issues of Manual Scavenging"
    ]
  },
  {
    chapter: "Communalism & Social Consolidation",
    topics: [
      "Secularism",
      "Causes of Communalism in India",
      "Consequences of Communalism and Social Consolidation"
    ]
  },
  {
    chapter: "Issue of Linguistic Minorities",
    topics: [
      "Operational Inefficiency",
      "Government Initiatives"
    ]
  },
  {
    chapter: "Overview of Economic Development Since Independence",
    topics: [
      "Planning in India"
    ]
  },
  {
    chapter: "Agriculture",
    topics: [
      "Journey through Five-Year Plans",
      "Land Reforms",
      "Post-Green Revolution Agricultural Issues",
      "Agrarian Movements",
      "Achievements in Agriculture since Independence",
      "Recent Challenges"
    ]
  },
  {
    chapter: "Industry",
    topics: [
      "Industrial Development since Independence",
      "Public Sector since Independence",
      "Sectoral Development",
      "Private Sector since Independence",
      "Industrial Policy since Independence",
      "Make in India"
    ]
  },
  {
    chapter: "New Economic Policy",
    topics: [
      "Impact of the New Economic Policy"
    ]
  },
  {
    chapter: "Post-Independence Policy of Science & Technology",
    topics: [
      "India's Policy in the Field of Science & Technology",
      "Institutional Framework for Science & Technology Development",
      "Science & Technology in the Pre-Reform Period",
      "Impact of Economic Reforms on Science & Technology in India",
      "New Policy Initiatives in Science & Technology",
      "Agenda of Skill Training"
    ]
  }
];

const WORLD_HISTORY_DATA = [
  {
    chapter: "Beginning of the Modern Age",
    topics: [
      "Disintegration of the Feudal System",
      "Renaissance",
      "Humanism",
      "Art and Architecture",
      "Literature",
      "Science",
      "Reformation",
      "Explorations, Discovery & Trade",
      "Colonization and the Rise of the Nation-State",
      "The English Revolution"
    ]
  },
  {
    chapter: "French Revolution",
    topics: [
      "Causes",
      "The Revolution in France",
      "France under Napoleon",
      "Impact of the Revolution",
      "Significance of the Revolution"
    ]
  },
  {
    chapter: "Nationalism in Europe",
    topics: [
      "Rise of the Nation-State System",
      "Unification of Italy",
      "Unification of Germany"
    ]
  },
  {
    chapter: "Colonialism and Imperialism",
    topics: [
      "Colonialism",
      "The Age of Imperialism (1870–1914)",
      "Imperialism in Asia",
      "Analysis of Colonialism"
    ]
  },
  {
    chapter: "Emergence of the USA",
    topics: [
      "Foundation of the American Colonies",
      "Independence of the United States of America",
      "American Revolutionary War",
      "Impact of the American Revolution",
      "Political Effects of the Revolution",
      "Influence of the American Revolution on the French Revolution",
      "US Civil War",
      "Impact of the Civil War on the USA",
      "Global Impact of the US Civil War",
      "Impact on India"
    ]
  },
  {
    chapter: "World War I",
    topics: [
      "Major Causes of the War",
      "Course of the War",
      "Analysis of Major Events",
      "Consequences of World War I",
      "Aftermath of World War I",
      "League of Nations"
    ]
  },
  {
    chapter: "Russian Revolution",
    topics: [
      "Major Events in Pre-Revolution Russia",
      "Causes",
      "Course of the Revolution",
      "Consequences",
      "Aftermath of the Revolution",
      "Post-Lenin Russia"
    ]
  },
  {
    chapter: "Inter-War Years (1919–1939)",
    topics: [
      "The Great Depression",
      "Rise of Fascism in Italy",
      "Rise of Nazism in Germany",
      "Soviet Union (USSR)"
    ]
  },
  {
    chapter: "World War II",
    topics: [
      "Foundations of the War",
      "Course of the War",
      "Aftermath of the War",
      "Analysis of the War",
      "Decolonization Phase"
    ]
  },
  {
    chapter: "Developments in the Middle East",
    topics: [
      "Democratic Reforms in the Middle East",
      "Arab Nationalism",
      "Israel"
    ]
  },
  {
    chapter: "Cold War",
    topics: [
      "Reasons",
      "Development of the Cold War (1945–1953)",
      "Thaw after 1953",
      "Nuclear Arms Race & Cuban Missile Crisis (1962)"
    ]
  },
  {
    chapter: "Post-Cold War World",
    topics: [
      "Global Issues since 1991",
      "Integration of Europe",
      "European Integration – Timeline",
      "Rise of Global Islamic Terrorism",
      "Rise of China"
    ]
  },
  {
    chapter: "Communism, Socialism & Capitalism",
    topics: [
      "Capitalism (Concept, Types & Examples)",
      "Communism (Concept, Types & Examples)",
      "Relevance of Capitalism in the Present Era",
      "Socialism"
    ]
  }
];

const INDIAN_CULTURE_DATA = [
  {
    chapter: "Sculptural Art in India",
    topics: [
      "Sculptures of Harappan Civilisation",
      "Sculptures of Mauryan Age",
      "Post-Mauryan Period Sculptures",
      "Jain Sculptures",
      "Buddhist Sculpture",
      "Gupta Sculpture",
      "Medieval School of Sculpture",
      "Modern Indian Sculpture"
    ]
  },
  {
    chapter: "Architecture in Ancient India",
    topics: [
      "Harappan Period Architecture",
      "Mauryan Architecture",
      "Post-Mauryan & Gupta Period Architecture",
      "Temples of Khajuraho",
      "Temples of Odisha",
      "Temples of Gwalior",
      "Temples of Gujarat",
      "Temples of Rajasthan",
      "Temples of Bengal",
      "Temples of Assam",
      "Temples of Himachal Pradesh",
      "Temples of Jammu & Kashmir",
      "Pallava Period Architecture",
      "Chola Period Architecture",
      "Pandya Temples",
      "Vijayanagara Period Architecture",
      "Nayaka Temples",
      "Temples of Kerala",
      "Vesara Style Temple",
      "Hoysala Style",
      "Rashtrakuta Period Architecture"
    ]
  },
  {
    chapter: "Indo-Islamic Architecture",
    topics: [
      "Imperial Style (Delhi Sultanate)",
      "Provincial Style",
      "Mughal Style",
      "Sikh Style of Architecture",
      "Rajput Architecture"
    ]
  },
  {
    chapter: "Modern Architecture",
    topics: [
      "European Influence",
      "Indo-Saracenic Architecture",
      "Post-Independence Architecture"
    ]
  },
  {
    chapter: "Indian Paintings",
    topics: [
      "Tradition of Mural Paintings",
      "Tradition of Miniature Paintings",
      "Paintings in the Deccan",
      "Rajput School of Painting",
      "Pahari School of Painting",
      "Miniature Painting in South India",
      "Regional Paintings",
      "Modern Paintings",
      "Contemporary Paintings"
    ]
  },
  {
    chapter: "Pottery Tradition in India",
    topics: [
      "Ochre Coloured Pottery (OCP)",
      "Black & Red Ware (BRW)",
      "Painted Grey Ware (PGW)",
      "Northern Black Polished Ware (NBPW)",
      "Glazed & Unglazed Pottery"
    ]
  },
  {
    chapter: "Music in India",
    topics: [
      "Main Pillars of Indian Music",
      "Forms of Indian Music",
      "Musical Instruments",
      "Institutions Related to Music"
    ]
  },
  {
    chapter: "Dances in India",
    topics: [
      "Concept of Dance in India",
      "Concept of Ashta Nayika",
      "Eight Classical Dance Forms",
      "Folk Dances",
      "Modern Dances"
    ]
  },
  {
    chapter: "Martial Arts in India",
    topics: [
      "Genesis of Martial Arts",
      "Forms of Traditional Martial Arts"
    ]
  },
  {
    chapter: "Indian Theatre",
    topics: [
      "Classical Sanskrit Theatre",
      "Regional Theatre",
      "Modern Theatre",
      "Renaissance of Indian Theatre"
    ]
  },
  {
    chapter: "Indian Puppetry",
    topics: [
      "String Puppets",
      "Shadow Puppets",
      "Rod Puppets",
      "Glove Puppets",
      "Modern Puppetry",
      "Tribal Puppetry"
    ]
  },
  {
    chapter: "Indian Cinema",
    topics: [
      "Cinema in India",
      "History of Indian Cinema",
      "Classification of Indian Cinema"
    ]
  },
  {
    chapter: "Religions in India",
    topics: [
      "Pre-Vedic Religion",
      "Hinduism",
      "Buddhism",
      "Jainism",
      "Sikhism",
      "Islam",
      "Christianity",
      "Zoroastrianism",
      "Judaism",
      "Philosophy in India"
    ]
  },
  {
    chapter: "Bhakti & Sufi Movements",
    topics: [
      "Bhakti Movement",
      "Vaishnava Acharyas – Metaphysical Foundation",
      "Other Saints of the Bhakti Movement",
      "Maharashtra Dharma",
      "Sufism"
    ]
  },
  {
    chapter: "Languages & Literature in India",
    topics: [
      "Sanskrit Literature",
      "Pali Literature",
      "Prakrit Literature",
      "Tamil Literature",
      "Telugu Literature",
      "Malayalam Literature",
      "Kannada Literature",
      "Odia Literature",
      "Assamese Literature",
      "Bengali Literature",
      "Gujarati Literature",
      "Rajasthani Literature",
      "Punjabi Literature",
      "Marathi Literature",
      "Hindi Literature",
      "Persian Literature",
      "Urdu Literature"
    ]
  },
  {
    chapter: "Miscellaneous Topics",
    topics: [
      "Indian Handicrafts",
      "Indian Universities",
      "Personalities Related to Culture",
      "Places of Cultural Interest",
      "Fairs & Festivals in India",
      "Cultural Institutions in India",
      "Awards & Honours Associated with Culture",
      "The Calendar",
      "The Eras",
      "Science & Technology in Ancient India",
      "UNESCO Cultural Heritage Sites in India",
      "Legal Provisions for Protection & Promotion of Indian Culture & Heritage"
    ]
  }
];

const PHYSICAL_GEOGRAPHY_DATA = [
  {
    chapter: "General Geography",
    topics: [
      "The origin of the Earth",
      "Early Theories of Earth Origin",
      "Modern Theories – Big Bang Theory (BBT)",
      "Star Formation",
      "Formation of Planets",
      "Solar System",
      "The Evolution of the Earth",
      "Layered Structure of Earth (5 layers)",
      "Evolution of Lithosphere",
      "Evolution of Atmosphere",
      "Evolution of Hydrosphere",
      "Geological History of the Earth",
      "Latitude and Longitude (Important Parallels & Meridians)",
      "Motions of the Earth (Rotation, Revolution & Effects)",
      "Inclination of Earth's Axis and its Effects",
      "Local Time, Standard Time, International Date Line & Calendar",
      "Eclipses (Solar & Lunar)",
      "Origin of Life",
      "Geological Time Scale"
    ]
  },
  {
    chapter: "Interior of the Earth",
    topics: [
      "Sources of Information - Direct",
      "Sources of Information - Indirect (Earthquakes, Waves & Magnetic Field)",
      "Seismic waves - Body waves",
      "Seismic waves - Surface waves",
      "Understanding earth's interior with help of seismic waves",
      "Internal Structure of earth - Crust",
      "Internal Structure of earth - Lithosphere",
      "Internal Structure of earth - Mantle",
      "Internal Structure of earth - Asthenosphere",
      "Internal Structure of earth - Outer core",
      "Internal Structure of earth - Inner core",
      "Seismic Discontinuities"
    ]
  },
  {
    chapter: "Geology",
    topics: [
      "Major Elements of the Earth's Crust",
      "Minerals – Feldspar, Quartz, Pyroxene, Amphibole, Mica, Olivine",
      "Physical Characteristics – Crystal Form, Cleavage, Fracture, Lusture, Color, Streak, Transparency, Structure, Hardness, Specific Gravity",
      "Metallic minerals – Precious, Ferrous, Non Ferrous",
      "Non-metallic Minerals – Sulphur, Phosphates, Cement",
      "Rocks (Aggregate of Minerals)",
      "Petrology",
      "Rocks & landforms",
      "Rocks & Soils",
      "3 Family of Rocks – Igneous",
      "3 Family of Rocks – Sedimentary",
      "3 Family of Rocks – Metamorphic",
      "Rock Cycle"
    ]
  },
  {
    chapter: "Earthquakes",
    topics: [
      "Waves: P, S, Body & Surface",
      "Shadow Zone",
      "Types of Earthquakes",
      "Causes of Earthquake",
      "Effects of Earthquakes",
      "Frequency of Earthquakes",
      "Locating an Epicentre",
      "Distribution of Earthquake",
      "Earthquake Observatories"
    ]
  },
  {
    chapter: "Volcano",
    topics: [
      "Volcano Types - Shield",
      "Volcano Types - Composite",
      "Volcano Types - Caldera",
      "Volcano Types - Flood Basalt",
      "Volcano Types - Mid Ocean Ridge",
      "Types of lava - Andesitic or Acidic lava",
      "Types of lava - Basic or Basaltic lava",
      "Intrusive volcanic Landforms - Batholiths",
      "Intrusive volcanic Landforms - Lacoliths",
      "Intrusive volcanic Landforms - Lapoliths",
      "Intrusive volcanic Landforms - Phacoliths",
      "Intrusive volcanic Landforms - Sills",
      "Intrusive volcanic Landforms - Dykes",
      "Extrusive Volcanic Landforms",
      "Geysers and Hot springs",
      "Extinct, Dormant and Active volcanoes",
      "Distribution of Volcanoes - Pacific Ring of Fire",
      "Distribution of Volcanoes - Mediterranean volcanism",
      "Distribution of Volcanoes - Other regions",
      "Effects of Volcanoes"
    ]
  },
  {
    chapter: "Tsunami",
    topics: [
      "Mechanism of Tsunami waves",
      "Properties of Tsunami waves",
      "Effects of Tsunami"
    ]
  },
  {
    chapter: "Geomorphic Processes",
    topics: [
      "Earth's Surface - Exogenic Forces",
      "Earth's Surface - Endogenic Forces",
      "Gradation, Degradation & Agradation",
      "Geomorphic Process - Endogenic Process",
      "Diastrophism - Orogenic & Epierogenic",
      "Endogenic - Earthquakes, Plate movements, Volcanism",
      "Exogenic Forces - Denudation Processes",
      "Weathering",
      "Mass movements",
      "Erosion: Transportation & Deposition"
    ]
  },
  {
    chapter: "Distribution of Continents & Oceans",
    topics: [
      "Continental Drift Theory - Alfred Wegner 1912",
      "Continental Drift - Pangea, Panthalasa, Laurasia, Gondwana land",
      "Evidence in support of Continental Drift Theory - Jigsaw Fit",
      "Evidence - Rocks of same age across oceans",
      "Evidence - Tillite",
      "Evidence - Placer Deposits",
      "Evidence - Distribution of Fossils",
      "Forces of Drifting - Pole Fleeing Force & Tidal Force",
      "Post Drift Studies - Convectional Current Theory",
      "Mapping of the Ocean Floor",
      "Continents – Plate Tectonics - Lithospheric Plates (Major Plate, Minor Plates)",
      "Plate Boundaries – Divergent, Convergent, Transform",
      "Rates of Plate Movements & Force of plate movements",
      "Indian Plate - Movement from 71 million years ago till today"
    ]
  },
  {
    chapter: "Landforms and their Evolution",
    topics: [
      "Landforms - Causes, Geomorphic Processes & Agents",
      "Geomorphic Agents - Erosional/Destructional & Depositional/Constructional",
      "Agents and Impacts - Wind, Running Water, Ground Water, Glaciers, Waves & Currents",
      "Winds - Cause: Deflation, Abrasion, Impact",
      "Winds - Erosional landforms: Pediments and Pediplains",
      "Winds - Erosional landforms: Playas",
      "Winds - Erosional landforms: Deflation Hollows and Caves",
      "Winds - Erosional landforms: Mushroom, Table & Pedestal Rocks",
      "Winds - Depositional Landforms: Barchans, Seif, Parabolic, Transverse, Longitudinal",
      "Running Water - Humid Regions & 2 Components (Overland Flow, Linear Flow)",
      "Running Water - Stages (Youth, Mature, Old)",
      "Running Water - Erosional Landforms: Valleys (Rills, Gullies, V Shape, Gorge, Canyon)",
      "Running Water - Erosional Landforms: Potholes & Plunge pools",
      "Running Water - Erosional Landforms: Incised or entrenched meanders",
      "Running Water - Erosional Landforms: River Terraces (paired & unpaired)",
      "Running Water - Depositional Landforms: Alluvial Fans",
      "Running Water - Depositional Landforms: Delta",
      "Running Water - Depositional Landforms: Floodplains, Natural Levees, Point Bars",
      "Running Water - Depositional Landforms: Meanders, Slip off bank, Under cut bank",
      "Running Water - Depositional Landforms: Oxbow lake",
      "Running Water - Depositional Landforms: Braided Channels",
      "Ground Water (Karst Topography) - Permeable Rocks, Percolation, Bedding Plains",
      "Ground Water - Limestone and Dolomite Regions (Balkans, Adriatic regions)",
      "Ground Water - Erosional Landforms: Pools-Swallow Hole, Valley Sinks (Uvalas), Sinkholes, Dolines, Lapies, Ridges, Limestone Pavements",
      "Ground Water - Erosional Landforms: Caves & Tunnels (Altering bed of Rocks)",
      "Ground Water - Depositional landforms: Stalactites, Stalagmites, Pillar Columns",
      "Glaciers - Erosional Landforms: Cirque of Tarn Lakes",
      "Glaciers - Erosional Landforms: Hors and Serrated Regions – Arete",
      "Glaciers - Erosional Landforms: Glacial Valleys / Troughs – Fiords",
      "Glaciers - Depositional Landforms: Glacial Tills, Moraines, Eskers, Outwash Plains, Drumlins",
      "Waves and Currents - High Rocky Coasts & Low Sedimentary Coasts",
      "Waves and Currents - Erosional Landforms: Cliffs, Terraces, Caves, Stacks",
      "Waves and Currents - Depositional Landforms: Beaches, Dunes, Bars, Barriers, Spits"
    ]
  },
  {
    chapter: "Weathering",
    topics: [
      "Weather over Earth Materials",
      "Factors of Weathering - Geological, Climatic, Topographic, Vegetative",
      "Chemical Weathering - Solution, Carbonation, Hydration, Oxidation & Reduction",
      "Physical Weathering - Gravitational, Expansion, Water Pressure, Unloading, Temperature, Freezing, Thawing, Frost Wedging, Salt",
      "Biological Weathering - Burrowing, Wedging, Plant Roots",
      "Effects of Weathering - Exfoliation (Flaking), Exfoliation Domes, Tors",
      "Significance of Weathering - Soil Formation, Biomes and Biodiversity, Leaching/Enrichment",
      "Mass Movements - Activating causes",
      "Mass Movements - Forms of movement: Heave, Flow, Slide",
      "Mass Movements - 3 major Groups: Slow Movement, Rapid Movements, Land Slides"
    ]
  },
  {
    chapter: "Landforms across the world",
    topics: [
      "Rivers and lakes of the World",
      "Mountains & Peaks - Fold Mountain, Block Mountain, Volcanic mountains",
      "Plateaus - Plateau Formation process",
      "Plateaus - Plateau Types (Dissected plateau, Volcanic plateau)",
      "Plateaus - Economic significance & Major plateaus of the world"
    ]
  },
  {
    chapter: "Climatology – Composition & Structure",
    topics: [
      "Composition of Atmosphere - Gases, Water Vapour, Dust Particles",
      "Structure of Atmosphere - Exosphere, Thermosphere, Mesosphere, Stratosphere, Troposphere",
      "Altitude vs Temperature"
    ]
  },
  {
    chapter: "Solar Radiation Heat Balance Temperature",
    topics: [
      "Insolation - Aphelion and Perihelion",
      "Variability of Insolation at surface of Earth (Day, Season, Year, Rotation, Angle of Rays, Length of Day, Transparency, Configuration)",
      "Heating and cooling of atmosphere - Conduction, Convection, Advection, Terrestrial Radiation",
      "Heat Budget of Planet Earth - Macro Budget, Albedo, Shortwave & Longwave Earth Radiation",
      "Variation in net Heat Budget at Earth's Surface",
      "Temperature - Factors controlling Temperature distribution",
      "Temperature Distribution & Range (Month of January–July)",
      "Inversion of Temperature"
    ]
  },
  {
    chapter: "Atmospheric Circulation and Weather Systems",
    topics: [
      "Atmospheric Pressure - Vertical variation & Horizontal distribution",
      "World Distribution of Sea Level Pressure",
      "Factors affecting Velocity and Direction of Wind - Pressure Gradient, Frictional & Coriolis Force",
      "Pressure and Wind - Cyclonic & Anticyclonic Circulation",
      "General Circulation of Atmosphere - Pattern of Planetary Winds",
      "Latitudinal Variation of Atmospheric Heating",
      "Emergence of Pressure Belts & Migration following Path of Sun",
      "Distribution of continents & Oceans, Rotation of Earth",
      "Simplified Global Circulation - Hadley Cell, Ferrel Cell, Polar cell",
      "Seasonal Wind & Local Wind (Land and Sea Breezes, Mountain and Valley winds)",
      "Air Mass and Fronts",
      "Extra Tropical Cyclone, Thunderstorms, Tornadoes"
    ]
  },
  {
    chapter: "Water in the Atmosphere",
    topics: [
      "Water Vapour & Precipitation",
      "Humidity – Absolute and Relative, Saturation – Dew Point",
      "Evaporation and Condensation - Dew, Frost, Fog & Mist",
      "Clouds Types – Cirrus, Cumulus, Stratus, Nimbus",
      "High Clouds – Cirrus, Cirrostratus, Cirrocumulus",
      "Middle Clouds – Altostratus, Altocumulus",
      "Low Clouds – Stratocumulus, Nimbostratus",
      "Vertical Development Clouds – Cumulus and Cumulonimbus",
      "Precipitation – Rainfall, Snowfall, Sleet, Hail, Hailstones",
      "Types of Rainfall – Convectional, Orographic, Cyclonic, Frontal, Monsoonal",
      "World Distribution of Rainfall"
    ]
  },
  {
    chapter: "Tropical Cyclone",
    topics: [
      "Conditions required for formation of Tropical Cyclone",
      "Convective cyclogenesis (Development of Tropical Cyclone)",
      "Path of Tropical Cyclone & Damage associated with Cyclone",
      "Arabian Sea Cyclone",
      "Naming of Tropical Cyclone",
      "Early warning system for tropical Cyclone"
    ]
  },
  {
    chapter: "Jet Streams",
    topics: [
      "Features of Jet streams",
      "Types of Jet streams - Permanent & Temporary",
      "Influence of Jet streams on weather",
      "Jet streams and aviation"
    ]
  },
  {
    chapter: "Temperate Cyclones",
    topics: [
      "Air masses and Fronts in Temperate Cyclones",
      "Origin and development of Temperate Cyclone",
      "Comparison between Tropical and Temperate Cyclone"
    ]
  },
  {
    chapter: "Polar Vortex",
    topics: [
      "Polar vortex details",
      "Polar vortex and Ozone depletion"
    ]
  },
  {
    chapter: "El Nino and La Nina",
    topics: [
      "ENSO & Indian Ocean dipole effect",
      "Effect of ENSO/IOD on regional and world climate",
      "Effect of these events on Indian Monsoon"
    ]
  },
  {
    chapter: "World Climate",
    topics: [
      "The Hot, Wet Equatorial Climate",
      "The Tropical Monsoon and Tropical Marine Climates",
      "The Savanna or Sudan Climate",
      "The Hot Desert and Mid-Latitude Desert Climates",
      "The Warm Temperate Western Margin (Mediterranean) Climate",
      "The Temperate Continental (Steppe) Climate",
      "The Warm Temperate Eastern Margin (China Type) Climate",
      "The Cool Temperate Western Margin (British Type) Climate",
      "The Cool Temperate Continental (Siberian) Climate",
      "The Cool Temperate Eastern Margin (Laurentian) Climate",
      "The Arctic or Polar Climate"
    ]
  },
  {
    chapter: "Oceanography",
    topics: [
      "Hydrological Cycle - Components & Processes",
      "Relief of Ocean floor - 4 divisions (Continental Shelf, Slope, Deep sea plain, Trenches)",
      "Minor relief features - Mid oceanic ridges, Seamount, Submarine canyons, Guyots, Atoll",
      "Temperature of Ocean Water - Vertical, Spatial Distribution & Thermocline (3 layers)",
      "Factors affecting Temperature distribution of Ocean Water",
      "Salinity of Ocean Water - Factors & Vertical Distribution",
      "Density of Ocean Waters"
    ]
  },
  {
    chapter: "Movements of Ocean Water",
    topics: [
      "Factors influencing Movement of Ocean Water",
      "Motion – Horizontal & Vertical Currents",
      "Waves - Motion of waves and water molecules, Characteristics of Wave",
      "Relation between Gravitational Forces and Tides",
      "Tidal currents",
      "Types of Tides - Based on Frequency & SME position",
      "Importance of Tides",
      "Ocean Currents - Primary Force & Secondary force",
      "Characteristics & Types of ocean currents (Surface/Deep, Cold/Warm)",
      "Major Ocean currents of the World",
      "Effects of Ocean Currents & Desert formation",
      "Atlantic Meridional Overturning Circulation (AMOC)"
    ]
  },
  {
    chapter: "Resources from the Ocean",
    topics: [
      "Ocean deposits - Terrigenous & Pelagic deposits",
      "Mineral resources on deep sea floor, Energy resources & Biotic resources",
      "Deep ocean mission",
      "UNCLOS - Territorial Waters, Contiguous Zone, Exclusive Economic Zone, High Seas"
    ]
  },
  {
    chapter: "Water Resource",
    topics: [
      "Underground, Surface & Inland water resources (Utilization)",
      "Oceanic water resources - Main features & Utilization by man",
      "Water consumption patterns & Water pollution",
      "Conservation of water resources & Techniques",
      "River Interlinking Projects",
      "The problem of ageing dams"
    ]
  },
  {
    chapter: "Biogeography - Soil",
    topics: [
      "Soil Characteristics & Factors Responsible for Soil Formation",
      "Stages of Soil Formation & Soil Forming Processes",
      "Soil Profiles and Horizons",
      "Soil Classification",
      "Soil Erosion and Conservation"
    ]
  },
  {
    chapter: "Vegetation Resources & Deforestation",
    topics: [
      "Types of Natural Vegetation - Forests, Grasslands, Desert, Tundra",
      "Significance of forests - Economic, Ecological, Cultural",
      "Factors of forest development, Extent of cover & Classification",
      "Economic utilization of forests",
      "Deforestation - Tropical & Temperate forests (Rate and extent)",
      "Causes and factors of deforestation - Immediate, Indirect & Underlying causes",
      "Conservation of forests & Strategies (Reforestation, Monoculture plantation, Afforestation)",
      "Types of forestry - Social forestry, Agro-forestry",
      "Miyawaki Method"
    ]
  }
];

const PHYSICAL_GEOGRAPHY_OF_INDIA_DATA = [
  {
    chapter: "Physiography of India",
    topics: [
      "Location",
      "Geopolitical Significance of India",
      "Geological Divisions - The Peninsular Block",
      "Geological Divisions - The Himalayas and other Peninsular Mountains",
      "Geological Divisions - Indo-Ganga-Brahmaputra Plain",
      "Physiographic Divisions"
    ]
  },
  {
    chapter: "Drainage System",
    topics: [
      "Drainage Patterns",
      "Drainage System of India",
      "Himalayan Drainage System",
      "River Systems of Himalayan Drainage - Indus river system",
      "River Systems of Himalayan Drainage - Ganga River System",
      "River Systems of Himalayan Drainage - Brahmaputra river system",
      "River Systems of Peninsular Drainage",
      "Small Rivers Flowing Towards East and West"
    ]
  },
  {
    chapter: "Climate",
    topics: [
      "Factors influencing the climate of India",
      "Monsoon - Mechanism of the Monsoon",
      "Monsoon Theories - Classical Theory",
      "Monsoon Theories - Modern theory",
      "Monsoon Theories - Air mass theory",
      "Monsoon Theories - Jet stream theory",
      "EL-NINO and LA-NINA & their impact",
      "The rhythm of Seasons - The cold weather season",
      "The rhythm of Seasons - The hot weather season",
      "The rhythm of Seasons - The southwest monsoon season",
      "The rhythm of Seasons - The retreating monsoon season",
      "Climatic Regions of India"
    ]
  },
  {
    chapter: "Soils in India",
    topics: [
      "Classification of Soils",
      "Soil textures",
      "Issue of Soil degradation & Soil Erosion",
      "Soil Conservation"
    ]
  },
  {
    chapter: "Natural Vegetation",
    topics: [
      "Types of Forests in India",
      "Forest Cover in India",
      "Forest Conservation",
      "Forest Problems in India"
    ]
  }
];

const HUMAN_GEOGRAPHY_DATA = [
  {
    chapter: "Demography",
    topics: [
      "Concept of Human Resources",
      "Population Distribution & Factors (Physical, Socio-cultural, Demographic)",
      "World Population Distribution & Continent-wise Distribution",
      "Density of Population & Pattern of Density",
      "Causes of Rapid Increase in Population & Determinants of Growth",
      "Characteristics of Population (Age, Pyramids, Sex Ratio, Literacy)",
      "Theories of Population Growth (Malthusian, Marxian, Demographic Transition)",
      "Population Problems of Developing & Developed Countries",
      "Population Dilemma of Europe",
      "Population Policies of China and India",
      "Rural Settlements & House Types",
      "Rising Youth Population"
    ]
  },
  {
    chapter: "Urbanization",
    topics: [
      "Basic Feature and Pattern of India's Urbanization",
      "Issues of Urbanization in India",
      "Rural Urban Migration & Emergence of Slums",
      "Urban Transport & Waste Disposal",
      "Water Supply, Drainage and Sanitation",
      "Urban Poverty",
      "Real Estate (Regulation & Development) Act, 2016",
      "Way Forward to Tackle Issues Related to Urbanization",
      "Inclusive Cities / Smart Cities & Government Programmes",
      "Migration & Reverse Migration",
      "Displacement & Rehabilitation Policy",
      "Urban Settlements & Urbanisation Process in India",
      "Morphology of Urban Settlements & Town Planning",
      "Settlement Types of the World",
      "Migration Push and Pull Factors",
      "Emigration (Colonial, Post-Independent & Post-Liberalisation)",
      "Internal vs World Migration",
      "Functional Classification of Cities",
      "Boundaries and Frontiers",
      "Rural Urban Fringe Characteristics",
      "National Urbanisation Policy & Principles of Urban Planning",
      "Land Cover Transformation",
      "Factors Affecting Rural Settlements",
      "Cities - Hierarchical & Morphological Classification"
    ]
  },
  {
    chapter: "Census & Demographics",
    topics: [
      "Literacy Rate & Sex Ratio Metrics",
      "Family Planning & Old Age Issues",
      "Age Structure & Population Density",
      "Population Growth Trends",
      "Census Terminology",
      "Caste Census Issues"
    ]
  }
];

const ECONOMIC_GEOGRAPHY_DATA = [
  {
    chapter: "Agriculture & Land Resources",
    topics: [
      "Land Resource – Land-use",
      "Land Resource – Land capability classification",
      "Causes of Land Degradation",
      "Impact of Land Degradation",
      "Steps taken by GOI for Sustainable Land Management",
      "Basic terms related to Agriculture",
      "Performance of the agriculture sector",
      "Types of farming in India",
      "Cropping seasons in India",
      "Cropping Pattern in India",
      "Agriculture regionalization",
      "Infrastructure factors: Seeds, Fertilizers, Irrigation",
      "Land use pattern in India",
      "Institutional Factors as land reform",
      "Horticulture sector in India",
      "Agricultural revolutions",
      "Agricultural labours",
      "Price Policy for Agriculture",
      "Agricultural marketing",
      "Agricultural Insurance",
      "Agricultural Census",
      "Major schemes in agricultural sector",
      "National Policy for farmers",
      "Impact of climate change on agriculture",
      "What is sustainable agriculture?",
      "Use of IT in agriculture",
      "Agriculture Issues and Challenges"
    ]
  },
  {
    chapter: "Productivity of Crops and Conditions for Growth",
    topics: [
      "Wheat – Conditions of growth, Varieties, Types of cultivation, Production pattern, International trade",
      "Rice – Conditions of growth, Varieties, Methods of cultivation, Production pattern, International trade",
      "Maize (Corn) – Conditions of growth, Production pattern, International trade",
      "Barley – Conditions of growth, Production pattern, International trade",
      "Oats & Rye",
      "Beverages – Tea: Condition of growth, Production pattern, International trade",
      "Beverages – Coffee: Types of coffee, Conditions of growth, Production pattern, International trade",
      "Beverages – Cocoa: Conditions of growth, Production pattern, International trade",
      "Tobacco – Conditions of growth, Production pattern, International trade",
      "Fibre Crops – Cotton: Varieties of cotton, Conditions of growth, Production pattern, International trade",
      "Fibre Crops – Jute: Conditions of growth, Production pattern, International trade, Substitutes (Flax, Hemp, Abaca, Henequen, Sisal)",
      "Raw Silk – Production pattern & International trade",
      "Natural Rubber – Other sources, Plantations in Southeast Asia, Production pattern & International trade",
      "Sugarcane – Conditions of growth, Production pattern & International trade",
      "Sugarbeet – Conditions of growth, Production pattern, Sugar industry, Sugar consumption & International trade"
    ]
  },
  {
    chapter: "Mineral Resources",
    topics: [
      "Types of minerals (Metallic & Non-metallic)",
      "Distribution of minerals and mining regions",
      "Distribution, production and international trade of Metallic minerals – Ferrous metals: Iron ore",
      "Ferro-alloys & Non-ferrous: Manganese, Chromium, Nickel, Tungsten, Antimony, Copper, Bauxite and Aluminium, Zinc, Lead, Tin",
      "Precious metals: Gold, Silver, Platinum",
      "Mineral chemicals: Mica, Potash, Phosphate, Nitrates, Sulphur",
      "Conservation of mineral resources"
    ]
  },
  {
    chapter: "Energy Resources",
    topics: [
      "Classification of energy & Production of conventional energy",
      "General trends of energy production and consumption",
      "Reserves and sources of energy",
      "Coal – Nature and origin, Constituents and kinds, Coal fields, By products, Conservation of Coal",
      "Petroleum – Nature, Origin & recovery, Exploration, Petroleum refining, Reserves, Producing areas, Consumption, International trade, OPEC & oil trade",
      "Natural gas: Reserves and Production",
      "Hydro-electricity – Advantages, Ideal conditions for generation, Distribution of potential hydro-power, Power Generation",
      "Atomic (Nuclear) Energy – Source minerals (Uranium, World distribution, Production), Thorium, Production of Nuclear Energy, Energy of future",
      "Alternative (non-conventional) Sources of energy – Renewable Energy (Solar, Wind, Geothermal, Tidal, Wave, Biomass)",
      "Alternate Energy Sources – Hydrogen as a Fuel for Future / Alternative Energy Source, Microbial Fuel Cell",
      "Energy Context with Respect to Indian Scenario – Energy Plantation, Energy crisis"
    ]
  },
  {
    chapter: "Industry",
    topics: [
      "Industrial development",
      "Iron And Steel Industry – Process of production, Location, Early localization, Distribution, Global steel production, International trade, Growth potential",
      "Textile Industry – Cotton textile (Location, Trends in localization, Distribution and production), Woollen textile (Location), Silk textile (Raw silk, Manufacturing, Synthetic silk, Man-made fibre fabrics)",
      "Engineering Industries – Machine tools and machines, Textile machinery, Other industrial machinery, Agricultural machinery, Manufacturing of transport equipment (Automobile, Railway car/locomotive, Shipbuilding, Aircrafts)",
      "Chemical Industry – Classes of chemicals, Heavy chemical industry, Acids & alkalies, Fertilizer industry (Nitrogen, Phosphate, Potash), Explosives",
      "Glass industry & Agro-industries",
      "Synthetic rubber industry",
      "Pulp and paper industry – Essential conditions for pulp production, Production of paper and paper board, International trade, Salient features",
      "Cement industry – Distribution & Recent global trends/competitors",
      "Petroleum refining industry – Localization, Site selection, History of oil refineries, World pattern of oil refining, Petroleum products",
      "Industrial Regions – Characteristics, Delimitation, Principal industrial regions of the world (Anglo America, Former USSR, Eastern Asia – Japan, China, Dragons, India, High tech patterns)"
    ]
  },
  {
    chapter: "Transport and Communication",
    topics: [
      "Modes of Transportation – Land Transport (Roads, Railways)",
      "Water Transport – Sea Routes, Shipping Canals, Inland Waterways",
      "Air Transport",
      "Pipelines",
      "Regional Rapid Transit System 1",
      "Odisha's coastal highway",
      "AERA Act amendment – Way to boost up Air transport"
    ]
  },
  {
    chapter: "Contemporary Issues",
    topics: [
      "Eleventh Agriculture Census (2021-22)",
      "Issues Related to Agriculture Produce Market Committee (APMC)",
      "New White Revolution: Need, Scope & Challenges",
      "The Western Indian Ocean Region and The Coordinated Fight Against Pollution",
      "Geopolitics of Natural Resources: Spatial Analysis",
      "Depletion of Natural Resources versus Economic Growth",
      "Renewable Energy and Women Empowerment",
      "Does Access to Energy Cause Human Development",
      "Potential of nuclear energy to reduce CO2 Emissions",
      "The Indian automotive industry: From resilience to resurgence?",
      "Role of Industrial Development in minimizing regional inequalities",
      "Impact of 4th Industrial Revolution on Global Manufacturing Sector",
      "Demographic Transition: Contemporary look at the model",
      "Demographic Window of Opportunities",
      "Astropolitics: Its growing significance",
      "Impact of Rural-Urban Migration on the resources at the source and destination region",
      "Global Population Ageing – Causes & Consequences",
      "Time to prepare to forecast and try to manage globally disruptive volcanic eruptions"
    ]
  }
];

const INDIAN_SOCIETY_DATA = [
  {
    chapter: "Salient features of Indian society",
    topics: [
      "Features of Indian society",
      "Changes within Indian society and their repercussions",
      "Causes of changes",
      "Indian Society today"
    ]
  },
  {
    chapter: "Diversity of India",
    topics: [
      "What is diversity?",
      "Types of diversities in India",
      "Can diversity be equated with difference?",
      "The unity in diversity – a reality or a chimera",
      "Manner of reconciliation"
    ]
  },
  {
    chapter: "Role of women’s organizations & SHGs",
    topics: [
      "Women’s organizations in Indian history",
      "Types of women’s organizations & Level of penetration",
      "Problems faced by women’s organizations",
      "Is a larger vocal role possible and ways to achieve the same",
      "Role of SHGs and Micro Finance Institutions"
    ]
  },
  {
    chapter: "Poverty and Development Issues",
    topics: [
      "Poverty concepts & measurements",
      "Concept of development & Sen vs Bhagwati model",
      "Crisis of development & Certain case studies",
      "Government’s initiatives and Five Year Plans",
      "Role of civil society organizations"
    ]
  },
  {
    chapter: "Effects of globalization on Indian society",
    topics: [
      "What is the meaning of globalization",
      "Kinds of impact of globalization – Economic, political, developmental and socio-cultural",
      "Is the impact solely positive or negative"
    ]
  },
  {
    chapter: "Social empowerment",
    topics: [
      "Meaning and concept of social empowerment",
      "Why do we need social empowerment?",
      "Social empowerment through the five year plans",
      "Government’s initiatives for empowerment",
      "Empowerment in reality and India’s experience",
      "Other approaches / players / tools for social empowerment and case studies"
    ]
  },
  {
    chapter: "Communalism",
    topics: [
      "Meaning and concept of communalism",
      "Historicity of communalism",
      "Recent incidents of communalism",
      "Role of third parties in inciting/perpetrating communalism",
      "Communalism under the law",
      "Can communalism be eradicated from Indian society completely?"
    ]
  },
  {
    chapter: "Secularism",
    topics: [
      "Meaning and concept of secularism",
      "Secularism through the vantage point of Indian Constitution",
      "Comparisons of models: Indian vs Western",
      "Gandhiji on religion",
      "Indian philosophy on secularism",
      "Threats to the secular spirit",
      "Is Indian democracy mature enough to handle the gravity of secularism?"
    ]
  },
  {
    chapter: "Regionalism",
    topics: [
      "Meaning and concept of regionalism",
      "Theories on regionalism",
      "Regionalism in its various manifestations",
      "Role of various players",
      "Recent incidents causing a wave of flurry",
      "Possible ways to tackle regionalism"
    ]
  }
];

const POLITY_DATA = [
  {
    chapter: "Historical Evolution & Features",
    topics: [
      "Importance of Constitution",
      "Historical evolution of the Constitution",
      "Constituent Assembly",
      "Objectives of the Constitution",
      "Salient features of Indian Constitution",
      "Unitary features",
      "Federal features",
      "Parliamentary form of government",
      "Presidential form of government",
      "Parliamentary vs. Presidential system of government"
    ]
  },
  {
    chapter: "Preamble",
    topics: [
      "Preamble",
      "Basic features",
      "Value premises of constitution",
      "Terminologies (Democratic, Sovereign, Socialist, Secular, Republic, Justice, Equality, Liberty, Fraternity, Integrity)",
      "Amendability of the Preamble"
    ]
  },
  {
    chapter: "Citizenship",
    topics: [
      "Basic constitutional features",
      "Methodology of getting citizenship",
      "Modes of Losing the Citizenship of India",
      "Concept of dual citizenship",
      "Citizenship provisions in J&K",
      "Special privileges enjoyed by citizens in India",
      "Overseas Citizens of India (OCI) and Persons of Indian Origin (PIOs)"
    ]
  },
  {
    chapter: "Fundamental Rights",
    topics: [
      "Significance of Fundamental Rights",
      "What is State?",
      "Right to Equality",
      "Right to Freedom",
      "Right against Exploitation",
      "Right to Freedom of Religion",
      "Cultural and Educational Rights",
      "Right to Constitutional Remedies",
      "Fundamental Rights and Armed Forces",
      "Martial Law & Fundamental Rights",
      "Difference between procedure established by law and due process of law",
      "Writs and their uses",
      "Restrictive limitations on fundamental rights",
      "Rights outside Part III of the Constitution",
      "Dynamic Nature of Article 32",
      "Need of Revitalizing Indian Reservation System"
    ]
  },
  {
    chapter: "DPSP",
    topics: [
      "Basic features",
      "Economic and Social DPSP",
      "Gandhian DPSP",
      "Administrative DPSP",
      "DPSP related to International Peace",
      "Implementation of DPSP",
      "Fundamental Rights and the Directive Principles of State Policy Controversy",
      "Directives outside Part IV of the Constitution",
      "Application of Uniform Civil Code in India"
    ]
  },
  {
    chapter: "Fundamental Duties",
    topics: [
      "Features",
      "Link of Fundamental Rights and Fundamental Duties"
    ]
  },
  {
    chapter: "Other Principles",
    topics: [
      "Process of law making in India",
      "Role of Constitutional and extra constitutional bodies in law making",
      "Basic structure: How it evolves?",
      "Different types of majorities required in Indian Constitution",
      "DPSP v. Fundamental Rights",
      "Doctrines & Terminologies"
    ]
  },
  {
    chapter: "Separation of Powers",
    topics: [
      "Features in American and UK Constitution",
      "Checks and balances provisions in Indian Constitution",
      "Judicial Review",
      "Concept of Separation of Powers",
      "Comparison of the Indian constitutional scheme with that of other countries (USA, UK, India and neighbours)"
    ]
  },
  {
    chapter: "Union & States",
    topics: [
      "State Reorganization Commission (brief)",
      "Components of Indian territory",
      "Process of formation of new states",
      "Zonal Councils",
      "Union territories",
      "Special provisions for states",
      "Scheduled and Tribal Areas",
      "Functions and responsibilities of the Union and the States",
      "Regulating functions of Government",
      "Development functions of government",
      "Service providing functions of government",
      "Problems in implementation",
      "Recommendations for improvement",
      "Interrelationship between union, state and local government in implementation of roles",
      "Constitutional provisions related to financial devolution",
      "Issues of financial devolution",
      "Issues and challenges pertaining to the federal structure (Administrative, Legislative & Financial relations)",
      "Emergency Provisions and Misuse of Article 356",
      "Inter-State relations",
      "Issues related to Union List, State List & Concurrent List",
      "Issues related to appointment of Governor",
      "Issues related to state formation",
      "Poor devolution of finances",
      "Reserving bill for Presidential approval",
      "Central sponsored schemes and issues",
      "Special package for different states",
      "Issues between Centre and State after 1990 reforms",
      "Foreign policy and Centre and State Relations",
      "Inter-State border disputes"
    ]
  },
  {
    chapter: "The President",
    topics: [
      "Importance of President",
      "Qualification",
      "Election procedure",
      "Advantages and disadvantages of single transferable form of voting",
      "Presidents’ Term of Office and emoluments",
      "Executive Powers",
      "Legislative Powers",
      "Emergency Powers",
      "Financial Powers",
      "Miscellaneous powers",
      "Judicial powers",
      "Impeachment of President",
      "President as nominal head",
      "Ordinance making power",
      "Passage of bills",
      "Misuse of emergency provisions",
      "Pardon power",
      "Coalition government"
    ]
  },
  {
    chapter: "Vice President",
    topics: [
      "Office of the Vice-President",
      "Functions",
      "Comparison between Indian VP and American VP"
    ]
  },
  {
    chapter: "Prime Minister",
    topics: [
      "Appointment of PM",
      "Functions of PM",
      "Role of PM with respect to CoM, President, Lok Sabha, Political Party & Coalition Government"
    ]
  },
  {
    chapter: "Council of Ministers",
    topics: [
      "Division of CoM",
      "Role of CoM",
      "Role of Cabinet",
      "Responsibilities of the Ministers"
    ]
  },
  {
    chapter: "Attorney General of India",
    topics: [
      "Qualification",
      "Functions",
      "Powers with respect to Parliament"
    ]
  },
  {
    chapter: "Parliament",
    topics: [
      "Composition of Rajya Sabha",
      "Composition of Lok Sabha",
      "Qualification and disqualification of MPs and MLAs",
      "Vacation of seats",
      "Sessions of Parliament",
      "Law making procedure",
      "Officers of Parliament and State Legislature",
      "Parliament Proceedings",
      "Motions and resolutions in Parliament",
      "Powers and Privileges",
      "Financial proceedings",
      "Comparison of Lok Sabha and Rajya Sabha",
      "Women reservation in Parliament and issues",
      "Lowering of Parliamentary powers",
      "Parliamentary committees and their working",
      "Judicial activism and Parliament",
      "Delegated legislation and issues"
    ]
  },
  {
    chapter: "The Judiciary",
    topics: [
      "Integrated judicial system",
      "Supreme Court (Composition, Independence, Jurisdiction & Judicial Review)",
      "High Court (Composition, Terms & removal, Jurisdiction, Other powers)",
      "Lower judiciary (Appointment, Powers)",
      "Tribunal & Subordinate Courts",
      "The role of the Supreme Court of India as guardian of the Constitution and protector of Fundamental Rights",
      "Judicial Review",
      "PIL",
      "Judicial Activism",
      "Judiciary appointment",
      "Collegiums System",
      "NJAC Controversy",
      "National Court of Appeal",
      "Judicial Accountability",
      "Issues of corruption in judiciary",
      "Role of Women in Judiciary",
      "Need for Virtual Courts"
    ]
  },
  {
    chapter: "Ministries and Departments of the Government",
    topics: [
      "Functioning of Ministries",
      "Central Secretariat",
      "Cabinet Secretary",
      "Field organizations",
      "Reforms needed",
      "International methodology"
    ]
  },
  {
    chapter: "Local Government",
    topics: [
      "Provisions of 73rd AA and 74th AA",
      "Role and functions of different tiers",
      "Municipal Corporations, Municipal Councils & Nagar Panchayats",
      "The steps taken towards women’s empowerment",
      "Role of State Election commission",
      "Role of State Finance Commission",
      "Smart City Mission & Municipal Governance",
      "Model Panchayat Citizens Charter Framework"
    ]
  },
  {
    chapter: "Dispute redressal mechanisms and institutions",
    topics: [
      "What is Dispute redressal mechanisms & Need of Dispute redressal mechanisms",
      "Administrative tribunal and issues",
      "Fast Track Courts and issues",
      "Gram Nyalayas and issues",
      "Parivarik Mahila Lok Adalats and issues",
      "Family Courts and issues",
      "Lok Adalat and issues",
      "NALSA and issues",
      "Dispute redressal for Weaker section",
      "Arbitration Mechanism",
      "International Arbitrary Centre",
      "Commercial Court"
    ]
  },
  {
    chapter: "Comptroller And Auditor-General Of India",
    topics: [
      "Appointment",
      "Functions",
      "Role of CAG in good governance"
    ]
  },
  {
    chapter: "The Governor",
    topics: [
      "Appointment, term of office, qualification, etc.",
      "Powers",
      "Discretionary powers",
      "Ordinance making power",
      "Pardoning power of the Governor"
    ]
  },
  {
    chapter: "Chief Minister",
    topics: [
      "Appointment",
      "Powers and responsibilities",
      "Relationship between the Governor and the Chief Minister",
      "Relationship between CoM and the Chief Minister"
    ]
  },
  {
    chapter: "The Advocate-General for the State",
    topics: [
      "Appointment",
      "Functions"
    ]
  },
  {
    chapter: "State legislature",
    topics: [
      "The composition of Vidhan Sabha and Vidhan Parishad",
      "Qualifications of the Members of Legislature",
      "Powers and Functions of State Legislature",
      "Relationship between both the Houses",
      "Officers of State Legislature",
      "Powers, Privileges and Immunities of State Legislatures and their Members",
      "Legislative procedure",
      "Governor’s assent to Bills",
      "Procedure in Financial Matters / Budget"
    ]
  },
  {
    chapter: "Constitutional Bodies",
    topics: [
      "Election Commission",
      "Union Public Service Commission",
      "State Public Service Commission",
      "Finance Commission",
      "GST Council",
      "National Commission for SCs and STs",
      "Special Officer for Linguistic Minorities",
      "Advocate General of State"
    ]
  },
  {
    chapter: "Non-Constitutional Bodies",
    topics: [
      "NITI Aayog",
      "National and State Human Rights Commission",
      "Central and State Information Commission",
      "Central Vigilance Commission",
      "Central Bureau of Investigation",
      "Lokpal and Lokayukta"
    ]
  },
  {
    chapter: "Various Constitutional Dimensions",
    topics: [
      "Co-operative Societies",
      "Official Languages under the Indian Constitution"
    ]
  },
  {
    chapter: "Political Dynamics",
    topics: [
      "Provisions related to Political Parties",
      "Rise of Regional Parties in India",
      "Election Laws and Electoral Reforms in India",
      "Importance of NRI votes in Indian Election System",
      "Tenth Schedule of the Indian Constitution"
    ]
  }
];

const GOVERNANCE_DATA = [
  {
    chapter: "Need and importance of Government Policies",
    topics: [
      "Growth and development",
      "Human development and human capital formation",
      "Equality (interpersonal and interregional) and social justice",
      "Unity and integrity",
      "Trust between state and citizens",
      "Governance: Meaning and Scope",
      "Good Governance",
      "Contemporary debate around Governance and Good Governance",
      "Governance and emerging areas (4th Industrial revolution and related technologies, gender issues, Ethical Governance, Environmental Governance)"
    ]
  },
  {
    chapter: "Effective Implementation",
    topics: [
      "What is effective implementation? Best outcomes in view of given time, resources and constraints",
      "Outcome orientation in implementation",
      "Programme impact assessment",
      "Analysis of different important schemes"
    ]
  },
  {
    chapter: "Government intervention",
    topics: [
      "Good Governance-Role of institutions, bureaucrats and other stakeholders",
      "Transparency and accountability",
      "Optimum use of resources - Right targeting, plugging leakages and wasteful expenditure, use of available knowledge, research and innovation",
      "Monitoring and evaluation - Outcome",
      "Budget, zero base budgeting, input-output analysis, cost-benefit analysis",
      "Setting up institutions and regulatory norms task forces, steering committees and review committees",
      "Interventions in emerging areas - Social Media, Data, Privacy, Social Sector"
    ]
  },
  {
    chapter: "Development Process & Industry",
    topics: [
      "Difference between Growth and Development",
      "Main Constraints of development",
      "Main Stake holders in development process"
    ]
  },
  {
    chapter: "Self Help Groups",
    topics: [
      "Meaning",
      "Importance",
      "Objectives",
      "Institutional Structure and organization",
      "Funding",
      "SHGs and Women Development",
      "Women Development and Women in Development dynamics",
      "SHGs and poverty",
      "SHGs and Rural Development"
    ]
  },
  {
    chapter: "Micro Finance",
    topics: [
      "Meaning and importance",
      "Objectives",
      "Structure and Organization",
      "Advantages",
      "Micro Finance in India"
    ]
  },
  {
    chapter: "Non-Government Organizations",
    topics: [
      "What are NGOs?",
      "Difference between Non-Government Organizations (NGOs) and International Non-Government Organizations (INGOs)",
      "United Nations Criteria for INGO and NGO",
      "NGOs and development projects",
      "NGOs and Community development",
      "NGOs involved in relief and rehabilitation",
      "NGOs involved in disaster management",
      "NGOs and advocacy"
    ]
  },
  {
    chapter: "Important aspects of governance, transparency and accountability",
    topics: [
      "Citizen centric governance",
      "Features of good governance",
      "Legislative accountability",
      "Administrative accountability",
      "Judicial accountability",
      "Ombudsman",
      "Whistleblowers concept",
      "Anti corruption machinery",
      "Role of citizens",
      "Role of media",
      "Social audit",
      "Systematic reforms",
      "Social Media and Accountability/Transparency/Governance",
      "Decentralisation",
      "Delegation",
      "Delegation vs decentralisation",
      "Bottom-up governance"
    ]
  },
  {
    chapter: "e-Governance",
    topics: [
      "Introduction",
      "Applications",
      "Models",
      "Successes",
      "Limitations",
      "Future prospects",
      "Dashboards and Portals of E-governance and E-government - Uses/Impact/Analysis",
      "Democracy and E-governance",
      "E governance and Judiciary",
      "E governance and Legislatures"
    ]
  },
  {
    chapter: "Citizens Charters",
    topics: [
      "Citizens Charters",
      "Introduction",
      "Models",
      "Features",
      "CC in India",
      "Issues in CC implementation",
      "Reform needed",
      "Sevottam Framework",
      "Citizens and Citizens Charters"
    ]
  },
  {
    chapter: "Role of civil services in a democracy",
    topics: [
      "Concept of civil services",
      "Need for civil services",
      "Different role of civil services",
      "Law making",
      "Policy formulation",
      "Policy implementation",
      "Policy evaluation",
      "Civil services as protector of democracy",
      "To protect minorities (religious and linguistic)",
      "To promote Inclusive and sustainable growth",
      "Civil Services – Democracy dynamics",
      "Civil Services in eras- Post independence/ Post-LPG/in 21st century",
      "Emerging challenges for Civil Services",
      "Reforms - Lateral Entry",
      "Capacity building of Civil Services (Past to Present) Autonomy",
      "Frequent transfers and security of tenure - concept/benefits/analysis",
      "Cadre Policy",
      "Performance Appraisal and HR policies for Civil Services",
      "Civil Services Board"
    ]
  },
  {
    chapter: "Pressure groups and formal/informal associations and their role in the Polity",
    topics: [
      "What are pressure groups?",
      "Types",
      "The significance of pressure groups in India",
      "Differentiate between a pressure group and a political party",
      "Evaluation of pressure groups role",
      "Pressure groups and new media",
      "Politicisation of Pressure Groups",
      "Role of pressure groups in governance",
      "Issues, pros, cons, challenges for Pressure Groups"
    ]
  },
  {
    chapter: "Appointment to various Constitutional posts, powers, functions and responsibilities of various Constitutional Bodies",
    topics: [
      "Appointment of CAG (procedure of appointment) - composition of CAG",
      "Functions and responsibilities of CAG",
      "Powers and privileges of CAG (provided by constitution and different ACTs of Parliament.)",
      "Appointment of ECI (procedure of appointment) - composition of ECI",
      "Functions and responsibilities of ECI",
      "Powers and privileges of ECI (provided by Constitution and different acts of Parliament)",
      "Appointment to UPSC (procedure of appointment)- composition of UPSC",
      "Functions and responsibilities of UPSC",
      "Powers and privileges of UPSC (provided by Constitution and different Acts of Parliament.)",
      "Appointment to Finance commission (procedure of appointment)",
      "Composition of Finance Commission",
      "Functions and responsibilities of Finance Commission",
      "Powers and privileges of Finance Commission (provided by Constitution and different Acts of Parliament.)",
      "National Commission for SCs and STs.",
      "Other bodies - NGT, NHRC etc.",
      "Evaluation of Each body: History/Evolution/Pros/Cons/Issues/Challenges/Way Forward"
    ]
  },
  {
    chapter: "Statutory, Regulatory and various Quasi-Judicial Bodies",
    topics: [
      "SEBI",
      "CVC",
      "CBI",
      "Planning Commission",
      "NDC",
      "PMO",
      "Zonal Council",
      "TRAI",
      "NCLAT",
      "IRDA",
      "National Human Rights Commission",
      "State Human Rights Commission",
      "Central Information Commission",
      "State Information Commission",
      "National Consumer Disputes Redressal Commission",
      "Tribunal",
      "Medical Council of India",
      "Pension Fund Regulatory and Development Authority",
      "Biodiversity Authority of India",
      "Press Council of India",
      "Forward Markets Commission",
      "Inland Waterways Authority of India",
      "RBI",
      "Evaluation of Each body: History/Evolution/Pros/Cons/Issues/Challenges/Way Forward"
    ]
  },
  {
    chapter: "Elections in India",
    topics: [
      "Salient features of the Representation of People Act, 1950",
      "Salient features of Representation of Peoples Act, 1951",
      "Electoral reforms",
      "Criminalization of politics",
      "Negative or neutral voting",
      "State funding of Elections",
      "Irregularities in polling",
      "Electoral Bonds"
    ]
  },
  {
    chapter: "Political Parties in India",
    topics: [
      "Political parties in India",
      "Party reforms",
      "Problems in the working of parties",
      "Casteism and politics",
      "Reforms in Party system in India",
      "Strengthening of Anti-defection measures",
      "Coalition Governments and dynamics"
    ]
  },
  {
    chapter: "Role of Pressure Groups",
    topics: [
      "Types of pressure groups",
      "Role of pressure group in developing countries",
      "Functions of pressure groups in India",
      "Pressure groups methods",
      "Pressure groups and Democracy",
      "Criticism of pressure groups"
    ]
  },
  {
    chapter: "Local Government and Governance",
    topics: [
      "Issues of Funds, Functions and Functionaries.",
      "Local Government and Vulnerable Sections (SC/ST/OBC/Women/Transgenders/Migrants/Children/Disabled etc.)",
      "Local Government and emerging issues (Disaster Management, Technology)",
      "Localism",
      "Neo-Localism",
      "Subsidiarity"
    ]
  },
  {
    chapter: "Vulnerable Sections",
    topics: [
      "SC",
      "ST",
      "OBC",
      "Migrants",
      "Women",
      "Disabled",
      "Children",
      "Refugees",
      "Transgenders",
      "LGBT",
      "Manual Scavengers",
      "People with Special needs etc."
    ]
  },
  {
    chapter: "Poverty, Hunger and Health",
    topics: [
      "Poverty",
      "Hunger",
      "Health",
      "Malnutrition",
      "Unemployment",
      "Distress Migration",
      "Schemes - MGNREGA, PM POSHAN, Ayushman Bharat etc",
      "Policies - NHP, NEP etc."
    ]
  },
  {
    chapter: "Miscellaneous",
    topics: [
      "‘Concern about democracy in the digital age’",
      "Indices and Rankings – Domestic and International (e.g. Global Hunger Index, NITI Ayyog’s, NIRF etc.)",
      "Reports - Domestic/international/governmental/Independent",
      "Internet shutdowns",
      "Committees and Commissions (Findings/recommendations/Analysis)",
      "Co-operatives",
      "MSME",
      "One nation one ration card/One district one product",
      "Aspirational districts",
      "Sustainable Development Goals and India",
      "Entitlement portability",
      "Fake news, Hate speech",
      "Recent interventions (e.g. Laws - Privacy/Crypto currency/Uniform Civil Code/Termination of Pregnancy etc.)",
      "IT rules - regulating the OTT and Digital Media",
      "Missions (Jal Jeevan mission/Gati Shakti etc)"
    ]
  }
];

const SOCIAL_JUSTICE_DATA = [
  {
    chapter: "Welfare schemes for vulnerable sections of the population by the Centre and States",
    topics: [
      "Constitutional arrangement",
      "Women welfare",
      "Gender technology gap",
      "Women in Indian Political System",
      "Issue of Marriageable Age for Women",
      "Child welfare",
      "SC/ST welfare",
      "OBC welfare",
      "Caste Census",
      "Gender reservation in ULB",
      "Minorities welfare",
      "Old age welfare",
      "Legislations Issues and Reforms needed"
    ]
  },
  {
    chapter: "Services relating to Health, Education, Human Resources",
    topics: [
      "Education structure in India",
      "Primary, secondary and higher education",
      "Initiatives taken by GOI in education",
      "Reforms needed",
      "Recommendations of committees",
      "Future prospects in education sector",
      "Skill development, indicators, indicators",
      "Private and Public health structure",
      "NITI Aayog Report",
      "Economic development and human development",
      "SDGs and India"
    ]
  },
  {
    chapter: "Issues relating to poverty and hunger",
    topics: [
      "Poverty definition by different committees",
      "Poverty data in India",
      "Causes of poverty",
      "Poverty and unemployment",
      "Poverty and social conflict",
      "Impact of LPG on poverty",
      "Linkage between poverty and development",
      "Rural poverty",
      "Urban poverty",
      "Feminization of poverty",
      "Poverty alleviation measures",
      "Problems in implementation of Poverty alleviation programmes",
      "Poverty and Hunger",
      "Food security programmes and issues",
      "Hunger and health",
      "Impact of hunger and poverty on economic development of the nation",
      "Controversy related to poverty data estimation"
    ]
  },
  {
    chapter: "The Scheduled and Tribal Areas",
    topics: [
      "5th Schedule Areas",
      "6th Schedule Areas",
      "Composition of autonomous councils",
      "Role and functions of councils",
      "Role of Governor with respect to tribal areas",
      "Tribal sub plan"
    ]
  },
  {
    chapter: "Start-up and Skill Development",
    topics: [
      "Start Up India Scheme",
      "Stand up India Scheme",
      "National Student Startup Policy",
      "National Skill Development Mission",
      "Pradhan Mantri Kaushal VikasYojana",
      "Deen Dayal Antyodaya Yojana",
      "Deen Dayal Upadhyaya Grameen Kaushalya Yojana",
      "Skill Development Initiative Scheme",
      "Self-Employment & Talent Utilisation (SETU)",
      "Atal Innovation Mission"
    ]
  },
  {
    chapter: "Vulnerable Sector",
    topics: [
      "Social Security Scheme",
      "Atal Pension Yojana",
      "Pradhan Mantri Jeevan Jyoti BimaYojana",
      "Pradhan Mantri Suraksha Bima Yojana",
      "Minorities",
      "Nai Roshni Scheme",
      "USTAAD Scheme (Upgrading the Skills and Training in Traditional Arts/Crafts for Development)",
      "Nai Manzil Scheme",
      "Women and Child Development",
      "Beti Bachao Beti Padhao",
      "Sukanya SamriddhiYojana",
      "Digital Gudda Guddi Board",
      "Sabla",
      "Ujjawala Scheme",
      "Janani SurakshaYojana",
      "Janani Shishu Suraksha Karyakram",
      "SC/ST",
      "Vanbandhu Kalyan Yojana",
      "Pradhan Mantri Adarsh Gram Yojana",
      "Disability",
      "Accessible India Campaign (Sugamya Bharat Abhiyan)"
    ]
  },
  {
    chapter: "Health",
    topics: [
      "National Health Mission",
      "National Ayush Mission",
      "Swasthya Rakshan Program",
      "Jan Aushadhi Scheme",
      "Mission Indradhanush",
      "NFHS-5 survey"
    ]
  },
  {
    chapter: "Education",
    topics: [
      "Padhe Bharat Badhe Bharat",
      "Mid Day Meal Scheme",
      "Ishan Uday",
      "GIAN (Global Initiative of Academic Networks)",
      "Rashtriya Avishkar Abhiyan",
      "SWAYAM (Study Webs of Active Learning for Young Aspiring Minds)"
    ]
  },
  {
    chapter: "Rural & Urban Development",
    topics: [
      "Sansad Adarsh Gram Yojana",
      "Gram Uday Se Bharat Uday Abhiyan",
      "Shyama Prasad Mukherjee Rurban Mission",
      "Deendayal Upadhyaya Gram Jyoti Yojana",
      "Pradhan Mantri Gram Sadak Yojana",
      "Swachch Bharat Abhiyan",
      "Pradhan Mantri Awas Yojana- Gramin",
      "Pradhan Mantri Awas Yojana - Urban",
      "Housing for all by 2022",
      "Smart Cities Mission",
      "Hriday - National Heritage City Development and Augmentation Yojana",
      "Amrut (Atal Mission for Rejuvenation and Urban Transformation)"
    ]
  },
  {
    chapter: "Miscellaneous Schemes",
    topics: [
      "Jeevan Praman",
      "Digilocker",
      "Bharatnet Project (National Optical Fibre Network)",
      "INSPIRE (Innovation in Science Pursuit for Inspired Research)",
      "SAKAAR",
      "Digital India",
      "Namami Gange Project (Integrated Ganga Conservation Mission Project)",
      "Ganga Gram Yojana",
      "Jal Kranti Abhiyan",
      "Khelo India",
      "One Rank One Pension Scheme",
      "PRAGATI (Pro-Active Governance and Timely Implementation)",
      "Indian Community Welfare Fund (ICWF)"
    ]
  },
  {
    chapter: "Inclusive growth",
    topics: [
      "Measurement criteria",
      "Government initiatives for inclusive growth",
      "Basic Amenities: Housing/Drinking Waters/Sanitations",
      "Sustainable Development",
      "Rural Development",
      "Rural development and poverty alleviation",
      "Review of the Existing Programmes",
      "Development Administration",
      "Panchayati Raj",
      "Agriculture and Rural Development"
    ]
  }
];

const INTERNATIONAL_RELATIONS_DATA = [
  {
    chapter: "Evolution and Key Principles of Indian Foreign Policy",
    topics: [
      "Indian Foreign Policy",
      "Determinants of India’s Foreign Policy",
      "Factors determining India’s Foreign Policy",
      "Non-Aligned Movement",
      "NAM 2.0",
      "Panchsheel",
      "India’s Nuclear Doctrine",
      "Evolution of Neighbourhood Policy",
      "Look East Policy, Act East Policy",
      "Look West Policy, Act West Policy"
    ]
  },
  {
    chapter: "Indian Diaspora",
    topics: [
      "Role played by Indian Diaspora",
      "Issue of safety of Indians abroad",
      "Schemes for Welfare of Overseas Indian"
    ]
  },
  {
    chapter: "Bilateral Relations",
    topics: [
      "India & Neighbours"
    ]
  },
  {
    chapter: "India – Nepal Relations",
    topics: [
      "Background of Relation",
      "Cooperation between India & Nepal",
      "Contentions in relations between India & Nepal",
      "The Issue of Water and Hydropower Cooperation",
      "Recommendations to Improve Relations",
      "External Influences"
    ]
  },
  {
    chapter: "India and Bhutan",
    topics: [
      "Economy: A Broad Overview",
      "India, Bhutan and China: Issues"
    ]
  },
  {
    chapter: "Indo-Afghan Bilateral Relations",
    topics: [
      "A Long History of Bilateral Relations",
      "The India-Afghanistan Development Partnership",
      "Strategic factors undergirding India’s Partnership with Afghanistan",
      "Afghanistan after NATO Withdrawal",
      "Options for India is Afghanistan",
      "Presence of Taliban"
    ]
  },
  {
    chapter: "India-Bangladesh Relations",
    topics: [
      "Development Partnership",
      "India-Bangladesh Relations in line with ‘Look East’ policy",
      "Boundary Agreements",
      "Teesta River Dispute"
    ]
  },
  {
    chapter: "India-Maldives Relations",
    topics: [
      "Geostrategic Importance of Maldives",
      "Development Cooperation",
      "Security Risks"
    ]
  },
  {
    chapter: "India-Sri Lanka Relations",
    topics: [
      "Commercial Relations",
      "Developmental Cooperation",
      "Fishermen Issue"
    ]
  },
  {
    chapter: "India-Myanmar Relations",
    topics: [
      "Relation through ages",
      "Recent change in policy",
      "China Role"
    ]
  },
  {
    chapter: "Indo-Pak Relations",
    topics: [
      "Cooperation between India & Pakistan",
      "Major Crisis",
      "Water Dispute",
      "Issue of Terrorism and Proxy Wars"
    ]
  },
  {
    chapter: "Indian–Russia",
    topics: [
      "Cooperation between India and Russia",
      "Strategic Cooperation",
      "Major Concerns",
      "Russia–China Impact in India"
    ]
  },
  {
    chapter: "Indo–China Relations",
    topics: [
      "Economic Relation",
      "China India Water Related Issue",
      "\"String of Pearls Strategy\" Chain Diamonds",
      "China’s Maritime Silk Route",
      "Implications for India",
      "Militarisation of Belt and Road Initiative (BRI)",
      "Confidence Building Measures (CBMs)",
      "Boarder Disputes",
      "South China Sea Dispute",
      "Main Disputes",
      "Resources as a Driver of Competition",
      "Attempts for Resolution",
      "India and South China Dispute"
    ]
  },
  {
    chapter: "Security Challenges in the Indian Ocean Region",
    topics: [
      "The Pivot to Asia – US Policy Shift",
      "South China Sea- Issues of Mistrust",
      "Piracy off the Coast of Somalia",
      "Neighbourhood Issues and Terrorism",
      "Energy Routes",
      "Fisheries and Livelihood Issues",
      "Environmental Security",
      "Declaration of Indian Ocean as Zone of Peace",
      "India and Asian Nations relations"
    ]
  },
  {
    chapter: "CIS Countries of Central Asia",
    topics: [
      "India-Turkmenistan",
      "India-Kazakhstan",
      "India Tajikistan",
      "China And Central Asia",
      "International North-South Transport Corridor",
      "Shanghai Cooperation Organisation"
    ]
  },
  {
    chapter: "India-Mongolia",
    topics: [
      "India-Mongolia Bilateral Cooperation",
      "Deal on Uranium Supply"
    ]
  },
  {
    chapter: "India–UAE",
    topics: [
      "Political and economic relation",
      "Oil Economic Relation"
    ]
  },
  {
    chapter: "India–Iran",
    topics: [
      "Iran Nuclear Deal and India",
      "India–Iran Relations",
      "US-Geopolitical and Geo-Economic Consideration in Iran"
    ]
  },
  {
    chapter: "India–Israel",
    topics: [
      "Israel and Palestine Conflict",
      "India–Israel Relations"
    ]
  },
  {
    chapter: "India–Saudi Arabia",
    topics: [
      "Areas of Cooperation",
      "Challenges in relations"
    ]
  },
  {
    chapter: "Asia-Pacific Region",
    topics: [
      "Zones of Activity",
      "Regional Groupings",
      "Geopolitics of Asia Pacific"
    ]
  },
  {
    chapter: "India-South East Asia",
    topics: [
      "Steps in Indo-ASEAN Relations",
      "India-ASEAN Security Co-operation"
    ]
  },
  {
    chapter: "Indo-Japan Bilateral Relationship",
    topics: [
      "Economy Centric Relationship",
      "Contemporary Perspective"
    ]
  },
  {
    chapter: "India–South Korea",
    topics: [
      "India–South Korea Relations",
      "Economic Partnership in Recent Years"
    ]
  },
  {
    chapter: "India–Vietnam",
    topics: [
      "Economic Cooperation",
      "Strategic Cooperation",
      "Geo-political Issues concerning India–Vietnam Energy Cooperation",
      "China’s Response",
      "India’s Response"
    ]
  },
  {
    chapter: "India & Other Nation",
    topics: [
      "India and Africa"
    ]
  },
  {
    chapter: "India and Africa",
    topics: [
      "Historical Connections",
      "Gandhi’s Role",
      "Nehru’s Role",
      "Strengthening of Ties",
      "South-South Engagement",
      "Current Dynamics",
      "Economic Cooperation",
      "Human resources development and capacity building",
      "Energy Cooperation",
      "Military Security Co-operation",
      "Trade Policy",
      "Afro-Indian Trade",
      "Indian investment in Africa",
      "African investment in India",
      "Development cooperation and assistance"
    ]
  },
  {
    chapter: "India–Australia",
    topics: [
      "Immigration Issue and Indian Diaspora",
      "Economic Relationship",
      "Issue of Nuclear Cooperation"
    ]
  },
  {
    chapter: "India–France",
    topics: [
      "Strategic Partnership",
      "Prime Minister’s Recent Visit to France"
    ]
  },
  {
    chapter: "India–Germany",
    topics: [
      "Indian–Germany Economic Relations"
    ]
  },
  {
    chapter: "India–United Kingdom",
    topics: [
      "India & UK Relations",
      "Brexit",
      "India & BREXIT"
    ]
  },
  {
    chapter: "India–USA",
    topics: [
      "Area of Co-operation: Strategic Consultations",
      "Area of Co-operation: Counterterrorism and Internal Security",
      "Area of Co-operation: Trade and Economic",
      "Area of Co-operation: Energy and Climate Change",
      "Area of Co-operation: Science & Technology (S & T) and Space",
      "Area of Co-operation: People to People Ties",
      "Area of Co-operation: Defence Cooperation",
      "Intellectual Property Issues",
      "India and International Organisations",
      "Indo-Pacific Relations",
      "Quadrilateral Security Dialogue (QUAD)",
      "India and Generalised System of Preference (GSP)"
    ]
  },
  {
    chapter: "Multilateral Relations",
    topics: [
      "Representation in the WTO and Economic Groupings",
      "How the WTO takes Decisions?",
      "The WTO Secretariat and Budget",
      "How Countries Join the WTO",
      "Assisting Developing and Transition Economies Specialized Help for Export Promotion",
      "The WTO’s Part in Global Economic Policy-making",
      "Nairobi Package",
      "WTO and protectionism",
      "WTO and IPR",
      "WTO reforms",
      "WTO and India",
      "WTO and Agriculture Issues of developing nations",
      "WTO and Free Trade Agreements (FTAs)"
    ]
  },
  {
    chapter: "International Monetary Fund",
    topics: [
      "International Monetary Fund (IMF)",
      "IMF Reforms"
    ]
  },
  {
    chapter: "Nuclear Security",
    topics: [
      "Nuclear Security Summit",
      "Threats of Nuclear Terrorism",
      "Missile Technology Control Regime (MTCR)",
      "Nuclear Suppliers Group (NSG)",
      "NSG Membership for India",
      "Nuclear Non-Proliferation Treaty (NPT)"
    ]
  },
  {
    chapter: "BRICS",
    topics: [
      "Economic Environment in BRICS Countries",
      "BRICS-BIMSTEC",
      "BRICS & India"
    ]
  },
  {
    chapter: "BIMSTEC",
    topics: [
      "BIMSTEC & India",
      "Convention on Mutual Legal Assistance in Criminal Matters"
    ]
  },
  {
    chapter: "IBSA",
    topics: [
      "IBSA Potential",
      "Need for Revitalizing IBSA",
      "India’s Policy Options",
      "Technological Collaboration"
    ]
  },
  {
    chapter: "SAARC",
    topics: [
      "Prospects For SAARC",
      "Indo-Pak Conflict",
      "Problem of Resource Development"
    ]
  },
  {
    chapter: "India–ASEAN Economic Cooperation",
    topics: [
      "Singapore",
      "Vietnam",
      "Indonesia",
      "India ASEAN FTA in Service"
    ]
  },
  {
    chapter: "Global Institutions",
    topics: [
      "United Nations & its Bodies",
      "Structure of United Nations",
      "United Nations General Assembly (UNGA)",
      "United Nations Security Council (UNSC)",
      "India & UNSC",
      "Economic and Social Council",
      "International Court of Justice (ICJ)",
      "UN Specialised Agencies",
      "Food & Agriculture Organization (FAO)",
      "International Civil Aviation Organization (ICAO)",
      "International Labour Organization (ILO)",
      "International Maritime Organization (IMO)",
      "International Telecommunication Union (ITU)",
      "United Nations Educational, Scientific and Cultural Organization (UNESCO)",
      "International Fund for Agricultural Development (IFAD)",
      "World Health Organization (WHO) and Question over its Credibility",
      "World Meteorological Organisation (WMO)",
      "WIPO",
      "World Bank",
      "International Monetary Fund (IMF)"
    ]
  },
  {
    chapter: "Important Key Concepts",
    topics: [
      "New World Order",
      "Dynamics of New World Order",
      "New Cold War?"
    ]
  }
];

const ECONOMY_DATA = [
  {
    chapter: "Indian Economy and issues relating to planning",
    topics: [
      "Indian Economy in Pre-independence Period",
      "Economy on Eve of Independence",
      "Challenges",
      "Features",
      "Post-Independence India",
      "Issues",
      "Agriculture and its development so far",
      "Industry",
      "Services",
      "Phases of Economic Development in India",
      "Nehruvian Socialist Economy",
      "Economic Reforms",
      "Planning",
      "Objectives",
      "Planning History",
      "Analysis of each plan",
      "Growth & Development",
      "Economic Growth in India:",
      "National Income Determination",
      "GDP",
      "GNP",
      "NDP",
      "NNP",
      "Personal Income",
      "Economic Growth versus Economic Development",
      "Measures of Economic Development",
      "Rise in real per capita income",
      "Real gross national product",
      "Human development index",
      "GDP (Measure)",
      "Gender-related development index",
      "Poverty index",
      "Economic and Social Development in India: Millennium Development Goals",
      "Sustainable Development Goals and India",
      "Employment"
    ]
  },
  {
    chapter: "Resource Mobilization",
    topics: [
      "Types of resources: Physical capital and finance capital",
      "Need for resource mobilization - Police State and Democratic Welfare State",
      "Sources of resource mobilization: Public Sector and Private Sector",
      "Savings and investment over the five year plan",
      "Budgetary resources: Tax and Non tax",
      "Role of Public Debt in resource mobilization and effects: Market borrowing, loans, grants, etc.",
      "Role of fiscal and monetary policies in resource mobilization",
      "Role of foreign investment in resource mobilization, desirability and consequences",
      "Multilateral agencies and resource mobilization"
    ]
  },
  {
    chapter: "Inclusive growth and issues arising from it",
    topics: [
      "Meaning and concept of Inclusion",
      "India's experience",
      "Social sector initiatives and inclusion process",
      "Ground reality and working of flagship schemes",
      "India's growth story in this context",
      "Rural economy based growth",
      "Need of Sustainable agriculture, food security and resilience for growth",
      "Public distribution schemes: Way to inclusive growth",
      "Financial inclusion as an instrument of inclusive growth",
      "Poverty Alleviation and Employment Generation as a strategy for inclusive growth",
      "Social sector development as an instrument for inclusive growth",
      "Public private partnership for inclusive growth",
      "Industrial Integration for inclusive growth",
      "Sectoral and regional diversification as a tool for inclusive growth",
      "Governmental Schemes and Policies for inclusive growth",
      "Pradhan Mantri Jan Dhan Yojana",
      "MUDRA (Micro Units Development and Refinance Agency) Bank",
      "Self Employment and Talent Utilization (SETU)",
      "Skill India",
      "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
      "Kisan Card",
      "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
      "National Agriculture Market (NAM)",
      "Pradhan Mantri Jeevan Jyoti Beema Yojana",
      "Pradhan Mantri Jeevan Suraksha Yojana",
      "Atal Pension Yojana",
      "Digital India programme"
    ]
  },
  {
    chapter: "Government Budgeting",
    topics: [
      "Budget, Economic Survey",
      "Budget terminology",
      "Types of Budget",
      "Features of outcome budgeting",
      "Merger of Railway and General Budget",
      "Benefits of budgeting",
      "Flaws in budgeting process",
      "Budget analysis",
      "Subsidy"
    ]
  },
  {
    chapter: "Investment Models",
    topics: [
      "Need for Investment",
      "Sources of Investment",
      "Measures of Investment",
      "Capital and investment",
      "Factors affecting investment",
      "Classification of Investment",
      "Types of Investment Models",
      "Investment Models Followed by India",
      "Domestic Investment Models",
      "Public Investment Model",
      "Private Investment Model",
      "Public Private Participation Investment Model",
      "Foreign Investment Models (FDI, FII, etc.)",
      "Role of State",
      "PPP (Public-Private Partnership)",
      "Savings and Investment Trends"
    ]
  },
  {
    chapter: "Fiscal policy",
    topics: [
      "Fiscal Policy in India",
      "Important Budgetary Terms and Fiscal Concept",
      "Government Revenues & Spending",
      "Deficits and its financing",
      "Revenue Deficit",
      "Fiscal Deficit",
      "Primary Deficit",
      "Balance Sheet"
    ]
  },
  {
    chapter: "Taxation",
    topics: [
      "Taxation Meaning",
      "Principles of Taxation",
      "Objectives of Taxation",
      "Taxation for Mobilization of Resources",
      "Tax System in India",
      "Current Taxation Policy of India",
      "Subsidies",
      "Tax Reforms",
      "GST and its progress",
      "Retrospective Taxation in India"
    ]
  },
  {
    chapter: "Monetary policy in India",
    topics: [
      "Instruments of Monetary Policy",
      "Monetary policy in pre-reform Era (1948\u20131991)",
      "Monetary Policy in Post-Reform Era (Since 1991)",
      "Urjit Patel Committee Report",
      "Monetary Policy Committee and Inflation Targeting"
    ]
  },
  {
    chapter: "Financial system",
    topics: [
      "Indian Financial System \u2013 An Overview",
      "Components of Indian Financial System",
      "Financial Institutions",
      "Banking Institutions or Depository Institutions",
      "Non-Banking Institutions or Non-Depository Institutions",
      "Others: (Regulatory, Intermediates, Non Intermediates)",
      "Financial Assets (Call Money, Notice Money, Term Money, Treasury Bills, Certificate of Deposits, Commercial Paper)",
      "Financial Services (Banking Services, Insurance Services, Investment Services, Foreign Exchange Services)",
      "Financial Markets (Capital Market, Money Market, Foreign Exchange Market, Credit Market)",
      "Indian financial market and Pandemic"
    ]
  },
  {
    chapter: "Banking",
    topics: [
      "Banking in India: Definition, Structure and Functions",
      "Origin of Banking system",
      "Type of Banks in India",
      "Central Bank (Reserve Bank of India)",
      "Cooperative Banks",
      "Commercial Banks",
      "Public Sector Banks (State Bank of India)",
      "Private Sector Bank (HDFC Bank)",
      "Foreign Banks (CITI Bank)",
      "Regional Rural Banks",
      "Local Area Banks",
      "Specialized Banks (SIDBI Bank, NABARD)",
      "Small Finance Banks",
      "Payments Banks (Airtel Payment Bank)",
      "Nationalization of Banks in India",
      "Banking Sector Reforms in India: Narasimhan Committee 1&2, Nachiket Mor Committee, P J Nayak Committee",
      "Development Finance Institutions: IFCI, ICICI, SIDBI, IDBI, UTI, LIC, GIC",
      "New Bank Licence Criteria",
      "Non-Banking Financial Company (NBFC)",
      "Financial Inclusion in India: Need and future; PMJDY; Payment Banks and Small Banks",
      "NPAs",
      "Bills related to Banking",
      "NEO BANK",
      "The emerging concept of Bad Banks",
      "Insurance sector of India",
      "Bank privatization",
      "Account Aggregator System",
      "Domestic systemically important banks (D-SIBs)"
    ]
  },
  {
    chapter: "Foreign Trade & International Organisations",
    topics: [
      "International Trade",
      "Trade Policy",
      "India's Balance of Payments:",
      "Current Account",
      "Capital Account",
      "Goods and Services Account",
      "India's BOP Performance:",
      "Balance of Payment versus Balance of Trade",
      "Current Account versus Capital Account",
      "Foreign Capital",
      "Impact of Globalization on Indian Economy",
      "FDI and FPI in India, External Commercial Borrowings",
      "Foreign Exchange Rate Determination in India",
      "Types of Exchange Rate",
      "Capital and Current Account Convertibility in India",
      "The Bretton Woods Twins:",
      "World Bank",
      "International Monetary Fund",
      "World Bank Group",
      "World Trade Organisation (WTO) and India",
      "ADB, NDB, BRICS Bank, AIIB",
      "Bilateral, Regional and Global Groupings and Agreements involving India",
      "Important report and forecasts"
    ]
  }
];

const AGRICULTURE_DATA = [
  {
    chapter: "Role of Agriculture in Indian Economy",
    topics: [
      "Situation of Indian Agriculture",
      "Historical background and current status",
      "Cropping Patterns: Types of Cropping Systems: Mono-cropping; Crop Rotation; Sequential Cropping; Inter Cropping; Relay Cropping",
      "Issues related to direct and indirect farm subsidies and minimum support prices",
      "Farm Subsidies in India: Definition; Working; Need; Negative Impacts",
      "Types of Farm Subsidies in Indian Agriculture: Irrigation and Power Subsidies; Fertilizer Subsidy; Seed Subsidy; Credit Subsidy",
      "Government Intervention in Indian Agriculture",
      "Minimum Support Prices in Indian Agriculture: MSP definition; Working; Issues; Drawbacks; Way Ahead; Buffer Stocks",
      "Public Distribution System in India: Definition; Issues; Working; Needs; Disadvantages",
      "Targeted PDS in India, Antyodaya Anna Yojana (AAY), Alternative to the PDS, Direct Benefit Transfers, National Food Security Act",
      "Agriculture Marketing",
      "Major crops: Major cropping patterns in different parts of the country, different types of irrigation, transport and marketing of agricultural produce and issues and associated constraints; e-technology for farmers",
      "Conclusive Land Titling",
      "Biotech-KISAN Program"
    ]
  },
  {
    chapter: "Land resource",
    topics: [
      "Land-use",
      "Land capability classification",
      "Causes of Land Degradation",
      "Impact of Land Degradation",
      "Steps taken by GOI",
      "Sustainable Land Management"
    ]
  },
  {
    chapter: "Land Reforms",
    topics: [
      "Land ownership patterns under the British rule",
      "Zamindari System (Permanent settlement of Bengal)",
      "Ryotwari System",
      "Mahalwari System",
      "Land reforms since independence",
      "Objectives of land reforms in India",
      "Progress of Land Reforms in India",
      "Progress of Ceiling Legislation",
      "NITI Aayog Report on Land Leasing",
      "SVAMITVA (Survey of Villages and Mapping with Improvised Technology in Village Areas)"
    ]
  },
  {
    chapter: "Agriculture Finance",
    topics: [
      "Features of Agricultural Finance",
      "Criteria for Agricultural Credit",
      "Need for Agricultural Finance",
      "Sources of Agricultural Finance",
      "Problems of Agricultural Finance",
      "Measures taken to improve credit flow to agriculture",
      "Co-operative Credit Societies in India",
      "Derivate Trade in Agriculture Commodities"
    ]
  },
  {
    chapter: "Important Schemes (Agriculture)",
    topics: [
      "Pradhan Mantri Kisan Maandhan Yojana",
      "PM-Kisan Scheme",
      "Paramparagat Krishi Vikas Yojana (PKVY)",
      "Pradhan Mantri Krishi Sinchai Yojana (PMKSY)",
      "Rythu Bandhu Scheme"
    ]
  },
  {
    chapter: "Agricultural Credit Institutions",
    topics: [
      "Commercial Bank",
      "Lead Bank Scheme",
      "Multi Agency Approach",
      "Regional Rural Banks",
      "National Bank for Agriculture and Rural Development (NABARD)",
      "Reserve Bank of India",
      "Kisan Credit Card Scheme",
      "Self Help Group (SHG) Bank Linkage Programme",
      "Rural Infrastructure Development Fund (RIDF)",
      "Government Policy For Agricultural Credit",
      "Farmers Service Societies (FSS)"
    ]
  },
  {
    chapter: "Crop Insurance in India",
    topics: [
      "Historical Background",
      "Issues Related to Crop Insurance",
      "Pradhan Mantri Fasal Bima Yojana",
      "Comparison with Earlier Crop Insurance Schemes",
      "Challenges"
    ]
  },
  {
    chapter: "Important Schemes (Insurance & Soil)",
    topics: [
      "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      "Kisan Credit Card (KCC) Scheme",
      "Soil Health Card Scheme",
      "National Mission for Sustainable Agriculture (NMSA)"
    ]
  },
  {
    chapter: "Agriculture Marketing",
    topics: [
      "Process of Agricultural Marketing in India",
      "Structure of Agricultural Marketing in India",
      "Importance of Proper Agriculture Marketing",
      "Government Measures to Improve Agricultural Marketing in India",
      "Analysis of APMC Act",
      "National Agriculture Market (e-NAM)"
    ]
  },
  {
    chapter: "Subsidies",
    topics: [
      "Subsidy in India",
      "Farm Subsidies",
      "Fertiliser subsidies",
      "Subsidy on power",
      "Subsidy on irrigation",
      "Issues related to direct and indirect farm subsidies and minimum support prices",
      "Objectives of subsidies",
      "Transfer of resources from gainers from economic policies to losers from economic policies",
      "Issues of buffer stocks and food security",
      "Technology missions",
      "Economics of animal-rearing",
      "Public Distribution System: Objectives, functioning, limitations, revamping, evolution from universal PDS to targeted PDS, Targeted PDS, a critical analysis of cost and benefit of PDS",
      "Buffer Stock policy and government's intervention in food market to keep prices under reasonable limits to help consumers",
      "Food Security bill, questions of resource mobilization for the FSB, criticism of the FSB",
      "Important questions on the future of subsidies"
    ]
  },
  {
    chapter: "Agricultural Revolutions in India",
    topics: [
      "Green Revolution",
      "White Revolution \u2013 Operation Flood",
      "Yellow Revolution",
      "Blue Revolution",
      "Golden Fiber Revolution: Jute",
      "The future of Indian agriculture",
      "Data revolution in Indian agriculture",
      "Artificial Intelligence & Agriculture",
      "Social Security Schemes for Farmers"
    ]
  },
  {
    chapter: "Food Processing",
    topics: [
      "Food processing and related industries: Scope and significance, location, upstream and downstream requirements, supply chain management.",
      "Processed Foods Scenario with respect to Specific Sectors",
      "Policy Initiatives",
      "Infrastructure Development in Food Processing Sector",
      "Issues in Food Processing Sector",
      "FDI Policy in Food Processing",
      "Notable Trends in the Indian Food Processing Sector",
      "Strategies Adopted in Budget",
      "New foreign and domestic investment",
      "Sector-specific government policies"
    ]
  }
];

const INDUSTRY_DATA = [
  {
    chapter: "Industrial Policy and Industrial Development: Main Issues",
    topics: [
      "Mahalanobis strategy and India's industrial policy-Discussing Industrial policy resolution 1948 and 1956 critically",
      "New Economic Policy and Industrial policy under the policy of Liberalization",
      "Privatization",
      "Globalization",
      "Phases of Industrial development",
      "Effects of liberalization on the economy",
      "Changes in industrial policy and their effects on industrial growth",
      "Impact on Different Sectors of the Economy"
    ]
  },
  {
    chapter: "Main features of Industrial development in India",
    topics: [
      "Roles of private sector and public sector, Investment in the industrial sector, employment, productivity, profit etc.",
      "Strategies for disinvestment and privatization",
      "Role of Small, Medium and Micro enterprises, Government Policy, main problems, effects of globalization",
      "New Manufacturing Policy",
      "Industrial disbursal and Industrial corridors",
      "SEZs - Main issues like land use, relocation of same industries that exist, exports earnings vs loss of tax income",
      "Industrial sickness, institutional mechanism to support the sick industries, exit policy issues",
      "Main constraints in the industrial development of India",
      "Effects of globalization on industries",
      "Sub-prime crisis and sovereign debt crisis on Industry in India",
      "Industrial Finance in India: Role of development banking, commercial banking, venture capital, angel capital in industrialization and promotion of entrepreneurship",
      "Make in India achievements",
      "Transformation of MSME sector and impact on India"
    ]
  }
];

const INFRASTRUCTURE_DATA = [
  {
    chapter: "Impact of Infrastructure",
    topics: [
      "Impact of Infrastructure-Economic Impacts, impact on social development, Environmental impacts"
    ]
  },
  {
    chapter: "Transport",
    topics: [
      "Ports",
      "Ocean transport routes",
      "Inland waterways",
      "Main regions of inland waterways",
      "Roads",
      "Importance",
      "Government push towards Road Infrastructure",
      "National Infrastructure pipeline",
      "Bharatmala Pariyojana",
      "Airports",
      "Air routes & Significance",
      "Factors influencing air transport",
      "Railways",
      "Railways: Factors affecting the railroads",
      "Distribution of railroads in the world",
      "Energy (Pipeline)",
      "Energy Pipeline Transport",
      "Petroleum (oil) Pipelines",
      "Gas Pipelines",
      "Importance and development of transport",
      "Means of transport",
      "Transport costs and economic distance",
      "Operating costs in transport",
      "Government's transport policy",
      "Transport patterns in the world",
      "Transport costs and specialization",
      "Transport and trade in the modern era",
      "Transport costs and scale economies",
      "Falling transport costs increase trade between neighbours",
      "Failing transport costs lead to concentration within countries",
      "Negative externalities of transport",
      "Important issues",
      "Ownership and financing",
      "Pricing of Public utilities",
      "Infrastructure as avenues for investment",
      "Project delays-reasons and measures to overcome Public Private Partnership and related issues",
      "Operation and Maintenance of roads, railways, irrigation and power projects - Main problems and solutions"
    ]
  },
  {
    chapter: "Important Schemes (Infrastructure)",
    topics: [
      "PM Gati Shakti National Master Plan",
      "Mega Investment Textiles Parks (MITRA) Scheme",
      "National Bank for Financing Infrastructure and Development (NaBFID) to fund infrastructure projects in India",
      "National Industrial Corridor Development Programme (NICDP)"
    ]
  },
  {
    chapter: "Recent Development",
    topics: [
      "Pulses for Food Security and Sustainable Future",
      "General Insurance Amendment Bill",
      "Pandora's papers",
      "National Urban Digital Mission",
      "'One District One Product: A Potential Game changer'",
      "Proposition 22: The Future of the Gig Economy",
      "Central Bank Digital Currency",
      "Industrial Finance in India: Role of development banking, commercial banking, venture capital, angel capital in industrialization and promotion of entrepreneurship",
      "Make in India achievements",
      "Transformation of MSME sector and impact on India",
      "Virtual Currencies",
      "Taxing Virtual Currencies",
      "G-SAP 1.0: Securities acquisition plan to boost the market",
      "G7 Corporate Tax Deal",
      "Major reforms in Natural Gas Marketing",
      "World Inequality Report",
      "India's telecom sector and issues",
      "Shifting towards Green Energy",
      "Gig Economy and India",
      "The State of Food and Agriculture 2021",
      "Fertiliser Shortage in India",
      "National Monetisation Pipeline",
      "National Mission on Edible Oil",
      "Zero defect zero effect scheme",
      "World Hunger Index 2021",
      "World Employment and Social Outlook \u2013 Trends 2022 report",
      "e-Gram Swaraj e-Financial Management System"
    ]
  }
];

const SCIENCE_TECHNOLOGY_DATA = [
  {
    chapter: "Chemistry",
    topics: [
      "Elements and Molecules","States of Matter","Atomic Structure","Chemical Bonding","Metals and Non-metals","Metallurgy","Acid and Base","Applications of Electrochemistry (Battery and Charging Devices)","Properties of Solution","Chemicals in Everyday Life","Polymers and Biopolymers","Chemistry of Pharmaceuticals","Carbon and its Allotropes","Hydrocarbons and their Derivatives","Biomolecules","Vitamins and Enzymes"
    ]
  },
  {
    chapter: "Physics",
    topics: [
      "Properties of Fundamental Particles","Fundamental Forces","Energy and its Various Types","Optics","Electromagnetic Spectrum","Laws and Theories in Physics, Relativity","Electromagnetism","Heat and Thermodynamics","Waves","Mechanical Waves","Electromagnetic Waves","Universe","Planets, Stars and Galaxies","Big Bang Theory and Singularity","Dark Matter and Energy","Black Holes","Neutrino Observatory","Gravitational Waves","Sunspots","Magnetars and Neutron Stars","Sub-atomic Particles"
    ]
  },
  {
    chapter: "Biology",
    topics: [
      "Chemical Building Blocks of Life","History and Origin of Life","Classification and Domains of Life","Viruses","Prokaryotes","Eukaryotes","Protists","Plants","Fungi","Animals","Evolution of Life","Human Evolution","Inheritance","DNA and RNA","Gene Expression","Gene Regulation","Mutation","Cell Structure","Membranes","Cell-Cell Interactions","Respiration","Energy and Metabolism","Cell Division","Epithelial Tissue","Connective Tissue","Muscle Tissue","Nervous Tissue","Myocardial","Hepatic","Endocrine System","Respiratory System","Circulatory System","Skeletal and Muscular Systems","Reproduction","Excretion, Osmoregulation and Thermoregulation","Digestive System","Immune System","Classification by Source of Energy and Carbon","Plant Nutrition","Animal Nutrition","Human Diet","Photosynthesis","Respiration (Plant)","Plant-water Balance","Reproduction (Plant)","Microbes in Human Welfare","Beneficial Animals","Beneficial Insects","Family of Angiosperms","Tissue Culture","Grafting","Horticulture","CT Scan","Magnetic Resonance Imaging (MRI)","Positron Emission Tomography (PET)","Generation and Significance of Fossil Fuels","Biofuels from Biomass","Biodiesel","Natural Gas and Petroleum","Hydrogen"
    ]
  },
  {
    chapter: "Biotechnology",
    topics: [
      "Genetic Engineering, Process and Application","Genomics","Proteomics","RNA Types & Technology","Genome Sequencing and its Applications","Bio Composting","Bioremediation","Microbial Remediation","Carbon Capture Technology","Transgenic Plants","Methods and Applications of Plant Biotechnology","Transgenic Animals","Methods and Applications of Animal Biotechnology","Bioprocessing","Bioreactors","Manipulation of Enzymes","Food Processing","Single Cell Protein","Food Fortification","GM Technology","GM Crops","Pest Resistant Plants","Gene Editing","Gene Therapy","Molecular Diagnosis","PCR","ELISA","Antibody\u2013Antigen Interactions and Detection","Embryo Transfer Technology","Stem Cells and their Engineering","Biopharmaceuticals / Therapeutic Proteins","Brain Fingerprinting Technology","Bioethics and Biopiracy","Biosafety Protocols","IPR in Biotechnology","Recent Trends in Biotechnology and Applied Biotechnology"
    ]
  },
  {
    chapter: "Human Health & Diseases",
    topics: [
      "Common Diseases in Humans and their Causative Agents","Diseases due to Nutrient Deficiency","Molecular Biology and Human Disease","Chromosomal Inheritance and Disease","Extra Chromosomal Inheritance and Disease","Vector-borne Diseases","Water-borne Diseases","Lifestyle Diseases","Immunity and its Types","Vaccination Programme of India","Antibiotics","Antiviral and Antifungal Drugs","Monoclonal Antibody Therapy","Antimicrobial Drug Resistance","Drug Formulations","Drug Pricing in India","Pharmacogenetics"
    ]
  },
  {
    chapter: "Space",
    topics: [
      "Types of Orbits","Types of Launch Vehicles and Applications","NASA","ISRO","ESA","ROSCOSMOS","JAXA","CNSA","ISRO and its Role in National Development","Private Sector in Space","Public\u2013Private Partnership in Space Sector","Cryogenics","Nanosatellites","Electric Propulsion","Aviation Internet / Starlink Communication","Satellite Communications","Remote Sensing and Applications","Ground Segment-as-a-Service","Green Propellant","Deep Space Atomic Clock","Space Weapons","A-SAT Technology","Laser Technology","HGV Technology","International Space Collaboration","Various Space Observatories","Various Telemetry","Global Positioning System (GPS)","Galileo","GLONASS","IRNSS","Geopolitics of Outer Space"
    ]
  },
  {
    chapter: "Defence",
    topics: [
      "Missile System & Classification","Ballistic and Cruise Missiles","India's Missile System","Integrated Guided Missile Programme","Missile Defence Programmes","Application of Robotics in Defence","Application of AI in Defence","Internet of Military Things (IoMT)","Cyber Warfare and Preparedness","Drone Technology","Unmanned Aerial Vehicle (UAV)","Stealth Technology","Advanced Defence Equipment","Air Defence System","3-D Printing Missiles","Lethal Autonomous Weapons","Hypersonic Technology","Hypersonic Glide Vehicles","Hypersonic Cruise Missiles","Classical Weapons","Weapons of Mass Destruction","Fission and Fusion Bombs","Chemical Weapons","Biological Weapons","Directed Energy Weapons","CDS","Various Committees and Recommendations","Domains of Warfare","Submarine","Aircraft Carrier","Combat Aircraft","Defence Organisations and Laboratories","Defence Exercises"
    ]
  },
  {
    chapter: "Nuclear Energy",
    topics: [
      "Types of Nuclear Reactions","Nuclear Energy and its Application","Civil and Military Applications of Nuclear Energy","Nuclear Fuels and Centrifugation","Nuclear Reactor","Nuclear Policy of India","Nuclear Radiation and its Impact","Radioactive Waste","Nuclear & Radiological Disasters","Department of Atomic Energy","Atomic Energy Regulatory Board","Bhabha Atomic Research Centre","Indira Gandhi Centre for Atomic Research"
    ]
  },
  {
    chapter: "Electronics & Telecommunications",
    topics: [
      "Generation of Computers","Computer Terminologies","Supercomputer and its Applications","Cloud Computing","Components of IT","IT Enabled Services","Applications of IT","Cathode Ray","LCD","LED","Plasma Monitors","OLED","AMOLED","Mobile Generations","Smartphone","Net Neutrality","Internet of Things (IoT)","Big Data Initiative and Privacy","Cyber-crime and Security","Government Initiatives"
    ]
  },
  {
    chapter: "Nano Science & Nano Technologies",
    topics: [
      "Basics of Nano Science and Nano Technology","Nanomaterials","Nano Medicine","Semiconductors and Computing","Food","Textiles","Sustainable Energy","Environment","Transport","Space","Agriculture","Adverse Health and Environmental Impacts","Social and Ethical Impacts","Nano Science & Nano Technology in India"
    ]
  },
  {
    chapter: "Robotics & AI",
    topics: [
      "Machine vs Computer vs Robots","Parts of a Robot","Classification of Robots","Advantages and Disadvantages of Robots","Applications of Robotics in Agriculture, Industry, Defence, etc.","Neural Networks","Machine Learning and Deep Learning","Applications of AI","Artificial Intelligence and Robotics"
    ]
  },
  {
    chapter: "IPR",
    topics: [
      "What are Intellectual Property Rights (IPR)?","Types of Intellectual Property Rights","International Agreements and Institutions on IPR","IPR Regime in India","National Intellectual Property Rights Policy"
    ]
  },
  {
    chapter: "Institutions & Policy",
    topics: [
      "Institutions & Policy","India's Policy in the Field of Science and Technology","Various Policies for Science & Technology","Institutional Structure","Department of Science & Technology","Technology Development Board","National Accreditation Board for Testing and Calibration Laboratories (NABL)","Science and Technology as a Source of Human Resource Development","Awards Related to Science","CSIR","Science and Engineering Research Board (SERB)","India and Global Collaboration in Science Projects","Technology Vision Document 2035"
    ]
  }
];

const ENVIRONMENT_ECOLOGY_DATA = [
  {
    chapter: "Ecology & Ecosystem Dynamics",
    topics: [
      "Types of Ecology","Ecological Hierarchy","Scope of Ecology","Habitat & Ecological Niche","Deep vs Shallow Ecology","Ecological Principles","Ecological Community","Structure and Characteristics of a Community","Stratification","Ecotones","Ecological Dominance","Seasonal and Diurnal Fluctuation","Periodicity","Turnover","Interdependence","Ecological Succession","Types and Process of Succession","Climax Community","Range of Tolerance, Maximum Range","Difference between Ecology, Environment and Ecosystem","Ecosystem Definitions","Functions and Properties of Ecosystem","The Structure/Components of Ecosystem","Abiotic Components","Biotic Components","Ecosystem Dynamics","Flow of Energy in Ecosystem","Trophic Levels","Food Chain","Types & Significance of Food Chain","Food Web","Models for Energy Flow","Ecological Productivity","Ecological Pyramid","Biomagnifications","Biological Control","Organic Farming","Parts of a Bio Geochemical Cycle","Types of Biogeochemical Cycle","Carbon Cycle","Nitrogen Cycle","Phosphorus Cycle","Sulphur Cycle"
    ]
  },
  {
    chapter: "Biomes & Aquatic Life Zones",
    topics: [
      "Biome","Grasslands","Tundra","Deserts","Thar desert","Mountain biome","Aquatic ecosystems","Basic facts about the ocean","Importance of the ocean","Zones of the ocean","Marine life","Coral reefs","Coral reefs in India","Conserving coral reefs","Mangroves","Mangroves in India","Freshwater in India","Importance of lakes","National Lake Conservation Plan","Wetlands and their importance","Ramsar Convention","Ramsar Sites","Montreux Record","Extent and distribution of wetlands in India","Conserving the wetlands of India"
    ]
  },
  {
    chapter: "Biodiversity Basics & Conservation",
    topics: [
      "Biodiversity","Important kinds of biodiversity","Degree of diversity in an ecosystem","Endemic species","Keystone species","Indicator species","Invasive species","Allopatric and sympatric speciation","Bioinformatics","Megadivers Countries","Uses and values of biodiversity","State of global biodiversity","Threats to biodiversity","Biodiversity Hotspots","Eco-regions","Role of traditional knowledge in biodiversity","Biopiracy","Extinction of species","Mass extinction","IUCN’s classification scheme","IUCN Red-List of Threatened Species","Level of biodiversity in India","Biogeographical classification of India","Ex-situ aid in-situ conservation","Seed banks","Zoos in biodiversity conservation","Botanical gardens","Protected areas","State of protected areas in the world","UNESCO Man and the Biosphere Program (MAB)","Characteristics of biosphere reserves","Convention on Biological Diversity","Cartagena Protocol","Nagoya Protocol","Aichi Biodiversity Targets","Important Coastal and Marine Biodiversity Areas of India","Important Bird Areas (IBAs) of India","Global Tiger Initiative","Project Tiger","Project Elephant","Indian Rhino Vision","Recovery Programme for Critically Endangered Species","Use of indigenous knowledge for conserving biodiversity","Seed village"
    ]
  },
  {
    chapter: "Environmental Impact & Degradation",
    topics: [
      "Effect of Modern Agriculture on Environment","Effect of Housing on Environment","Effect of Power Generation on Environment","Effect of River Valley Projects (Water Resource Projects) on Environment","Effect of Mining on Environment","Effect of Transportation Activities on Environment","Effect of Tourism on Environment","Water Cycle (Hydrological Cycle)","Availability and Quality Aspects (groundwater depletion)","Water-borne and Water-induced Diseases","Fluoride Problem in Drinking Water","Arsenic Problem in Drinking Water","Mining and Environment","Sensitivity of Select Ecosystems to Mining","Impact of Mining","Indirect Impact of Mining","International Laws on Mining","Main Act or Statute to regulate the impact of Indian Mining Sector","Sustainable Mining","Causes of Deforestation","Implications of Deforestation for Climate Change","Consequences of Deforestation on the Wildlife of India","Impact of Deforestation on Indian Monsoon","Impact of Deforestation on People","Deforestation Leads to Water and Soil Resources Loss and Flooding","Economical Impacts","Strategies for Reducing Deforestation","Government Programmes for Conservation of Forests","Legislations for Conservation of Forests using People Participation","Steps for Improving People Participation in Forest Resource Management","Use of Local Traditional Methods"
    ]
  },
  {
    chapter: "Waste Management & Sustainable Development",
    topics: [
      "Solid Waste","Hazardous Waste","E-Waste","Bio Medical Waste","Plastic Waste","Methods for Waste Management","Effects of Poor Waste Disposal","Landfill","Principles of sustainability","Measurement of Sustainability or Sustainable Ethics or Equitable Utilisation of Natural Resource","Sustainable Lifestyle (Role of an individual in sustainable development)","Challenges to Sustainable Development","International Efforts to Achieve Sustainability"
    ]
  },
  {
    chapter: "Environmental Pollution",
    topics: [
      "Air Pollution","Sources of Air Pollution","Effects of Air Pollution","Classification of Air Pollutant","Control Measures of Air Pollution","Air Pollution Disasters","Long Range Transport of Gaseous Air Pollutants","National Ambient Air Quality Standards","Water Pollution","Sources of Water Pollution","Types of Water Pollutants","Effects of Water Pollution","Water Quality Standards","Control of Water Pollution","Thermal Pollution","Sources of Thermal Pollution","Effects of Thermal Pollution","Control of Thermal Pollution","Soil Pollution or Land Degradation","Sources of Soil Pollution","Effects of Soil Pollution","Control Measures","Noise Pollution","Air-borne Diseases","Toxic Substances: Toxicant, Toxicity and Toxicology","Factors affecting toxicity","Carcinogens"
    ]
  },
  {
    chapter: "Coastal Ecosystem Management & Recent Developments",
    topics: [
      "Mangroves (Salient features and Importance)","Mangroves in India and under threats","Legal and Regulatory Approaches for Protection","Estuaries and their Importance","Threats to estuaries","Coral Reefs (Geographical Conditions and Uses)","Conservation of coral reef","Steps for Coastal Ecosystem Management","Air Pollution (Recent Report and BS Norms)","Bharat Stage Emission Standards","Polluters Pay Model","Household Air Pollution","Open Waste Burning and its Impact","Graded Response Action Plan on Pollution","UN Sets Limits on Global Airline Emissions","Waste Management (Recent Developments)","Biodegradable Plastics","Green Train Corridors","Oil Spill","Solid Waste Management-Buffer Zone","Other News","Report of Parliamentary Committee on Forest Fires","Urban Forestry Scheme","Draft Notification to Regulate Pet Shops","Ban on Import of Animal Skin","River linking Project and Impact on Environment","Algal Bloom Issue","Illegal Salt Mining and its Impact","India’s Wetland Report","Deep Sea Mining","Mass Coral Bleaching","Ganga River Pollution"
    ]
  },
  {
    chapter: "Environmental Laws, Institutions & Schemes",
    topics: [
      "Government Body which Executes EIA","Environmental Effects Analysed under EIA","Process of EIA","EIA Ruling 1984","Environmental Laws: Provisions in the Indian Constitution towards Environmental Protection","Salient Features of Air (Prevention and Control of Pollution) Act, 1981","Salient Features of Water (Prevention and Control of Pollution) Act, 1974","Salient features of Forest Conservation Act, 1980","Salient Features of Wildlife Protection Act, 1972","Salient Features of Environment (Protection) Act, 1986","Role of Government in Environmental Protection","Pollution Control Boards","National Green Tribunal","Forest Survey of India","National Board for Wildlife","Ecomark Scheme","National Afforestation Program","National River Conservation Plan","National Mission for Clean Ganga","National Air Quality Index (AQI)","National Action Programme to Combat Desertification","UJALA Scheme","Bharat Stage Norms"
    ]
  },
  {
    chapter: "International Environmental Governance & Climate Change",
    topics: [
      "UNEP","UNDP","Centre for Biological Diversity","WWF for Nature","IUCN - Red List","Birdlife International","International Conventions/Protocols & their Objectives","Green House Effect and Global Warming","Global Climate Change: International Efforts to Control Global Warming or Global Climate Change","Ozone Layer Depletion or Ozone Hole","Acid Rain","El Nino","La Nina","Pollution in metros and climate change","Real estate boom and environment degradation","Urban Heat Island","Polythene bags and pollution","Methane generation from waste","Agriculture increases Carbon Dioxide Emissions","Monoculture practice impacts biodiversity","Pollution due to use of chemical fertilizers","Soil-related effects","Fertilizer’s Effect on the Environment","Impact of livestock on environment","Impact of use of pesticides on environment","Impact of GM crop on environment","Emission of Methane from agricultural practices","Sustainable Agriculture Techniques","Health impacts of global warming","Mosquito-borne diseases","Ozone depletion and human health","Relevance of International Conventions in protecting Environment","Wetland and coastal region conservation in India","Impact of National Hydrogen Mission","Plastic Pollution, Plastic Pollution Waste management Rules, 2021 and 2022","Causes and Impacts of Land Degradation"
    ]
  },
  {
    chapter: "Contemporary Issues (Environment)",
    topics: [
      "Sustainable Land Management measures in India.","Issues with EIA process in India","Landslides And Fragile Ecosystem Of Hilly States","Cyclone And Its Impact On Coastal Women","Marine Heat Waves And Its Impact On Marine Biodiversity","Role of Local Self-Government in Disaster Management","Role of the GIS and Information Technology in Disaster Management","Environment driven taxes","universal right","Agro-forestry and its socio-economic impact","Man-Animal Conflict","Artificial Intelligence and its climate cost","India’s Renewable sector (Wind Project addition to peak by 2024)","Access to a clean, healthy environment, a universal right","Green Investments and Sustainability","Balancing Global Nutrition and Climate Change","Indian solar-power dream","Biofuels and E20 fuel","Nord stream and hazardous methane release","The UN High Seas Treaty drafted","Energy Conservation Act Amendment and Carbon market","Global Biodiversity Framework","The Wildlife Protection Act 2022 and its relevance","Carbon Border Adjustment Mechanism"
    ]
  }
];

const INTERNAL_SECURITY_DATA = [
  {
    chapter: "Internal Security Challenges",
    topics: [
      "Social Diversity as Issues of Security","Challenges from within Neighbours as Issue of Security Threat","Non-State Actors as Issue of Security Threat","Global Indices and Measurement of Vulnerability of a State Towards such Non-State Actors","Law and Order vs. Internal Security"
    ]
  },
  {
    chapter: "Terrorism & Organized Crime",
    topics: [
      "Changing face of Terrorism","Terror Threats Faced by India","Broader Framework to Deal with Terrorism","Drawbacks in Intelligence Infrastructure","Types of Organized Crime","Problems in controlling organized crimes","Drug trafficking in India","Combating organized crimes","Linkage of Terrorism and Organized Crime in India"
    ]
  },
  {
    chapter: "Extremism & Insurgency",
    topics: [
      "Linkage between Development and Spread of Extremism","Stated Purpose of the Naxal Movement","Covid 19 and Naxalism","Why naxalism got huge support from common man?","Why naxalism is biggest threat to internal security?","Insurgency in North-East (Issues & Conflicts)","Assam Insurgency","Resolving the Bodo Issue"
    ]
  },
  {
    chapter: "Border Management & Cyber Security",
    topics: [
      "Challenges to Border Management","Issues Faced in Border Management","Community Participation for Border Management","Types of Cyber Crimes","Impact and Steps needed","Recent Incident: Ransomware","India’s Cyber Security Infrastructure","The National Cyber Security Policy of India 2013","Factors Contributing/Aggravating Rise of Cyber Attack","Recent Initiatives for Tackling Cyber Warfare"
    ]
  },
  {
    chapter: "Social Media & Money Laundering",
    topics: [
      "Regulation of Social Media in India for Internal Security","Challenges in Monitoring Social Media","Steps Needed (Social Media Regulation)","Meaning of Money Laundering","Harmful Effects of Money Laundering","Steps taken by the Government","Parallel Economy in India","What are the various measures taken by Government to curb Black Money?","Impact of demonetisation on black money"
    ]
  },
  {
    chapter: "Police Reforms & Security Forces",
    topics: [
      "Police we Want in 21st Century","Traditional Security Challenges","Non-Traditional Security Challenges (NTS)","Recommendations for Police Reforms","Assam Rifles Mandate","Border Security Force (BSF)","Indo-Tibetan Border Police","Central Industrial Security Force (CISF)","Central Reserve Police Force","National Security Guard","Integrated theatre commands","National Maritime Security Coordinator","Issues with Paramilitary Forces"
    ]
  },
  {
    chapter: "Contemporary Issues (Security)",
    topics: [
      "Drug trafficking and Narcoterrorism emerge as a national threat for India","Growing insurgency in different states of India","De-Radicalization in India","Contemporary challenges in terrorism like religious indoctrination via social media","Left Wing Extremism and Insurgency in J&K","Technological Dependence on Other Nations and its impact on India’s technological security","Modernisation Fund for Defence and Internal Security","The Dark Web and associated Regulatory Challenges","Coastal Security challenges for India","Police Reform with Respect to Cyber Security","India’s National Cyber Security Strategy","Big-Techs & weaponisation of Internet","India’s Coastal Security & its significance","AFSPA and the ‘debate’ on its need","Integration of Central Agencies with CCTNS","Inter-operable Criminal Justice System (ICJS)","Crypto currency and National Security","Terrorism, the biggest violator of ‘human rights’","Medical devices and cyber-attack threats","Exclusive Economic Zone and India’s Maritime Governance","Role of CAPF (paramilitary forces) in internal security","Frequent changes in anti-terror laws","Smart Fencing (Border Management)","Insurgency in North East","Money Laundering","Drug abuse problem in border areas"
    ]
  }
];

const DISASTER_MANAGEMENT_DATA = [
  {
    chapter: "Natural & Man-Made Disasters",
    topics: [
      "Types of disasters","India’s vulnerability profile","Earthquakes","Tsunamis","Landslides","Flood","Drought","Epidemics","Nuclear Reactor explosion","Dam collapse","Gas Leakage","Oil Spill","Volcanic Eruption","Forest fires"
    ]
  },
  {
    chapter: "Disaster Management & Mitigation",
    topics: [
      "Management of disasters","Community management","Government initiatives to tackle disasters","National disaster management act, 2005","Global framework for disaster risk reduction","Disaster Insurance","Role of media in disaster management","Gender implications of disasters","Disaster management cycle","Role of NGOs in disaster management","Pre disaster preparation"
    ]
  },
  {
    chapter: "Disaster Technology & Policy",
    topics: [
      "Role of Science and Technology in Disaster Management","Pandemic preparedness fund","Disaster Induced Displacement","Urban Flood Management (to tackle frequent floods)","Disaster Risk Financing (G20)","India’s increasing climate vulnerability demands urgent disaster preparedness","India achieving Atmanirbharta in Disaster Management","India’s Disaster Management Model through Turkiye’s case study","India’s Disaster Management: Joshimath Crisis","Prime Minister’s Ten Point Agenda on Disaster Risk Reduction","The Sendai Framework For Disaster Risk Reduction","Disaster Resilience- CDRI","National Policy on disaster management"
    ]
  }
];

const ETHICS_DATA = [
  {
    chapter: "Ethics & Human Interface",
    topics: [
      "Dimensions of Ethics","Essence of Ethics","Approaches of Ethical Study as Indian Perspective and Western Perspective","Basic concept of ethics morality and value","Ethics in public life","Ethics in Economic Life","Freedom and Discipline","Duties and Rights","Virtue Ethics","Consequences of Ethics in Human Actions","Values and Ethics in Government","Contribution of Family in Value Education"
    ]
  },
  {
    chapter: "Human Values",
    topics: [
      "Human value & Socialization","Individual Personality and Value","Values and Skill","Fundamental and Instrumental Values","Democratic values","Role of ethical value in governance and society","Significance of value in Civil Services","Contribution of Society in Inculcating Values","Role of Educational Institutions in Inculcating Values","Aesthetic values","Values in work life and professional ethics"
    ]
  },
  {
    chapter: "Aptitude & Foundational Values for Civil Services",
    topics: [
      "Essential Aptitude for civil servants","Foundational Values of Civil Services","Neutrality","Anonymity","Civil Services Accountability","Integrity","Humility","Adaptability","Magnanimity","Perseverance","Impartiality and Non-Partisanship","Tolerance and compassion for the weaker section","Contribution to society"
    ]
  },
  {
    chapter: "India & World Thinkers",
    topics: [
      "Mahatma Gandhi","Dr. S. Radhakrishnan","Rabindranath Tagore","Swami Dayanand Saraswati","Mahadeva Govinda Ranade","Sri Aurobindo","Swami Vivekananda","Sardar Patel","Buddha Bhim Rao Ambedkar","Raja Ram Mohan Roy","Chhatrapati Shahu Maharaj","Mother Teresa","Amitabha Chowdhury","Aruna Roy","T. N. Seshan","E. Sreedharan","Administrative Thinkers","Max Weber","Elton Mayo","Peter Drucker","Chestar Barnard","Mary Parker Follet","Plato","Aristotle","Socrates","Jeremy Bentham","JS Mill","Thomas Hobbes","John Locke","Jean Jacques Rousseau","John Rawls","Immanuel Kant","Carol Gilligan","Jean Paul Sartre","Georg Wilhelm Friedrich Hegel","Confucius","René Descartes","Karl Marx","Adam Smith","Thomas Aquinas","David Hume","Democritus","Galileo","Friedrich Nietzsche","Montesquieu","Voltaire","Thomas Jefferson","Benjamin Franklin","Martin Luther King","Dalai Lama","Nelson Mandela","Siddhartha Gautama","Aung San Suu Kyi","Albert Einstein","Abraham Lincoln","J. L. Nehru","Lee Kuan Yew","Henry Ford","Abdul Kalam","Muhammad Yunus","Wangari Maathai","Kofi Annan","Lech Walesa","Desmond Tutu","Isaac Newton","Elie Wiesel","King Ashoka","Sun Yat Sen"
    ]
  },
  {
    chapter: "Attitude",
    topics: [
      "Components of Attitude","Affective component","Cognitive component","Behavioral component","Functions of Attitude","Adjustive Function","Ego-Defensive Function","Value-Expressive Function","Knowledge Function","Attitude Formation Model","Impact of Beliefs and Values","Group Influences","Social Influence","Persuasion Tactics","Tools of Persuasion","Moral Attitude formation","Political Attitude formation"
    ]
  },
  {
    chapter: "Emotional Intelligence",
    topics: [
      "Theories Associated with Emotional Intelligence","Can Emotional Intelligence be Developed?","Components of Emotional Competencies","The Self-Awareness Cluster: Understanding Feelings and Accurate Self Assessment","The Self-Management Cluster: Managing Internal States, Impulses, and Resources","The Social Awareness Cluster: Reading People and Groups Accurately","The Relationship Management Cluster: Inducing Desirable Responses in Others","Importance of Emotional Intelligence at Workplace","Importance of Emotional Intelligence in Civil Services"
    ]
  },
  {
    chapter: "Values & Ethics in Public Administration",
    topics: [
      "Ethical Concerns in Public Institution","Ethical Concerns in Private Institutions","Ethical Dilemmas in Public and Private Institutions","Laws, Rules and Regulations as Source of Ethical Guidance","Accountability and Ethical Governance","Strengthening of Ethical and Moral Values in Governance","Moral Judgements in International Relations","Ethical Relation in Funding International Relations and concept of Moral Responsibility","Ethics in working of international organizations","What is Corporate Governance?","Models of Corporate Social Responsibility","Steps taken by World Bank for Good Corporate Governance","Norms for Corporate Government in India","Concept of business ethics"
    ]
  },
  {
    chapter: "Probity in Governance",
    topics: [
      "Concept of Public Service","Philosophical basis of Governance and Probity","Information Sharing, Transparency and Right to Information","Flaws in RTI and recommendations for improvement","Importance of vigilant citizens","Information sharing and participation","Importance of Code of ethics","Code of Ethics in Professions","Code of Conduct for Ministers; for Legislators; for Civil Servants; for Regulators and for the Judiciary","Components of a Citizen Charter","Steps in formulation of a Citizen’s Charter","Concept of Work Culture","The Indian Approach to Work","Methods of improving Work Culture","Quality of Service Delivery","Utilisation of Public Funds","Problems in Fund Release and Utilization","Parliamentary Control on Expenditure","Corruption as a Social Evil","Probity in public life Corrupt practice among civil servants and official misconduct","Exposing corruption: Civil Society initiatives and role of Whistleblower Act","Tackling corruption: Role of government and institutions of governance","Controlling corruption: Various approaches and efficacy"
    ]
  },
  {
    chapter: "Applied Ethics",
    topics: [
      "Euthanasia Issue","Social and Ethical Angle","Different arguments related to Euthanasia","Conclusion","Surrogacy","Case study","Issues","Ethical Issues","Concept of ethical surrogacy","Ethics & Sports","Importance of sports","Ethical Issue: Need for sportsmanship","Ethical Issue: Doping","Ethical Issue: Discrimination and Sexual Harassment","Ethical Issue: Sports as a Business","Steps needed","Media Ethics","Role of Media","Ethical Issues faced by Reporters","Trial by Media","Media Prejudice","Ethical Dilemma faced by Photo Journalists","Digital Media Ethics","Paid News","Business Ethics","Principles of Business Ethics","Dimensions related to Business Ethics in Organisation","Business Ethics and Corporate Governance","Journey from Philanthropy to Corporate Social Responsibility","Issues related to Corporate Social Responsibility","Issues in implementation of Business Ethics","Ethics Related to Economic Sanctions","Why Economic Sanctions placed?","Ethics in Economic Sanctions","Refugees & Ethics","Why Migration occurs?","Case study of Syria","Dilemmas related to Refugee crisis","Steps needed","Ethical Dilemmas of Globalization","What is Globalization","Free trade in Globalized world","Issues with Newly developed trade patterns","Criticism against global regime","Way forward","Ethics of war","Ethics and War theories","Evils of war","Environmental Ethics","Linkage between Ethics and Environment","Theories related to Environmental ethics","Role of individual","Ethical Issues in Biotechnology","Issues related to Stem Cell","Issues related to cloning","Issues related to designer babies","Animal Ethics","Introduction","Issues of conducting research on animals","Issue of keeping animals as pets","Issue of Cruelty against animals","Food Adulteration and Ethics","Ethical dimension","Ethical issue related to food additive","Abortion: Ethical or Unethical","Law of abortion in India","Recent Supreme Court verdict","Ethical Issue: Health of Women vs fetus","Justification for abortion","Argument against abortion","Abortion and women rights","Abortion and father rights","Honour Killing","Honour killing is unethical","Role of khap pachayat","Marital Rape","Why Marital Rape should not be criminalized?","Why Marital Rape should be criminalized?","What are the hurdles?","Ethical Issue Involved in Child Labour","Rights of children","Child labour and company","Solution","Role of consumer","Ethical Issue Involved in Treating Juvenile as Adult","Juvenile justice system","Negative implications","Ethics and Old Age","Ethical issues","Issues faced","Importance of autonomy","Ethics in Public and Private Relationships","Ethical values in Private Relationships","Ethical principles in Public relationships","Linkage between Private relationships and Public Relationships"
    ]
  },
  {
    chapter: "Contemporary Issues (Ethics)",
    topics: [
      "Work Ethics & Moonlighting","Ethics of public interest litigation","Influence of Opinion poll","Ethical dilemmas related to war (Just War Theory)","Ethical issues in Surrogacy","Environmental Ethics"
    ]
  }
];

const SOCIOLOGY_PAPER_1_DATA = [
  {
    chapter: "Sociology – The Discipline",
    headings: [
      {
        name: "Topic 1.1 Modernity and Emergence of Sociology",
        topics: [
          "Modernity",
          "Industrial Revolution",
          "French Revolution",
          "Enlightenment",
          "Social Change in Europe",
          "Emergence of Sociology"
        ]
      },
      {
        name: "Topic 1.2 Scope of Sociology",
        topics: [
          "Definition",
          "Nature",
          "Scope",
          "Sociology vs Political Science",
          "Sociology vs Economics",
          "Sociology vs Anthropology",
          "Sociology vs Psychology",
          "Sociology vs History"
        ]
      },
      {
        name: "Topic 1.3 Sociology and Common Sense",
        topics: [
          "Meaning",
          "Difference",
          "Importance",
          "Examples"
        ]
      }
    ]
  },
  {
    chapter: "Sociology as Science",
    headings: [
      {
        name: "Topic 2.1 Science",
        topics: [
          "Meaning",
          "Characteristics",
          "Scientific Method"
        ]
      },
      {
        name: "Topic 2.2 Research Methodology",
        topics: [
          "Major Theoretical Strands",
          "Positivism",
          "Interpretivism",
          "Critical Theory"
        ]
      },
      {
        name: "Topic 2.3 Positivism",
        topics: [
          "Auguste Comte",
          "Characteristics",
          "Criticism"
        ]
      },
      {
        name: "Topic 2.4 Fact, Value & Objectivity",
        topics: [
          "Fact",
          "Value",
          "Objectivity",
          "Value Neutrality"
        ]
      },
      {
        name: "Topic 2.5 Non-Positivism",
        topics: [
          "Weberian Approach",
          "Phenomenology",
          "Ethnomethodology",
          "Symbolic Interactionism"
        ]
      }
    ]
  },
  {
    chapter: "Research Methods & Analysis",
    headings: [
      {
        name: "Topic 3.1 Qualitative Research",
        topics: [
          "Observation",
          "Case Study",
          "Ethnography",
          "Interview"
        ]
      },
      {
        name: "Topic 3.2 Quantitative Research",
        topics: [
          "Survey",
          "Census",
          "Statistical Analysis"
        ]
      },
      {
        name: "Topic 3.3 Data Collection",
        topics: [
          "Primary Data",
          "Secondary Data",
          "Questionnaire",
          "Schedule",
          "Observation",
          "Interview"
        ]
      },
      {
        name: "Topic 3.4 Research Concepts",
        topics: [
          "Variable",
          "Sampling",
          "Hypothesis",
          "Reliability",
          "Validity"
        ]
      }
    ]
  },
  {
    chapter: "Sociological Thinkers",
    headings: [
      {
        name: "Topic 4.1 Karl Marx",
        topics: [
          "Historical Materialism",
          "Mode of Production",
          "Alienation",
          "Class Struggle",
          "Base & Superstructure"
        ]
      },
      {
        name: "Topic 4.2 Emile Durkheim",
        topics: [
          "Division of Labour",
          "Social Facts",
          "Suicide",
          "Religion",
          "Collective Conscience",
          "Anomie"
        ]
      },
      {
        name: "Topic 4.3 Max Weber",
        topics: [
          "Social Action",
          "Ideal Types",
          "Authority",
          "Bureaucracy",
          "Protestant Ethic",
          "Capitalism"
        ]
      },
      {
        name: "Topic 4.4 Talcott Parsons",
        topics: [
          "Social System",
          "Pattern Variables",
          "AGIL Model"
        ]
      },
      {
        name: "Topic 4.5 Robert K. Merton",
        topics: [
          "Manifest Function",
          "Latent Function",
          "Dysfunction",
          "Reference Group",
          "Conformity",
          "Deviance"
        ]
      },
      {
        name: "Topic 4.6 George Herbert Mead",
        topics: [
          "Self",
          "Identity",
          "I",
          "Me",
          "Generalized Other"
        ]
      }
    ]
  },
  {
    chapter: "Stratification & Mobility",
    headings: [
      {
        name: "Topic 5.1 Concepts",
        topics: [
          "Equality",
          "Inequality",
          "Hierarchy",
          "Exclusion",
          "Poverty",
          "Deprivation"
        ]
      },
      {
        name: "Topic 5.2 Theories",
        topics: [
          "Functional Theory",
          "Marxist Theory",
          "Weberian Theory"
        ]
      },
      {
        name: "Topic 5.3 Dimensions",
        topics: [
          "Class",
          "Status",
          "Gender",
          "Race",
          "Ethnicity"
        ]
      },
      {
        name: "Topic 5.4 Social Mobility",
        topics: [
          "Open System",
          "Closed System",
          "Horizontal Mobility",
          "Vertical Mobility",
          "Causes",
          "Sources"
        ]
      }
    ]
  },
  {
    chapter: "Work & Economic Life",
    headings: [
      {
        name: "Topic 6.1 Organization of Work",
        topics: [
          "Slave Society",
          "Feudal Society",
          "Industrial Society",
          "Capitalist Society"
        ]
      },
      {
        name: "Topic 6.2 Work Organization",
        topics: [
          "Formal Organization",
          "Informal Organization"
        ]
      },
      {
        name: "Topic 6.3 Labour",
        topics: [
          "Labour",
          "Labour Market",
          "Labour Process",
          "Alienation"
        ]
      }
    ]
  },
  {
    chapter: "Politics & Society",
    headings: [
      {
        name: "Topic 7.1 Power",
        topics: [
          "Power",
          "Authority",
          "Legitimacy"
        ]
      },
      {
        name: "Topic 7.2 Political Institutions",
        topics: [
          "Power Elite",
          "Bureaucracy",
          "Political Parties",
          "Pressure Groups"
        ]
      },
      {
        name: "Topic 7.3 State & Society",
        topics: [
          "Nation",
          "State",
          "Citizenship",
          "Democracy",
          "Civil Society",
          "Ideology"
        ]
      },
      {
        name: "Topic 7.4 Social Movements",
        topics: [
          "Protest",
          "Agitation",
          "Collective Action",
          "Revolution"
        ]
      }
    ]
  },
  {
    chapter: "Religion & Society",
    headings: [
      {
        name: "Topic 8.1 Sociological Theories",
        topics: [
          "Functional Theory",
          "Conflict Theory",
          "Interpretive Theory"
        ]
      },
      {
        name: "Topic 8.2 Religious Practices",
        topics: [
          "Animism",
          "Monism",
          "Pluralism",
          "Sect",
          "Cult"
        ]
      },
      {
        name: "Topic 8.3 Religion in Modern Society",
        topics: [
          "Religion & Science",
          "Secularization",
          "Revivalism",
          "Fundamentalism"
        ]
      }
    ]
  },
  {
    chapter: "Systems of Kinship",
    headings: [
      {
        name: "Topic 9.1 Family",
        topics: [
          "Family",
          "Household",
          "Marriage"
        ]
      },
      {
        name: "Topic 9.2 Types of Family",
        topics: [
          "Nuclear",
          "Joint",
          "Extended"
        ]
      },
      {
        name: "Topic 9.3 Lineage & Descent",
        topics: [
          "Patrilineal",
          "Matrilineal",
          "Bilineal"
        ]
      },
      {
        name: "Topic 9.4 Patriarchy",
        topics: [
          "Patriarchy",
          "Sexual Division of Labour"
        ]
      },
      {
        name: "Topic 9.5 Contemporary Trends",
        topics: [
          "Live-in",
          "Divorce",
          "Single Parent",
          "Same-sex Family"
        ]
      }
    ]
  },
  {
    chapter: "Social Change in Modern Society",
    headings: [
      {
        name: "Topic 10.1 Theories",
        topics: [
          "Evolutionary",
          "Cyclical",
          "Conflict",
          "Functional"
        ]
      },
      {
        name: "Topic 10.2 Development",
        topics: [
          "Development",
          "Dependency Theory"
        ]
      },
      {
        name: "Topic 10.3 Agents",
        topics: [
          "Education",
          "Technology",
          "Economy",
          "Media"
        ]
      },
      {
        name: "Topic 10.4 Education",
        topics: [
          "Education & Social Change"
        ]
      },
      {
        name: "Topic 10.5 Science & Technology",
        topics: [
          "Technology",
          "Innovation",
          "Globalization"
        ]
      }
    ]
  }
];

const SOCIOLOGY_PAPER_2_DATA = [
  {
    chapter: "Introducing Indian Society",
    headings: [
      {
        name: "Topic 1.1 Perspectives",
        topics: [
          "Indology (G.S. Ghurye)",
          "Structural Functionalism (M.N. Srinivas)",
          "Marxist Sociology (A.R. Desai)"
        ]
      },
      {
        name: "Topic 1.2 Colonial Impact",
        topics: [
          "Indian Nationalism",
          "Modernization",
          "Colonial Movements",
          "Social Reforms"
        ]
      }
    ]
  },
  {
    chapter: "Rural & Agrarian Social Structure",
    headings: [
      {
        name: "Topics",
        topics: [
          "Indian Village",
          "Village Studies",
          "Agrarian Structure",
          "Land Tenure",
          "Land Reforms"
        ]
      }
    ]
  },
  {
    chapter: "Caste System",
    headings: [
      {
        name: "Topics",
        topics: [
          "Perspectives",
          "Ghurye",
          "Srinivas",
          "Dumont",
          "Beteille",
          "Features",
          "Untouchability",
          "Sanskritization",
          "Dominant Caste",
          "Westernization"
        ]
      }
    ]
  },
  {
    chapter: "Tribal Communities",
    headings: [
      {
        name: "Topics",
        topics: [
          "Definition",
          "Distribution",
          "Colonial Policy",
          "Integration",
          "Autonomy",
          "Tribal Issues"
        ]
      }
    ]
  },
  {
    chapter: "Social Classes in India",
    headings: [
      {
        name: "Topics",
        topics: [
          "Agrarian Class",
          "Industrial Class",
          "Middle Class",
          "New Middle Class"
        ]
      }
    ]
  },
  {
    chapter: "Kinship in India",
    headings: [
      {
        name: "Topics",
        topics: [
          "Lineage",
          "Descent",
          "Marriage",
          "Family",
          "Household",
          "Patriarchy",
          "Division of Labour"
        ]
      }
    ]
  },
  {
    chapter: "Religion & Society in India",
    headings: [
      {
        name: "Topics",
        topics: [
          "Religious Communities",
          "Minority Issues",
          "Communalism",
          "Secularism"
        ]
      }
    ]
  },
  {
    chapter: "Visions of Social Change",
    headings: [
      {
        name: "Topics",
        topics: [
          "Planning",
          "Mixed Economy",
          "Constitution",
          "Law",
          "Education"
        ]
      }
    ]
  },
  {
    chapter: "Rural Transformation",
    headings: [
      {
        name: "Topics",
        topics: [
          "Rural Development",
          "Community Development",
          "Cooperatives",
          "Poverty Alleviation",
          "Green Revolution",
          "Agricultural Change",
          "Rural Labour",
          "Bonded Labour",
          "Migration"
        ]
      }
    ]
  },
  {
    chapter: "Industrialization & Urbanization",
    headings: [
      {
        name: "Topics",
        topics: [
          "Industrial Development",
          "Urban Growth",
          "Working Class",
          "Informal Sector",
          "Child Labour",
          "Slums"
        ]
      }
    ]
  },
  {
    chapter: "Politics & Society",
    headings: [
      {
        name: "Topics",
        topics: [
          "Nation",
          "Democracy",
          "Citizenship",
          "Political Parties",
          "Pressure Groups",
          "Elites",
          "Regionalism",
          "Decentralization",
          "Secularization"
        ]
      }
    ]
  },
  {
    chapter: "Social Movements",
    headings: [
      {
        name: "Topics",
        topics: [
          "Peasant Movements",
          "Farmers Movements",
          "Women's Movement",
          "Dalit Movement",
          "OBC Movement",
          "Environmental Movement",
          "Ethnic Movements",
          "Identity Movements"
        ]
      }
    ]
  },
  {
    chapter: "Population Dynamics",
    headings: [
      {
        name: "Topics",
        topics: [
          "Population Size",
          "Growth",
          "Composition",
          "Distribution",
          "Birth Rate",
          "Death Rate",
          "Migration",
          "Population Policy",
          "Family Planning",
          "Ageing",
          "Sex Ratio",
          "Infant Mortality",
          "Reproductive Health"
        ]
      }
    ]
  },
  {
    chapter: "Challenges of Social Transformation",
    headings: [
      {
        name: "Topics",
        topics: [
          "Development Crisis",
          "Displacement",
          "Environment",
          "Sustainability",
          "Poverty",
          "Inequality",
          "Violence Against Women",
          "Caste Conflict",
          "Ethnic Conflict",
          "Communalism",
          "Religious Revivalism",
          "Illiteracy",
          "Educational Disparities"
        ]
      }
    ]
  }
];

async function seedAISFramework() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const filePath = path.join(__dirname, '../Full Syllabus.txt');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const rawLines = fileContent.split('\n');

    let currentPaper = 'GS I';
    let currentSubject = 'Ancient History';
    let currentChapter = 'Pre Historic Cultures in India';

    const subjectCounters = {};
    Object.keys(SUBJECT_PREFIXES).forEach(s => subjectCounters[s] = 1);

    let pendingTitle = '';
    const topicsToInsert = [];

    let isInsideMedievalInTxt = false;
    let isInsideModernInTxt = false;
    let isInsidePICInTxt = false;
    let isInsideWorldInTxt = false;
    let isInsideCultureInTxt = false;
    let isInsidePGEOInTxt = false;
    let isInsideIGEOInTxt = false;
    let isInsideHGEOInTxt = false;
    let isInsideEGEOInTxt = false;
    let isInsideSOCInTxt = false;
    let isInsidePolityInTxt = false;
    let isInsideGovInTxt = false;
    let isInsideSJInTxt = false;
    let isInsideIRInTxt = false;
    let isInsideEconInTxt = false;
    let isInsideAgriInTxt = false;
    let isInsideIndInTxt = false;
    let isInsideInfraInTxt = false;
    let isInsideSTInTxt = false;
    let isInsideEnvInTxt = false;
    let isInsideSecInTxt = false;
    let isInsideDMInTxt = false;
    let isInsideEthicsInTxt = false;

    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i].trim();
      if (!line || line.includes('www.iasscore.in') || line.includes('UPSC SYLLABUS') || line.startsWith('Page ')) continue;

      // Subject Headers Detection
      if (line.includes('ANCIENT HISTORY')) { currentPaper = 'GS I'; currentSubject = 'Ancient History'; currentChapter = 'Pre Historic Cultures in India'; pendingTitle = ''; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }
      if (line.includes('MEDIEVAL HISTORY')) { currentPaper = 'GS I'; currentSubject = 'Medieval History'; isInsideMedievalInTxt = true; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }
      if (line.includes('MODERN HISTORY')) { currentPaper = 'GS I'; currentSubject = 'Modern History'; isInsideMedievalInTxt = false; isInsideModernInTxt = true; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }
      if (line.includes('POST INDEPENDENCE CONSOLIDATION')) { currentPaper = 'GS I'; currentSubject = 'Post-Independence Consolidation'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = true; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }
      if (line.includes('WORLD HISTORY')) { currentPaper = 'GS I'; currentSubject = 'World History'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = true; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }
      if (line.includes('INDIAN CULTURE')) { currentPaper = 'GS I'; currentSubject = 'Indian Culture'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = true; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }
      if (line.includes('PHYSICAL GEOGRAPHY') && !line.includes('INDIA')) { currentPaper = 'GS I'; currentSubject = 'Physical Geography'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = true; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }
      if (line.includes('PHYSICAL GEOGRAPHY OF INDIA')) { currentPaper = 'GS I'; currentSubject = 'Physical Geography of India'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = true; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }
      if (line.includes('HUMAN GEOGRAPHY')) { currentPaper = 'GS I'; currentSubject = 'Human Geography'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = true; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }
      if (line.includes('ECONOMIC GEOGRAPHY')) { currentPaper = 'GS I'; currentSubject = 'Economic Geography'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = true; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }
      if (line.includes('INDIAN SOCIETY')) { currentPaper = 'GS I'; currentSubject = 'Indian Society'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = true; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }

      if (line.includes('POLITY')) { currentPaper = 'GS II'; currentSubject = 'Polity'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = true; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }
      if (line.includes('GOVERNANCE')) { currentPaper = 'GS II'; currentSubject = 'Governance'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = true; isInsideSJInTxt = false; isInsideIRInTxt = false; continue; }
      if (line.includes('SOCIAL JUSTICE')) { currentPaper = 'GS II'; currentSubject = 'Social Justice'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = true; isInsideIRInTxt = false; continue; }
      if (line.includes('INTERNATIONAL RELATIONS')) { currentPaper = 'GS II'; currentSubject = 'International Relations'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = true; isInsideEconInTxt = false; continue; }

      if (line.includes('BASIC ECONOMY') || line === 'ECONOMY') { currentPaper = 'GS III'; currentSubject = 'Economy'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; isInsideEconInTxt = true; isInsideAgriInTxt = false; continue; }
      if (line === 'AGRICULTURE') { currentPaper = 'GS III'; currentSubject = 'Agriculture'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; isInsideEconInTxt = false; isInsideAgriInTxt = true; isInsideIndInTxt = false; continue; }
      if (line === 'INDUSTRY') { currentPaper = 'GS III'; currentSubject = 'Industry'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; isInsideEconInTxt = false; isInsideAgriInTxt = false; isInsideIndInTxt = true; isInsideInfraInTxt = false; continue; }
      if (line === 'INFRASTRUCTURE') { currentPaper = 'GS III'; currentSubject = 'Infrastructure'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; isInsideEconInTxt = false; isInsideAgriInTxt = false; isInsideIndInTxt = false; isInsideInfraInTxt = true; isInsideSTInTxt = false; continue; }

      if (isInsideMedievalInTxt || isInsideModernInTxt || isInsidePICInTxt || isInsideWorldInTxt || isInsideCultureInTxt || isInsidePGEOInTxt || isInsideIGEOInTxt || isInsideHGEOInTxt || isInsideEGEOInTxt || isInsideSOCInTxt || isInsidePolityInTxt || isInsideGovInTxt || isInsideSJInTxt || isInsideIRInTxt || isInsideEconInTxt || isInsideAgriInTxt || isInsideIndInTxt || isInsideInfraInTxt || isInsideSTInTxt || isInsideEnvInTxt || isInsideSecInTxt || isInsideDMInTxt || isInsideEthicsInTxt) continue;
      if (line.includes('SCIENCE & TECHNOLOGY')) { currentPaper = 'GS III'; currentSubject = 'Science & Technology'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; isInsideEconInTxt = false; isInsideAgriInTxt = false; isInsideIndInTxt = false; isInsideInfraInTxt = false; isInsideSTInTxt = true; isInsideEnvInTxt = false; isInsideSecInTxt = false; isInsideDMInTxt = false; isInsideEthicsInTxt = false; continue; }
      if (line.includes('ENVIRONMENT & ECOLOGY') || line.includes('ENVIRONMENT')) { currentPaper = 'GS III'; currentSubject = 'Environment & Ecology'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; isInsideEconInTxt = false; isInsideAgriInTxt = false; isInsideIndInTxt = false; isInsideInfraInTxt = false; isInsideSTInTxt = false; isInsideEnvInTxt = true; isInsideSecInTxt = false; isInsideDMInTxt = false; isInsideEthicsInTxt = false; continue; }
      if (line.includes('INTERNAL SECURITY')) { currentPaper = 'GS III'; currentSubject = 'Internal Security'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; isInsideEconInTxt = false; isInsideAgriInTxt = false; isInsideIndInTxt = false; isInsideInfraInTxt = false; isInsideSTInTxt = false; isInsideEnvInTxt = false; isInsideSecInTxt = true; isInsideDMInTxt = false; isInsideEthicsInTxt = false; continue; }
      if (line.includes('DISASTER MANAGEMENT') || line.includes('DISASTER')) { currentPaper = 'GS III'; currentSubject = 'Disaster Management'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; isInsideEconInTxt = false; isInsideAgriInTxt = false; isInsideIndInTxt = false; isInsideInfraInTxt = false; isInsideSTInTxt = false; isInsideEnvInTxt = false; isInsideSecInTxt = false; isInsideDMInTxt = true; isInsideEthicsInTxt = false; continue; }

      if (line.includes('ETHICS, INTEGRITY') || line.includes('ETHICS BASIC') || line.includes('Ethics Basic')) { currentPaper = 'GS IV'; currentSubject = 'Ethics, Integrity & Aptitude'; isInsideMedievalInTxt = false; isInsideModernInTxt = false; isInsidePICInTxt = false; isInsideWorldInTxt = false; isInsideCultureInTxt = false; isInsidePGEOInTxt = false; isInsideIGEOInTxt = false; isInsideHGEOInTxt = false; isInsideEGEOInTxt = false; isInsideSOCInTxt = false; isInsidePolityInTxt = false; isInsideGovInTxt = false; isInsideSJInTxt = false; isInsideIRInTxt = false; isInsideEconInTxt = false; isInsideAgriInTxt = false; isInsideIndInTxt = false; isInsideInfraInTxt = false; isInsideSTInTxt = false; isInsideEnvInTxt = false; isInsideSecInTxt = false; isInsideDMInTxt = false; isInsideEthicsInTxt = true; continue; }

      if (line.includes('')) { pendingTitle = ''; continue; }

      if (line.includes('')) {
        let fullTitle = (pendingTitle + ' ' + line.replace(//g, '')).trim();
        pendingTitle = '';
        if (fullTitle) {
          const prefix = SUBJECT_PREFIXES[currentSubject] || 'TP';
          const count = subjectCounters[currentSubject] || 1;
          subjectCounters[currentSubject] = count + 1;
          const topicCode = `${prefix}-${String(count).padStart(3, '0')}`;

          topicsToInsert.push({
            paper: currentPaper,
            subjectName: currentSubject,
            chapter: currentChapter,
            heading: currentChapter,
            topicCode: topicCode,
            title: fullTitle,
            tags: [currentSubject, currentChapter]
          });
        }
      } else {
        if (line.length > 0 && line.length < 90) {
          const nextLineHasBox = rawLines[i + 1] && rawLines[i + 1].includes('');
          const secondLineHasBox = rawLines[i + 2] && rawLines[i + 2].includes('');

          if (nextLineHasBox && !secondLineHasBox) {
            pendingTitle = line;
          } else {
            currentChapter = line;
            pendingTitle = '';
          }
        }
      }
    }

    // Insert explicit Medieval History topics
    MEDIEVAL_HISTORY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Medieval History'];
        subjectCounters['Medieval History'] = count + 1;
        const topicCode = `MH-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS I',
          subjectName: 'Medieval History',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Medieval History', cObj.chapter]
        });
      });
    });

    // Insert explicit Modern History topics
    MODERN_HISTORY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Modern History'];
        subjectCounters['Modern History'] = count + 1;
        const topicCode = `MOD-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS I',
          subjectName: 'Modern History',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Modern History', cObj.chapter]
        });
      });
    });

    // Insert explicit Post-Independence Consolidation topics
    POST_INDEPENDENCE_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Post-Independence Consolidation'];
        subjectCounters['Post-Independence Consolidation'] = count + 1;
        const topicCode = `PIC-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS I',
          subjectName: 'Post-Independence Consolidation',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Post-Independence Consolidation', cObj.chapter]
        });
      });
    });

    // Insert explicit World History topics
    WORLD_HISTORY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['World History'];
        subjectCounters['World History'] = count + 1;
        const topicCode = `WH-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS I',
          subjectName: 'World History',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['World History', cObj.chapter]
        });
      });
    });

    // Insert explicit Indian Culture topics
    INDIAN_CULTURE_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Indian Culture'];
        subjectCounters['Indian Culture'] = count + 1;
        const topicCode = `CUL-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS I',
          subjectName: 'Indian Culture',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Indian Culture', cObj.chapter]
        });
      });
    });

    // Insert explicit Physical Geography topics
    PHYSICAL_GEOGRAPHY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Physical Geography'];
        subjectCounters['Physical Geography'] = count + 1;
        const topicCode = `PGEO-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS I',
          subjectName: 'Physical Geography',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Physical Geography', cObj.chapter]
        });
      });
    });

    // Insert explicit Physical Geography of India topics
    PHYSICAL_GEOGRAPHY_OF_INDIA_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Physical Geography of India'];
        subjectCounters['Physical Geography of India'] = count + 1;
        const topicCode = `IGEO-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS I',
          subjectName: 'Physical Geography of India',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Physical Geography of India', cObj.chapter]
        });
      });
    });

    // Insert explicit Human Geography topics
    HUMAN_GEOGRAPHY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Human Geography'];
        subjectCounters['Human Geography'] = count + 1;
        const topicCode = `HGEO-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS I',
          subjectName: 'Human Geography',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Human Geography', cObj.chapter]
        });
      });
    });

    // Insert explicit Economic Geography topics
    ECONOMIC_GEOGRAPHY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Economic Geography'];
        subjectCounters['Economic Geography'] = count + 1;
        const topicCode = `EGEO-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS I',
          subjectName: 'Economic Geography',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Economic Geography', cObj.chapter]
        });
      });
    });

    // Insert explicit Indian Society topics
    INDIAN_SOCIETY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Indian Society'];
        subjectCounters['Indian Society'] = count + 1;
        const topicCode = `SOC-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS I',
          subjectName: 'Indian Society',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Indian Society', cObj.chapter]
        });
      });
    });

    // Insert explicit Polity topics under GS II
    POLITY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Polity'];
        subjectCounters['Polity'] = count + 1;
        const topicCode = `POL-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS II',
          subjectName: 'Polity',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Polity', cObj.chapter]
        });
      });
    });

    // Insert explicit Governance topics under GS II
    GOVERNANCE_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Governance'];
        subjectCounters['Governance'] = count + 1;
        const topicCode = `GOV-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS II',
          subjectName: 'Governance',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Governance', cObj.chapter]
        });
      });
    });

    // Insert explicit Social Justice topics under GS II
    SOCIAL_JUSTICE_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Social Justice'];
        subjectCounters['Social Justice'] = count + 1;
        const topicCode = `SJ-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS II',
          subjectName: 'Social Justice',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Social Justice', cObj.chapter]
        });
      });
    });

    // Insert explicit International Relations topics under GS II
    INTERNATIONAL_RELATIONS_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['International Relations'];
        subjectCounters['International Relations'] = count + 1;
        const topicCode = `IR-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS II',
          subjectName: 'International Relations',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['International Relations', cObj.chapter]
        });
      });
    });

    // Insert explicit Economy topics under GS III
    ECONOMY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Economy'];
        subjectCounters['Economy'] = count + 1;
        const topicCode = `ECO-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS III',
          subjectName: 'Economy',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Economy', cObj.chapter]
        });
      });
    });

    // Insert explicit Agriculture topics under GS III
    AGRICULTURE_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Agriculture'];
        subjectCounters['Agriculture'] = count + 1;
        const topicCode = `AGR-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS III',
          subjectName: 'Agriculture',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Agriculture', cObj.chapter]
        });
      });
    });

    // Insert explicit Industry topics under GS III
    INDUSTRY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Industry'];
        subjectCounters['Industry'] = count + 1;
        const topicCode = `IND-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS III',
          subjectName: 'Industry',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Industry', cObj.chapter]
        });
      });
    });

    // Insert explicit Infrastructure topics under GS III
    INFRASTRUCTURE_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Infrastructure'];
        subjectCounters['Infrastructure'] = count + 1;
        const topicCode = `INF-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS III',
          subjectName: 'Infrastructure',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Infrastructure', cObj.chapter]
        });
      });
    });

    // Insert explicit Science & Technology topics under GS III
    SCIENCE_TECHNOLOGY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Science & Technology'];
        subjectCounters['Science & Technology'] = count + 1;
        const topicCode = `ST-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS III',
          subjectName: 'Science & Technology',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Science & Technology', cObj.chapter]
        });
      });
    });

    // Insert explicit Environment & Ecology topics under GS III
    ENVIRONMENT_ECOLOGY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Environment & Ecology'];
        subjectCounters['Environment & Ecology'] = count + 1;
        const topicCode = `ENV-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS III',
          subjectName: 'Environment & Ecology',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Environment & Ecology', cObj.chapter]
        });
      });
    });

    // Insert explicit Internal Security topics under GS III
    INTERNAL_SECURITY_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Internal Security'];
        subjectCounters['Internal Security'] = count + 1;
        const topicCode = `SEC-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS III',
          subjectName: 'Internal Security',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Internal Security', cObj.chapter]
        });
      });
    });

    // Insert explicit Disaster Management topics under GS III
    DISASTER_MANAGEMENT_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Disaster Management'];
        subjectCounters['Disaster Management'] = count + 1;
        const topicCode = `DM-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS III',
          subjectName: 'Disaster Management',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Disaster Management', cObj.chapter]
        });
      });
    });

    // Insert explicit Ethics topics under GS IV
    ETHICS_DATA.forEach(cObj => {
      cObj.topics.forEach(tTitle => {
        const count = subjectCounters['Ethics, Integrity & Aptitude'];
        subjectCounters['Ethics, Integrity & Aptitude'] = count + 1;
        const topicCode = `ETH-${String(count).padStart(3, '0')}`;
        topicsToInsert.push({
          paper: 'GS IV',
          subjectName: 'Ethics, Integrity & Aptitude',
          chapter: cObj.chapter,
          heading: cObj.chapter,
          topicCode: topicCode,
          title: tTitle,
          tags: ['Ethics, Integrity & Aptitude', cObj.chapter]
        });
      });
    });

    // Insert explicit Sociology Paper I topics under Sociology
    SOCIOLOGY_PAPER_1_DATA.forEach(cObj => {
      cObj.headings.forEach(hObj => {
        hObj.topics.forEach(tTitle => {
          const count = subjectCounters['Sociology Paper I'] || 1;
          subjectCounters['Sociology Paper I'] = count + 1;
          const topicCode = `SOC1-${String(count).padStart(3, '0')}`;
          topicsToInsert.push({
            paper: 'Sociology',
            subjectName: 'Sociology Paper I',
            chapter: cObj.chapter,
            heading: hObj.name,
            topicCode: topicCode,
            title: tTitle,
            tags: ['Sociology', 'Sociology Paper I', cObj.chapter, hObj.name]
          });
        });
      });
    });

    // Insert explicit Sociology Paper II topics under Sociology
    SOCIOLOGY_PAPER_2_DATA.forEach(cObj => {
      cObj.headings.forEach(hObj => {
        hObj.topics.forEach(tTitle => {
          const count = subjectCounters['Sociology Paper II'] || 1;
          subjectCounters['Sociology Paper II'] = count + 1;
          const topicCode = `SOC2-${String(count).padStart(3, '0')}`;
          topicsToInsert.push({
            paper: 'Sociology',
            subjectName: 'Sociology Paper II',
            chapter: cObj.chapter,
            heading: hObj.name,
            topicCode: topicCode,
            title: tTitle,
            tags: ['Sociology', 'Sociology Paper II', cObj.chapter, hObj.name]
          });
        });
      });
    });

    console.log(`Parsed ${topicsToInsert.length} clean topics with permanent Topic IDs.`);

    const paperIds = {};
    for (const paperName of ['GS I', 'GS II', 'GS III', 'GS IV', 'Sociology']) {
      let subj = await Subject.findOne({ name: paperName });
      if (!subj) {
        subj = await Subject.create({ name: paperName, description: `${paperName} Syllabus Module` });
      }
      paperIds[paperName] = subj._id;
    }

    console.log('🧹 Wiping existing topics in MongoDB...');
    await Topic.deleteMany({});

    console.log('🌱 Seeding fresh AIS topics into MongoDB...');
    const documents = topicsToInsert.map(t => ({
      subjectId: paperIds[t.paper],
      paper: t.paper,
      subjectName: t.subjectName,
      chapter: t.chapter,
      heading: t.heading,
      topicCode: t.topicCode,
      title: t.title,
      tags: t.tags,
      difficulty: 'Medium',
      status: 'Pending',
      completed: false,
      notes: { theory: '' }
    }));

    await Topic.insertMany(documents);
    console.log(`🎉 SUCCESS! Seeded ${documents.length} clean AIS topics with permanent Topic Codes!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedAISFramework();
