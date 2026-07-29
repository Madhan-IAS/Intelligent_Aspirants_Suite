/**
 * Seed Environment & Ecology Syllabus (GS III) Exactly As Is
 * Run: node seedEnvironmentAsIs.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const RAW_ENV_TEXT = `
ENVIRONMENT & 
ECOLOGY
Ecology
 Types of Ecology  
 Ecological Hierarchy 
 Scope of Ecology 
 Habitat & Ecological Niche 
  Deep vs Shallow Ecology  
 Ecological Principles 
 Ecological Community 
 Structure and Characteristics of a   
Community
 Stratification 
 Ecotones 
 Ecological Dominance 
 Seasonal and Diurnal Fluctuation 
 Periodicity 
 Turnover 
 Interdependence 
 Ecological Succession 
 Types and Process of Succession 
 Climax Community 
 Range of Tolerance, Maximum Range 
 Difference between Ecology,   
Environment and Ecosystem
 Ecosystem and its dynamics
 Ecosystem Definitions  
 Functions and Properties of Ecosystem 
 The Structure/Components of   
Ecosystem
 Abiotic Components  
 Biotic Components 
 Ecosystem Dynamics  
 Flow of Energy in Ecosystem 
 Trophic Levels 
 Food Chain  
 Types & Significance of Food Chain 
 Food Web 
 Models for Energy Flow  
 Ecological Productivity 
 Ecological Pyramid 
 Biomagnifications 
 Biological Control 
 Organic Farming 
 Biogeochemical Cycles
 Parts of a Bio Geochemical Cycle 
 Types of Biogeochemical Cycle 
 Carbon Cycle 
 Nitrogen Cycle 
 Phosphorus Cycle 
 Sulphur Cycle  
 Biomes: Forest, Grassland, 
Mountain, and Desert Ecosystems
 Biome 
 Grasslands 
 Tundra 
 Deserts 
 Thar desert 
 Mountain biome 
 Aquatic Life Zones: Ocean, Rivers, 
Lakes, and Wetlands
 Aquatic ecosystems 
 Basic facts about the ocean 
 Importance of the ocean 
 Zones of the ocean 
 Marine life 
ENVIRONMENT & 
ECOLOGY
66 UPSC SYLLABUS 2024-25 www.iasscore.in
 Coral reefs 
 Coral reefs in India 
 Conserving coral reefs 
 Mangroves 
 Mangroves in India 
 Freshwater in India 
 Importance of lakes 
 National Lake Conservation Plan 
 Wetlands and their importance 
 Ramsar Convention 
 Ramsar Sites 
 Montreux Record 
 Extent and distribution of wetlands   
in India
 Conserving the wetlands of India 
 Biodiversity Basics
 Biodiversity 
 Important kinds of biodiversity 
 Degree of diversity in an ecosystem 
 Endemic species
 Keystone species 
 Indicator species 
 Invasive species 
 Allopatric and sympatric speciation 
 Bioinformatics 
 Biodiversity distribution
 Megadivers Countries 
 Uses and values of biodiversity 
 State of global biodiversity 
 Threats to biodiversity 
 Biodiversity Hotspots 
 Eco-regions 
 Role of traditional knowledge in   
biodiversity
 Biopiracy 
 Extinction of species 
 Mass extinction 
 IUCN’s classification scheme  
 IUCN Red-List of Threatened Species  
 Level of biodiversity in India  
 Biogeographical classification of India 
 Biodiversity Conservation
 Ex-situ aid in-situ conservation 
 Seed banks 
 Zoos in biodiversity conservation 
 Botanical gardens 
 Protected areas 
 State of protected areas in the world 
 UNESCO Man and the Biosphere   
Program (MAB)
 Characteristics of biosphere reserves 
 International agreements for 
biodiversity conservation
 Convention on Biological Diversity 
 Cartagena Protocol 
 Nagoya Protocol 
 Aichi Biodiversity Targets  
 Important Coastal and Marine 
Biodiversity Areas of India
 Important Bird Areas (IBAs) of India 
 Global Tiger Initiative 
 Project Tiger  
 Project Elephant 
 Indian Rhino Vision 
 Recovery Programme for Critically   
Endangered Species
 Use of indigenous knowledge for   
conserving biodiversity
 Seed village 
 Effect of Human Activities on 
Environment
 Effect of Modern Agriculture on   
Environment
 Effect of Housing on Environment 
 Effect of Power Generation on   
Environment 
 Effect of River Valley Projects (Water   
Resource Projects) on Environment 
 Effect of Mining on Environment  
 Effect of Transportation Activities on   
Environment 
 Effect of Tourism on Environment 
 Water Resource degradation
 Water Cycle (Hydrological Cycle) 
UPSC SYLLABUS 2024-25 www.iasscore.in 67
 Availability and Quality Aspects   
(groundwater depletion) 
 Water-borne and Water-induced   
Diseases  
 Fluoride Problem in Drinking Water  
 Arsenic Problem in Drinking Water 
 Minerals & Environmental 
Degradation
 Mining and Environment 
 Sensitivity of Select Ecosystems to   
Mining 
 Impact of Mining 
 Indirect Impact of Mining 
 International Laws on Mining 
 Main Act or Statute to regulate the   
impact of Indian Mining Sector
 Sustainable Mining 
 Deforestation
 Causes of Deforestation 
 Implications of Deforestation for   
Climate Change
 Consequences of Deforestation on the   
Wildlife of India
 Impact of Deforestation on Indian   
Monsoon
 Impact of Deforestation on People 
 Deforestation Leads to Water and Soil   
Resources Loss and Flooding
 Economical Impacts 
 Strategies for Reducing Deforestation 
 Government Programmes for   
Conservation of Forests
 Legislations for Conservation of   
Forests using People Participation
 Steps for Improving People   
Participation in Forest Resource 
Management
 Use of Local Traditional Methods 
 Waste Management
 Solid Waste 
 Hazardous Waste 
 E-Waste 
 Bio Medical Waste 
 Plastic Waste 
 Methods for Waste Management 
 Effects of Poor Waste Disposal 
 Landfill 
 Sustainable Development
 Principles of sustainability 
 Measurement of Sustainability or   
Sustainable Ethics or Equitable   
Utilisation of Natural Resource 
 Sustainable Lifestyle (Role of an   
individual in sustainable development) 
 Challenges to Sustainable   
Development  
 International Efforts to Achieve   
Sustainability
 Environmental Pollution
 Air Pollution  
 Sources of Air Pollution  
 Effects of Air Pollution  
 Classification of Air Pollutant  
 Control Measures of Air Pollution 
 Air Pollution Disasters  
 Long Range Transport of Gaseous Air   
Pollutants 
 National Ambient Air Quality   
Standards  
 Water Pollution  
 Sources of Water Pollution 
 Types of Water Pollutants  
 Effects of Water Pollution 
 Water Quality Standards  
 Control of Water Pollution  
 Thermal Pollution  
 Sources of Thermal Pollution 
 Effects of Thermal Pollution 
 Control of Thermal Pollution 
  Soil Pollution or Land Degradation  
 Sources of Soil Pollution 
 Effects of Soil Pollution  
 Control Measures  
 Noise Pollution 
68 UPSC SYLLABUS 2024-25 www.iasscore.in
 Air-borne Diseases 
 Toxic Substances: Toxicant, Toxicity   
and Toxicology
 Factors affecting toxicity 
 Carcinogens 
 Solid Waste Management
 Sources of Solid Waste 
 Effect of Solid Waste 
 Control Measures of Solid Waste 
 Solid Waste Management Rules 
 Hazardous Waste Management (HWM) 
 Coastal Ecosystem Management
 Mangroves 
 Salient features of Mangroves 
 Importance of Mangroves 
 Mangroves in India 
 Mangroves under threats 
 Legal and Regulatory Approaches for   
Protection
 Estuaries 
 Importance of estuaries 
 Threats to estuaries 
 Coral Reefs 
 Geographical Conditions Required 
 Uses of coral reefs 
 Conservation of coral reef 
 Steps for Coastal Ecosystem 
  Management 
 Recent developments
 Air Pollution 
 Report on Air Pollution 
 Bharat Stage Emission Standards 
 Polluters Pay Model 
 Household Air Pollution 
 Open Waste Burning and its Impact 
 Graded Response Action Plan on   
Pollution
 UN Sets Limits on Global Airline 
 Emissions  
 Waste Management 
 Biodegradable Plastics 
 Green Train Corridors 
 Oil Spill 
 Solid Waste Management-Buffer Zone 
 Other News 
 Report of Parliamentary Committee on   
Forest Fires
 Urban Forestry Scheme 
 Draft Notification to Regulate Pet Shops 
 Ban on Import of Animal Skin 
 River linking Project and Impact on   
Environment 
 Algal Bloom Issue 
 Illegal Salt Mining and its Impact 
 India’s Wetland Report, 2016 
 Deep Sea Mining 
 Mass Coral Bleaching 
 Ganga River Pollution 
 Environmental Impact Assessment
 Government Body which Executes EIA  
 Environmental Effects Analysed   
under EIA
 Process of EIA 
 EIA Ruling 1984 
 Environmental Laws
 Environmental Laws: Provisions   
in the Indian Constitution towards  
Environmental Protection
 Salient Features of Air (Prevention    
and Control of Pollution) Act, 1981
 Salient Features of Water (Prevention   
and Control of Pollution) Act, 1974
 Salient features of Forest Conservation   
Act, 1980
 Salient Features of Wildlife Protection   
Act, 1972
 Salient Features of Environment   
(Protection) Act, 1986
 Role of Government in Environmental   
Protection
UPSC SYLLABUS 2024-25 www.iasscore.in 69
 Environment related Institutions 
and Organizations
 Pollution Control Boards 
 National Green Tribunal  
 Forest Survey of India 
 National Board for Wildlife 
 Schemes
 Ecomark Scheme  
 National Afforestation Program 
 National River Conservation Plan 
 National Mission for Clean Ganga 
 National Air Quality Index (AQI) 
 National Action Programme to   
Combat Desertification
 UJALA Scheme 
 Bharat Stage Norms  
 International Environmental 
Governance
 UNEP 
 UNDP 
 Centre for Biological Diversity  
 WWF for Nature  
 IUCN - Red List  
 Birdlife International  
 International Conventions/Protocols &   
their Objectives
 Basics of Climate change
 Green House Effect and Global   
Warming 
 Global Climate Change: International  
Efforts to Control Global Warming or 
Global Climate Change
 Ozone Layer Depletion or Ozone Hole 
 Acid Rain 
 El Nino  
 La Nina 
 Urbanization and climate
 Pollution in metros and climate   
change
 Real estate boom and environment   
degradation 
 Urban Heat Island 
 Polythene bags and pollution  
 Methane generation from waste 
 Impact of agriculture on climate
 Agriculture increases Carbon Dioxide   
Emissions
 Monoculture practice impacts   
biodiversity 
 Pollution due to use of chemical   
fertilizers
 Soil-related effects 
 Fertilizer’s Effect on the Environment 
 Impact of livestock on environment 
 Impact of use of pesticides on   
environment
 Impact of GM crop on environment 
 Emission of Methane from agricultural   
practices
 Sustainable Agriculture Techniques 
 Global Warming & Health
 Health impacts of global warming 
 Mosquito-borne diseases 
 Ozone depletion and human health 
 Threat to Biomes and their conservation
 Relevance of International Conventions 
in protecting Environment
 Wetland and coasted region 
conservation in India
 Impact of National Hydrogen Mission
 Plastic Pollution, Plastic Pollution Waste 
management Rules, 2021 and 2022
 Causes and Impacts of Land 
Degradation
CONTEMPORARY ISSUES
70 UPSC SYLLABUS 2024-25
www.iasscore.in
Sustainable Land Management measures 
in India.
Issues with EIA process in India
Landslides And Fragile Ecosystem Of 
Hilly States
Cyclone And Its Impact On Coastal 
Women
Marine Heat Waves And Its Impact On 
Marine Biodiversity
Role of Local Self-Government in 
Disaster Management
Role of the GIS and Information 
Technology in Disaster Management
Environment driven taxes
universal right
Agro-forestry and its socio-economic 
impact
Man-Animal Conflict
Artificial Intelligence and its climate cost
India’s Renewable sector (Wind Project 
addition to peak by 2024)
Access to a clean, healthy environment, a 
Green Investments and Sustainability
Balancing Global Nutrition and Climate 
Change
Indian solar-power dream
Biofuels and E20 fuel 
Nord stream and hazardous methane 
release
The UN High Seas Treaty drafted
Energy Conservation Act Amendment 
and Carbon market
Global Biodiversity Framework
The Wildlife Protection Act 2022 and its 
relevance
Carbon Border Adjustment Mechanism
`;

async function callGeminiWithRetry(ai, prompt, retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Sending API call to Gemini (Attempt ${i + 1}/${retries})...`);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return response;
    } catch (err) {
      console.warn(`⚠️ Warning: Gemini API returned error: ${err.message}`);
      if (i === retries - 1) throw err;
      console.log(`Waiting ${delay / 1000}s before retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

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

    console.log('Asking Gemini to clean up split lines and list all Environment subtopics as a JSON array of strings...');
    const ai = new GoogleGenAI({});
    const prompt = `
    Here is a raw text list of UPSC Environment & Ecology topics.
    Some lines have been split across lines during copy-pasting (e.g. "Access to a clean, healthy environment, a" and then "universal right" should be "Access to a clean, healthy environment, a universal right").
    Also, remove headers/footers like "ENVIRONMENT & ECOLOGY", "Ecology", "66 UPSC SYLLABUS 2024-25 www.iasscore.in", "67", "68", "69", "70", "www.iasscore.in", "CONTEMPORARY ISSUES".
    Do not summarize, do not skip, and do not omit any single subtopic. Keep all of them!
    Return a JSON array of strings, where each string is a complete topic or subtopic from the list.

    Raw Text:
    ${RAW_ENV_TEXT}
    `;

    const response = await callGeminiWithRetry(ai, prompt);
    const topicsArray = JSON.parse(response.text);
    console.log(`Gemini cleaned up ${topicsArray.length} total Environment topics.`);

    // Delete any existing Environment topics under GS III
    const deleteRes = await Topic.deleteMany({
      subjectId: subject._id,
      tags: 'Environment & Biodiversity'
    });
    console.log(`Deleted ${deleteRes.deletedCount} old Environment topics.`);

    const topicsToInsert = topicsArray.map(title => ({
      title: title.trim(),
      tags: ["Environment & Biodiversity"],
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
    console.log(`✅ Successfully seeded all ${inserted.length} Environment topics exactly as is!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
