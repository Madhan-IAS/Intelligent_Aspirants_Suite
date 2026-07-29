/**
 * Seed Social Justice Syllabus (GS II) Exactly As Is
 * Run: node seedSocialJusticeAsIs.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const RAW_SOCIAL_JUSTICE_TEXT = `
SOCIAL JUSTICE
Welfare schemes for vulnerable 
sections of the population by the 
Centre and States
 Constitutional arrangement 
 Women welfare 
 Gender technology gap 
 Women in Indian Political System 
 Issue of Marriageable Age for Women 
 Child welfare 
 SC/ST welfare 
 OBC welfare 
 Caste Census 
 Gender reservation in ULB 
 Minorities welfare 
 Old age welfare 
 Legislations Issues and Reforms   
needed
 Services relating to Health, 
Education, Human Resources
 Education structure in India 
 Primary, secondary and higher   
education
 Initiatives taken by GOI in education 
 Reforms needed 
 Recommendations of committees 
 Future prospects in education sector 
 Skill development, indicators,  
 indicators 
 Private and Public health structure 
 NITI Aayog Report 
 Economic development and human   
development
 SDGs and India 
 Issues relating to poverty and 
hunger
 Poverty definition by different   
committees
 Poverty data in India 
 Causes of poverty 
 Poverty and unemployment 
 Poverty and social conflict 
 Impact of LPG on poverty 
 Linkage between poverty and   
development
 Rural poverty 
 Urban poverty 
 Feminization of poverty 
 Poverty alleviation measures 
 Problems in implementation of   
Poverty alleviation programmes
 Poverty and Hunger 
 Food security programmes and issues 
 Hunger and health 
 Impact of hunger and poverty on   
economic development of the nation
 Controversy related to poverty data   
estimation
SOCIAL JUSTICE
UPSC SYLLABUS 2024-25 www.iasscore.in 41
  The Scheduled and Tribal Areas
 5th Schedule Areas 
 6th Schedule Areas 
 Composition of autonomous councils 
 Role and functions of councils 
 Role of Governor with respect to tribal   
areas
 Tribal sub plan 
 Start-up and Skill Development 
 Start Up India Scheme
 Stand up India Scheme 
 National Student Startup Policy 
  National Skill Development Mission 
 Pradhan Mantri Kaushal VikasYojana 
 Deen Dayal Antyodaya Yojana 
 Deen Dayal Upadhyaya Grameen    
Kaushalya Yojana
 Skill Development Initiative Scheme 
 Self-Employment & Talent Utilisation   
(SETU)
 Atal Innovation Mission 
 Vulnerable Sector
 Social Security Scheme 
 Atal Pension Yojana 
 Pradhan Mantri Jeevan Jyoti 
BimaYojana 
 Pradhan Mantri Suraksha Bima  
Yojana 
 Minorities 
 Nai Roshni Scheme 
 USTAAD Scheme (Upgrading   
the Skills  and Training in  
Traditional Arts/Crafts   
for Development)
 Nai Manzil Scheme 
 Women and Child Development 
 Beti Bachao Beti Padhao 
 Sukanya SamriddhiYojana 
 Digital Gudda Guddi Board 
 Sabla 
 Ujjawala Scheme 
 Janani SurakshaYojana 
 Janani Shishu Suraksha Karyakram 
 SC/ST  
 Vanbandhu Kalyan Yojana 
 Pradhan Mantri Adarsh Gram  
Yojana 
 Disability  
 Accessible India Campaign   
(Sugamya Bharat Abhiyan)
 Health
 National Health Mission 
 National Ayush Mission 
 Swasthya Rakshan Program 
 Jan Aushadhi Scheme 
 Mission Indradhanush 
 NFHS-5 survey 
 Education
 Padhe Bharat Badhe Bharat 
 Mid Day Meal Scheme 
 Ishan Uday 
 GIAN (Global Initiative of Academic   
Networks)
 Rashtriya Avishkar Abhiyan 
 SWAYAM (Study Webs of Active -   
Learning for Young Aspiring Minds)
 Rural & Urban Development
 Sansad Adarsh Gram Yojana 
 Gram Uday Se Bharat Uday Abhiyan 
 Shyama Prasad Mukherjee Rurban   
Mission
 Deendayal Upadhyaya Gram Jyoti   
Yojana
 Pradhan Mantri Gram Sadak Yojana 
 Swachch Bharat Abhiyan 
 Pradhan Mantri Awas Yojana- Gramin 
 Pradhan Mantri Awas Yojana - Urban 
 Housing for all by 2022 
 Smart Cities Mission 
 Hriday - National Heritage City   
Development and Augmentation   
Yojana
42 UPSC SYLLABUS 2024-25 www.iasscore.in
 Amrut (Atal Mission for Rejuvenation   
and Urban Transformation)
 Miscellaneous Schemes
 Jeevan Praman 
 Digilocker 
 Bharatnet Project (National Optical   
Fibre Network)
 INSPIRE (Innovation in Science   
Pursuit for Inspired Research)
 SAKAAR 
 Digital India 
 Namami Gange Project (Integrated   
Ganga Conservation Mission Project)
 Ganga Gram Yojana 
 Jal Kranti Abhiyan 
 Khelo India 
 One Rank One Pension Scheme 
 PRAGATI (Pro-Active Governance and   
Timely Implementation)
 Indian Community Welfare Fund   
(ICWF)
 Inclusive growth
 Measurement criteria 
 Government initiatives for inclusive   
growth
 Basic Amenities: Housing/Drinking 
 Waters/Sanitations 
 Sustainable Development 
 Rural Development 
 Rural development and poverty   
alleviation
 Review of the Existing Programmes 
 Development Administration 
 Panchayati Raj 
 Agriculture and Rural Development 
CONTEMPORARY ISSUES
 Democracy in the digital age
 One nation Approach to Welfare and Service 
Delivery
 Evolution of Governance from Food, Shelter, 
clothing to Ease of Living
 Local Bodies and Disaster Management: 
bringing in bottom up Resilience
 SHGs -Cushioning to Rural Governance
 Regulating The Foreign Contribution and 
funding : A much needed safety valve
 Emerging Challenges to Sustainable 
Development and Road Ahead
 Transparent Taxation : From Tax terrorism to 
Tax compliance
 Public Accountability in present times
 Social Audit Law: Modern Means of enforcing 
Accountability
 Climate goals and Development: A search for 
“Win-Win” Solution.
 Online education and India: A stopgap or a 
revolution?
 Rebooting Mid-Day Meals in the post 
pandemic World
 Regulatory Bodies of 21st Century: Embracing 
Technology
 One Nation One Ration Card : A model for 
portability in Governance
 Startups and Governance: A roadmap for 
future
 Governance of future and 4th Industrial 
Revolution.
  Adding Digital layers for democratic 
governance
  Internal Democracy in Political Parties
  Era of Combative Federalism
 One Nation, One Election
 Religion and Conversions
 Open Prison for women
  Is the RTI Act fulfilling its purpose?
  Government to unveil National Data 
Governance Policy
  Punish to Reform: Rajasthan’s Open Prison 
Model
  Transparency in OTT regulation
  Regulating online sale of drugs
  E-postal ballot for overseas Indian voters
 Section 144 of CrPC
 Hate Speech
  Mission Karmayogi civil service reform
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

    console.log('Asking Gemini to clean up split lines and list all Social Justice subtopics as a JSON array of strings...');
    const ai = new GoogleGenAI({});
    const prompt = `
    Here is a raw text list of UPSC Social Justice topics.
    Some lines have been split across lines during copy-pasting (e.g. "Welfare schemes for vulnerable" and then "sections of the population by the Centre and States" should be "Welfare schemes for vulnerable sections of the population by the Centre and States").
    Also, remove headers/footers like "SOCIAL JUSTICE www.iasscore.in 41" and "42 UPSC SYLLABUS 2024-25 www.iasscore.in" or "CONTEMPORARY ISSUES".
    Do not summarize, do not skip, and do not omit any single subtopic. Keep all of them!
    Return a JSON array of strings, where each string is a complete topic or subtopic from the list.

    Raw Text:
    ${RAW_SOCIAL_JUSTICE_TEXT}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const topicsArray = JSON.parse(response.text);
    console.log(`Gemini cleaned up ${topicsArray.length} total Social Justice topics.`);

    // Delete any existing Social Justice topics under GS II
    const deleteRes = await Topic.deleteMany({
      subjectId: subject._id,
      tags: 'Social Justice'
    });
    console.log(`Deleted ${deleteRes.deletedCount} old Social Justice topics.`);

    const topicsToInsert = topicsArray.map(title => ({
      title: title.trim(),
      tags: ["Social Justice"],
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
    console.log(`✅ Successfully seeded all ${inserted.length} Social Justice topics exactly as is!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
