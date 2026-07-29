/**
 * Append Manual GS I Syllabus (India, Human, Economic & Contemporary Geography)
 * Run: node appendManualGS1IndiaEconomicGeography.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const INDIA_ECONOMIC_GEOGRAPHY_AS_IS = [
  "Physiography of India",
  "Location of India",
  "Geopolitical Significance of India",
  "Geological Divisions of India",
  "The Peninsular Block",
  "The Himalayas and other Peninsular Mountains",
  "Indo-Ganga-Brahmaputra Plain",
  "Physiographic Divisions of India",
  "Drainage System - Drainage Patterns",
  "Drainage System of India",
  "Himalayan Drainage System",
  "River Systems of Himalayan Drainage (Indus, Ganga, Brahmaputra)",
  "River Systems of Peninsular Drainage",
  "Small Rivers Flowing Towards East and West",
  "Climate - Factors influencing the climate of India",
  "Monsoon - Mechanism of the Monsoon (Classical & Modern theories, Air mass, Jet stream)",
  "EL-NINO and LA-NINA & their impact on Indian Climate",
  "The rhythm of Seasons (Cold, Hot, SW Monsoon, Retreating Monsoon)",
  "Climatic Regions of India",
  "Soils in India - Classification & textures",
  "Issue of Soil degradation & Soil Erosion",
  "Soil Conservation in India",
  "Natural Vegetation - Types of Forests in India",
  "Forest Cover, Conservation & Problems in India",
  "Demography - Concept of Human Resources & Population Distribution Factors",
  "World population distribution & Continent-wise distribution",
  "Density of population & Patterns of population density",
  "Causes of rapid increase in population & Determinants of population growth",
  "Characteristics of population (Age composition, Population pyramids, Sex composition, Literacy)",
  "Theories of population growth (Malthusian, Marxian, Demographic transition)",
  "Population problems of developing & developed countries (Population dilemma of Europe)",
  "Population Policies of China and India",
  "Various types of rural settlements & Relationship with relief, climate & building materials",
  "Rising Youth Population",
  "Urbanization - Basic Feature & Pattern of India’s Urbanization",
  "Issues of Urbanization in India (Migration, Slums, Transport, Waste, Water, Poverty)",
  "Real Estate (Regulation & Development) Act, 2016",
  "Way Forward to Tackle Issues Related to Urbanization (Inclusive/Smart cities)",
  "Migration, Reverse Migration & Displacement (Push/Pull factors, Rehabilitation policy)",
  "Urban settlements: types, morphology, town planning & patterns",
  "Migration: Emigration during colonial, post-independent and post-liberalisation period",
  "Internal versus world migration",
  "Functional classification of cities & boundaries/frontiers",
  "Rural urban fringe characteristics, advantages & problems",
  "National urbanisation policy & Principles of urban planning",
  "Land cover transformation",
  "Census (Literacy, Sex ratio, Family Planning, Old Age, Age Structure, Density, Growth)",
  "Caste Census Issues",
  "Agriculture - Land Resource, Land-use & capability classification",
  "Causes & Impact of Land Degradation & Sustainable Land Management steps",
  "Performance & Types of farming in India",
  "Cropping seasons & Cropping Patterns in India",
  "Agriculture regionalization & Infrastructure factors (Seeds, Fertilizers, Irrigation)",
  "Land reforms & Institutional Factors in India",
  "Horticulture sector & Agricultural revolutions in India",
  "Agricultural labours, Price Policy, Marketing, Insurance & Agricultural Census",
  "Major schemes in agricultural sector & National Policy for farmers",
  "Impact of climate change on agriculture & Sustainable agriculture",
  "Use of IT in agriculture & Agriculture Issues and Challenges",
  "Productivity & Growth Conditions of Wheat",
  "Productivity & Growth Conditions of Rice",
  "Productivity & Growth Conditions of Maize (Corn)",
  "Productivity & Growth Conditions of Barley, Oats & Rye",
  "Beverages: Tea (Conditions, Production & Trade)",
  "Beverages: Coffee (Types, Conditions, Production & Trade)",
  "Beverages: Cocoa & Tobacco (Conditions, Production & Trade)",
  "Fibre Crops: Cotton (Varieties, Conditions, Production & Trade)",
  "Fibre Crops: Jute (Conditions, Production & Substitutes: Flax, Hemp, Abaca, Sisal)",
  "Fibre Crops: Raw Silk & Natural Rubber (Production & Trade)",
  "Sugarcane & Sugarbeet (Conditions, Production & Trade)",
  "Sugar industry & Sugar consumption",
  "Mineral resources - Types (Metallic, Non-metallic) & Mining Regions",
  "Distribution, production & trade of Ferrous metals: Iron ore",
  "Ferro-alloys and non-ferrous (Manganese, Chromium, Nickel, Tungsten, Antimony, Copper, Bauxite, Zinc, Lead, Tin)",
  "Precious metals: Gold, Silver, Platinum",
  "Mineral chemicals: Mica, Potash, Phosphate, Nitrates, Sulphur",
  "Conservation of mineral resources",
  "Energy resources - Classification, production & trends",
  "Reserves and sources of energy: Coal (Origin, types, fields, conservation)",
  "Reserves and sources of energy: Petroleum (Exploration, refining, OPEC role)",
  "Natural gas: Reserves and Production",
  "Hydro-electricity: Advantages, ideal conditions & potential distribution",
  "Atomic (Nuclear) Energy: Uranium & Thorium reserves & world distribution",
  "Production of Atomic (Nuclear) Energy: Nuclear Energy as future energy source",
  "Alternative (non-conventional) Sources of energy (Solar, Wind, Geothermal, Tidal, Wave, Biomass)",
  "Alternate Energy Sources: Hydrogen as a Fuel & Microbial Fuel Cell",
  "Energy Context with Respect to Indian Scenario & Energy Plantation & Energy crisis",
  "Industry - Industrial development",
  "Iron And Steel Industry (Production, localization & global steel trade)",
  "Textile Industry (Cotton, Woollen, Silk & Synthetic textile localization & trade)",
  "Engineering Industries (Machine tools, industrial/textile machinery, transport equipment)",
  "Automobile, Railway car/locomotive, Shipbuilding & Aircrafts industries",
  "Chemical Industry (Branches, heavy chemicals, acids, alkalies, fertilizers, explosives)",
  "Glass industry & Agro-industries & Synthetic rubber industry",
  "Pulp and paper industry (Conditions, paper production & international trade)",
  "Cement industry (Distribution & main global competitors)",
  "Petroleum refining industry (Localization, refineries history & petroleum products)",
  "Industrial Regions (Characteristics, delimitation & principal global regions)",
  "Transport and Communication (Roads, Railways, Water, Air, Sea Routes, Canals, Pipelines)",
  "Regional Rapid Transit System 1 & Odisha’s coastal highway",
  "AERA Act amendment – Way to boost up Air transport",
  "Eleventh Agriculture Census (2021-22)",
  "Issues Related To Agriculture Produce Market Committee (APMC)",
  "New White Revolution: Need, Scope & Challenges",
  "The Western Indian Ocean Region and The Coordinated Fight Against Pollution",
  "Geopolitics of Natural Resources: Spatial Analysis",
  "Depletion of Natural Resources versus Economic Growth",
  "Renewable Energy and Women Empowerment",
  "Does Access to Energy Causes Human Development",
  "Potential of nuclear energy to reduce CO2 Emissions",
  "The Indian automotive industry: From resilience to resurgence?",
  "Role of Industrial Development in minimizing regional inequalities",
  "Impact of 4th Industrial Revolution on Global Manufacturing Sector",
  "Demographic Transition: Contemporary look at the model",
  "Demographic Window of Opportunities",
  "Astropolitics : Its growing significance",
  "Impact of Rural-Urban Migration on the resources at the source and destination region.",
  "Global Population Ageing - Causes & Consequences",
  "Time to prepare to forecast and try to manage globally disruptive volcanic eruptions"
];

async function appendIndiaEconomicGeography() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS I Subject
    const subject = await Subject.findOne({ name: 'GS I' });
    if (!subject) {
      console.error('❌ Subject GS I not found.');
      process.exit(1);
    }

    const topicsWithSubject = INDIA_ECONOMIC_GEOGRAPHY_AS_IS.map(title => ({
      title,
      tags: ["Geography"],
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

    const created = await Topic.insertMany(topicsWithSubject);
    console.log(`✅ Successfully appended all ${created.length} India, Human & Economic Geography topics exactly as is!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error appending Geography:', err.message);
    process.exit(1);
  }
}

appendIndiaEconomicGeography();
