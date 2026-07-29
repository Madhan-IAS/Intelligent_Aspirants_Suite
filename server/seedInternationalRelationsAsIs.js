/**
 * Seed International Relations Syllabus (GS II) Exactly As Is
 * Run: node seedInternationalRelationsAsIs.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const RAW_IR_TEXT = `
INTERNATIONAL RELATIONS
 Evolution and Key Principles of 
Indian Foreign Policy 
 Indian Foreign Policy
 Determinants of India’s   
Foreign Policy 
 Factors determining India’s Foreign   
Policy
 Non-Aligned Movement 
 NAM 2.0 
 Panchsheel 
 India’s Nuclear Doctrine 
 Evolution of Neighbourhood Policy 
 Look East Policy, Act East Policy 
 Look West Policy, Act West Policy 
 Indian Diaspora
 Role played by Indian Diaspora 
 Issue of safety of Indians abroad 
 Schemes for Welfare of Overseas   
Indian
 Bilateral Relations 
 India & Neighbours
 India – Nepal Relations
 Background of Relation 
 Cooperation between India & Nepal 
 Contentions in relations between   
India & Nepal
 The Issue of Water and   
Hydropower Cooperation
 Recommendations to Improve  
Relations 
 External Influences 
 India and Bhutan
 Economy: A Broad Overview 
 India, Bhutan and China: Issues 
 Indo-Afghan Bilateral Relations
 A Long History of Bilateral Relations 
 The India-Afghanistan   
Development Partnership
 Strategic factors undergirding   
India’s Partnership with Afghanistan
 Afghanistan after NATO  
Withdrawal 
 Options for India is Afghanistan  
 Presence of Taliban 
 India-Bangladesh Relations
 Development Partnership 
 India-Bangladesh Relations in   
line with ‘Look East’ policy
 Boundary Agreements  
 Teesta River Dispute 
 India-Maldives Relations
 Geostrategic Importance of Maldives 
 Development Cooperation 
 Security Risks 
 India-Sri Lanka Relations
 Commercial Relations 
 Developmental Cooperation 
 Fishermen Issue 
 India-Myanmar Relations
 Relation through ages 
 Recent change in policy 
 China Role 
 Indo-Pak Relations
 Cooperation between India   
& Pakistan 
 Major Crisis 
 Water Dispute 
INTERNATIONAL 
RELATIONS
UPSC SYLLABUS 2024-25 www.iasscore.in 45
 Issue of Terrorism and Proxy Wars 
 Indian–Russia
 Cooperation between India and   
Russia 
 Strategic Cooperation 
 Major Concerns 
 Russia–China Impact in India 
 Indo–China Relations
 Economic Relation 
 China India Water Related Issue 
 “String of Pearls Strategy” Chain   
Diamonds
 China’s Maritime Silk Route 
 Implications for India 
 Militarisation of Belt and Road  
Initiative (BRI)
 Confidence Building Measures   
(CBMs) 
 Boarder Disputes 
 South China Sea Dispute 
 Main Disputes 
 Resources as a Driver of Competition 
 Attempts for Resolution 
 India and South China Dispute 
  Security Challenges in the Indian 
Ocean Region
 The Pivot to Asia – US Policy Shift 
 South China Sea- Issues of Mistrust 
 Piracy off the Coast of Somalia 
 Neighbourhood Issues and   
Terrorism 
 Energy Routes 
 Fisheries and Livelihood Issues 
 Environmental Security 
 Declaration of Indian Ocean as   
Zone of Peace
 India and Asian Nations relations  
 India & Asian Nations relations
 CIS Countries of Central Asia
 India-Turkmenistan 
 India-Kazakhstan 
 India Tajikistan 
 China And Central Asia 
 International North-South   
Transport Corridor
 Shanghai Cooperation Organisation 
 India-Mongolia
 India-Mongolia Bilateral   
Cooperation 
 Deal on Uranium Supply 
 India–UAE
 Political and economic relation 
 Oil Economic Relation 
 India–Iran
 Iran Nuclear Deal and India 
 India–Iran Relations 
 US-Geopolitical and Geo-Economic   
Consideration in Iran
 India–Israel
 Israel and Palestine Conflict 
 India–Israel Relations 
 India–Saudi Arabia
 Areas of Cooperation 
 Challenges in relations 
 Asia-Pacific Region
 Zones of Activity 
 Regional Groupings 
 Geopolitics of Asia Pacific 
 India-South East Asia
 Steps in Indo-ASEAN Relations 
 India-ASEAN Security Co-operation 
 Indo-Japan Bilateral Relationship
 Economy Centric Relationship 
 Contemporary Perspective 
 India–South Korea
 India–South Korea Relations 
 Economic Partnership in Recent   
Years 
46 UPSC SYLLABUS 2024-25 www.iasscore.in
 India–Vietnam
 Economic Cooperation 
 Strategic Cooperation 
 Geo-political Issues concerning   
India–Vietnam Energy Cooperation
 China’s Response 
 India’s Response 
 India & Other Nation
 India and Africa
 Historical Connections 
 Gandhi’s Role 
 Nehru’s Role 
 Strengthening of Ties 
 South-South Engagement 
 Current Dynamics 
 Economic Cooperation 
 Human resources development and   
capacity building
 Energy Cooperation 
 Military Security Co-operation 
 Trade Policy  
 Afro-Indian Trade 
 Indian investment in Africa 
 African investment in India 
 Development cooperation and   
assistance
 India–Australia
 Immigration Issue and Indian   
Diaspora
 Economic Relationship 
 Issue of Nuclear Cooperation 
 India–France
 Strategic Partnership 
 Prime Minister’s Recent Visit   
to France 
 India–Germany
 Indian–Germany Economic   
Relations 
 India–United Kingdom
 India & UK Relations 
 Brexit 
 India & BREXIT 
 India–USA
 Area of Co-operation: Strategic   
Consultations
 Area of Co-operation:   
Counterterrorism   
and Internal Security
 Area of Co-operation: Trade and   
Economic
 Area of Co-operation: Energy and   
Climate Change
 Area of Co-operation: Science &   
Technology (S & T) and Space
 Area of Co-operation: People   
to People Ties
 Area of Co-operation: Defence   
Cooperation
 Intellectual Property Issues 
 India and International   
Organisations 
 Indo-Pacific Relations 
 Quadrilateral Security Dialogue   
(QUAD) 
 India and Generalised System of   
Preference (GSP)
 Multilateral Relations
 The World Trade Organization
 Representation in the WTO and   
Economic Groupings
 How the WTO takes Decisions? 
 The WTO Secretariat and Budget 
 How Countries Join the WTO 
 Assisting Developing and Transition   
Economies Specialized Help for Export 
Promotion
 The WTO’s Part in Global   
Economic Policy-making
 Nairobi Package  
 WTO and protectionism 
 WTO and IPR 
 WTO reforms 
 WTO and India 
 WTO and Agriculture Issues of   
developing nations
 WTO and Free Trade Agreements   
(FTAs) 
UPSC SYLLABUS 2024-25 www.iasscore.in 47
  International Monetary Fund
 International Monetary Fund (IMF) 
 IMF Reforms 
 Nuclear Security 
 Nuclear Security Summit 
 Threats of Nuclear Terrorism 
 Missile Technology Control Regime   
(MTCR)
 Nuclear Suppliers Group (NSG) 
 NSG Membership for India 
 Nuclear Non-Proliferation Treaty   
(NPT) 
 BRICS
 Economic Environment in BRICS   
Countries
 BRICS-BIMSTEC  
 BRICS & India 
 BIMSTEC
 BIMSTEC & India 
 Convention on Mutual Legal   
Assistance in Criminal Matters
 IBSA
 IBSA Potential 
 Need for Revitalizing IBSA 
 India’s Policy Options 
 Technological Collaboration  
 SAARC
 Prospects For SAARC 
 Indo-Pak Conflict 
 Problem of Resource Development 
 India–ASEAN Economic Cooperation
 Singapore 
 Vietnam 
 Indonesia 
 India ASEAN FTA in Service 
 Global Institutions
 United Nations & its Bodies 
 Structure of United Nations 
 United Nations General Assembly   
(UNGA)
 United Nations Security Council   
(UNSC)
 India & UNSC 
 Economic and Social Council 
 International Court of Justice (ICJ) 
 UN Specialised Agencies 
 Food & Agriculture Organization   
(FAO)
 International Civil Aviation   
Organization (ICAO)
 International Labour Organization   
(ILO)
 International Maritime Organization   
(IMO)
 International Telecommunication   
Union (ITU)
 United Nations Educational, Scientific   
and Cultural Organization (UNESCO)
 International Fund for Agricultural   
Development (IFAD)
 World Health Organization (WHO)   
and Question over its Credibility
 World Meteorological Organisation   
(WMO)
 WIPO 
 World Bank 
 International Monetary Fund (IMF) 
 Important Key Concepts
 New World Order 
 Dynamics of New World Order 
 New Cold War? 
 Personality as factor in Indian Foreign 
Policy
 Economic Crises in Sri Lanka
 Limitations of Soft Power 
 India, Russia and the new era of global 
politics
CONTEMPORARY ISSUES
48 UPSC SYLLABUS 2024-25
www.iasscore.in
Impact of China Plus One Strategy
Harnessing New Opportunities in a 
World of Declining Multilateralism
Minilateralism: Weighing the Prospects 
for Cooperation and Governance
Blue Economy in the Indo-Pacific
Southeast Asia: Importance in the US’ 
Indo-Pacific strategy
India and Geopolitics of Technology
Intersecting Geo-economics and 
Geopolitics: Nord Stream 2 and Europe
Blue Opportunities for Green 
Development of Pacific Island Countries
Geopolitical implications of green 
hydrogen economy
Prospects of Indian Diaspora in the 
politics abroad
Rise in conflict & impact on 
globalization
War Crimes and Rules of War
Multilateralism-changing notion
NATO and India’s strategic autonomy
Multilateralism-changing notion
India’s refugee policy
India’s G20 Presidency and 
Opportunities:
Role of UNHCR
India’s Antarctic Bill, 2022:
India’s Soft Power and its limitations
India’s Africa Outlook
FATF and Pakistan
WHO’s role in recent times
Restructuring of Global Financial 
Institutions:
India’s role in changing world order 
Emerging Climate Diplomacy
UN’s High Seas Treaty
`;

async function main() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing.');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS II Subject
    const subject = await Subject.findOne({ name: 'GS II' });
    if (!subject) {
      console.error('❌ Subject GS II not found.');
      process.exit(1);
    }

    console.log('Asking Gemini to clean up split lines and list all IR subtopics as a JSON array of strings...');
    const ai = new GoogleGenAI({});
    const prompt = `
    Here is a raw text list of UPSC International Relations (IR) topics.
    Some lines have been split across lines during copy-pasting (e.g. "Evolution and Key Principles of" and then "Indian Foreign Policy" should be "Evolution and Key Principles of Indian Foreign Policy").
    Also, remove headers/footers like "INTERNATIONAL RELATIONS", "UPSC SYLLABUS 2024-25 www.iasscore.in 45", "46 UPSC SYLLABUS", "47", "48 UPSC SYLLABUS 2024-25", "www.iasscore.in", and "CONTEMPORARY ISSUES".
    Do not summarize, do not skip, and do not omit any single subtopic. Keep all of them!
    Return a JSON array of strings, where each string is a complete topic or subtopic from the list.

    Raw Text:
    ${RAW_IR_TEXT}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const topicsArray = JSON.parse(response.text);
    console.log(`Gemini cleaned up ${topicsArray.length} total IR topics.`);

    // Delete any existing International Relations topics under GS II
    const deleteRes = await Topic.deleteMany({
      subjectId: subject._id,
      tags: 'International Relations'
    });
    console.log(`Deleted ${deleteRes.deletedCount} old IR topics.`);

    const topicsToInsert = topicsArray.map(title => ({
      title: title.trim(),
      tags: ["International Relations"],
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
    console.log(`✅ Successfully seeded all ${inserted.length} IR topics exactly as is!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
