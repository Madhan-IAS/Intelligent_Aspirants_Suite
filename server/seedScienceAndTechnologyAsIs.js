/**
 * Seed Science & Technology Syllabus (GS III) Exactly As Is
 * Run: node seedScienceAndTechnologyAsIs.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const RAW_ST_TEXT = `
SCIENCE  
& TECHNOLOGY
CHEMISTRY
 Elements and Molecules 
 States of Matters 
 Atomic structure 
 Chemical bonding 
 Metals and non-metals 
 Metallurgy  
 Acid and base 
 Applications of electrochemistry   
(Battery and Charging devices)
 Properties of solution 
 Chemicals in everyday life 
 Polymers and Biopolymers 
 Chemistry of Pharmaceuticals  
 Carbon and its allotropes 
 Hydrocarbons and their derivatives 
 Biomolecules  
 Vitamins and Enzymes 
 Properties of funda-mental particles 
 Fundamental forces 
 Energy and its various types 
 Optics  
 Electromagnetic spectrum 
 Laws and theories in physics, Relativity 
 Electromagnetism 
 Heat and thermodynamics 
 Waves  
 Mechanical  
 Electromagnetic waves 
 Universe 
 Planets, stars, and galaxies 
 Big-bang theory and singularity 
 Dark matter and energy 
 Black holes 
 Neutrino Observatory 
 Gravitational Waves 
 Sunspot 
 Magnetars and Neutron stars 
 Sub-atomic particles 
CHEMISTRY
PHYSICS
 Chemical Building Blocks   
of Life
 History and Origin of Life 
 Diversity of Living Things 
 Classification and Domains of Life 
 Viruses 
 Prokaryotes 
 Eukaryotes 
 Protists 
 Plants 
BIOLOGY
SCIENCE  
& TECHNOLOGY
UPSC SYLLABUS 2024-25 www.iasscore.in 59
 Fungi 
 Animals 
 Evolution
 Evolution of Life 
 Human Evolution 
 Genetics
 Inheritance 
 DNA and RNA 
 Gene Expression 
 Gene Regulation 
 Mutation 
 Cells
 Cell Structure 
 Membranes 
 Cell-Cell Interactions 
 Respiration 
 Energy and Metabolism 
 Cells Division 
 Tissues 
 Epithelial tissue 
 Connective tissue 
 Muscle tissue 
 Nervous 
 Myocardial 
 Hepatic  
 Organ system and Human 
physiology
 Endocrine System 
 Respiratory system 
 Circulatory system 
 Skeletal and Muscular Systems 
 Reproduction 
 Excretion, Osmoregulation and   
Thermoregulation
 The Digestive System 
 Immune system 
 Nutrition
 Classification by Source of Energy   
and Carbon
 Plant Nutrition 
 Animal Nutrition 
 Human Diet 
 Plant physiology
 Photosynthesis 
 Respiration 
 Plant-water balance 
 Reproduction 
 Economic Zoology
 Microbes in Human Welfare 
 Beneficial animals 
 Beneficial insects 
 Economic botany
 Family of angiosperms 
 Tissue culture 
 Grafting 
 Horticulture 
 Imaging techniques
 CT scan 
 Magnetic resonance imaging 
 Positron emission tomography (PET) 
 Biological fuel generation
 Generation and significance of fossils   
fuels 
 Biofuels from biomass 
 Biodiesel 
 Natural gas and petroleum 
 Hydrogen 
60 UPSC SYLLABUS 2024-25 www.iasscore.in
 Genetic Engineering, Process,   
and Application
 Genomics  
 Proteomics 
 RNA Types & Technology 
 Genome sequencing and Its  
Applications 
 Application of biotechnology   
in Environment
 Bio composting  
 Bioremediation
 Microbial remediation 
 Carbon capture Technology 
 Plant biotechnology
 Transgenic plants 
 Methods and application of Plant   
biotechnology
 Animal biotechnology 
 Transgenic animals 
 Methods and application of Animal   
biotechnology
 Application of Biotechnology in 
Food and beverage industry
 Bioprocessing  
 Bioreactors 
 Manipulation of Enzymes  
 Food processing 
 Single cell protein 
 Food fortification  
 Application of Biotechnology in 
agriculture
 GM technology  
 GM crops 
 Pest Resistant Plants 
 Biotechnology and medicine
 Gene Editing  
 Gene therapy 
 Molecular Diagnosis 
 PCR 
 ELISA 
 Antibody-Antigen interactions and   
detections
 Embryo transfer technology 
 Stem cells and their engineering 
 Biopharmaceuticals/therapeutic   
proteins
 Brain fingerprinting technology 
 Bioethics and Biopiracy 
 Biosafety protocols 
 IPR in Biotechnology 
 Recent trends in biotechnology  
and applied biotechnology
 Human Diseases
 Common diseases in human and their   
causative agents
 Diseases due to nutrient deficiency 
 Molecular biology and human disease 
 Chromosomal inheritance and disease 
 Extra chromosomal inheritance and   
disease 
 Vector borne diseases 
 Water borne diseases 
 Lifestyle diseases 
 Immunity and its types 
HUMAN HEALTH & DISEASES
BIOTECHNOLOGY
UPSC SYLLABUS 2024-25 www.iasscore.in 61
 Types of orbits 
 Types of Launch Vehicles and  
application
 Space missions of key space   
agencies
 NASA 
 ISRO 
 ESA 
 ROSCOSMOS 
 JAXA 
 CNSA 
 ISRO and its role in national  
development
 Private sector in space 
 Public-private partnership in  
space sector
 Space Technology
 Cryogenics 
 Nanosatellites 
 Electric Propulsion 
 Aviation Internet, Starlink   
communication
 Satellite communications 
 Remote sensing and its applications 
 Ground Segment-As-A-Service 
 Green Propellant 
 Deep Space Atomic Clock 
 Strategic dimensions
 Space weapons 
 A-SAT technology 
 Laser technology 
 HGV technology 
 International Space   
Collaboration
 Various Space Observatories 
 Various Telemetry 
 Navigation
 Global Positioning System 
 Galileo 
 GLONASS 
 IRNSS 
 Geopolitics of outer space 
SPACE
 Vaccination and Immunisation 
 Vaccination program of India 
 Medicines
 Antibiotics 
 Antiviral and antifungal drugs 
 Monoclonal antibodies therapy 
 Antimicrobial drug resistance 
 Drug formulations 
 Drug pricing in India 
 Pharmacogenetics 
DEFENCE
 Missile System & Classification 
 Ballistics And Cruise Missile 
 India’s Missile System 
 Integrated Guided Missile  
Program
 Missile Defence Programmes
 Defence Technology 
 Application of robotics in defence   
sector
 Application of AI in defence 
 Internet of Military Things (IoMT) 
62 UPSC SYLLABUS 2024-25 www.iasscore.in
NUCLEAR ENERGY
 Types of nuclear reactions 
 Nuclear Energy and its  application
 Civil and military applications of   
Nuclear Energy
 Nuclear Fuels and   
Centrifugation
 Nuclear Reactor 
 Nuclear Policy of India 
 Nuclear Radiation and   
Its impact
 Radioactive Waste 
 Nuclear & Radiological   
Disasters
 Institutions involved in   
Nuclear Energy Development
 Department of Atomic Energy 
 Atomic Energy Regulatory Board 
 Bhabha Atomic Research Centre 
 Indira Gandhi Centre for Atomic   
Research
 Computers
 Generation of computers 
 Computer terminologies 
 Supercomputer and its applications 
 Cloud computing 
 Information Technology
 Components of IT 
 IT enabled services 
 Application of IT 
 Display Technologies
 Cathode ray 
 LCD
 LED 
 Plasma Monitors 
 OLED 
 AMOLED 
 Mobile Generations 
 Smartphone 
 Net Neutrality 
 Internet of Things 
 Big Data Initiative and Privacy 
 Cyber-crime and Security 
 Government Initiatives 
NANO SCIENCE & NANO TECHNOLOGIES
Basics of Nano Science and   
Nano Technology
 Nanomaterial 
 Applications of  Nano Technology
 Nano medicine 
 Semiconductors and computing 
 Food 
 Textiles 
  Sustainable energy 
 Environment 
 Transport 
 Space 
 Agriculture 
 Impacts of Nano Technology
 Adverse Health and Environmental  
 Social and Ethical Impacts 
 Nano Science & Nano   
technology in India
ROBOTICS & AI
 Robotics
 Machine vs Computer vs Robots 
 Parts of a Robot 
 Classification of Robots 
 Advantages and Disadvantages of   
Robot
 Applications of Robotics in   
Agriculture, industry, defence, etc.
 AI
 Neural networks 
 Machine Learning and Deep learning 
 Application of AI 
 Artificial Intelligence and Robotics 
 LED 
 Plasma Monitors 
 OLED 
 AMOLED 
 Mobile Generations 
 Smartphone 
 Net Neutrality 
 Internet of Things 
 Big Data Initiative and Privacy 
 Cyber-crime and Security 
 Government Initiatives 
IPR
 IPR
 What are Intellectual Property Rights   
(IPR)?
 Types of Intellectual Property Rights 
 International Agreements and   
Institution on IPR
 IPR Regime in India 
 National Intellectual Property Rights   
Policy
64 UPSC SYLLABUS 2024-25
www.iasscore.in
INSTITUTIONS & POLICY
INSTITUTIONS & POLICY
India’s policy in the field of the science   
and technology
Various policies for S&T  
Institutional structure 
Department of Science & Technology 
Technology Development Board 
National Accreditation Board For  
Testing And Calibration Laboratories
Science and technology as a source of   
Human Resource Development
Awards related to Science 
CSIR 
Science and Engineering Research  
Board
India and global collaboration in  
science projects
Technology Vision Document 2035 
CONTEMPORARY ISSUES
Private sector and its role in space
Indigenization of Technology and 
Developing New Technology.
Defence Technology Issues, Challenges 
and solutions
Indigenization in the Defence 
Technology
Importance and Challenges in front of 
India with respect to Nuclear energy 
use.
Importance of Nano-technology in 21st 
century
Biotechnology and its challenges
Applications of Web 3.0
Additive Manufacture: opportunities & 
challenges
Importance of AI in India
Robotics and Issues of Unemployment
Issue of Public Health Surveillance
India’s Space Sector (Private Sector in 
Space, Indian Space Policy – 2023)
Space Debris
Importance of Drone Technology in 
Indian Agriculture
Policing in the Metaverse
5G Technology & India (Web 5.0)
India’s geospatial technology
CRISPR & its role in changing the world 
(10 Years of CRISPR)
Increasing adoption of AI (Delhi Police’s 
use of Facial Recognition Technology)
ChatGPT: Artificial Intelligence and 
ethical challenges
Biotransformation technology
Increasing Cyber Attacks (LockBit 
ransomware, Bluebugging, Hermit, the 
Pegasus-like spyware)
Deepfake (China to rein in ‘deepfake’ 
tech)
Antimicrobial Resistance (recognised as 
a ‘silent pandemic’)
India’s Deep Ocean Mission
The uncontrolled re-entries of satellites
Human Cell Atlas
The status of India’s national cyber 
security strategy
Recycling heat generated by datacenters
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

    console.log('Asking Gemini to clean up split lines and list all S&T subtopics as a JSON array of strings...');
    const ai = new GoogleGenAI({});
    const prompt = `
    Here is a raw text list of UPSC Science & Technology (S&T) topics.
    Some lines have been split across lines during copy-pasting (e.g. "Civil and military applications of" and then "Nuclear Energy" should be "Civil and military applications of Nuclear Energy").
    Also, remove headers/footers like "SCIENCE & TECHNOLOGY", "CHEMISTRY", "PHYSICS", "BIOLOGY", "BIOTECHNOLOGY", "HUMAN HEALTH & DISEASES", "SPACE", "DEFENCE", "NUCLEAR ENERGY", "NANO SCIENCE & NANO TECHNOLOGIES", "ROBOTICS & AI", "IPR", "INSTITUTIONS & POLICY", "CONTEMPORARY ISSUES", "UPSC SYLLABUS 2024-25 www.iasscore.in 59", "60", "61", "62", "64", "www.iasscore.in".
    Do not summarize, do not skip, and do not omit any single subtopic. Keep all of them!
    Return a JSON array of strings, where each string is a complete topic or subtopic from the list.

    Raw Text:
    ${RAW_ST_TEXT}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const topicsArray = JSON.parse(response.text);
    console.log(`Gemini cleaned up ${topicsArray.length} total S&T topics.`);

    // Delete any existing Science & Technology topics under GS III
    const deleteRes = await Topic.deleteMany({
      subjectId: subject._id,
      tags: 'Science & Technology'
    });
    console.log(`Deleted ${deleteRes.deletedCount} old S&T topics.`);

    const topicsToInsert = topicsArray.map(title => ({
      title: title.trim(),
      tags: ["Science & Technology"],
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
    console.log(`✅ Successfully seeded all ${inserted.length} S&T topics exactly as is!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
