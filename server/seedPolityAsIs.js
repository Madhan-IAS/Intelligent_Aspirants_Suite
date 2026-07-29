/**
 * Seed Polity Syllabus (GS II) Exactly As Is
 * Run: node seedPolityAsIs.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const RAW_POLITY_TEXT = `
POLITY
Historical Evolution & Features
 Importance of Constitution 
 Historical evolution of the   
Constitution
 Constituent Assembly 
 Objectives of the Constitution 
 Salient features of Indian Constitution 
 Unitary features 
 Federal features 
 Parliamentary form of government 
 Presidential form of government 
 Parliamentary vs. Presidential system   
of government
 Preamble
 Preamble  
 Basic features 
 Value premises of constitution 
 Terminologies as: 
 Democratic 
 Sovereign 
 Socialist 
 Secular 
 Republic 
 Justice 
 Equality 
 Liberty 
 Fraternity 
 Integrity 
 Amendability of the Preamble 
 Citizenship
 Basic constitutional features 
 Methodology of getting citizenship 
 Modes of Losing the Citizenship of   
India
 Concept of dual citizenship 
 Citizenship provisions in J&K 
 Special privileges enjoyed by citizens   
in India
 Overseas Citizens of India (OCI) and   
Persons of Indian Origin (PIOs)
 Fundamental Rights
 Significance of Fundamental Rights 
 What is State? 
 Right to Equality 
 Right to Freedom 
 Right against Exploitation 
 Right to Freedom of Religion  
 Cultural and Educational Rights 
 Right to Constitutional Remedies 
 Fundamental Rights and Armed   
Forces
 Martial Law & Fundamental Rights 
 Difference between procedure   
established by law and due process  
of law
 Writs and their uses 
 Restrictive limitations on fundamental   
rights
 Rights outside Part III of the   
Constitution
 Dynamic Nature of Article 32 
 Need of Revitalizing Indian   
Reservation System
  DPSP
 Basic features 
 Economic and Social DPSP 
 Gandhian DPSP 
POLITY
UPSC SYLLABUS 2024-25 www.iasscore.in 31
 Administrative DPSP 
  DPSP related to International Peace 
 Implementation of DPSP 
 Fundamental Rights and the Directive   
Principles of State Policy Controversy
 Directives outside Part IV of the   
Constitution
 Application of Uniform Civil Code in   
India
 Fundamental Duties
 Features 
 Link of Fundamental Rights and   
Fundamental Duties
 Other Principles
 Process of law making in India 
 Role of Constitutional and extra   
constitutional bodies in law making
 Basic structure: How it evolves? 
 Different types of majorities required   
in Indian Constitution
 DPSP v. Fundamental Rights 
 Doctrines & Terminologies 
 Separation of Powers
 Features in American and UK   
Constitution
 Checks and balances provisions in   
Indian Constitution
 Judicial Review 
 Concept of Separation of Powers 
 Comparison of the Indian 
constitutional scheme with that of 
other countries
 It should cover comparison of USA,   
UK, India and neighbours
 Union & States
 State Reorganization Commission   
(brief)   
 Components of Indian territory 
 Process of formation of new states 
 Zonal Councils 
 Union territories 
 Special provisions for states 
 Scheduled and Tribal Areas  
 Functions and responsibilities of 
the Union and the States
 Regulating functions of Government 
 Development functions of government 
 Service providing functions of   
government
 Problems in implementation 
 Recommendations for improvement 
 Interrelationship between union,   
state and local government in 
implementation of roles
 Constitutional provisions related to   
financial devolution
 Issues of financial devolution 
 Issues and challenges pertaining 
to the federal structure
 Administrative relations 
 Legislative relations 
 Financial relations 
 Emergency Provisions and Misuse   
of Article 356
 Inter-State relations 
 Issues related to Union List, State   
List & Concurrent List
 Issues related to appointment of   
Governor
 Issues related to state formation 
 Poor devolution of finances 
 Reserving bill for Presidential   
approval
 Central sponsored schemes and issues 
 Special package for different states 
 Issues between Centre and State after   
1990 reforms
 Foreign policy and Centre and State   
Relations
 Inter-State border disputes 
 The President
 Importance of President 
 Qualification  
32 UPSC SYLLABUS 2024-25 www.iasscore.in
 Election procedure 
 Advantages and disadvantages of   
single transferable form of voting
 Presidents’ Term of Office and   
emoluments
 Executive Powers 
 Legislative Powers 
 Emergency Powers 
 Financial Powers 
 Miscellaneous powers 
 Judicial powers 
 Impeachment of President 
 President as nominal head 
 Ordinance making power 
 Passage of bills 
 Misuse of emergency provisions 
 Pardon power 
 Coalition government 
 Vice President
 Office of the Vice-President 
 Functions 
 Comparison between Indian VP and   
American VP
 Prime Minister
 Appointment of PM 
 Functions of PM 
 Role of PM with respect 
 CoM 
 President 
 Lok Sabha 
 Political Party 
 Coalition Government 
 Council of Ministers
 Division of CoM 
 Role of CoM 
 Role of Cabinet 
 Responsibilities of the Ministers 
 Attorney General of India
 Qualification 
 Functions 
 Powers with respect to Parliament 
 Parliament
 Composition of Rajya Sabha 
 Composition of Lok Sabha 
 Qualification and disqualification of   
MPs and MLAs
 Vacation of seats 
 Sessions of Parliament 
 Law making procedure 
 Officers of Parliament and State   
Legislature
 Parliament Proceedings 
 Motions and resolutions in Parliament 
 Powers and Privileges 
 Financial proceedings 
 Comparison of Lok Sabha and   
Rajya Sabha
 Women reservation in Parliament and   
issues
 Lowering of Parliamentary powers 
 Parliamentary committees and their   
working
 Judicial activism and Parliament 
 Delegated legislation and issues 
 The Judiciary
 Integrated judicial system 
 Supreme Court 
 Composition 
 Independence of Supreme Court 
 Jurisdiction of SC 
 Judicial Review 
 High Court 
 Composition 
 Terms and removal 
 Jurisdiction 
 Other powers 
 Lower judiciary 
 Appointment 
 Powers 
 Tribunal & Subordinate Courts 
The role of the Supreme Court of   
India as guardian of the Constitution  
and protector of Fundamental Rights
 Judicial Review 
 PIL 
 Judicial Activism 
 Judiciary appointment 
 Collegiums System 
 NJAC Controversy 
 National Court of Appeal 
 Judicial Accountability 
 Issues of corruption in judiciary 
 Role of Women in Judiciary 
 Need for Virtual Courts 
 Ministries and Departments of the 
Government
 Functioning of Ministries 
 Central Secretariat 
 Cabinet Secretary 
 Field organizations 
 Reforms needed 
 International methodology 
 Local Government
 Provisions of 73rd AA and 74th AA 
 Role and functions of different tiers 
 Municipal Corporations 
 Municipal Councils 
 Nagar Panchayats 
 The steps taken towards women’s   
empowerment
 Role of State Election commission  
 Role of State Finance Commission 
 Smart City Mission & Municipal   
Governance
 Model Panchayat Citizens Charter  
Framework
 Dispute redressal mechanisms and 
institutions
 What is Dispute redressal   
mechanisms?
 Need of Dispute redressal   
mechanisms
 Administrative tribunal and issues 
 Fast Track Courts and issues 
 Gram Nyalayas and issues 
 Parivarik Mahila Lok Adalats and   
issues
 Family Courts and issues 
 Lok Adalat and issues 
 NALSA and issues 
 Dispute redressal for Weaker section 
 Arbitration Mechanism 
 International Arbitrary Centre 
 Commercial Court 
 Comptroller And Auditor-General 
Of India
 Appointment 
 Functions 
 Role of CAG in good governance 
 The Governor
 Appointment, term of office,   
qualification, etc.
 Powers 
 Discretionary powers 
 Ordnance making power 
 Pardoning power of the Governor 
 CM
 Appointment 
 Powers and responsibilities 
 Relationship between the Governor   
and the Chief Minister
 Relationship between CoM and the   
Chief Minister
  The Advocate-General for the 
State
 Appointment 
 Functions 
 State legislature
 The composition of Vidhan Sabha   
and Vidhan Parishad
34 UPSC SYLLABUS 2024-25 www.iasscore.in
 Qualifications of the Members of   
Legislature 
 Powers and Functions of State   
Legislature
 Relationship between both the   
Houses
 Officers of State Legislature 
 Powers, Privileges and Immunities   
of State Legislatures and their Members
 Legislative procedure 
 Governor’s assent to Bills 
 Procedure in Financial Matters/  
Budget
 Constitutional Bodies
 Election Commission 
 Union Public Service Commission 
 State Public Service Commission 
 Finance Commission 
 GST Council 
 National Commission for SCs   
and STs
 Special Officer for Linguistic   
Minorities
 Advocate General of State 
 Non-Constitutional Bodies
 NITI Aayog 
 National and State Human Rights   
Commission
 Central and State Information   
Commission
 Central Vigilance Commission 
 Central Bureau of Investigation 
 Lokpal and Lokayukta 
  Various Constitutional 
Dimensions
 Co-operative Societies 
 Official Languages under the Indian   
Constitution
 Political Dynamics
 Provisions related to Political Parties 
 Rise of Regional Parties in India 
 Election Laws and Electoral Reforms   
in India
 Importance of NRI votes in Indian   
Election System
 Tenth Schedule of the Indian   
Constitution
`;

async function main() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing.');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create GS II Subject
    let subject = await Subject.findOne({ name: 'GS II' });
    if (!subject) {
      console.log('GS II Subject not found. Creating it...');
      subject = await Subject.create({
        name: 'GS II',
        description: 'Governance, Constitution, Polity, Social Justice and International Relations'
      });
    }

    console.log('Asking Gemini to clean up split lines and list all Polity subtopics as a JSON array of strings...');
    const ai = new GoogleGenAI({});
    const prompt = `
    Here is a raw text list of UPSC Polity topics.
    Some lines have been split across lines during copy-pasting (e.g. "Parliamentary vs. Presidential system" and then "of government" should be "Parliamentary vs. Presidential system of government").
    Also, remove headers/footers like "POLITY www.iasscore.in" and "UPSC SYLLABUS 2024-25 31" or "32 UPSC SYLLABUS 2024-25 www.iasscore.in" or "34 UPSC SYLLABUS 2024-25".
    Do not summarize, do not skip, and do not omit any single subtopic. Keep all of them!
    Return a JSON array of strings, where each string is a complete topic or subtopic from the list.

    Raw Text:
    ${RAW_POLITY_TEXT}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const topicsArray = JSON.parse(response.text);
    console.log(`Gemini cleaned up ${topicsArray.length} total Polity topics.`);

    // Delete any existing Polity topics under GS II
    const deleteRes = await Topic.deleteMany({
      subjectId: subject._id,
      tags: 'Polity'
    });
    console.log(`Deleted ${deleteRes.deletedCount} old Polity topics.`);

    const topicsToInsert = topicsArray.map(title => ({
      title: title.trim(),
      tags: ["Polity"],
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
    console.log(`✅ Successfully seeded all ${inserted.length} Polity topics exactly as is!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
