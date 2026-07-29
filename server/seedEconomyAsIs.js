/**
 * Seed Economy Syllabus (GS III) Exactly As Is
 * Run: node seedEconomyAsIs.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const RAW_ECONOMY_TEXT = `
ECONOMY
BASIC ECONOMY
  Indian Economy and issues 
relating to planning
 Indian Economy in Pre-independence   
Period
 Economy on Eve of Independence 
 Challenges 
 Features 
 Post-Independence India 
  Issues 
 Agriculture and its development so far 
 Industry 
 Services 
 Phases of Economic Development in   
India
 Nehruvian Socialist Economy 
 Economic Reforms 
 Planning 
 Objectives 
 Planning History 
 Analysis of each plan 
 Growth & Development 
 Economic Growth in India:
 National Income Determination 
 GDP 
 GNP 
 NDP 
 NNP 
 Personal Income 
 Economic Growth versus   
Economic Development 
 Measures of Economic Development 
 Rise in real per capita income 
 Real gross national product 
 Human development index 
 GDP 
 Gender-related development index 
 Poverty index 
 Economic and Social Development  
in India: Millennium Development  
Goals
 Sustainable Development Goals and   
India
 Employment 
 Resource Mobilization
 Types of resources: Physical capital   
and finance capital
 Need for resource mobilization - Police 
 State and Democratic Welfare State 
 Sources of resource mobilization:  
Public Sector and Private Sector
 Savings and investment over the five   
year plan
 Budgetary resources: Tax and Non tax 
 Role of Public Debt in resource   
mobilization and effects: Market  
borrowing, loans, grants, etc.
 Role of fiscal and monetary policies in   
resource mobilization
 Role of foreign investment in resource   
mobilization, desirability   
and consequences
 Multilateral agencies and resource   
mobilization
 Inclusive growth and issues 
arising from it
 Meaning and concept of Inclusion 
ECONOMY
50 UPSC SYLLABUS 2024-25 www.iasscore.in
 India’s experience 
 Social sector initiatives and inclusion   
process
 Ground reality and working of flagship   
schemes
 India’s growth story in this context 
 Rural economy based growth 
 Need of Sustainable agriculture, food   
security and resilience for growth
 Public distribution schemes: Way to   
inclusive growth
 Financial inclusion as an instrument of   
inclusive growth
 Poverty Alleviation and Employment   
Generation as a strategy for inclusive 
growth
 Social sector development as an   
instrument for inclusive growth
 Public private partnership for inclusive   
growth
 Industrial Integration for inclusive   
growth
 Sectoral and regional diversification as   
a tool for inclusive growth
 Governmental Schemes and Policies for   
inclusive growth
 Pradhan Mantri Jan Dhan Yojana 
 MUDRA (Micro Units   
Development and  Refinance  
 Agency) Bank
 Self Employment and Talent   
Utilization (SETU)
 Skill India 
 Mahatma Gandhi National Rural  
Employment Guarantee   
Act (MGNREGA)
 Kisan Card 
 Pradhan Mantri Krishi Sinchayee  
Yojana (PMKSY)
 National Agriculture Market (NAM) 
 Pradhan Mantri Jeevan Jyoti Beema   
Yojana 
 Pradhan Mantri Jeevan Suraksha 
Yojana 
 Atal Pension Yojana  
 Digital India programme 
  Government Budgeting
 Budget, Economic Survey 
 Budget terminology 
 Types of Budget 
 Features of outcome budgeting 
 Merger of Railway and General Budget 
 Benefits of budgeting 
 Flaws in budgeting process 
 Budget analysis 
 Subsidy 
 Investment Models
 Need for Investment 
 Sources of Investment 
 Measures of Investment 
 Capital and investment 
 Factors affecting investment 
 Classification of Investment 
 Types of Investment Models 
 Investment Models Followed by India 
 Domestic Investment Models
 Public Investment Model 
 Private Investment Model 
 Public Private Participation   
Investment Model
 Foreign Investment Models   
(FDI, FII, etc.)
 Role of State 
 PPP (Public-Private Partnership) 
 Savings and Investment Trends 
 Fiscal policy
 Fiscal Policy in India 
 Important Budgetary Terms and Fiscal   
Concept
 Government Revenues & Spending 
 Deficits and its financing 
 Revenue Deficit 
 Fiscal Deficit  
 Primary Deficit 
 Balance Sheet 
UPSC SYLLABUS 2024-25 www.iasscore.in 51
 Taxation
 Taxation Meaning 
 Principles of Taxation 
 Objectives of Taxation 
 Taxation for Mobilization of Resources 
 Tax System in India 
 Current Taxation Policy of India 
 Subsidies 
 Tax Reforms 
 GST and its progress 
 Retrospective Taxation in India 
 Monetary policy in India
 Instruments of Monetary Policy 
 Monetary policy in pre-reform Era   
(1948–1991)
 Monetary Policy in Post-Reform Era   
(Since 1991)
 Urjit Patel Committee Report 
 Monetary Policy Committee and   
Inflation Targeting
 Financial system
 Indian Financial System – An Overview 
 Components of Indian Financial System 
 Financial Institutions 
 Banking Institutions or Depository   
Institutions 
 Non-Banking Institutions or   
Non-Depository Institutions 
 Others: (Regulatory, Intermediates,   
Non Intermediates)
 Financial Assets (Call Money, Notice   
Money, Term Money, Treasury Bills, 
Certificate of Deposits, Commercial Paper 
Financial Services (Banking Services, 
Insurance Services, Investment Services, 
Foreign Exchange Services)
 Financial Markets (Capital Market,   
Money Markey, Foreign Exchange  
Market, Credit Market)
 Indian financial market and Pandemic 
 Banking
 Banking in India: Definition, Structure   
and Functions
 Origin of Banking system 
 Type of Banks in India 
 Central Bank (Reserve Bank of India) 
 Cooperative Banks 
 Commercial Banks 
 Public Sector Banks (State Bank of   
India)
 Private Sector Bank (HDFC  Bank) 
 Foreign Banks (CITI Bank) 
 Regional Rural Banks 
 Local Area Banks  
 Specialized Banks (SIDBI Bank,   
NABARD)
 Small Finance Banks 
 Payments Banks (Airtel Payment   
Bank) 
 Nationalization of Banks in India 
 Banking Sector Reforms in   
India:Narasimhan Committee 1&2, 
Nachiket Mor Committee, P J Nayak 
Committee
 Development Finance Institutions:   
IFCI, ICICI, SIDBI, IDBI, UTI, LIC, GIC
 New Bank Licence Criteria 
 Non-Banking Financial Company   
(NBFC)
 Financial Inclusion in India: Need   
and future; PMJDY; Payment Banks  
and Small Banks
 NPAs 
 Bills related to Banking 
 NEO BANK 
 The emerging concept of Bad Banks 
 Insurance sector of India 
 Bank privatization  
 Account Aggregator System 
 Domestic systemically important    
banks (D-SIBs) 
 Foreign Trade & International 
Organisations
 International Trade 
 Trade Policy 
 India’s Balance of Payments: 
 Current Account 
52 UPSC SYLLABUS 2024-25 www.iasscore.in
 Capital Account 
 Goods and Services Account 
 India’s BOP Performance: 
 Balance of Payment versus Balance   
of Trade
 Current Account versus Capital   
Account
 Foreign Capital 
 Impact of Globalization on Indian   
Economy
 FDI and FPI in India, External   
Commercial Borrowings 
 Foreign Exchange Rate Determination   
in India 
 Types of Exchange Rate 
 Capital and Current Account   
Convertibility in India
 The Bretton Woods Twins: 
 World Bank 
 International Monetary Fund 
 World Bank Group 
 World Trade Organisation (WTO) and   
India
 ADB, NDB, BRICS Bank, AIIB 
 Bilateral, Regional and Global 
 Groupings and Agreements involving   
India
 Important report and forecasts 
`;

async function main() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing.');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS III Subject
    const subject = await Subject.findOne({ name: 'GS III' });
    if (!subject) {
      console.error('❌ Subject GS III not found.');
      process.exit(1);
    }

    console.log('Asking Gemini to clean up split lines and list all Economy subtopics as a JSON array of strings...');
    const ai = new GoogleGenAI({});
    const prompt = `
    Here is a raw text list of UPSC Economy topics.
    Some lines have been split across lines during copy-pasting (e.g. "Indian Economy and issues" and then "relating to planning" should be "Indian Economy and issues relating to planning").
    Also, remove headers/footers like "ECONOMY", "BASIC ECONOMY", "50 UPSC SYLLABUS 2024-25 www.iasscore.in", "51", "52", "www.iasscore.in".
    Do not summarize, do not skip, and do not omit any single subtopic. Keep all of them!
    Return a JSON array of strings, where each string is a complete topic or subtopic from the list.

    Raw Text:
    ${RAW_ECONOMY_TEXT}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const topicsArray = JSON.parse(response.text);
    console.log(`Gemini cleaned up ${topicsArray.length} total Economy topics.`);

    // Delete any existing Economy topics under GS III
    const deleteRes = await Topic.deleteMany({
      subjectId: subject._id,
      tags: 'Economy'
    });
    console.log(`Deleted ${deleteRes.deletedCount} old Economy topics.`);

    const topicsToInsert = topicsArray.map(title => ({
      title: title.trim(),
      tags: ["Economy"],
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
    console.log(`✅ Successfully seeded all ${inserted.length} Economy topics exactly as is!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
