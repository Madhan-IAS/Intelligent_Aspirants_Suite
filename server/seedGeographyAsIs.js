/**
 * Seed Geography Syllabus Exactly As Is
 * Run: node seedGeographyAsIs.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const GEOGRAPHY_AS_IS = [
  "General Geography",
  "The origin of the Earth",
  "Early Theories",
  "Modern Theories – BBT",
  "Star Formation",
  "Formation of Planets",
  "Solar System",
  "The Evolution of the Earth",
  "Layered Structure (5 layers)",
  "Evolution of Lithosphere",
  "Evolution of Atmosphere",
  "Evolution of Hydrosphere",
  "Geological History of the Earth",
  "Latitude and Longitude including important Parallels and Meridians",
  "Motions of the Earth - Rotation, Revolution and their effects",
  "Inclination of the Earth’s Axis and its effects",
  "Local and Standard Time and the International Date Line, Calendar",
  "Eclipses - Solar, Lunar",
  "Origin of Life",
  "Geological Time Scale",
  "Interior of the Earth",
  "Sources of Information - Direct",
  "Sources of Information - Indirect - Earthquakes, Waves and Magnetic Field",
  "Seismic waves",
  "Body waves",
  "Surface waves",
  "Understanding earth’s interior with help of seismic waves",
  "Internal Structure of earth",
  "Crust",
  "Lithosphere",
  "Mantle",
  "Asthenosphere",
  "Outer core",
  "Inner core",
  "Seismic Discontinuities",
  "Geology",
  "Minerals",
  "Major Elements of the Earth’s Crust",
  "Minerals – Feldspar , Quartz, Pyroxene Amphibole, Mica , Olivine",
  "Physical Characteristics–Crystal Form, Cleavage Fracture, Lusture, Color, Streak, Transparency, Structure, Hardness, Specific Gravity",
  "Metallic minerals – precious Ferrous, Non Ferrous",
  "Non-metallic Minerals – Sulphur, Phosphates, Cement",
  "Rocks (Aggregate of Minerals)",
  "Petrology",
  "Rocks & landforms",
  "Rocks & Soils",
  "3 Family of Rocks",
  "Igneous",
  "Sedimentary",
  "Metamorphic",
  "Rock Cycle",
  "Earthquakes",
  "Waves: P, S, Body & Surface",
  "Shadow Zone",
  "Types of Earthquakes",
  "Causes of Earthquake",
  "Effects of Earthquake",
  "Frequency",
  "Locating an Epicentre",
  "Distribution of Earthquake",
  "Earthquake Observatories",
  "Volcano",
  "Types of Volcanoes (Shield, Composite, Caldera, Flood Basalt, Mid Ocean Ridge)",
  "Types of lava (Andesitic or Acidic lava, Basic or Basaltic lava)",
  "Intrusive volcanic Landforms (Batholiths, Lacoliths, Lapoliths, Phacoliths, Sills, Dykes)",
  "Extrusive Volcanic Landforms",
  "Geysers and Hot springs",
  "Extinct, Dormant and Active volcanoes",
  "Distribution of Volcanoes",
  "Pacific Ring of Fire",
  "Mediterranean volcanism",
  "Effects of Volcanoes",
  "Tsunami",
  "Mechanism of Tsunami waves",
  "Properties of Tsunami waves",
  "Effects of Tsunami",
  "Geomorphic Processes",
  "Earth’s Surface",
  "Exogenic Forces",
  "Endogenic Forces",
  "Gradation, Degradation & Agradation",
  "Geomorphic Process",
  "Endogenic Process",
  "Diastrophism (Orogenic, Epierogenic)",
  "Plate movements",
  "Volcanism",
  "Exogenic Forces - Denudation Processes",
  "Weathering",
  "Mass movements",
  "Erosion: Transportation & Deposition",
  "Distribution of Continents & Oceans",
  "Theories",
  "Continental Drift Theory (Alfred Wegner 1912, Pangea, Panthalasa, Laurasia, Gondwana land)",
  "Evidence in support of Continental Drift Theory (Jigsaw Fit, Rocks of same age across oceans, Tillite, Placer Deposits, Distribution of Fossils)",
  "Forces of Drifting (Pole Fleeing Force, Tidal Force)",
  "Post Drift Studies",
  "Convectional Current Theory",
  "Mapping of the Ocean Floor",
  "Continents – plate Tectonics",
  "Lithospheric Plates (Major & Minor Plates)",
  "Plate Boundaries (Divergent, Convergent, Transform)",
  "Rates of Plate Movements",
  "Force of plate movements",
  "Indian Plate (Movement from 71 million years ago till today)",
  "Landforms and their Evolution",
  "Causes of Landforms",
  "Geomorphic Processes & Agents",
  "Erosional or Destructional",
  "Depositional or Constructional",
  "Agents and their Impacts (Wind, Running Water, Ground Water, Glaciers, Waves & Currents)",
  "Winds (Erosional: Pediments and Pediplains, Playas, Deflation Hollows, Mushroom Rocks)",
  "Winds (Depositional: Barchans, Seif, Parabolic, Transverse, Longitudinal)",
  "Running Water (Overland Flow, Linear Flow, Stages: Youth, Mature, Old)",
  "Running Water (Erosional Landforms: Valleys, Rills, Gullies, Gorges, Canyons, Potholes, River Terraces)",
  "Running Water (Depositional Landforms: Alluvial Fans, Delta, Floodplains, Natural Levees, Meanders, Oxbow lake, Braided Channels)",
  "Ground Water - Karst Topography (Erosional Landforms: Pools, Sinks, Dolines, Caves)",
  "Ground Water - Karst Topography (Depositional landforms: Stalactites, Stalagmites, Pillar Columns)",
  "Glaciers (Erosional Landforms: Cirque, Tarn Lakes, Horns, Arete, Fiords)",
  "Glaciers (Depositional Landforms: Glacial Tills, Moraines, Eskers, Outwash Planes, Drumlins)",
  "Waves and Currents (High Rocky Coasts & Low Sedimentary Coasts)",
  "Waves and Currents (Erosional Landforms: Cliffs, Terraces, Caves, Stacks)",
  "Waves and Currents (Depositional Landforms: Beaches and Dunes, Bars, Barriers, Spits)",
  "Weathering Factors (Geological, Climatic, Topographic, Vegetative)",
  "Weathering Processes (Chemical: Solution, Carbonation, Hydration, Oxidation & Reduction)",
  "Weathering Processes (Physical/Mechanical: Unloading, Temp changes, Freezing, Salt Weathering)",
  "Weathering Processes (Biological Weathering: Burrowing, Wedging, Plant Roots)",
  "Effects & Significance of Weathering (Exfoliation Domes, Tors, Soil Formation, Biomes, Leaching)",
  "Mass Movements (Causes & Forms: Slow, Rapid, Landslides)",
  "Landforms across the world (Rivers and lakes, Mountain & Peaks: Fold, Block, Volcanic)",
  "Plateaus (Formation process, Types: Dissected, Volcanic, Economic significance, Major plateaus)",
  "Composition & Structure of Atmosphere (Gases, Water Vapour, Dust Particles, Troposphere to Exosphere)",
  "Solar Radiation Heat Balance & Temperature (Insolation, Aphelion, Perihelion, Variability)",
  "Heat Balance (Heating/cooling, Conduction, Convection, Advection, Terrestrial Radiation, Heat Budget)",
  "Temperature (Factors controlling distribution, January-July range, Inversion of Temperature)",
  "Atmospheric Circulation (Pressure, Vertical/Horizontal variation, Sea Level Pressure)",
  "Factors affecting Wind velocity/direction (Pressure Gradient, Frictional, Coriolis Forces)",
  "Planetary Winds & Circulation (Hadley Cell, Ferrel Cell, Polar cell, Pressure Belts migration)",
  "Seasonal & Local Winds (Land/Sea Breezes, Mountain/Valley winds)",
  "Air Masses, Fronts, Extra Tropical Cyclones, Thunderstorms, Tornadoes",
  "Water in the Atmosphere (Humidity, Saturation, Evaporation, Condensation, Dew, Frost, Fog, Mist)",
  "Clouds Classification (Cirrus, Cumulus, Stratus, Nimbus, vertical development)",
  "Precipitation (Rainfall, Snowfall, Sleet, Hail, Types: Convective, Orographic, Cyclonic, Monsoonal)",
  "Tropical Cyclone (Formation conditions, Convective cyclogenesis, Path, Damage, Arabian Sea, Naming, Early warning)",
  "Jet Streams (Features, Types: Permanent, Temporary, Influence on weather, Aviation)",
  "Temperate Cyclones (Air masses, Fronts, Origin, development, Comparison with Tropical)",
  "Polar Vortex & Ozone Depletion",
  "El Nino, La Nina, ENSO & Indian Ocean dipole effect",
  "World Climate (Hot Wet Equatorial, Tropical Monsoon, Savanna, Hot Desert, Mediterranean, Steppe, China Type, British Type, Siberian, Laurentian, Polar)",
  "Hydrological Cycle (Components & Processes)",
  "Ocean Floor Relief (Shelf, Slope, Deep sea plain, Trenches, Ridges, Seamounts, Canyons, Guyots, Atolls)",
  "Ocean Temperature & Salinity (Vertical/Spatial distribution, Factors, Thermocline, Density)",
  "Movements of ocean Water (waves, tides, tidal currents, wave characteristics)",
  "Ocean Currents (Primary & Secondary forces, surface/deep, cold/warm, Major currents, Desert formation)",
  "Atlantic Meridional Overturning Circulation (AMOC)",
  "Resources from the Ocean (Deposits, Minerals on deep floor, Energy, Biotic, Deep ocean mission, UNCLOS)",
  "Water Resource (Underground, Surface, Inland utilization, Oceanic features & utilization, consumption patterns, pollution, conservation, river interlinking, ageing dams)",
  "Soil (Characteristics, Formation factors, Stages, Processes, Profiles, Classification, Erosion & Conservation)",
  "Vegetation Resources (Natural Vegetation types, Forests significance, Extent of cover, Classification, Grasslands, Desert, Tundra)",
  "Deforestation (Causes & factors in Tropical & Temperate forests, Rate, extent, Conservation strategies)",
  "Afforestation & Forestry Types (Reforestation, Monoculture, Social forestry, Agro-forestry, Miyawaki Method)"
];

async function seedGeographyExactly() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS I Subject
    const subject = await Subject.findOne({ name: 'GS I' });
    if (!subject) {
      console.error('❌ Subject GS I not found.');
      process.exit(1);
    }

    // Delete existing Geography topics (including previously seeded ones)
    const deleteRes = await Topic.deleteMany({
      subjectId: subject._id,
      $or: [
        { title: /^Physical Geography:/ },
        { tags: 'Geography' },
        { tags: 'Oceanography' },
        { tags: 'Climatology' },
        { tags: 'Biogeography' }
      ]
    });
    console.log(`Deleted ${deleteRes.deletedCount} old geography topics.`);

    const topicsWithSubject = GEOGRAPHY_AS_IS.map(title => ({
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
    console.log(`✅ Successfully seeded all ${created.length} Geography topics exactly as is!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Geography:', err.message);
    process.exit(1);
  }
}

seedGeographyExactly();
