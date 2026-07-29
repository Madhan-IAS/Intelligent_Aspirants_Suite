/**
 * Seed Governance Syllabus (GS II) Exactly As Is
 * Run: node seedGovernanceAsIs.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const RAW_GOVERNANCE_TEXT = `
GOVERNANCE
 Need and importance of 
Government Policies
 Growth and development 
 Human development and human   
capital formation
 Equality (interpersonal and   
interregional) and social justice
 Unity and integrity 
 Trust between state and citizens 
 Governance: Meaning and Scope 
 Good Governance 
 Contemporary debate around   
Governance and Good Governance
 Governance and emerging areas (4th   
Industrial revolution and related 
technologies, gender issues, Ethical 
Governance, Environmental Governance)
 Effective Implementation
 What is effective implementation?   
Best outcomes in view of given time, 
resources and constraints
 Outcome orientation in   
implementation
 Programme impact assessment 
 Analysis of different important   
schemes
 Government intervention
 Good Governance-Role of institutions,   
bureaucrats and other stakeholders
 Transparency and accountability 
 Optimum use of resources - Right   
targeting, plugging leakages and  
wasteful expenditure, use of available 
knowledge, research and innovation.
 Monitoring and evaluation - Outcome  
  Budget, zero base budgeting,   
input-output analysis, cost-benefit  
analysis
 Setting up institutions and regulatory   
norms task forces, steering committees  
and review committees.
 Interventions in emerging areas - 
 Social Media, Data, Privacy, Social  
Sector
  Development Process & Industry
 Difference between Growth and   
Development
 Main Constraints of development 
 Main Stake holders in development   
process
 Self Help Groups 
 Meaning 
 Importance 
 Objectives 
 Institutional Structure and   
organization 
 Funding 
 SHGs and Women Development 
 Women Development and Women  
in Development dynamics
 SHGs and poverty 
 SHGs and Rural Development 
 Micro Finance 
 Meaning and importance 
 Objectives 
GOVERNANCE  
& SOCIAL JUSTICE
GOVERNANCE
UPSC SYLLABUS 2024-25 www.iasscore.in 37
 Structure and Organization 
 Advantages 
 Micro Finance in India 
 Non-Government Organizations 
 What are NGOs? 
 Difference between   
Non-Government Organizations 
(NGOs) and International Non
Government Organizations (INGOs) 
 United Nations Criteria for   
INGO and NGO
 NGOs and development projects 
 NGOs and Community  
development
 NGOs involved in relief and  
rehabilitation 
 NGOs involved in disaster   
management 
 NGOs and advocacy 
 Important aspects of governance, 
transparency and accountability
 Citizen centric governance 
 Features of good governance 
 Legislative accountability 
 Administrative accountability 
 Judicial accountability 
 Ombudsman 
 Whistleblowers concept 
 Anti corruption machinery 
 Role of citizens 
 Role of media 
 Social audit 
 Systematic reforms 
 Social Media and Accountability/   
Transparency/Governance
 Decentralisation 
 Delegation 
 Delegation vs decentralisation 
 Bottom-up governance 
 e-Governance
 Introduction 
 Applications 
 Models 
 Successes 
 Limitations 
 Future prospects 
 Dashboards and Portals of   
E-governance and E-government  - Uses/Impact/Analysis
 Democracy and E-governance 
 E governance and Judiciary 
 E governance and Legislatures 
 Citizens Charters
 Citizens Charters 
 Introduction 
 Models 
 Features 
 CC in India 
 Issues in CC implementation 
 Reform needed  
 Sevottam Framework 
 Citizens and Citizens Charters 
 Role of civil services in a 
democracy
 Concept of civil services 
 Need for civil services 
 Different role of civil services 
 Law making 
 Policy formulation 
 Policy implementation 
 Policy evaluation 
 civil services as protector of   
democracy
 To protect minorities (religious and   
linguistic)
 To promote Inclusive and sustainable   
growth
 Civil Services – Democracy dynamics 
 Civil Services in eras- Post   
38 UPSC SYLLABUS 2024-25 www.iasscore.in
independence/ Post-LPG/in 21st century
 Emerging challenges for Civil Services 
 Reforms - Lateral Entry 
 Capacity building of Civil Services   
(Past to Present) Autonomy
 Frequent transfers and security of   
tenure - concept/benefits/ analysis
 Cadre Policy 
 Performance Appraisal and HR   
policies for Civil Services
 Civil Services Board 
 Pressure groups and formal/
informal asso-ciations and their 
role in the Polity
 What are pressure groups? 
 Types 
 The significance of pressure groups   
in India
 Differentiate between a pressure   
group and a political party
 Evaluation of pressure groups role 
 Pressure groups and new media 
 Politicisation of Pressure Groups 
 Role of pressure groups in governance 
 Issues, pros, cons, challenges for   
Pressure Groups
 Appointment to various 
Constitutional posts, powers, 
functions and responsibilities of 
various Constitutional Bodies
 Appointment of CAG (procedure of   
appointment) - composition of CAG
 Functions and responsibilities of CAG 
 Powers and privileges of CAG (provided 
by constitution and different ACTs of 
Parliament.)
 Appointment of ECI (procedure of   
appointment) - composition of ECI
 Functions and responsibilities of ECI 
 Powers and privileges of ECI (provided  
by Constitution and different acts of 
Parliament)
 Appointment to UPSC (procedure of   
appointment)- composition of UPSC
 Functions and responsibilities of UPSC 
 Powers and privileges of UPSC   
(provided by Constitution and different 
Acts of Parliament.)
 Appointment to Finance commission   
(procedure of appointment) 
 Composition of Finance Commission 
 Functions and responsibilities of   
Finance Commission
 Powers and privileges of Finance   
Commission (provided by Constitution  
and different Acts of Parliament.)
 National Commission for SCs and STs. 
 Other bodies - NGT, NHRC etc. 
 Evaluation of Each body: History/  
Evolution/ Pros/Cons/Issues/ 
Challenges/Way Forward
 Statutory, Regulatory and various 
Quasi-Judicial Bodies
 SEBI 
 CVC 
 CBI 
 Planning Commission 
  NDC 
 PMO 
 Zonal Council 
 TRAI 
 NCLAT 
 IRDA 
 National Human Rights Commission 
 State Human Rights Commission 
 Central Information Commission 
 State Information Commission 
 National Consumer Disputes Redressal   
Commission
 Tribunal 
 Medical Council of India 
 Pension Fund Regulatory and   
Development Authority
 Biodiversity Authority of India 
 Press Council of India 
 Forward Markets Commission 
 Inland Waterways Authority of India 
UPSC SYLLABUS 2024-25 www.iasscore.in 39
 RBI 
 Evaluation of Each body: History/  
Evolution/ Pros/Cons/Issues/
Challenges/Way Forward
 Elections in India
 Salient features of the Representation   
of People Act, 1950
 Salient features of Representation of   
Peoples Act, 1951
 Electoral reforms 
 Criminalization of politics 
 Negative or neutral voting 
 State funding of Elections 
 Irregularities in polling 
 Electoral Bonds 
 Political Parties in India
 Political parties in India 
 Party reforms 
 Problems in the working of parties 
 Casteism and politics 
 Reforms in Party system in India 
 Strengthening of Anti-defection   
measures
 Coalition Governments and dynamics 
 Role of Pressure Groups
 Types of pressure groups 
 Role of pressure group in developing   
countries
 Functions of pressure groups in India 
 Pressure groups methods 
 Pressure groups and Democracy 
 Criticism of pressure groups 
 Local Government and 
Governance
 Issues of Funds, Functions and   
Functionaries.
 Local Government and Vulnerable   
Sections (SC/ST/OBC/Women/
Transgenders/Migrants/Children/
Disabled etc.)
 Local Government and emerging   
issues (Disaster Management,  
Technology)
 Localism 
 Neo-Localism 
 Subsidiarity 
 Vulnerable Sections (issues/
challenges/ solutions/laws/
interventions)
 SC 
 ST 
 OBC 
 Migrants 
 Women 
 Disabled 
 Children 
 Refugees 
 Transgenders 
 LGBT 
 Manual Scavengers 
 People with Special needs etc. 
 Poverty, Hunger and Health 
(Evaluation/ issues/challenges/
solutions/committees/ 
commissions/ Programs/
institutions/ international 
comparisons)
 Poverty 
 Hunger 
 Health 
 Malnutrition 
 Unemployment 
 Distress Migration 
 Schemes - MGNREGA, PM POSHAN,   
Ayushman Bharat etc
 Policies - NHP, NEP etc. 
 Miscellaneous
 ‘Concern about democracy in the   
digital age’
 Indices and Rankings – Domestic and   
International (e.g. Global Hunger Index, 
40 UPSC SYLLABUS 2024-25 www.iasscore.in
NITI Ayyog’s, NIRF etc.)
 Reports - Domestic/international/   
governmental/Independent
 Internet shutdowns 
 Committees and Commissions   
(Findings/recommendations/ Anlaysis)
 Co-operatives 
 MSME  
 One nation one ration card/One   
district one product
 Aspirational districts 
 Sustainable Development Goals and   
India
 Entitlement portability 
 Fake news, Hate speech 
 Recent interventions (e.g. Laws -   
Privacy/Crypto currency/Uniform  
Civil Code/ Termination of  
Pregnancy etc.
 IT rules - regulating the OTT and   
Digital Media
 Missions (Jal Jeevan mission/Gati   
Shakti etc)
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

    console.log('Asking Gemini to clean up split lines and list all Governance subtopics as a JSON array of strings...');
    const ai = new GoogleGenAI({});
    const prompt = `
    Here is a raw text list of UPSC Governance topics.
    Some lines have been split across lines during copy-pasting (e.g. "Human development and human" and then "capital formation" should be "Human development and human capital formation").
    Also, remove headers/footers like "GOVERNANCE & SOCIAL JUSTICE" and "UPSC SYLLABUS 2024-25 www.iasscore.in 37" or "38 UPSC SYLLABUS 2024-25 www.iasscore.in" or "40 UPSC SYLLABUS".
    Do not summarize, do not skip, and do not omit any single subtopic. Keep all of them!
    Return a JSON array of strings, where each string is a complete topic or subtopic from the list.

    Raw Text:
    ${RAW_GOVERNANCE_TEXT}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const topicsArray = JSON.parse(response.text);
    console.log(`Gemini cleaned up ${topicsArray.length} total Governance topics.`);

    // Delete any existing Governance topics under GS II
    const deleteRes = await Topic.deleteMany({
      subjectId: subject._id,
      tags: 'Governance'
    });
    console.log(`Deleted ${deleteRes.deletedCount} old Governance topics.`);

    const topicsToInsert = topicsArray.map(title => ({
      title: title.trim(),
      tags: ["Governance"],
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
    console.log(`✅ Successfully seeded all ${inserted.length} Governance topics exactly as is!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
