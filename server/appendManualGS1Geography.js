/**
 * Append Manual GS I Syllabus (Geography)
 * Run: node appendManualGS1Geography.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const GEOGRAPHY_TOPICS = [
  // General Geography
  { title: "Physical Geography: Earths Origin, Evolution & Geological Time Scale", tags: ["Geography", "General"], difficulty: "Medium" },
  { title: "Physical Geography: Latitude, Longitude, Standard Time & Motions of Earth", tags: ["Geography", "General"], difficulty: "Easy" },

  // Geomorphology
  { title: "Physical Geography: Interior of Earth, Seismic Waves & Discontinuities", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Rock Types (Igneous, Sedimentary, Metamorphic) & Rock Cycle", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },
  { title: "Physical Geography: Earthquakes - Shadow Zones, Causes & Distribution", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Volcanoes - Types, Intrusive & Extrusive Landforms", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Tsunamis - Causes, Propagation & Impacts", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },
  { title: "Physical Geography: Geomorphic Processes (Endogenic vs Exogenic Forces)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Continental Drift Theory & Evidence (Wegener)", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },
  { title: "Physical Geography: Plate Tectonics - Major Plates & Boundary Types", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Fluvial Landforms (Running Water - Youth, Mature, Old)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Aeolian (Wind) & Glacial Landforms", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Karst (Groundwater) & Coastal (Waves/Currents) Topography", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Weathering (Physical, Chemical, Biological) & Mass Movements", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Mountain & Plateau Formation Processes & World Distribution", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },

  // Climatology
  { title: "Physical Geography: Structure & Composition of the Atmosphere", tags: ["Geography", "Climatology"], difficulty: "Easy" },
  { title: "Physical Geography: Heat Budget of the Earth, Insolation & Temperature Inversion", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Pressure Belts, Planetary Winds & Coriolis Force", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Local Winds, Jet Streams & Polar Vortex", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Air Masses, Fronts & Temperate Cyclones", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Tropical Cyclones - Formation, Cyclogenesis & Naming", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Humidity, Condensation & Cloud Classification", tags: ["Geography", "Climatology"], difficulty: "Medium" },
  { title: "Physical Geography: Precipitation Types, Monsoon & Global Rainfall Distribution", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: El Nino, La Nina, ENSO & Indian Ocean Dipole", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: World Climate Classification (Koppen, Equatorial, Monsoon, Desert, Mediterranean, Steppe, Siberian, Polar)", tags: ["Geography", "Climatology"], difficulty: "Hard" },

  // Oceanography
  { title: "Physical Geography: Ocean Floor Relief (Shelf, Slope, Deep Sea Plain, Trenches, Ridges)", tags: ["Geography", "Oceanography"], difficulty: "Hard" },
  { title: "Physical Geography: Temperature & Salinity Distribution in Ocean Water", tags: ["Geography", "Oceanography"], difficulty: "Hard" },
  { title: "Physical Geography: Ocean Waves, Currents & Tides - Types & Importance", tags: ["Geography", "Oceanography"], difficulty: "Hard" },
  { title: "Physical Geography: Major Ocean Currents of the World & Climatic Impacts", tags: ["Geography", "Oceanography"], difficulty: "Hard" },
  { title: "Physical Geography: Atlantic Meridional Overturning Circulation (AMOC)", tags: ["Geography", "Oceanography"], difficulty: "Hard" },
  { title: "Physical Geography: Ocean Deposits & Deep Ocean Mineral Resources", tags: ["Geography", "Oceanography"], difficulty: "Medium" },
  { title: "Physical Geography: UNCLOS zones (Territorial Waters, Contiguous, EEZ, High Seas)", tags: ["Geography", "Oceanography"], difficulty: "Medium" },
  { title: "Physical Geography: Water Resources, River Interlinking & Aging Dams Issue", tags: ["Geography", "Oceanography"], difficulty: "Medium" },

  // Biogeography & Soils
  { title: "Physical Geography: Soil Formation (Factors, Profile, Classification & Erosion)", tags: ["Geography", "Biogeography"], difficulty: "Hard" },
  { title: "Physical Geography: World Vegetation - Forests, Grasslands & Tundra", tags: ["Geography", "Biogeography"], difficulty: "Medium" },
  { title: "Physical Geography: Deforestation Causes, Consequences & Conservation Strategies", tags: ["Geography", "Biogeography"], difficulty: "Medium" },
  { title: "Physical Geography: Forestry Types, Social Forestry, Agro-Forestry & Miyawaki Method", tags: ["Geography", "Biogeography"], difficulty: "Easy" }
];

async function appendGS1Geography() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS I Subject
    const subject = await Subject.findOne({ name: 'GS I' });
    if (!subject) {
      console.error('❌ Subject GS I not found. Please seed subjects first.');
      process.exit(1);
    }

    const topicsWithSubject = GEOGRAPHY_TOPICS.map(topic => ({
      ...topic,
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
    console.log(`✅ Appended ${created.length} Geography topics to GS I!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error appending GS I Geography:', err.message);
    process.exit(1);
  }
}

appendGS1Geography();
