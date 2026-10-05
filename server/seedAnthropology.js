/**
 * seedAnthropology.js
 * 
 * Master Anthropology Framework (79 Major Units)
 * Paper I: 42 Units
 * Paper II: 37 Units
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

// ═══════════════════════════════════════════════════════════════
// PAPER I — GENERAL ANTHROPOLOGY (42 Units)
// ═══════════════════════════════════════════════════════════════

const PAPER_1_DATA = [
    {
        chapter: "1. Meaning & scope",
        topics: [
            "Meaning of Anthropology", "Definitions of Anthropology", "Anthropology as the study of humankind",
            "Holistic approach", "Comparative approach", "Cross-cultural approach", "Evolutionary approach",
            "Biocultural approach", "Anthropological perspective", "Anthropological imagination", "Fieldwork orientation",
            "Anthropology as a science", "Anthropology as a social science", "Anthropology as a biological science",
            "Anthropology as a humanistic discipline", "Anthropology as an interdisciplinary discipline",
            "Anthropology as a holistic discipline", "Study of biological evolution", "Study of human variation",
            "Study of culture", "Study of society", "Study of language", "Study of prehistoric societies",
            "Study of contemporary societies", "Applied anthropology"
        ]
    },
    {
        chapter: "2. Development of anthropology",
        topics: [
            "Pre-scientific period", "Travellers", "Missionaries", "Explorers", "Colonial administrators",
            "Early descriptions of societies", "Evolutionary period", "Unilinear evolutionism", "Comparative method",
            "Cultural evolution", "Diffusionist period", "Historical Particularism", "Functionalism",
            "Structural Functionalism", "Culture and Personality", "Neo-evolutionism", "Structuralism",
            "Symbolic/Interpretive Anthropology", "Cognitive Anthropology", "Cultural Ecology", "Cultural Materialism",
            "Postmodern/Contemporary Anthropology"
        ]
    },
    {
        chapter: "3. Relationship with other disciplines",
        topics: [
            "Anthropology and Sociology", "Similarities and Differences in Sociology", "Subject matter comparison",
            "Methodology comparison", "Scale of study", "Fieldwork comparison", "Comparative approach",
            "Anthropology and Economics", "Economic anthropology", "Production", "Distribution", "Exchange", "Subsistence",
            "Anthropology and Political Science", "Political anthropology", "Power", "Authority", "Legitimacy", "State", "Stateless societies",
            "Anthropology and History", "Historical anthropology", "Oral history", "Ethnohistory", "Archaeology",
            "Anthropology and Psychology", "Culture and personality", "Psychological anthropology", "Child-rearing", "Personality formation",
            "Anthropology and behavioural sciences", "Behaviour", "Learning", "Socialisation", "Culture and behaviour",
            "Anthropology and Biology", "Human evolution", "Genetics", "Human variation", "Adaptation",
            "Anthropology and Zoology", "Primatology", "Comparative anatomy", "Evolution",
            "Anthropology and Genetics", "Population genetics", "Human evolution (Genetic)", "Genetic variation",
            "Medical anthropology", "Nutritional anthropology", "Epidemiological anthropology", "Human growth", "Genetic diseases", "Public health",
            "Earth Sciences", "Archaeology", "Geology", "Palaeoanthropology", "Dating methods", "Environmental reconstruction",
            "Humanities", "Philosophy", "History (Humanities)", "Linguistics", "Literature", "Religion", "Art", "Ethics"
        ]
    },
    {
        chapter: "4. Branches of anthropology",
        topics: [
            "Social-Cultural Anthropology", "Study of Culture", "Study of Society", "Social institutions", "Social organisation",
            "Kinship", "Marriage", "Family", "Religion (Socio-Cultural)", "Economy (Socio-Cultural)", "Political organisation",
            "Social control", "Social change", "Applications in Development", "Applications in Health", "Applications in Education",
            "Applications in Governance", "Tribal development",
            "Biological Anthropology", "Human evolution (Biological)", "Primatology", "Human genetics", "Human variation (Biological)",
            "Human growth (Biological)", "Human adaptation", "Population biology", "Human ecology", "Demography", "Forensic anthropology",
            "Archaeological Anthropology", "Prehistory", "Protohistory", "Material culture", "Stone tools", "Pottery",
            "Settlement", "Burial", "Subsistence (Archaeological)", "Technology (Archaeological)", "Cultural evolution (Archaeological)",
            "Linguistic Anthropology", "Language", "Communication", "Language structure", "Language and culture", "Language and society",
            "Linguistic variation", "Language change", "Symbolism"
        ]
    },
    {
        chapter: "5. Human evolution",
        topics: [
            "Biological factors in human evolution", "Variation", "Heredity", "Mutation", "Recombination", "Natural selection",
            "Sexual selection", "Genetic drift", "Gene flow", "Isolation", "Genetic differentiation", "Adaptation",
            "Cultural factors in human evolution", "Cultural evolution vs biological evolution", "Tool-making", "Tool use",
            "Hunting", "Food sharing", "Fire", "Cooking", "Language (Evolution)", "Cooperation", "Social organisation (Evolution)",
            "Symbolism (Evolution)", "Technology (Evolution)", "Learning (Evolution)", "Cultural transmission"
        ]
    },
    {
        chapter: "6. Evolutionary theories",
        topics: [
            "Pre-Darwinian theories", "Lamarckism", "Use and disuse", "Inheritance of acquired characteristics", "Environmental influence",
            "Criticism of Lamarckism", "Other early evolutionary ideas",
            "Darwinian evolution", "Charles Darwin", "Variation (Darwinism)", "Struggle for existence", "Natural selection (Darwinism)",
            "Survival/reproductive success", "Adaptation (Darwinism)", "Descent with modification", "Alfred Russel Wallace", "Darwin-Wallace theory",
            "Post-Darwinian theories", "Mutation theory", "Mendelian genetics in evolution", "Neo-Darwinism", "Modern evolutionary theory",
            "Synthetic Theory of Evolution", "Mutation (Synthetic)", "Recombination (Synthetic)", "Natural selection (Synthetic)",
            "Genetic drift (Synthetic)", "Gene flow (Synthetic)", "Isolation (Synthetic)", "Population genetics (Synthetic)",
            "Population as evolutionary unit", "Microevolution", "Macroevolution",
            "Evolutionary rules and concepts", "Doll's Rule", "Cope's Rule", "Gause's Rule", "Parallelism", "Convergence",
            "Divergence", "Adaptive radiation", "Mosaic evolution"
        ]
    },
    {
        chapter: "7. Primates",
        topics: [
            "Anatomical Characteristics of Primates", "Grasping hands", "Opposable thumb", "Nails", "Sensitive fingertips",
            "Forward-facing eyes", "Binocular vision", "Stereoscopic vision", "Reduced snout", "Brain development",
            "Flexible shoulder", "Generalised dentition",
            "Behavioural Characteristics of Primates", "Sociality", "Grooming", "Communication (Primates)", "Learning (Primates)",
            "Play", "Parenting", "Territoriality (Primates)",
            "Primate Evolutionary Trends", "Brain trends", "Vision trends", "Dentition trends", "Limbs trends", "Locomotion trends",
            "Posture trends", "Hands trends", "Social behaviour trends",
            "Primate Taxonomy", "Prosimians", "Anthropoids", "New World monkeys", "Old World monkeys", "Hominoids",
            "Gibbons", "Orangutan", "Gorilla", "Chimpanzee", "Humans (Taxonomy)",
            "Primate Adaptations", "Arboreal adaptation", "Grasping adaptation", "Climbing", "Prehensility", "Vision adaptation",
            "Limb proportions", "Tail adaptations", "Terrestrial adaptation", "Locomotion adaptation", "Weight-bearing",
            "Body proportions", "Social behaviour (Terrestrial)",
            "Primate Behaviour Analysis", "Feeding", "Grooming behaviour", "Communication behaviour", "Dominance", "Aggression",
            "Cooperation", "Sexual behaviour", "Parental care", "Infanticide", "Territoriality behaviour", "Tool use", "Intelligence",
            "Fossil Primates", "Tertiary primates", "Quaternary primates", "Evolutionary significance of fossil primates"
        ]
    },
    {
        chapter: "8. Human evolutionary anatomy",
        topics: [
            "Man-Ape comparison", "Skull comparison", "Cranial capacity comparison", "Cranial shape", "Brow ridges",
            "Face differences", "Prognathism", "Foramen magnum",
            "Dentition comparison", "Incisors", "Canines", "Premolars", "Molars", "Dental arcade",
            "Vertebral column comparison", "Curvature",
            "Pelvis comparison", "Shape", "Width", "Orientation",
            "Limbs comparison", "Arm/leg ratio", "Femur comparison", "Tibia comparison",
            "Foot comparison", "Arch", "Big toe", "Locomotion (Foot)",
            "Brain comparison", "Size (Brain)", "Organisation (Brain)"
        ]
    },
    {
        chapter: "9. Bipedalism",
        topics: [
            "Meaning of Bipedalism", "Evolution of bipedalism", "Advantages of bipedalism", "Costs of bipedalism",
            "Anatomical adaptations for bipedalism",
            "Skeletal changes", "Foramen magnum changes", "Vertebral column changes", "Pelvis changes", "Femur changes",
            "Knee changes", "Foot changes", "Big toe changes",
            "Theories of bipedalism", "Bipedalism and brain evolution", "Bipedalism and tool use"
        ]
    },
    {
        chapter: "10. Human fossils",
        topics: [
            "Australopithecines", "Australopithecus major species", "Distribution (Australopithecus)", "Anatomy (Australopithecus)",
            "Bipedalism (Australopithecus)", "Cranial capacity (Australopithecus)", "Culture (Australopithecus)",
            "Robust Australopithecines / Paranthropus", "Characteristics (Robust)", "Diet (Robust)", "Robusticity", "Evolutionary significance",
            "Homo habilis", "Cranial capacity (H. habilis)", "Anatomy (H. habilis)", "Tools (H. habilis)", "Significance (H. habilis)",
            "Homo erectus", "African Homo erectus", "Java Man", "Peking Man", "Anatomy (H. erectus)", "Cranial capacity (H. erectus)",
            "Fire (H. erectus)", "Tools (H. erectus)", "Migration (H. erectus)", "Culture (H. erectus)",
            "Archaic Homo", "Heidelberg-related forms", "Rhodesian Man",
            "Neanderthals", "Anatomy (Neanderthals)", "Cranial capacity (Neanderthals)", "Robusticity (Neanderthals)",
            "Adaptation (Neanderthals)", "Culture (Neanderthals)", "Burial (Neanderthals)", "Tools (Neanderthals)",
            "Relationship with modern humans",
            "Homo sapiens", "Cro-Magnon", "Upper Palaeolithic populations", "Anatomy (H. sapiens)", "Art (H. sapiens)",
            "Tools (H. sapiens)", "Culture (H. sapiens)", "Symbolism (H. sapiens)"
        ]
    },
    {
        chapter: "11. Prehistoric archaeology",
        topics: [
            "Relative dating", "Stratigraphy", "Superposition", "Typology", "Seriation", "Faunal correlation",
            "Absolute dating", "Radiocarbon dating", "Potassium-Argon dating", "Uranium series dating", "Thermoluminescence",
            "Dendrochronology", "Other relevant scientific dating methods",
            "Lower Palaeolithic", "Tools (Lower Palaeolithic)", "Acheulean", "Handaxe", "Cleaver", "Subsistence", "Settlement", "Fire usage",
            "Middle Palaeolithic", "Flake technology", "Levallois", "Hunting patterns", "Adaptation",
            "Upper Palaeolithic", "Blade technology", "Bone tools", "Art", "Symbolism", "Greater behavioural complexity",
            "Mesolithic", "Microliths", "Hunting", "Fishing", "Gathering", "Semi-sedentism", "Rock art", "Domestication beginnings",
            "Neolithic", "Food production", "Agriculture", "Domestication", "Sedentary life", "Pottery", "Polished tools",
            "Village settlement", "Social differentiation",
            "Chalcolithic", "Copper", "Stone-copper technology", "Agriculture (Chalcolithic)", "Settlement (Chalcolithic)",
            "Craft specialisation", "Trade", "Social differentiation (Chalcolithic)"
        ]
    },
    {
        chapter: "12. Culture",
        topics: [
            "Definition of Culture", "Meaning of Culture", "Characteristics of Culture", "Learned behaviour", "Shared behaviour",
            "Symbolic nature", "Integrated nature", "Dynamic nature", "Adaptive nature", "Transmitted nature",
            "Culture and Civilization difference", "Ethnocentrism", "Cultural relativism", "Acculturation", "Enculturation",
            "Assimilation", "Diffusion", "Syncretism", "Cultural lag", "Cultural change", "Cultural ecology"
        ]
    },
    {
        chapter: "13. Society",
        topics: [
            "Definition of Society", "Characteristics of Society", "Social relationships", "Social interaction",
            "Social groups", "Social institutions", "Social structure concepts", "Social organisation concepts",
            "Status", "Role", "Norms", "Values", "Institutions", "Groups", "Social networks", "Social stratification"
        ]
    },
    {
        chapter: "14. Marriage",
        topics: [
            "Definition of Marriage", "Universality of Marriage", "Social functions of Marriage", "Economic functions of Marriage",
            "Reproductive functions of Marriage", "Political functions of Marriage", "Kinship functions of Marriage",
            "Rules of Marriage", "Endogamy", "Exogamy", "Hypergamy", "Hypogamy", "Incest taboo",
            "Forms of Marriage", "Monogamy", "Polygamy", "Polygyny", "Polyandry", "Fraternal polyandry", "Non-fraternal polyandry",
            "Group marriage", "Marriage Regulation", "Prescriptive marriage", "Preferential marriage", "Proscriptive rules",
            "Marriage Payments", "Bridewealth", "Dowry", "Bride service",
            "Marriage and kinship", "Alliance", "Descent in Marriage", "Affinity", "Exchange"
        ]
    },
    {
        chapter: "15. Family",
        topics: [
            "Definition of Family", "Characteristics of Family", "Functions of Family",
            "Types of Family", "Nuclear family", "Joint family", "Extended family", "Stem family", "Compound family",
            "Family by descent", "Family by residence", "Family by authority", "Patriarchal family", "Matriarchal family",
            "Family and contemporary change", "Industrialisation impact", "Urbanisation impact", "Migration impact",
            "Women's employment impact", "Individualisation", "Changing household structures"
        ]
    },
    {
        chapter: "16. Kinship",
        topics: [
            "Kinship basic concepts", "Consanguinity", "Affinity (Kinship)", "Filiation",
            "Descent (Unilineal)", "Patrilineal descent", "Matrilineal descent", "Bilateral descent", "Double descent", "Ambilineal descent",
            "Descent groups", "Lineage", "Clan", "Phratry", "Moiety", "Kindred",
            "Kinship Terminology", "Descriptive terminology", "Classificatory terminology", "Hawaiian system", "Eskimo system",
            "Iroquois system", "Crow system", "Omaha system", "Sudanese system",
            "Kinship Rules", "Incest taboo (Kinship)", "Exogamy (Kinship)", "Endogamy (Kinship)", "Cousin marriage",
            "Cross-cousin marriage", "Parallel-cousin marriage", "Prescriptive alliance", "Avoidance relationships", "Joking relationship",
            "Kinship theories", "Morgan on Kinship", "Radcliffe-Brown on Kinship", "Malinowski on Kinship", "Lévi-Strauss on Kinship",
            "Evans-Pritchard on Kinship", "Fortes on Kinship", "Leach on Kinship"
        ]
    },
    {
        chapter: "17. Economic anthropology",
        topics: [
            "Meaning and Scope of Economic Anthropology", "Economy and culture", "Economy and social organisation",
            "Subsistence Systems", "Hunting-gathering", "Fishing", "Horticulture", "Pastoralism", "Agriculture",
            "Production", "Labour", "Technology in economy", "Resources", "Division of labour", "Gender division of labour",
            "Distribution", "Reciprocity", "Redistribution", "Market exchange",
            "Types of Reciprocity", "Generalised reciprocity", "Balanced reciprocity", "Negative reciprocity",
            "Economic theories", "Formalist approach", "Substantivist approach", "Karl Polanyi", "Malinowski (Economic)", "Firth"
        ]
    },
    {
        chapter: "18. Political anthropology",
        topics: [
            "Political organisation", "Band", "Tribe", "Chiefdom", "State",
            "Stateless societies", "Segmentary lineage systems", "Clan systems", "Age sets", "Councils", "Consensus", "Conflict resolution",
            "Power", "Authority", "Influence", "Coercion",
            "Types of Authority", "Traditional authority", "Charismatic authority", "Legal-rational authority",
            "Legitimacy", "Meaning of legitimacy", "Sources of legitimacy", "Political order",
            "Social control", "Informal control", "Custom", "Norms", "Religion as control", "Kinship as control", "Public opinion",
            "Formal control", "Law", "Courts", "Police", "State as formal control",
            "Political change", "Tribe to state transition", "Colonialism (Political)", "State formation", "Nation-state", "Globalisation (Political)"
        ]
    },
    {
        chapter: "19. Religion",
        topics: [
            "Meaning and Definition of Religion", "Characteristics of Religion", "Functions of Religion",
            "Sacred and Profane", "Durkheim's approach", "Animism", "Tylor's approach", "Animatism", "Mana",
            "Magic", "Imitative magic", "Contagious magic", "Magic vs religion", "Magic vs science",
            "Totemism", "Totem", "Clan and totemism", "Social organisation and totemism", "Ritual and totemism",
            "Myth", "Nature of myth", "Function of myth", "Oral tradition", "Symbolism of myth",
            "Ritual", "Meaning of Ritual", "Structure of Ritual", "Functions of Ritual", "Rites of passage", "Victor Turner on Ritual",
            "Religious specialists", "Priest", "Shaman", "Witch", "Sorcerer", "Medicine man",
            "Anthropological approaches", "Tylor (Religion)", "Frazer (Religion)", "Durkheim (Religion)", "Malinowski (Religion)",
            "Radcliffe-Brown (Religion)", "Evans-Pritchard (Religion)", "Clifford Geertz (Religion)"
        ]
    },
    {
        chapter: "20. Anthropological theories",
        topics: [
            "Evolutionism", "E. B. Tylor", "Cultural evolution", "Animism (Theory)", "Survivals",
            "Lewis Henry Morgan", "Savagery", "Barbarism", "Civilization", "Kinship evolution",
            "James Frazer", "Magic", "Religion", "Science",
            "Diffusionism", "British school", "German-Austrian school", "American diffusionism", "Culture areas", "Cultural traits", "Diffusion", "Culture circles",
            "Historical Particularism", "Franz Boas", "Culture history", "Cultural relativism (Theory)", "Criticism of evolutionism", "Fieldwork (Boas)", "Particular historical development",
            "Functionalism", "Bronislaw Malinowski", "Basic needs", "Derived needs", "Institutions", "Functionalism concepts", "Participant observation", "Kula",
            "Structural Functionalism", "A. R. Radcliffe-Brown", "Social structure (Theory)", "Social function", "Social system", "Structural continuity",
            "Culture and Personality", "Ruth Benedict", "Margaret Mead", "Ralph Linton", "Kardiner", "Basic personality", "Culture and personality", "Child-rearing", "National character",
            "Neo-evolutionism", "Leslie White", "Julian Steward", "Marshall Sahlins", "Elman Service", "Cultural evolution (Neo)", "Energy", "Technology", "Cultural ecology (Neo)", "Unilinear vs multilinear evolution", "Band-tribe-chiefdom-state",
            "Structuralism", "Claude Lévi-Strauss", "Binary oppositions", "Deep structure", "Myth (Structuralism)", "Kinship (Structuralism)", "Exchange (Structuralism)", "Nature/culture", "Edmund Leach",
            "Cultural Materialism", "Marvin Harris", "Infrastructure", "Structure", "Superstructure", "Material explanation of culture",
            "Symbolic Anthropology", "Victor Turner", "Symbols", "Ritual (Symbolic)", "Liminality", "Communitas",
            "Interpretive Anthropology", "Clifford Geertz", "Thick description", "Culture as text", "Symbols (Interpretive)", "Interpretation",
            "Cognitive Anthropology", "Culture as knowledge", "Classification", "Folk taxonomy", "Ethnosemantics", "Emic/etic",
            "Postmodern Anthropology", "Reflexivity", "Representation", "Power", "Voice", "Ethnographic authority", "Multi-sited ethnography", "Critical ethnography", "Multispecies anthropology"
        ]
    },
    {
        chapter: "21. Language & communication",
        topics: [
            "Definition of Language", "Characteristics of Language", "Origin of Language", "Structure of Language", "Language change",
            "Language and Culture", "Language as cultural expression", "Language influencing worldview", "Sapir-Whorf hypothesis", "Linguistic relativity",
            "Communication", "Verbal communication", "Non-verbal communication", "Symbolic communication", "Ritual communication",
            "Linguistic anthropology", "Language and society", "Language and identity", "Dialects", "Social variation", "Language and power"
        ]
    },
    {
        chapter: "22. Fieldwork",
        topics: [
            "Anthropology and fieldwork", "Evolution of fieldwork", "Armchair anthropology", "Scientific fieldwork", "Malinowski revolution",
            "Participant Observation", "Meaning", "Process", "Advantages", "Limitations", "Insider/outsider perspective",
            "Ethnography", "Meaning", "Objectives", "Data collection", "Writing", "Interpretation",
            "Ethnology", "Comparative study", "Cross-cultural analysis",
            "Contemporary ethnography", "Multi-sited ethnography", "Critical ethnography", "Multispecies ethnography", "Digital ethnography", "Reflexivity", "Ethics", "Positionality"
        ]
    },
    {
        chapter: "23. Research methodology",
        topics: [
            "Research design", "Research problem", "Hypothesis", "Variables", "Sampling", "Data collection", "Analysis", "Interpretation",
            "Methods of observation", "Participant observation method", "Interview", "Structured interview", "Unstructured interview",
            "Questionnaire", "Schedule", "Case study", "Life history", "Genealogical method", "Oral history", "Focus groups", "Survey"
        ]
    },
    {
        chapter: "24. Human genetics",
        topics: [
            "Basic genetics", "Gene", "Allele", "Genotype", "Phenotype", "Chromosome", "DNA", "RNA", "Mutation", "Recombination",
            "Cell biology", "Cell structure", "Nucleus", "Chromosomes (Cell)", "Mitochondria",
            "Cell division", "Mitosis", "Meiosis", "Crossing over", "Genetic recombination",
            "DNA function", "Structure", "Replication", "Transcription", "Translation", "Protein synthesis", "Genetic code",
            "Mendelian Genetics", "Mendel's laws", "Law of dominance", "Law of segregation", "Law of independent assortment", "Monohybrid inheritance", "Dihybrid inheritance",
            "Non-Mendelian Genetics", "Incomplete dominance", "Codominance", "Multiple alleles", "Polygenic inheritance", "Sex-linked inheritance", "Sex-influenced traits", "Sex-limited traits", "Mitochondrial inheritance", "Pleiotropy"
        ]
    },
    {
        chapter: "25. Population genetics",
        topics: [
            "Gene pool", "Allele frequency", "Genotype frequency", "Hardy-Weinberg principle",
            "Conditions for equilibrium", "Large population", "Random mating", "No mutation", "No migration", "No selection", "No drift",
            "Forces affecting gene frequencies", "Mutation (Force)", "Natural selection (Force)", "Genetic drift", "Gene flow", "Migration (Force)", "Isolation", "Non-random mating", "Inbreeding"
        ]
    },
    {
        chapter: "26. Human variation",
        topics: [
            "Morphological variation", "Height", "Weight", "Body proportions", "Skin pigmentation", "Hair", "Facial characteristics",
            "Physiological variation", "Blood", "Haemoglobin", "Metabolism", "Adaptation",
            "Population markers", "ABO", "Rh", "HLA", "Serum proteins", "Enzymes", "Genetic markers"
        ]
    },
    {
        chapter: "27. Race",
        topics: [
            "Historical concept of race", "Typological concept", "Biological limitations of race", "Race and ethnicity", "Racism", "Modern population approach"
        ]
    },
    {
        chapter: "28. Chromosomal abnormalities",
        topics: [
            "Numerical abnormalities", "Down syndrome", "Edwards syndrome", "Patau syndrome", "Turner syndrome", "Klinefelter syndrome", "Triple-X", "XYY",
            "Structural abnormalities", "Deletion", "Duplication", "Inversion", "Translocation",
            "Methods of human genetic studies", "Family studies", "Pedigree analysis", "Twin studies", "Foster child studies", "Adoption studies", "Biochemical genetics", "Immunological methods"
        ]
    },
    {
        chapter: "29. Human adaptation",
        topics: [
            "Biological adaptation", "Genetic adaptation", "Physiological adaptation", "Developmental adaptation",
            "Environmental adaptation", "Cold adaptation", "Heat adaptation", "High altitude adaptation", "Desert adaptation", "Tropical environment adaptation",
            "High-altitude adaptation cases", "Tibetans", "Andeans", "Ethiopians", "Haemoglobin differences", "Respiration adaptation", "Oxygen saturation", "Genetic adaptation evidence"
        ]
    },
    {
        chapter: "30. Ecological anthropology",
        topics: [
            "Human-environment relationship", "Culture ecology", "Human adaptation (Ecological)", "Cultural adaptation", "Ecological adaptation",
            "Resource use", "Carrying capacity", "Subsistence (Ecology)", "Environmental stress"
        ]
    },
    {
        chapter: "31. Epidemiological anthropology",
        topics: [
            "Disease", "Health", "Culture and disease", "Epidemiology", "Disease ecology", "Infectious disease", "Non-communicable disease",
            "Nutritional diseases", "Cultural determinants of health", "Medical anthropology"
        ]
    },
    {
        chapter: "32. Human growth",
        topics: [
            "Stages of growth", "Prenatal", "Neonatal", "Infancy", "Childhood", "Adolescence", "Adulthood (Growth)", "Old age (Growth)",
            "Growth types", "Physical growth", "Skeletal growth", "Dental growth", "Brain growth", "Sexual maturation",
            "Factors influencing growth", "Genetic factors", "Nutritional factors", "Environmental factors", "Socio-economic factors", "Cultural factors", "Disease factors",
            "Growth studies", "Longitudinal studies", "Cross-sectional studies", "Mixed longitudinal studies", "Anthropometry", "Growth curves", "Growth standards"
        ]
    },
    {
        chapter: "33. Human physique",
        topics: [
            "Somatotypes", "Endomorph", "Mesomorph", "Ectomorph", "Sheldon method", "Heath-Carter method"
        ]
    },
    {
        chapter: "34. Ageing",
        topics: [
            "Biological ageing", "Chronological age", "Biological age", "Senescence", "Longevity", "Life expectancy", "Factors affecting longevity"
        ]
    },
    {
        chapter: "35. Reproduction",
        topics: [
            "Bio-events", "Menarche", "Menopause", "Puberty", "Other reproductive milestones",
            "Fertility", "Fertility Concepts", "Fecundity", "Natality", "Fertility rate", "Fertility differential"
        ]
    },
    {
        chapter: "36. Demography",
        topics: [
            "Mortality", "Mortality rate", "Infant mortality", "Maternal mortality", "Life expectancy (Demography)",
            "Demographic theories", "Biological theories", "Social theories", "Cultural theories"
        ]
    },
    {
        chapter: "37. Sports anthropology",
        topics: [
            "Anthropometry in sports", "Somatotyping in sports", "Body composition", "Talent identification", "Performance", "Nutrition in sports"
        ]
    },
    {
        chapter: "38. Nutritional anthropology",
        topics: [
            "Nutrition concepts", "Food habits", "Malnutrition", "Undernutrition", "Obesity", "Cultural food practices", "Nutritional assessment"
        ]
    },
    {
        chapter: "39. Forensic anthropology",
        topics: [
            "Skeletal identification", "Age estimation", "Sex estimation", "Stature estimation", "Ancestry/population estimation", "Trauma", "Facial reconstruction",
            "Personal Identification", "Skeletal remains", "Dental identification", "Anthropometric methods", "DNA identification"
        ]
    },
    {
        chapter: "40. Applied genetics",
        topics: [
            "Paternity diagnosis", "Genetic counselling", "Eugenics", "Genetic screening",
            "Defence Equipment (Applications)", "Anthropometry in defence", "Ergonomics", "Human-machine interaction", "Equipment design", "Clothing", "Seating", "Protective equipment"
        ]
    },
    {
        chapter: "41. DNA technology",
        topics: [
            "DNA fingerprinting", "Genetic diagnosis", "Disease studies", "Molecular anthropology", "Population genetics applications",
            "Medical Anthropology (Applications)", "Disease studies", "Health studies", "Culture studies", "Reproductive health applications", "Nutrition applications", "Traditional medicine applications"
        ]
    },
    {
        chapter: "42. Serogenetics/cytogenetics",
        topics: [
            "Serogenetics", "Blood groups", "Population variation", "Genetic markers (Serogenetics)",
            "Cytogenetics", "Chromosomes (Cytogenetics)", "Karyotyping", "Reproductive abnormalities", "Genetic disorders (Cytogenetics)"
        ]
    }
];

// ═══════════════════════════════════════════════════════════════
// PAPER II — ANTHROPOLOGY OF INDIA (37 Units)
// ═══════════════════════════════════════════════════════════════

const PAPER_2_DATA = [
    {
        chapter: "43. Indian prehistoric archaeology",
        topics: [
            "Prehistoric India", "Palaeolithic", "Lower Palaeolithic", "Tools", "Acheulean", "Handaxes", "Cleavers", "Sites", "Subsistence", "Settlement",
            "Middle Palaeolithic", "Flake tools", "Levallois", "Hunting",
            "Upper Palaeolithic", "Blade tools", "Bone tools", "Art", "Symbolism",
            "Mesolithic India", "Microliths", "Hunting", "Fishing", "Gathering", "Early domestication", "Rock art", "Settlement", "Important Mesolithic sites",
            "Neolithic India", "Agriculture", "Domestication", "Pottery", "Polished stone tools", "Settlement", "Food production", "Social change",
            "Neolithic-Chalcolithic", "Copper", "Stone tools", "Agriculture", "Pastoralism", "Settlements", "Craft production", "Trade"
        ]
    },
    {
        chapter: "44. Indian protohistory/Indus",
        topics: [
            "Protohistoric India", "Indus Civilization", "Pre-Harappan", "Early Harappan", "Mature Harappan", "Late/Post-Harappan",
            "Urbanisation", "Cities", "Planning", "Drainage", "Architecture",
            "Economy", "Agriculture", "Craft", "Trade", "Internal exchange", "External trade",
            "Technology", "Metallurgy", "Pottery", "Bead-making", "Craft (Technology)",
            "Social organisation", "Stratification", "Occupation", "Settlement hierarchy",
            "Religion", "Burial", "Ritual", "Symbols",
            "Script", "Nature", "Problems of decipherment",
            "Decline", "Environmental theories", "Economic theories", "Social theories", "Multi-causal explanations"
        ]
    },
    {
        chapter: "45. Tribal contribution to civilization",
        topics: [
            "Tribal contributions to Indian civilization", "Technology", "Agriculture", "Forest knowledge", "Food systems", "Art", "Crafts",
            "Ecological knowledge", "Cultural traditions", "Folk traditions", "Language", "Music", "Ritual"
        ]
    },
    {
        chapter: "46. Indian palaeoanthropology",
        topics: [
            "Palaeo-anthropological evidence from India", "Siwalik evidence", "Ramapithecus", "Discovery", "Location", "Dating", "Morphology", "Evolutionary interpretation",
            "Sivapithecus", "Anatomy", "Distribution", "Significance",
            "Narmada Basin", "Narmada Man", "Discovery of Narmada Man", "Hathnora", "Dating of Narmada Man", "Cranial morphology", "Interpretation", "Place in Indian human evolution"
        ]
    },
    {
        chapter: "47. Indian ethnoarchaeology",
        topics: [
            "Ethno-archaeology Concept", "Definition", "Scope", "Objectives", "Methods", "Analogy", "Archaeological interpretation",
            "Survivals and parallels", "Hunting communities", "Foraging communities", "Fishing communities", "Pastoral communities", "Peasant communities", "Craft communities", "Art-producing communities"
        ]
    },
    {
        chapter: "48. Indian demographic profile",
        topics: [
            "Ethnic elements", "Historical population classifications", "Physical diversity", "Population variation", "Modern understanding of population",
            "Linguistic elements", "Indo-European", "Dravidian", "Austroasiatic", "Tibeto-Burman", "Andamanese languages", "Distribution", "Linguistic characteristics", "Cultural associations",
            "Indian population structure", "Fertility", "Mortality", "Migration", "Marriage", "Urbanisation", "Industrialisation", "Education", "Health", "Economic development",
            "Population growth", "Population transition", "Demographic transition", "Age structure", "Sex ratio", "Dependency"
        ]
    },
    {
        chapter: "49. Traditional Indian social system",
        topics: [
            "Varna", "Brahmana", "Kshatriya", "Vaishya", "Shudra", "Varna vs caste",
            "Ashrama", "Brahmacharya", "Grihastha", "Vanaprastha", "Sannyasa",
            "Purushartha", "Dharma", "Artha", "Kama", "Moksha",
            "Karma", "Meaning of Karma", "Social implications", "Religious implications",
            "Rina", "Deva Rina", "Rishi Rina", "Pitri Rina",
            "Rebirth", "Concept of Rebirth", "Social implications of Rebirth", "Religious worldview"
        ]
    },
    {
        chapter: "50. Caste",
        topics: [
            "Meaning of Caste", "Definition", "Characteristics", "Endogamy", "Hierarchy", "Hereditary occupation", "Social restrictions", "Purity and pollution", "Commensality", "Social mobility",
            "Varna and Jati", "Structure", "Scope", "Hierarchy differences", "Locality", "Occupation", "Ritual status",
            "Theories of Origin of Caste", "Racial theory", "Religious theory", "Occupational theory", "Political theory", "Economic theory", "Evolutionary/historical explanations", "Contemporary critiques",
            "Features of caste", "Segmental division", "Occupational association", "Social control",
            "Dominant Caste", "M. N. Srinivas", "Meaning of Dominant Caste", "Criteria", "Land ownership", "Numerical strength", "Political influence", "Education", "Economic power",
            "Caste and Politics", "Electoral mobilisation", "Vote banks", "Caste associations", "Political representation", "Reservation", "Identity politics",
            "Jajmani System", "Definition", "Structure", "Functions", "Exchange", "Hereditary relations", "Criticism", "Decline", "Contemporary transformation"
        ]
    },
    {
        chapter: "51. Sacred Complex",
        topics: [
            "Sacred Complex Concept", "Louis Dumont", "Indian sociological-anthropological context",
            "Components of Sacred Complex", "Sacred geography", "Sacred specialists", "Ritual", "Pilgrimage", "Religious institutions",
            "Universalisation", "Parochialisation", "Sanskritization (Sacred Complex)", "Great Tradition/Little Tradition"
        ]
    },
    {
        chapter: "52. Nature-Man-Spirit Complex",
        topics: [
            "Nature-Man-Spirit Complex", "Nature", "Human society", "Spirit world", "Cosmology", "Ritual", "Ecology", "Resource use", "Environmental adaptation", "Indigenous ecological knowledge"
        ]
    },
    {
        chapter: "53. Indian anthropological thinkers",
        topics: [
            "Colonial anthropology", "Census", "Ethnographic surveys", "Administrative anthropology", "Classification", "Racial approaches", "Tribal administration",
            "Major Indian anthropologists", "Sarat Chandra Roy", "L. K. Ananthakrishna Iyer", "H. H. Risley", "G. S. Ghurye",
            "D. N. Majumdar", "N. K. Bose", "Verrier Elwin", "Irawati Karve", "S. C. Dube",
            "M. N. Srinivas (Thinker)", "L. P. Vidyarthi", "K. S. Singh"
        ]
    },
    {
        chapter: "54. Indian village",
        topics: [
            "Village as social system", "Social organisation", "Kinship", "Caste", "Economy", "Religion", "Politics",
            "Village studies", "M. N. Srinivas contributions", "S. C. Dube contributions", "D. N. Majumdar contributions", "Andre Béteille contributions",
            "Village economy", "Agriculture", "Land", "Labour", "Tenancy", "Jajmani", "Rural markets",
            "Village social structure", "Caste (Village)", "Class", "Kinship (Village)", "Faction", "Gender",
            "Factionalism", "Meaning", "Causes", "Leadership", "Politics", "Panchayat",
            "Panchayati Raj", "Decentralisation", "Local government", "Participation", "Representation", "Women", "SC/ST", "Political mobilisation",
            "Rural transformation", "Green Revolution", "Mechanisation", "Migration", "Urbanisation", "Education", "Media", "Globalisation"
        ]
    },
    {
        chapter: "55. Linguistic minorities",
        topics: [
            "Linguistic minorities", "Language", "Identity", "Regionalism", "Political representation", "Cultural rights"
        ]
    },
    {
        chapter: "56. Religious minorities",
        topics: [
            "Religious minorities", "Identity", "Social integration", "Cultural interaction", "Communalism", "Political participation", "Socio-economic issues"
        ]
    },
    {
        chapter: "57. Social-cultural change",
        topics: [
            "Sanskritization", "Process", "Agents", "Effects", "Limitations",
            "Westernization", "Colonial influence", "Education", "Technology", "Law", "Institutions",
            "Modernization", "Rationalisation", "Secularisation", "Urbanisation", "Industrialisation",
            "Little Tradition", "Robert Redfield", "Great Tradition", "Great/Little Tradition interaction",
            "Universalization", "Parochialization",
            "Social change factors", "Democracy", "Constitution", "Globalisation", "Media", "Migration"
        ]
    },
    {
        chapter: "58. Tribe",
        topics: [
            "Concept of Tribe", "Definition", "Characteristics", "Tribe vs caste", "Tribe vs peasant", "Tribe vs ethnic group", "Tribe and state"
        ]
    },
    {
        chapter: "59. Tribal distribution",
        topics: [
            "Central India", "Gond", "Santhal", "Munda", "Oraon", "Bhil",
            "Northeast India", "Naga groups", "Mizo", "Khasi", "Garo", "Bodo", "Arunachal tribes",
            "Western India", "Garasia", "Warli",
            "Southern India", "Toda", "Kota", "Irula", "Kurumba", "Chenchu",
            "Himalayan region", "Himalayan tribal communities",
            "Andaman & Nicobar", "Great Andamanese", "Onge", "Jarawa", "Sentinelese", "Nicobarese", "Shompen"
        ]
    },
    {
        chapter: "60. Tribal social organisation",
        topics: [
            "Family (Tribal)", "Marriage (Tribal)", "Kinship (Tribal)", "Clan (Tribal)", "Lineage (Tribal)", "Age grades", "Youth dormitories", "Village organisation"
        ]
    },
    {
        chapter: "61. Tribal economy",
        topics: [
            "Hunting-gathering", "Fishing", "Shifting cultivation", "Pastoralism", "Agriculture", "Forest economy", "Wage labour", "Industrial labour"
        ]
    },
    {
        chapter: "62. Tribal religion",
        topics: [
            "Animism", "Ancestor worship", "Nature worship", "Totemism", "Sacred groves", "Ritual specialists", "Magic (Tribal)", "Shamanism",
            "Tribal art and culture", "Music", "Dance", "Painting", "Craft", "Architecture", "Oral traditions", "Festivals", "Material culture (Tribal)"
        ]
    },
    {
        chapter: "63. Tribal political organisation",
        topics: [
            "Village councils", "Chiefs", "Elders", "Traditional authority", "Consensus", "Customary law", "Modern Panchayati Raj"
        ]
    },
    {
        chapter: "64. Tribal problems",
        topics: [
            "Land alienation", "Moneylenders", "Land markets", "Non-tribal encroachment", "Legal safeguards",
            "Indebtedness", "Causes", "Moneylending", "Poverty", "Exploitation", "Informal credit",
            "Tribal Poverty", "Subsistence economy", "Low productivity", "Market exclusion", "Landlessness",
            "Tribal Education", "Access", "Language barriers", "Dropouts", "Residential schooling", "Digital divide",
            "Tribal Health", "Malnutrition", "Maternal health", "Infant mortality", "Infectious disease", "Genetic disorders", "Access to healthcare", "Traditional medicine",
            "Forest-related problems", "Forest dependence", "Colonial forest policies", "Conservation conflicts", "Forest rights", "Minor forest produce", "Community resource rights",
            "Tribal Migration", "Seasonal migration", "Distress migration", "Labour migration", "Urban migration", "Cultural consequences"
        ]
    },
    {
        chapter: "65. Tribal development",
        topics: [
            "Approaches to tribal policy", "Isolation", "Assimilation", "Integration", "Participation",
            "Tribal development programmes", "Community development", "Tribal development blocks", "Integrated Tribal Development Projects", "Special Central Assistance", "Livelihood programmes", "Education schemes", "Health programmes",
            "Tribal development challenges", "Implementation", "Leakage", "Administrative problems", "Cultural mismatch", "Local governance"
        ]
    },
    {
        chapter: "66. Tribal administration",
        topics: [
            "Colonial period", "Exclusion", "Scheduled/Excluded Areas", "Administrative classification",
            "Post-independence", "Fifth Schedule", "Scheduled Areas", "Governor", "Tribes Advisory Council",
            "Sixth Schedule", "Autonomous District Councils", "Autonomous Regional Councils", "Northeast tribal governance",
            "PESA", "Gram Sabha", "Community resources", "Self-governance", "Customary practices",
            "Forest Rights Act", "Individual rights", "Community rights", "Community forest resource", "Recognition of forest dwellers"
        ]
    },
    {
        chapter: "67. Constitutional safeguards",
        topics: [
            "Fundamental rights", "Protective discrimination", "Reservation", "Political representation", "Educational safeguards", "Employment safeguards"
        ]
    },
    {
        chapter: "68. PVTGs",
        topics: [
            "Meaning of PVTGs", "Characteristics of PVTGs", "Small population", "Geographical isolation", "Low literacy", "Subsistence economy", "Technological backwardness", "Vulnerability",
            "Distribution of PVTGs", "Problems of PVTGs", "Health", "Nutrition", "Land", "Livelihood", "Cultural survival", "Development approach"
        ]
    },
    {
        chapter: "69. Tribal movements",
        topics: [
            "Colonial tribal movements", "Santhal rebellion", "Birsa Munda movement", "Tana Bhagat movement", "Other regional movements",
            "Movement Breakdown", "Background", "Leader", "Tribe", "Region", "Causes", "Nature", "Course", "Government response", "Outcome", "Significance",
            "Post-independence tribal movements", "Naga movement", "Mizo movement", "Jharkhand movement", "Bodo movement", "Gond movements", "Other autonomy movements",
            "Tribal movements and ethnicity", "Identity", "Ethnicity", "Autonomy", "Regionalism", "Statehood", "Self-determination"
        ]
    },
    {
        chapter: "70. Tribe-caste continuum",
        topics: [
            "Tribe/Caste concepts", "Cultural contact", "Acculturation", "Assimilation", "Sanskritization", "Hinduization", "Tribalisation", "Integration"
        ]
    },
    {
        chapter: "71. Religion and tribes",
        topics: [
            "Impact of Hinduism", "Impact of Christianity", "Impact of Islam", "Impact of Buddhism",
            "Effect on tribes", "Tribal identity", "Social organisation", "Culture", "Conversion", "Political mobilisation", "Ethnic identity", "Social change"
        ]
    },
    {
        chapter: "72. Tribe and nation-state",
        topics: [
            "Tribal identity and the state", "National integration", "Autonomy and self-governance", "Ethnic nationalism", "Regionalism", "Secessionism", "State response"
        ]
    },
    {
        chapter: "73. Ethnicity",
        topics: [
            "Ethnicity concepts", "Ethnic conflict", "Identity politics", "Cultural boundaries", "National integration (Ethnicity)"
        ]
    },
    {
        chapter: "74. Regionalism",
        topics: [
            "Regionalism concepts", "Anthropological interpretation of Regionalism", "Regionalism and Migration"
        ]
    },
    {
        chapter: "75. Industrialisation and tribes",
        topics: [
            "Industrialisation", "Employment", "Displacement", "Labour migration", "Cultural change",
            "Development projects", "Dams", "Mining"
        ]
    },
    {
        chapter: "76. Urbanisation and tribes",
        topics: [
            "Urbanisation", "Migration", "Urban tribal populations", "Identity in urban areas", "Adaptation"
        ]
    },
    {
        chapter: "77. Displacement",
        topics: [
            "Causes of Displacement", "Dams", "Mining", "Industries", "Infrastructure", "Conservation", "Urbanisation",
            "Consequences of Displacement", "Land loss", "Livelihood loss", "Cultural loss", "Social disintegration", "Migration", "Identity crisis"
        ]
    },
    {
        chapter: "78. Rehabilitation/resettlement",
        topics: [
            "Compensation", "Resettlement", "Rehabilitation", "Livelihood restoration", "Social rehabilitation", "Cultural rehabilitation", "Participation", "Consent", "Rights-based approach"
        ]
    },
    {
        chapter: "79. Anthropology and development",
        topics: [
            "Role of anthropologists in tribal development", "Policy formulation", "Baseline surveys", "Social impact assessment", "Participatory development", "Health", "Education", "Livelihood", "Rehabilitation", "Cultural preservation", "Conflict resolution"
        ]
    }
];


// ═══════════════════════════════════════════════════════════════
// SEEDER
// ═══════════════════════════════════════════════════════════════

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        let anthroSubject = await Subject.findOne({ name: 'Anthropology' });
        if (!anthroSubject) {
            console.log('Anthropology subject not found, creating it...');
            anthroSubject = await Subject.create({ name: 'Anthropology', description: 'Anthropology Optional Subject' });
        }
        const subjectId = anthroSubject._id;

        const deleteRes = await Topic.deleteMany({ subjectId });
        console.log(`Deleted ${deleteRes.deletedCount} existing Anthropology topics.`);

        const topicsToInsert = [];
        let p1Count = 0;
        let p2Count = 0;

        PAPER_1_DATA.forEach((chapterObj, cIndex) => {
            // Create a clean standard name without the leading number for the UI, or keep the number?
            // Keeping the number since it was explicitly requested in the 1-79 list.
            const chapterCleanName = chapterObj.chapter;

            chapterObj.topics.forEach((title, tIndex) => {
                p1Count++;
                topicsToInsert.push({
                    subjectId,
                    paper: 'Anthropology',
                    subjectName: 'Anthropology Paper I',
                    chapter: chapterCleanName,
                    heading: chapterCleanName,
                    topicCode: `ANT1-${String(cIndex + 1).padStart(2, '0')}-${String(tIndex + 1).padStart(2, '0')}`,
                    title,
                    tags: ['Anthropology', 'Anthropology Paper I', chapterCleanName],
                    difficulty: 'Medium',
                    status: 'Pending',
                    completed: false,
                    notes: { theory: '' }
                });
            });
        });

        PAPER_2_DATA.forEach((chapterObj, cIndex) => {
            const chapterCleanName = chapterObj.chapter;

            chapterObj.topics.forEach((title, tIndex) => {
                p2Count++;
                topicsToInsert.push({
                    subjectId,
                    paper: 'Anthropology',
                    subjectName: 'Anthropology Paper II',
                    chapter: chapterCleanName,
                    heading: chapterCleanName,
                    topicCode: `ANT2-${String(cIndex + 43).padStart(2, '0')}-${String(tIndex + 1).padStart(2, '0')}`,
                    title,
                    tags: ['Anthropology', 'Anthropology Paper II', chapterCleanName],
                    difficulty: 'Medium',
                    status: 'Pending',
                    completed: false,
                    notes: { theory: '' }
                });
            });
        });

        const inserted = await Topic.insertMany(topicsToInsert);
        console.log(`\n✅ Successfully seeded ${inserted.length} Anthropology topics across 79 Major Units!`);
        console.log(`  - Anthropology Paper I (42 Units): ${p1Count} micro-topics`);
        console.log(`  - Anthropology Paper II (37 Units): ${p2Count} micro-topics`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
