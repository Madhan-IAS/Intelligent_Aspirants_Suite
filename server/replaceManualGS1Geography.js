/**
 * Replace Geography Topics with Fully Granular Breakdown
 * Run: node replaceManualGS1Geography.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const GRANULAR_GEOGRAPHY_TOPICS = [
  // General Geography
  { title: "Physical Geography: Origin of the Earth (Early & Modern Theories, BBT)", tags: ["Geography", "General"], difficulty: "Medium" },
  { title: "Physical Geography: Star Formation & Planet Formation", tags: ["Geography", "General"], difficulty: "Medium" },
  { title: "Physical Geography: Solar System & Evolution of Earth (Lithosphere, Atmosphere, Hydrosphere)", tags: ["Geography", "General"], difficulty: "Medium" },
  { title: "Physical Geography: Geological History of Earth & Geological Time Scale", tags: ["Geography", "General"], difficulty: "Hard" },
  { title: "Physical Geography: Latitudes, Longitudes, Parallels, Meridians & Standard Time", tags: ["Geography", "General"], difficulty: "Easy" },
  { title: "Physical Geography: International Date Line, Local Time & Calendar Systems", tags: ["Geography", "General"], difficulty: "Medium" },
  { title: "Physical Geography: Earth's Rotation, Revolution & Inclination Effects", tags: ["Geography", "General"], difficulty: "Medium" },
  { title: "Physical Geography: Eclipses (Solar & Lunar) & Origin of Life", tags: ["Geography", "General"], difficulty: "Easy" },

  // Geomorphology - Earth Interior & Rocks
  { title: "Physical Geography: Interior of the Earth - Direct & Indirect Sources", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },
  { title: "Physical Geography: Seismic Waves (P, S, Body & Surface Waves)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Earth's Interior Structure (Crust, Mantle, Core, Asthenosphere)", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },
  { title: "Physical Geography: Seismic Discontinuities in the Earth's Crust", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Minerals of Earth's Crust (Feldspar, Quartz, Pyroxene, Mica)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Rocks (Igneous, Sedimentary, Metamorphic) & Rock Cycle", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },

  // Earthquakes & Volcanoes
  { title: "Physical Geography: Earthquakes - Waves, Shadow Zones & Causes", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Earthquakes - Distribution, Effects & Observatories", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },
  { title: "Physical Geography: Volcanoes - Types (Shield, Composite, Caldera, Flood Basalt)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Intrusive Volcanic Landforms (Batholiths, Lacoliths, Sills, Dykes)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Extrusive Volcanic Landforms, Hot Springs & Geysers", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },
  { title: "Physical Geography: Global Distribution of Volcanoes & Pacific Ring of Fire", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },
  { title: "Physical Geography: Tsunamis - Waves Mechanism, Properties & Effects", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },

  // Geomorphic Processes & Theories
  { title: "Physical Geography: Endogenic Forces (Diastrophism, Orogenic, Epierogenic)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Exogenic Forces (Denudation, Weathering, Erosion, Deposition)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Continental Drift Theory & Evidence (Wegener, Pangea)", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },
  { title: "Physical Geography: Convectional Current Theory & Ocean Floor Mapping", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Plate Tectonics - Major & Minor Plates & Boundary Types", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Movement of the Indian Plate (71 Million Years Ago to Present)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },

  // Landform Evolution
  { title: "Physical Geography: Geomorphic Agents & Erosional vs Depositional Landforms", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },
  { title: "Physical Geography: Wind Landforms in Deserts (Mushroom Rocks, Barchans, Seifs)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Running Water Landforms (Valleys, Gorges, Deltas, Oxbow Lakes)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Karst Topography (Limestone Caves, Stalactites, Stalagmites)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Glacial Landforms (Cirques, Fiords, Moraines, Eskers, Drumlins)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Wave & Current Coastal Landforms (Cliffs, Terraces, Caves, Spits)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Weathering Processes (Chemical, Physical & Biological weathering)", tags: ["Geography", "Geomorphology"], difficulty: "Hard" },
  { title: "Physical Geography: Mass Movements (Slow, Rapid, Landslides)", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },
  { title: "Physical Geography: Major Mountains, Peaks, Plateaus & Economic Significance", tags: ["Geography", "Geomorphology"], difficulty: "Medium" },

  // Climatology
  { title: "Physical Geography: Composition & Structure of Atmosphere (Troposphere to Exosphere)", tags: ["Geography", "Climatology"], difficulty: "Easy" },
  { title: "Physical Geography: Solar Radiation, Insolation Variability & Earth Heat Budget", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Horizontal & Vertical Temperature Distribution & Inversion", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Atmospheric Pressure & Sea Level Pressure Distribution", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Forces affecting Winds (Pressure Gradient, Frictional, Coriolis)", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: General Atmospheric Circulation (Hadley, Ferrel & Polar Cells)", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Planetary Winds, Seasonal Winds & Local Winds", tags: ["Geography", "Climatology"], difficulty: "Medium" },
  { title: "Physical Geography: Air Masses & Fronts", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Temperate & Extra-Tropical Cyclones", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Thunderstorms & Tornadoes", tags: ["Geography", "Climatology"], difficulty: "Medium" },
  { title: "Physical Geography: Water in Atmosphere (Absolute/Relative Humidity, Saturation)", tags: ["Geography", "Climatology"], difficulty: "Medium" },
  { title: "Physical Geography: Dew, Frost, Fog, Mist & Clouds Classification", tags: ["Geography", "Climatology"], difficulty: "Medium" },
  { title: "Physical Geography: Precipitation Types & World Distribution of Rainfall", tags: ["Geography", "Climatology"], difficulty: "Medium" },
  { title: "Physical Geography: Tropical Cyclones - Formation, Cyclogenesis & Paths", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Jet Streams - Types & Climatic Influences", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Polar Vortex & Ozone Depletion", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: El Nino, La Nina, ENSO & Indian Ocean Dipole", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Climatic Regions - Hot Wet Equatorial & Tropical Monsoon", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Climatic Regions - Savanna, Hot Desert & Mediterranean", tags: ["Geography", "Climatology"], difficulty: "Hard" },
  { title: "Physical Geography: Climatic Regions - Steppe, China Type, British, Siberian & Polar", tags: ["Geography", "Climatology"], difficulty: "Hard" },

  // Oceanography
  { title: "Physical Geography: Hydrological Cycle - Components & Processes", tags: ["Geography", "Oceanography"], difficulty: "Easy" },
  { title: "Physical Geography: Ocean Floor Relief (Shelf, Slope, Deep Sea Plain, Trenches)", tags: ["Geography", "Oceanography"], difficulty: "Hard" },
  { title: "Physical Geography: Mid-Ocean Ridges, Seamounts, Submarine Canyons & Atolls", tags: ["Geography", "Oceanography"], difficulty: "Medium" },
  { title: "Physical Geography: Ocean Temperature Distribution & Salinity Factors", tags: ["Geography", "Oceanography"], difficulty: "Hard" },
  { title: "Physical Geography: Ocean Density & Movements (Horizontal & Vertical)", tags: ["Geography", "Oceanography"], difficulty: "Hard" },
  { title: "Physical Geography: Tides - Gravitational Forces, Tidal Currents & Types", tags: ["Geography", "Oceanography"], difficulty: "Hard" },
  { title: "Physical Geography: Ocean Currents - Primary & Secondary Forces & Types", tags: ["Geography", "Oceanography"], difficulty: "Hard" },
  { title: "Physical Geography: Major World Ocean Currents & Desert Formation Influence", tags: ["Geography", "Oceanography"], difficulty: "Hard" },
  { title: "Physical Geography: Atlantic Meridional Overturning Circulation (AMOC)", tags: ["Geography", "Oceanography"], difficulty: "Hard" },
  { title: "Physical Geography: Ocean Deposits (Terrigenous, Pelagic) & Deep Sea Minerals", tags: ["Geography", "Oceanography"], difficulty: "Medium" },
  { title: "Physical Geography: UNCLOS Zones (Territorial Waters, Contiguous, EEZ, High Seas)", tags: ["Geography", "Oceanography"], difficulty: "Medium" },
  { title: "Physical Geography: Water Resources (Underground, Surface & Utilization)", tags: ["Geography", "Oceanography"], difficulty: "Medium" },
  { title: "Physical Geography: Water Consumption Patterns, Pollution & Conservation", tags: ["Geography", "Oceanography"], difficulty: "Medium" },
  { title: "Physical Geography: River Interlinking Projects & Aging Dams Issue", tags: ["Geography", "Oceanography"], difficulty: "Medium" },

  // Biogeography
  { title: "Physical Geography: Soil Characteristics, Formation & Profiles", tags: ["Geography", "Biogeography"], difficulty: "Hard" },
  { title: "Physical Geography: Soil Classification, Erosion & Conservation", tags: ["Geography", "Biogeography"], difficulty: "Hard" },
  { title: "Physical Geography: Natural Vegetation - Forests & Grasslands Types", tags: ["Geography", "Biogeography"], difficulty: "Medium" },
  { title: "Physical Geography: Desert & Tundra Vegetation Resources", tags: ["Geography", "Biogeography"], difficulty: "Medium" },
  { title: "Physical Geography: Deforestation - Rate, Extent, Causes & Conservation", tags: ["Geography", "Biogeography"], difficulty: "Medium" },
  { title: "Physical Geography: Forestry Types (Social Forestry, Agro-forestry & Miyawaki Method)", tags: ["Geography", "Biogeography"], difficulty: "Easy" }
];

async function replaceGeography() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS I Subject
    const subject = await Subject.findOne({ name: 'GS I' });
    if (!subject) {
      console.error('❌ Subject GS I not found.');
      process.exit(1);
    }

    // Delete existing Physical Geography topics in GS I
    const deleteRes = await Topic.deleteMany({
      subjectId: subject._id,
      title: /^Physical Geography:/
    });
    console.log(`Deleted ${deleteRes.deletedCount} old geography topics.`);

    const topicsWithSubject = GRANULAR_GEOGRAPHY_TOPICS.map(topic => ({
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
    console.log(`✅ Successfully seeded all ${created.length} granular Physical Geography topics!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error replacing Geography:', err.message);
    process.exit(1);
  }
}

replaceGeography();
