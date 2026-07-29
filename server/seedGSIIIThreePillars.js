/**
 * Seed Agriculture, Industry, Infrastructure & Contemporary Issues (GS III) Exactly As Is
 * Run: node seedGSIIIThreePillars.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const RAW_TEXT = `
AGRICULTURE
 Role of Agriculture in Indian 
Economy
 Situation of Indian Agriculture 
 Historical background and current   
status
 Cropping Patterns: Types of Cropping  
 Systems: Mono-cropping; Crop   
Rotation; Sequential Cropping; Inter 
Cropping; Relay Cropping
 Issues related to direct and indirect   
farm subsidies and minimum support 
prices
 Farm Subsidies in India: Definition;   
Working; Need; Negative Impacts
 Types of Farm Subsidies in Indian   
Agriculture: Irrigation and Power  
Subsidies; Fertilizer Subsidy; Seed  
Subsidy; Credit Subsidy
 Government Intervention in Indian   
Agriculture
 Minimum Support Prices in Indian   
Agriculture: MSP definition; Working; 
Issues; Drawbacks; Way Ahead; Buffer 
Stocks
 Public Distribution System in India:   
Definition; Issues; Working; Needs; 
Disadvantages
 Targeted PDS in India, Antyodaya   
Anna Yojana (AAY), Alternative  
to the PDS, Direct Benefit Transfers,    
National Food Security Act
 Agriculture Marketing 
 Major crops: Major cropping patterns   
in different parts of the country, 
different types of irrigation, transport 
and marketing of agricultural produce 
and issues and associated constraints; 
e-technology for farmers
 Conclusive Land Titling 
 Biotech-KISAN Program 
 Land resource
 Land-use 
 Land capability classification 
 Causes of Land Degradation 
 Impact of Land Degradation 
 Steps taken by GOI 
 Sustainable Land Management 
 Land Reforms
 Land ownership patterns under the   
British rule
 Zamindari System (Permanent  
settlement of Bengal)
 Ryotwari System  
 Mahalwari System 
UPSC SYLLABUS 2024-25 www.iasscore.in 53
 Land reforms since independence 
 Objectives of land reforms in India 
 Progress of Land Reforms in India 
 Progress of Ceiling Legislation 
 NITI Aayog Report on Land Leasing 
 SVAMITVA (Survey of Villages and   
Mapping with Improvised   
Technology in Village Areas)
 Agriculture Finance
 Features of Agricultural Finance 
 Criteria for Agricultural Credit 
 Need for Agricultural Finance 
 Sources of Agricultural Finance 
 Problems of Agricultural Finance 
 Measures taken to improve credit flow   
to agriculture
 Co-operative Credit Societies in India 
 Derivate Trade in Agriculture   
Commodities
 Important Schemes
 Pradhan Mantri Kisan Maandhan   
Yojana
 PM-Kisan Scheme Paramparagat   
Krishi Vikas Yojana (PKVY)
 Pradhan Mantri Krishi Sinchai Yojana   
(PMKSY)
 Rythu Bandhu Scheme 
 Agricultural Credit Institutions
 Commercial Bank 
 Lead Bank Scheme 
 Multi Agency Approach 
 Regional Rural Banks 
 National Bank for Agriculture and   
Rural Development (NABARD)
 Reserve Bank of India 
 Kisan Credit Card Scheme 
 Self Help Group (SHG) Bank Linkage   
Programme
 Rural Infrastructure Development   
Fund (RIDF)
 Government Policy For Agricultural   
Credit
 Farmers Service Societies (FSS) 
 Crop Insurance in India
 Historical Background 
 Issues Related to Crop Insurance 
 Pradhan Mantri Fasal Bima Yojana 
 Comparison with Earlier Crop   
Insurance Schemes
 Challenges 
 Important Schemes
 Pradhan Mantri Fasal Bima Yojana   
(PMFBY)
 Kisan Credit Card (KCC) Scheme 
 Soil Health Card Scheme 
 National Mission for Sustainable   
Agriculture (NMSA)
 Agriculture Marketing
 Process of Agricultural Marketing in   
India
 Structure of Agricultural Marketing in   
India
 Importance of Proper Agriculture   
Marketing
 Government Measures to Improve    
Agricultural Marketing in India
 Analysis of APMC Act 
 National Agriculture Market (e-NAM) 
 Subsidies
 Subsidy in India 
 Farm Subsidies 
 Fertiliser subsidies 
 Subsidy on power 
  Subsidy on irrigation 
 Issues related to direct and indirect   
farm subsidies and minimum support 
prices
 Objectives of subsidies 
 Transfer of resources from gainers   
from economic policies to losers from 
economic policies
 Issues of buffer stocks and food   
security
 Technology missions 
54 UPSC SYLLABUS 2024-25 www.iasscore.in
 Economics of animal-rearing 
 Public Distribution System: Objectives,   
functioning, limitations, revamping, 
evolution from universal PDS to targeted 
PDS, Targeted PDS, a critical analysis of 
cost and benefit of PDS
 Buffer Stock policy and government’s   
intervention in food market to keep prices 
under reasonable limits to help consumers
 Food Security bill, questions of   
resource mobilization for the FSB,  
criticism of the FSB
 Important questions on the future of   
subsidies
 Agricultural Revolutions in India
 Green Revolution 
 White Revolution – Operation Flood 
 Yellow Revolution 
  Blue Revolution 
 Golden Fiber Revolution: Jute 
 The future of Indian agriculture 
 Data revolution in Indian agriculture 
 Artificial Intelligence & Agriculture 
 Social Security Schemes for Farmers 
 Food Processing
 Food processing and related industries:   
Scope and significance, location, upstream 
and downstream requirements, supply 
chain management.
 Processed Foods Scenario with respect   
to Specific Sectors
 Policy Initiatives 
 Infrastructure Development in Food   
Processing Sector
 Issues in Food Processing Sector 
 FDI Policy in Food Processing 
 Notable Trends in the Indian Food   
Processing Sector
 Strategies Adopted in Budget 
 New foreign and domestic investment 
 Sector-specific government policies 
INDUSTRY
 Industrial Policy and Industrial 
Development: Main Issues
 Mahalanobis strategy and India’s   
industrial policy-Discussing Industrial 
policy resolution 1948 and 1956 critically
 New Economic Policy and   
Industrial policy under the   
policy of Liberalization
 Privatization  
 Globalization 
 Phases of Industrial development 
 Effects of liberalization on the economy 
 Changes in industrial policy and their   
effects on industrial growth
 Impact on Different Sectors of the   
Economy
 Main features of Industrial 
development in India
 Roles of private sector and public   
sector, Investment in the industrial sector, 
employment, productivity, profit etc.
 Strategies for disinvestment and   
privatization
 Role of Small, Medium and Micro   
enterprises, Government Policy, main 
problems, effects of globalization
 New Manufacturing Policy 
 Industrial disbursal and Industrial   
corridors
 SEZs - Main issues like land use,   
relocation of same industries that exist, 
exports earnings vs loss of tax income
 Industrial sickness, institutional   
mechanism to support the sick industries, 
exit policy issues
 Main constraints in the industrial   
development of India
 Effects of globalization on industries 
 Sub-prime crisis and sovereign debt   
crisis on Industry in India
UPSC SYLLABUS 2024-25 www.iasscore.in 55
INFRASTRUCTURE
 Impact of Infrastructure-Economic   
Impacts, impact on social   
development, Environmental impacts
 Transport  
 Ports 
 Ocean transport routes 
 Inland waterways 
 Main regions of inland waterways 
 Roads 
 Importance 
 Government push towards Road   
Infrastructure 
 National Infrastructure pipeline 
 Bharatmala Pariyojana 
 Airports 
 Air routes & Significance 
 Factors influencing air transport 
 Railways  
 Railways: Factors affecting the   
railroads
 Distribution of railroads in the world 
 Energy (Pipeline) 
 Energy Pipeline Transport 
 Petroleum (oil) Pipelines 
 Gas Pipelines 
 Importance and development of   
transport
 Means of transport 
 Transport costs and economic distance 
 Operating costs in transport 
 Government’s transport policy 
 Transport patterns in the world 
  Transport costs and specialization 
 Transport and trade in the modern era 
 Transport costs and scale economies 
 Falling transport costs increase trade   
between neighbours
 Failing transport costs lead to   
concentration within countries
 Negative externalities of transport  
 Important issues 
 Ownership and financing 
 Pricing of Public utilities 
 Infrastructure as avenues for   
investment
 Project delays-reasons and measures   
to overcome Public Private Partnership  
and related issues
 Operation and Maintenance of roads,   
railways, irrigation and power  
projects - Main problems and solutions
 Important Schemes
 PM Gati Shakti National Master Plan 
 Mega Investment Textiles Parks   
(MITRA) Scheme
 National Bank for Financing   
Infrastructure and Development  
(NaBFID) to fund infrastructure  
projects in India
 National Industrial Corridor   
Development Programme (NICDP)
 Recent Development
 Pulses for Food Security and   
Sustainable Future
 General Insurance Amendment Bill 
 Pandora’s papers 
 National Urban Digital Mission 
 ‘One District One Product: A Potential   
Game changer’
 Proposition 22: The Future of the Gig   
Economy
 Central Bank Digital Currency 
 Industrial Finance in India: Role of    
development banking, commercial 
banking, venture capital, angel capital in 
industrialization and promotion of  
entrepreneurship
 Make in India achievements 
 Transformation of MSME sector and   
impact on India
56 UPSC SYLLABUS 2024-25
www.iasscore.in
Virtual Currencies 
Taxing Virtual Currencies 
G-SAP 1.0: Securities acquisition plan   
to boost the market
G7 Corporate Tax Deal 
Major reforms in Natural Gas  
Marketing 
World Inequality Report 
India’s telecom sector and issues 
Shifting towards Green Energy 
Gig Economy and India 
The State of Food and Agriculture 2021 
Fertiliser Shortage in India 
National Monetisation Pipeline 
National Mission on Edible Oil 
Zero defect zero effect scheme 
World Hunger Index 2021 
World Employment and Social  
Outlook – Trends 2022 report
e-Gram Swaraj e-Financial  
Management System
CONTEMPORARY ISSUES
GST Analysis
Issues with Offshore Investments 
Credit Rating Agencies and their 
Implications
Fiscal Federalism in India and GST 
provisions
Issue with Banking System
Issues related to mobilization of capital
Effectiveness of Monetary Policy 
Committee in high fiscal deficit 
situation
Lessons on NPA from Global Banks
Government schemes for Industry
Need for reforms in Market 
infrastructure Institutions
Renewable Energy Sector: goals related 
deadlines
Financing of Infrastructure in India: 
Issues, Challenges and Government 
Steps
Transitioning to a Sustainable Energy 
Ecosystems
Short selling of share
Carbon Tax
Bank failure in US
DBT and Financial Inclusion
RBI’s digital currency: Potential and 
Challenges
The ‘serious’ situation of hunger in 
India
Innovation and India (Global 
Innovation index, 2022)
India’s Energy Security
Rupees depreciation
Global Value Chains: Significance for 
Banking System liquidity & its ‘deficit 
mode’
Impact of the Russia-Ukraine Conflict 
India & its Concerns
Rising New Form of Protectionism
How is India’s exchange rate related to 
its current account deficit, forex reserves 
and balance of Payments.
India’s Employment Scenario
Online Gaming Sector
The Insolvency and Bankruptcy Code
on the Indian Economy
Freebies & their economic viability
India & its race to be in the list of largest 
Economies
Hyper-lapse consumerism
Assessing Indian Economic progress 
since Independence
Required reform in indirect taxation 
(GST 2.0)
Significance of Semiconducting Devices 
in Indian Economy
India’s Fertiliser sector: India as a global 
organic fertilizer hub
Universal basic Income
Reforms in India’s Agriculture
www.iasscore.in
India and the problem of bad loans
Credit challenges: On credit flow 
and all-around capital spendingRBI 
proposed a forward-looking approach 
for loan losses
Digital crop survey in India
Centre to give incentive for banks to 
promote digital payments
The International Year of Millets: how 
India’s govt can promote the cereals in 
2023
Economic Survey 2022- 23
Primary Agricultural Credit Societies
UPSC SYLLABUS 2024-25
57
Just Energy Transition Partnership 
(JET-P)
New Tax Regime
The status and proceeds of 
disinvestment
Bhutan graduated from the ‘Least 
Developed Country’ status
RBI allows banks of other nations to 
trade in rupee
PM MITRA: Seven states selected to 
develop Mega Textile Parks
Prudent Asset Liability management
SEBI getting set to regulate index 
providers
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

    console.log('Asking Gemini to parse the subtopics and tag them appropriately...');
    const ai = new GoogleGenAI({});
    const prompt = `
    Here is a raw text list of UPSC Economy/Agriculture/Industry/Infrastructure/Contemporary Issues subtopics.
    Some lines have been split across lines during copy-pasting (e.g. "Role of Agriculture in Indian" and then "Economy" should be "Role of Agriculture in Indian Economy").
    Also, remove headers/footers like "UPSC SYLLABUS 2024-25 www.iasscore.in 53", "54", "55", "56", "57", "www.iasscore.in", and section titles when they are alone.
    Do not summarize, do not skip, and do not omit any single subtopic. Keep all of them!
    
    You need to return a JSON array of objects, where each object has:
    1. "title": The cleaned, concatenated subtopic title.
    2. "tag": The category tag which must be exactly one of: "Agriculture", "Industry", "Infrastructure", or "Economy".
       - For subtopics belonging to AGRICULTURE or Food Processing, use "Agriculture".
       - For subtopics belonging to INDUSTRY, use "Industry".
       - For subtopics belonging to INFRASTRUCTURE, use "Infrastructure".
       - For CONTEMPORARY ISSUES, map them logically (e.g., agricultural issues to "Agriculture", industrial/infrastructural issues to "Industry" or "Infrastructure", and purely macroeconomic/financial issues to "Economy").

    Raw Text:
    ${RAW_TEXT}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedArray = JSON.parse(response.text);
    console.log(`Gemini parsed and categorized ${parsedArray.length} total subtopics.`);

    // Delete existing Agriculture, Industry, Infrastructure topics under GS III
    const deleteRes = await Topic.deleteMany({
      subjectId: subject._id,
      tags: { $in: ['Agriculture', 'Industry', 'Infrastructure'] }
    });
    console.log(`Deleted ${deleteRes.deletedCount} old GS III topics with these tags.`);

    const topicsToInsert = parsedArray.map(item => ({
      title: item.title.trim(),
      tags: [item.tag],
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
    console.log(`✅ Successfully seeded all ${inserted.length} GS III topics exactly as is!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
