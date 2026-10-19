/**
 * seedRameshSinghEconomy.js
 * 
 * Adds ~200+ subtopics from Ramesh Singh's Indian Economy book (22 chapters)
 * to the GS III → Indian Economy section. APPENDS only — does NOT delete
 * existing topics. Skips duplicates by title.
 * 
 * Run: node seedRameshSinghEconomy.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

// ─── All 22 Ramesh Singh Chapters with granular subtopics ───────────────────
const RAMESH_SINGH_CHAPTERS = [
    // ━━━ Chapter 1: Introduction to Economics ━━━
    {
        chapter: 'Introduction to Economics',
        heading: 'Basic Concepts',
        topics: [
            'Meaning, Scope and Nature of Economics',
            'Microeconomics vs Macroeconomics',
            'Economic Activities: Production, Consumption and Distribution',
            'Scarcity and Choice: Core Economic Problem',
            'Sectors of Economy: Primary, Secondary, Tertiary, Quaternary and Quinary',
            'Types of Economies: Capitalist (Market) Economy',
            'Types of Economies: Socialist (Command/State) Economy',
            'Types of Economies: Mixed Economy',
            'Washington Consensus, Beijing Consensus and Santiago Consensus',
            'Open Economy vs Closed Economy',
        ]
    },

    // ━━━ Chapter 2: National Income ━━━
    {
        chapter: 'National Income',
        heading: 'National Income Accounting',
        topics: [
            'Concept and Significance of National Income',
            'Gross Domestic Product (GDP): Meaning and Calculation',
            'Gross National Product (GNP) and Net Factor Income from Abroad',
            'Net Domestic Product (NDP) and Depreciation',
            'Net National Product (NNP) at Factor Cost (National Income)',
            'Factor Cost vs Market Price',
            'Nominal GDP vs Real GDP and GDP Deflator',
            'Gross Value Added (GVA) at Basic Prices',
            'Per Capita Income: Calculation and Relevance',
            'Methods of Measuring National Income: Production/Output Method',
            'Methods of Measuring National Income: Income Method',
            'Methods of Measuring National Income: Expenditure Method',
            'Personal Income and Disposable Personal Income',
            'Base Year Revision and CSO/NSO Methodology',
            'Green GDP and Green Accounting',
            'Limitations of GDP as a Measure of Welfare',
        ]
    },

    // ━━━ Chapter 3: Growth, Development and Happiness ━━━
    {
        chapter: 'Growth, Development and Happiness',
        heading: 'Growth & Development Indicators',
        topics: [
            'Economic Growth vs Economic Development: Definitions and Differences',
            'Measuring Development: Physical Quality of Life Index (PQLI)',
            'Human Development Index (HDI): Parameters and Calculation',
            'Inequality-adjusted HDI (IHDI)',
            'Gender Development Index (GDI) and Gender Inequality Index (GII)',
            'Multidimensional Poverty Index (MPI)',
            'Inclusive Growth: Pillars, Objectives and Challenges in India',
            'Sustainable Development Goals (SDGs): Framework and India\'s Performance',
            'Gross National Happiness (GNH) and Easterlin Paradox',
            'World Happiness Report and Well-being Metrics',
        ]
    },

    // ━━━ Chapter 4: Evolution of Indian Economy ━━━
    {
        chapter: 'Evolution of Indian Economy',
        heading: 'Historical Economic Journey',
        topics: [
            'Pre-British Indian Economy: Structure and Features',
            'British Era: De-industrialisation and Drain of Wealth Theory',
            'Dadabhai Naoroji\'s Drain Theory',
            'Post-Independence: Choice of Mixed Economy Model',
            'Nehruvian-Mahalanobis Strategy of Development',
            'Import Substitution Industrialisation (ISI) Strategy',
            'License Raj and Hindu Rate of Growth',
            'Balance of Payments Crisis of 1991',
            'Emergency Stabilisation Measures of 1991',
        ]
    },

    // ━━━ Chapter 5: Economic Planning ━━━
    {
        chapter: 'Economic Planning',
        heading: 'Planning Framework',
        topics: [
            'Concept, Objectives and Types of Economic Planning',
            'Imperative vs Indicative Planning',
            'Pre-Independence Plans: Visvesvaraya Plan (1934)',
            'Pre-Independence Plans: Bombay Plan (1944)',
            'Pre-Independence Plans: Gandhian Plan and People\'s Plan',
            'Planning Commission: Structure, Evolution and Role',
            'Financing of Five-Year Plans: Domestic and External Resources',
        ]
    },

    // ━━━ Chapter 6: Planning in India ━━━
    {
        chapter: 'Planning in India',
        heading: 'Five Year Plans & NITI Aayog',
        topics: [
            'First Five Year Plan (1951-56): Harrod-Domar Model',
            'Second Five Year Plan (1956-61): Mahalanobis Model (Heavy Industrialisation)',
            'Third to Fifth Five Year Plans: Key Features and Outcomes',
            'Sixth to Eighth Five Year Plans: Liberalisation Era Planning',
            'Ninth to Twelfth Five Year Plans: Inclusive Growth Focus',
            'Achievements and Failures of Indian Planning',
            'Critique of Top-Down Planning and Transition to NITI Aayog',
            'NITI Aayog: Objectives, Composition and Major Verticals',
            'NITI Aayog Indices: SDG India Index, Health Index, Innovation Index',
            'Cooperative Federalism and Competitive Federalism',
        ]
    },

    // ━━━ Chapter 7: Economic Reforms ━━━
    {
        chapter: 'Economic Reforms',
        heading: 'LPG Reforms',
        topics: [
            'Background and Causes of 1991 Economic Reforms',
            'Stabilisation vs Structural Adjustment Programmes',
            'Liberalisation: Industrial Delicensing and Deregulation',
            'Liberalisation: Financial Sector Reforms',
            'Liberalisation: Trade Policy Reforms',
            'Privatisation: Disinvestment Strategies and Strategic Sale',
            'Globalisation: FDI and FPI Policy Reforms',
            'Globalisation: Convertibility of Rupee (Current and Capital Account)',
            'First Generation Reforms (1991-2000)',
            'Second Generation Reforms: Structural and Institutional Changes',
            'Third Generation Reforms: IBC, GST, PLI Schemes',
            'Impact of LPG Reforms on Indian Economy',
        ]
    },

    // ━━━ Chapter 8: Inflation and Business Cycle ━━━
    {
        chapter: 'Inflation and Business Cycle',
        heading: 'Inflation Concepts & Management',
        topics: [
            'Inflation: Definition, Causes and Effects on Economy',
            'Demand-Pull Inflation vs Cost-Push Inflation',
            'Structural Inflation and Bottlenecks in India',
            'Core Inflation vs Headline Inflation',
            'Types: Galloping Inflation, Hyperinflation, Creeping Inflation',
            'Deflation, Disinflation, Stagflation, Reflation and Skewflation',
            'Consumer Price Index (CPI): CPI-IW, CPI-AL, CPI-Rural, CPI-Urban, CPI-Combined',
            'Wholesale Price Index (WPI): Structure and Weightages',
            'Producer Price Index (PPI) and GDP Deflator',
            'Winners and Losers of Inflation: Impact on Different Groups',
            'Monetary Policy Measures for Inflation Control',
            'Fiscal Measures and Supply-Side Management for Inflation',
            'Flexible Inflation Targeting (FIT) Framework',
            'Monetary Policy Committee (MPC): Structure and Mandate (4% ± 2%)',
            'Phillips Curve and Inflation-Unemployment Trade-off',
            'Business Cycle Phases: Boom, Recession, Depression and Recovery',
        ]
    },

    // ━━━ Chapter 9: Agriculture and Food Management ━━━
    {
        chapter: 'Agriculture and Food Management',
        heading: 'Agricultural Economy',
        topics: [
            'Role of Agriculture in Indian Economy: GDP and Employment Share',
            'Evolution of Agricultural Policy since Independence',
            'Land Reforms: Abolition of Intermediaries, Tenancy Reforms, Land Ceiling',
            'Green Revolution: Success, Regional Spread and Ecological Consequences',
            'Evergreen Revolution Concept',
            'Agricultural Pricing Policy: MSP and Fair & Remunerative Price (FRP)',
            'Commission for Agricultural Costs and Prices (CACP)',
            'Food Corporation of India (FCI) and Buffer Stocking',
            'Public Distribution System (PDS): Universal vs Targeted',
            'National Food Security Act (NFSA) 2013',
            'Agricultural Marketing Reforms: e-NAM, APMC Reforms',
            'Contract Farming and Farmer Producer Organisations (FPOs)',
        ]
    },

    // ━━━ Chapter 10: Industry and Infrastructure ━━━
    {
        chapter: 'Industry and Infrastructure',
        heading: 'Industrial Policy & Infrastructure',
        topics: [
            'Industrial Policy Resolutions: IPR 1948, 1956 and 1991',
            'MSME Sector: Definition, Classification, Significance and Challenges',
            'Make in India and National Manufacturing Policy',
            'Ease of Doing Business: India\'s Progress and Reforms',
            'Public Sector Undertakings: Navratna, Maharatna, Miniratna Status',
            'National Asset Monetisation Pipeline',
            'Energy Sector: Power Generation and Renewable Energy Transition',
            'Transport Infrastructure: Roads, National Highways, Bharatmala, Sagarmala',
            'Transport Infrastructure: Railways Modernisation and Dedicated Freight Corridors',
            'Telecom and Digital Infrastructure',
            'Public-Private Partnership (PPP) Models: BOT, BOOT, HAM, Hybrid Annuity',
        ]
    },

    // ━━━ Chapter 11: Services Sector ━━━
    {
        chapter: 'Services Sector',
        heading: 'Growth of Services',
        topics: [
            'Services Sector: Contribution to GDP, Employment and Exports',
            'IT and IT-enabled Services (IT-BPM) Sector',
            'Tourism and Hospitality Sector in India',
            'Financial Services and Real Estate Sector',
            'Retail and Logistics Sector',
            'Start-up Ecosystem in India: Unicorns and Start-up India Initiative',
            'Space Economy and Commercialisation',
            'Challenges: Skill Shortages, Global Protectionism, Gig Workforce',
        ]
    },

    // ━━━ Chapter 12: Indian Financial Market ━━━
    {
        chapter: 'Indian Financial Market',
        heading: 'Financial System Structure',
        topics: [
            'Structure of Indian Financial System: Organised vs Unorganised',
            'Money Market vs Capital Market: Key Distinctions',
            'Money Market Instruments: Treasury Bills (T-Bills)',
            'Money Market Instruments: Commercial Paper (CP) and Certificate of Deposit (CD)',
            'Money Market Instruments: Call Money, Notice Money and Term Money',
            'Money Market Instruments: Repo and Reverse Repo Transactions',
            'Capital Market: Primary Market (IPOs, FPOs, QIPs)',
            'Capital Market: Secondary Market (BSE, NSE) and Trading Mechanisms',
            'Financial Regulators: Overview of RBI, SEBI, IRDAI, PFRDA',
            'Financial Inclusion: Jan Dhan Yojana and Digital Payments Ecosystem',
        ]
    },

    // ━━━ Chapter 13: Banking in India ━━━
    {
        chapter: 'Banking in India',
        heading: 'Banking Structure & RBI',
        topics: [
            'Evolution of Banking: Pre-Independence to Nationalisation (1969, 1980)',
            'Structure of Indian Banking: Scheduled vs Non-Scheduled Banks',
            'Commercial Banks: Public Sector, Private Sector and Foreign Banks',
            'Regional Rural Banks (RRBs): Structure and Role',
            'Cooperative Banks: Structure, Role and Challenges',
            'Differentiated Banks: Payment Banks and Small Finance Banks',
            'Reserve Bank of India (RBI): Functions and Role as Central Bank',
            'Monetary Policy Tools (Quantitative): Repo Rate and Reverse Repo Rate',
            'Monetary Policy Tools: Liquidity Adjustment Facility (LAF) and MSF',
            'Monetary Policy Tools: Bank Rate, CRR and SLR',
            'Open Market Operations (OMOs) and Market Stabilisation Scheme (MSS)',
            'Selective Credit Controls and Moral Suasion',
            'Narasimham Committee Recommendations on Banking Reforms',
            'Non-Performing Assets (NPAs): Definition, Classification and Provisioning',
            'NPA Resolution: SARFAESI Act, IBC and NARCL (Bad Bank)',
            'Prompt Corrective Action (PCA) Framework',
            'Capital Adequacy Ratio (CAR) and Basel Norms (Basel I, II, III)',
            'Priority Sector Lending (PSL) Norms',
            'Digital Banking: UPI, BHIM, CBDC (Digital Rupee)',
            'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
        ]
    },

    // ━━━ Chapter 14: Insurance in India ━━━
    {
        chapter: 'Insurance in India',
        heading: 'Insurance Sector',
        topics: [
            'Evolution of Insurance: Nationalisation of LIC (1956) and GIC (1972)',
            'Insurance Reforms: Malhotra Committee Recommendations',
            'Insurance Regulatory and Development Authority of India (IRDAI)',
            'Life Insurance vs General/Non-Life Insurance',
            'FDI in Insurance: Liberalisation and Investment Caps',
            'Reinsurance: GIC Re and its Role',
            'Export Credit Guarantee Corporation (ECGC)',
            'Deposit Insurance and Credit Guarantee Corporation (DICGC)',
            'Insurance Penetration and Insurance Density in India',
            'Social Security: PM Jeevan Jyoti Bima Yojana (PMJJBY)',
            'Social Security: PM Suraksha Bima Yojana (PMSBY)',
            'Social Security: Atal Pension Yojana (APY)',
        ]
    },

    // ━━━ Chapter 15: Securities Market in India ━━━
    {
        chapter: 'Securities Market in India',
        heading: 'Capital Markets & SEBI',
        topics: [
            'Primary Market: IPOs, FPOs and Qualified Institutional Placements (QIPs)',
            'Secondary Market: Stock Exchanges (BSE, NSE) and Settlement Cycles',
            'Stock Market Indices: SENSEX and NIFTY',
            'Securities and Exchange Board of India (SEBI): Role and Powers',
            'Financial Instruments: Shares, Bonds, Debentures and Mutual Funds',
            'Derivatives: Futures, Options and Credit Default Swaps (CDS)',
            'Foreign Portfolio Investment (FPI) and Participatory Notes (P-Notes)',
            'Angel Investors, Venture Capital and Private Equity',
            'Commodity Trading and Spot Exchanges',
            'GIFT City and India International Exchange (India INX)',
            'Investor Protection and Market Regulations',
        ]
    },

    // ━━━ Chapter 16: External Sector ━━━
    {
        chapter: 'External Sector',
        heading: 'Foreign Trade & BoP',
        topics: [
            'Balance of Payments (BoP): Structure and Components',
            'Current Account: Visible Trade, Invisible Trade and Transfers',
            'Capital Account: FDI, FPI, ECBs, External Assistance',
            'BoP Disequilibrium: Causes, Impacts and Correction Measures',
            'Foreign Exchange Reserves: Components (FCA, Gold, SDRs, RT Position)',
            'Exchange Rate Systems: Fixed, Floating and Managed Float',
            'NEER and REER (Nominal and Real Effective Exchange Rate)',
            'Current Account Convertibility and Capital Account Convertibility',
            'Tarapore Committee on Capital Account Convertibility',
            'From FERA to FEMA: Evolution of Forex Regulation',
            'India\'s Trade Policy: EXIM Trends, Trade Deficit and Major Partners',
            'Special Economic Zones (SEZs) and Export Promotion',
        ]
    },

    // ━━━ Chapter 17: International Economic Organisations ━━━
    {
        chapter: 'International Economic Organisations',
        heading: 'Global Economic Institutions',
        topics: [
            'International Monetary Fund (IMF): Objectives, SDRs, Quota Reforms',
            'World Bank Group: IBRD, IDA, IFC, MIGA, ICSID',
            'World Trade Organisation (WTO): Principles and Key Agreements',
            'WTO Agreements: AoA, TRIPS, TRIMS and GATS',
            'WTO Disputes Involving India',
            'Asian Development Bank (ADB): Role and India\'s Engagement',
            'New Development Bank (NDB / BRICS Bank)',
            'Asian Infrastructure Investment Bank (AIIB)',
            'G20: India\'s Role and G20 Presidency',
            'G7, OECD and India\'s Engagement',
            'Regional Trade Agreements and Free Trade Agreements (FTAs)',
        ]
    },

    // ━━━ Chapter 18: Tax Structure in India ━━━
    {
        chapter: 'Tax Structure in India',
        heading: 'Taxation Framework',
        topics: [
            'Taxation: Objectives — Allocation, Distribution and Stabilisation',
            'Types of Taxes: Progressive, Regressive, Proportional and Degressive',
            'Direct Tax vs Indirect Tax: Incidence and Impact',
            'Personal Income Tax: Slabs, Surcharges and Cess',
            'Corporation Tax: Corporate Tax Cuts and Minimum Alternate Tax (MAT)',
            'Capital Gains Tax and Securities Transaction Tax (STT)',
            'Laffer Curve and Tax-to-GDP Ratio',
            'Pre-GST Indirect Tax System: Excise, VAT and Service Tax',
            'Goods and Services Tax (GST): Constitutional Framework (101st Amendment)',
            'GST Structure: CGST, SGST, IGST and UTGST',
            'GST Council: Structure, Voting Mechanism and Federal Governance',
            'GST Issues: Compensation Cess, Inverted Duty Structure, Exemptions',
            'Tax Reforms: Chelliah Committee, Kelkar Task Force',
            'Faceless Assessment, TDS/TCS and Anti-Tax Avoidance (GAAR, POEM)',
        ]
    },

    // ━━━ Chapter 19: Public Finance in India ━━━
    {
        chapter: 'Public Finance in India',
        heading: 'Government Budgeting & Fiscal Policy',
        topics: [
            'Public Finance: Role of State (Musgrave\'s Three-Branch Model)',
            'Government Budget: Constitutional Provisions (Article 112)',
            'Budget Process: Presentation, Discussion, Voting on Demands for Grants',
            'Appropriation Bill and Finance Bill',
            'Types of Budgets: Performance, Zero-Based, Outcome and Gender Budgeting',
            'Revenue Budget: Revenue Receipts (Tax and Non-Tax)',
            'Revenue Budget: Revenue Expenditure',
            'Capital Budget: Capital Receipts (Recoveries, Disinvestment, Borrowings)',
            'Capital Budget: Capital Expenditure (CapEx)',
            'Revenue Deficit and Effective Revenue Deficit',
            'Fiscal Deficit: Significance, Implications and Financing',
            'Primary Deficit: Meaning and Calculation (FD minus Interest Payments)',
            'Monetised Deficit: Historical Context',
            'FRBM Act 2003: Targets, Escape Clauses and N.K. Singh Committee',
            'Centre-State Financial Relations and Fiscal Federalism',
            'Finance Commission: Vertical and Horizontal Devolution (Article 280)',
            'Grants-in-Aid: Constitutional Provisions and Types',
        ]
    },

    // ━━━ Chapter 20: Sustainability and Climate Change ━━━
    {
        chapter: 'Sustainability and Climate Change',
        heading: 'Environmental Economics',
        topics: [
            'Environmental Economics: Concepts and Principles',
            'Green Bonds and Climate Finance',
            'Carbon Credits, Carbon Tax and Carbon Trading',
            'Sustainable Development: Concept and Brundtland Commission',
            'India\'s Climate Commitments: NDCs, COP Summits and Paris Agreement',
            'India\'s Net Zero Target (2070) and Climate Action Plan',
            'Circular Economy and Resource Efficiency',
            'Environmental Impact Assessment (EIA) and Green Clearances',
        ]
    },

    // ━━━ Chapter 21: Human Development in India ━━━
    {
        chapter: 'Human Development in India',
        heading: 'Social Development Indicators',
        topics: [
            'Human Development: Concept and Paradigm Shifts',
            'HDI: Parameters (Health, Education, Standard of Living) and India\'s Rank',
            'Multidimensional Poverty Index (MPI) and India\'s Progress',
            'Poverty Estimation: Tendulkar Committee and Rangarajan Committee',
            'Types of Unemployment: Structural, Frictional, Disguised, Seasonal, Cyclical',
            'Unemployment in India: Trends, PLFS Data and Policy Responses',
            'Demographic Dividend: Challenges and Opportunities',
            'Health Indicators: MMR, IMR, TFR and Disease Burden',
            'Public vs Private Healthcare Expenditure in India',
            'Education: Literacy, Dropout Rates, National Education Policy (NEP)',
            'Skill Development: Skill India Mission and PMKVY',
            'Social Sector Schemes for Human Development',
        ]
    },

    // ━━━ Chapter 22: Burning Socioeconomic Issues ━━━
    {
        chapter: 'Burning Socioeconomic Issues',
        heading: 'Contemporary Economic Challenges',
        topics: [
            'Wealth Inequality and Income Disparity in India',
            'Gig Economy: Growth, Impact on Labour and Social Security',
            'Digital Divide: Urban-Rural and Income-Based Disparities',
            'AI, Automation and Impact on Employment',
            'Universal Basic Income (UBI): Concept, Debate and India\'s Context',
            'Informal Economy and Formalisation Challenges',
            'Migration and Urbanisation: Economic Impacts',
            'Financial Inclusion: Progress and Remaining Gaps',
        ]
    },
];

// ─── Main function ──────────────────────────────────────────────────────────
async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find GS III Subject
        const subject = await Subject.findOne({ name: 'GS III' });
        if (!subject) {
            console.error('❌ Subject "GS III" not found in database.');
            process.exit(1);
        }
        console.log(`Found GS III subject: ${subject._id}`);

        // Fetch all existing Economy topic titles for deduplication
        const existingTopics = await Topic.find(
            { subjectId: subject._id, tags: 'Indian Economy' },
            { title: 1 }
        ).lean();
        const existingTitles = new Set(existingTopics.map(t => t.title.toLowerCase().trim()));
        console.log(`Found ${existingTitles.size} existing Indian Economy topics.`);

        // Build topics to insert
        const topicsToInsert = [];
        let skippedCount = 0;

        for (const chapterData of RAMESH_SINGH_CHAPTERS) {
            for (const topicTitle of chapterData.topics) {
                const normalised = topicTitle.toLowerCase().trim();
                if (existingTitles.has(normalised)) {
                    skippedCount++;
                    continue;
                }

                topicsToInsert.push({
                    subjectId: subject._id,
                    paper: 'GS III',
                    subjectName: 'Economy',
                    chapter: chapterData.chapter,
                    heading: chapterData.heading,
                    title: topicTitle.trim(),
                    tags: ['Indian Economy', 'GS III'],
                    difficulty: 'Medium',
                    status: 'Pending',
                    completed: false,
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
                });

                // Mark as seen so we don't insert duplicates within our own list
                existingTitles.add(normalised);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Total Ramesh Singh subtopics prepared: ${topicsToInsert.length + skippedCount}`);
        console.log(`   Duplicates skipped: ${skippedCount}`);
        console.log(`   New topics to insert: ${topicsToInsert.length}`);

        if (topicsToInsert.length === 0) {
            console.log('\n⚠️ No new topics to insert. All topics already exist.');
            process.exit(0);
        }

        // Insert new topics
        const inserted = await Topic.insertMany(topicsToInsert);
        console.log(`\n✅ Successfully added ${inserted.length} new Ramesh Singh Economy topics!`);

        // Print breakdown by chapter
        console.log('\n📖 Chapter-wise breakdown:');
        const chapterCounts = {};
        for (const t of topicsToInsert) {
            chapterCounts[t.chapter] = (chapterCounts[t.chapter] || 0) + 1;
        }
        for (const [chapter, count] of Object.entries(chapterCounts)) {
            console.log(`   ${chapter}: ${count} topics`);
        }

        // Final total count
        const totalEconomyTopics = await Topic.countDocuments({
            subjectId: subject._id,
            tags: 'Indian Economy'
        });
        console.log(`\n📈 Total Indian Economy topics now in database: ${totalEconomyTopics}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

main();
