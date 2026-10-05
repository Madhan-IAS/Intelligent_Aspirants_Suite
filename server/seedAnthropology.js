/**
 * seedAnthropology.js
 * 
 * Clears and seeds the complete Anthropology optional syllabus (Paper I and Paper II)
 * into MongoDB. Follows the exact same pattern as seedSociology.js.
 * 
 * Run: node seedAnthropology.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

// ═══════════════════════════════════════════════════════════════
// PAPER I — GENERAL ANTHROPOLOGY
// ═══════════════════════════════════════════════════════════════

const paper1Topics = [
    // 1. MEANING, SCOPE AND DEVELOPMENT
    "Meaning and definition of Anthropology — holistic, comparative, cross-cultural and biocultural approaches.",
    "Nature of Anthropology — as a science, social science, biological science, humanistic and interdisciplinary discipline.",
    "Scope of Anthropology — biological evolution, human variation, culture, society, language, prehistory, applied anthropology.",

    // 2. DEVELOPMENT OF ANTHROPOLOGY
    "Pre-scientific period — travellers, missionaries, explorers, colonial administrators.",
    "Evolutionary period — unilinear evolutionism and the comparative method.",
    "Diffusionist period and culture circles.",
    "Historical Particularism — Franz Boas.",
    "Functionalism — Malinowski; basic needs, derived needs, institutions.",
    "Structural Functionalism — Radcliffe-Brown; social structure, function, system.",
    "Culture and Personality school — Benedict, Mead, Linton, Kardiner.",
    "Neo-evolutionism — White, Steward, Sahlins, Service.",
    "Structuralism — Lévi-Strauss; binary oppositions, myth, kinship, exchange.",
    "Symbolic and Interpretive Anthropology — Turner, Geertz; thick description, liminality.",
    "Cognitive Anthropology — culture as knowledge, folk taxonomy, ethnosemantics.",
    "Cultural Ecology and Cultural Materialism — Marvin Harris.",
    "Postmodern Anthropology — reflexivity, representation, multi-sited ethnography.",

    // 3. RELATIONSHIP WITH OTHER DISCIPLINES
    "Anthropology and Sociology — similarities, differences, methodology, fieldwork.",
    "Anthropology and Economics — economic anthropology, production, distribution, exchange.",
    "Anthropology and Political Science — political anthropology, power, authority, state, stateless societies.",
    "Anthropology and History — historical anthropology, oral history, ethnohistory.",
    "Anthropology and Psychology — culture and personality, psychological anthropology.",
    "Anthropology and Biology — human evolution, genetics, human variation, adaptation.",
    "Anthropology and Medical Sciences — medical, nutritional and epidemiological anthropology.",
    "Anthropology and Earth Sciences — archaeology, geology, palaeoanthropology, dating methods.",

    // 4. MAIN BRANCHES
    "Social-Cultural Anthropology — culture, society, institutions, kinship, marriage, religion, economy, polity, change.",
    "Biological Anthropology — evolution, primatology, genetics, variation, growth, adaptation, forensic anthropology.",
    "Archaeological Anthropology — prehistory, material culture, tools, pottery, settlement, technology.",
    "Linguistic Anthropology — language, communication, language and culture, language and society.",

    // 5. HUMAN EVOLUTION
    "Biological factors in human evolution — variation, heredity, mutation, natural selection, drift, gene flow, isolation, adaptation.",
    "Cultural factors in human evolution — tools, fire, language, cooperation, social organisation, technology, cultural transmission.",

    // 6. THEORIES OF ORGANIC EVOLUTION
    "Lamarckism — use and disuse, inheritance of acquired characteristics, criticism.",
    "Darwinism — variation, struggle for existence, natural selection, survival, descent with modification.",
    "Post-Darwinian theories — mutation theory, Mendelian genetics, Neo-Darwinism.",
    "Synthetic Theory of Evolution — mutation, recombination, selection, drift, gene flow, isolation.",
    "Evolutionary rules — Doll's Rule, Cope's Rule, Gause's Rule, parallelism, convergence, divergence, adaptive radiation, mosaic evolution.",

    // 7. PRIMATES
    "Characteristics of Primates — grasping hands, opposable thumb, binocular vision, brain development, sociality.",
    "Primate evolutionary trends — brain, vision, dentition, limbs, locomotion, social behaviour.",
    "Primate taxonomy — Prosimians, Anthropoids, New World, Old World monkeys, Hominoids.",
    "Primate adaptations — arboreal and terrestrial; grasping, climbing, locomotion.",
    "Primate behaviour — feeding, grooming, dominance, communication, tool use, learning, intelligence.",
    "Fossil Primates — Tertiary and Quaternary primates, evolutionary significance.",

    // 8. HUMAN EVOLUTIONARY ANATOMY
    "Man-Ape comparison — skull, cranial capacity, brow ridges, prognathism, foramen magnum.",
    "Man-Ape comparison — dentition, dental arcade, vertebral column, pelvis.",
    "Man-Ape comparison — limbs, arm/leg ratio, femur, foot arch, big toe, brain organisation.",

    // 9. BIPEDALISM
    "Bipedalism — meaning, evolution, advantages, costs, anatomical adaptations.",
    "Skeletal changes for bipedalism — foramen magnum, vertebral column, pelvis, femur, knee, foot.",
    "Theories of bipedalism; bipedalism and brain evolution; bipedalism and tool use.",

    // 10. HUMAN FOSSIL RECORD
    "Australopithecines — major species, distribution, anatomy, bipedalism, cranial capacity, culture.",
    "Robust Australopithecines / Paranthropus — characteristics, diet, evolutionary significance.",
    "Homo habilis — cranial capacity, anatomy, tools, significance.",
    "Homo erectus — African, Java Man, Peking Man; anatomy, fire, tools, migration, culture.",
    "Archaic Homo — Heidelberg-related forms, Rhodesian Man.",
    "Neanderthals — anatomy, robusticity, adaptation, culture, burial, tools, relationship with modern humans.",
    "Homo sapiens — Cro-Magnon, Upper Palaeolithic populations; anatomy, art, tools, symbolism.",

    // 11. PREHISTORIC ARCHAEOLOGY
    "Relative dating — stratigraphy, superposition, typology, seriation, faunal correlation.",
    "Absolute dating — radiocarbon, potassium-argon, uranium series, thermoluminescence, dendrochronology.",
    "Lower Palaeolithic — Acheulean, handaxe, cleaver, fire, subsistence.",
    "Middle Palaeolithic — flake technology, Levallois, hunting, adaptation.",
    "Upper Palaeolithic — blade technology, bone tools, art, symbolism, behavioural complexity.",
    "Mesolithic — microliths, hunting, fishing, gathering, semi-sedentism, rock art, domestication beginnings.",
    "Neolithic — food production, agriculture, domestication, sedentary life, pottery, polished tools, social differentiation.",
    "Chalcolithic — copper, stone-copper technology, agriculture, craft specialisation, trade.",

    // 12. CULTURE AND SOCIETY
    "Culture — definition, characteristics: learned, shared, symbolic, integrated, dynamic, adaptive, transmitted.",
    "Culture and Civilization — differences and relationships.",
    "Cultural concepts — ethnocentrism, cultural relativism, acculturation, enculturation, assimilation, diffusion, syncretism, cultural lag.",
    "Society — definition, characteristics, social relationships, interactions, groups, institutions, structure, organisation.",
    "Social Structure — status, role, norms, values, institutions, groups, networks, stratification.",

    // 13. MARRIAGE
    "Marriage — definition, universality, social/economic/reproductive/political/kinship functions.",
    "Rules of marriage — endogamy, exogamy, hypergamy, hypogamy, incest taboo.",
    "Forms of marriage — monogamy, polygyny, polyandry (fraternal/non-fraternal), group marriage.",
    "Marriage regulation — prescriptive, preferential, proscriptive rules.",
    "Marriage payments — bridewealth, dowry, bride service.",

    // 14. FAMILY
    "Family — definition, characteristics, functions.",
    "Types of family — nuclear, joint, extended, stem, compound; by descent, residence, authority.",
    "Family and contemporary change — industrialisation, urbanisation, migration, women's employment.",

    // 15. KINSHIP
    "Kinship — consanguinity, affinity, filiation.",
    "Descent — patrilineal, matrilineal, bilateral, double descent, ambilineal.",
    "Descent groups — lineage, clan, phratry, moiety, kindred.",
    "Kinship terminology systems — Hawaiian, Eskimo, Iroquois, Crow, Omaha, Sudanese.",
    "Kinship rules — incest taboo, exogamy, endogamy, cross/parallel cousin marriage, avoidance, joking relationship.",
    "Kinship theories — Morgan, Radcliffe-Brown, Malinowski, Lévi-Strauss, Evans-Pritchard, Fortes, Leach.",

    // 16. ECONOMIC ANTHROPOLOGY
    "Economic Anthropology — meaning, scope, economy and culture.",
    "Subsistence systems — hunting-gathering, fishing, horticulture, pastoralism, agriculture.",
    "Production — labour, technology, resources, division of labour, gender division.",
    "Distribution — reciprocity (generalised, balanced, negative), redistribution, market exchange.",
    "Economic theories — formalist vs substantivist; Polanyi, Malinowski, Firth.",

    // 17. POLITICAL ANTHROPOLOGY
    "Political organisation — band, tribe, chiefdom, state.",
    "Stateless societies — segmentary lineage, clan systems, age sets, consensus, conflict resolution.",
    "Power, authority, influence, coercion; traditional, charismatic, legal-rational authority.",
    "Social control — informal (custom, norm, religion, kinship) and formal (law, courts, state).",
    "Political change — tribe to state, colonialism, state formation, nation-state, globalisation.",

    // 18. RELIGION
    "Religion — meaning, definition, characteristics, functions; sacred and profane (Durkheim).",
    "Animism (Tylor), Animatism/Mana, Magic (imitative/contagious), Totemism.",
    "Myth, Ritual, Rites of passage (Turner); Religious specialists — priest, shaman, witch, sorcerer.",
    "Anthropological approaches to religion — Tylor, Frazer, Durkheim, Malinowski, Radcliffe-Brown, Evans-Pritchard, Geertz.",

    // 19. ANTHROPOLOGICAL THEORIES
    "Evolutionism — Tylor (cultural evolution, animism), Morgan (savagery-barbarism-civilization), Frazer.",
    "Diffusionism — British, German-Austrian, American schools; culture areas, traits, circles.",
    "Historical Particularism — Boas; culture history, cultural relativism, criticism of evolutionism.",
    "Functionalism — Malinowski; basic/derived needs, institutions, Kula, participant observation.",
    "Structural Functionalism — Radcliffe-Brown; social structure, function, structural continuity.",
    "Culture and Personality — Benedict, Mead, Linton, Kardiner; basic personality, national character.",
    "Neo-evolutionism — White (energy), Steward (cultural ecology), Sahlins, Service (band-tribe-chiefdom-state).",
    "Structuralism — Lévi-Strauss; binary oppositions, deep structure, myth, nature/culture. Leach.",
    "Cultural Materialism — Harris; infrastructure-structure-superstructure.",
    "Symbolic Anthropology — Turner; symbols, ritual, liminality, communitas.",
    "Interpretive Anthropology — Geertz; thick description, culture as text.",
    "Cognitive Anthropology — culture as knowledge, classification, folk taxonomy, emic/etic.",
    "Postmodern Anthropology — reflexivity, representation, power, voice, ethnographic authority.",

    // 20. LANGUAGE AND COMMUNICATION
    "Language — definition, characteristics, origin, structure, change.",
    "Language and Culture — Sapir-Whorf hypothesis, linguistic relativity.",
    "Communication — verbal, non-verbal, symbolic, ritual.",
    "Linguistic Anthropology — language and society, identity, dialects, power.",

    // 21. FIELDWORK AND RESEARCH METHODS
    "Fieldwork — evolution of fieldwork, armchair to scientific fieldwork, Malinowski revolution.",
    "Participant Observation — meaning, process, advantages, limitations, insider/outsider.",
    "Ethnography and Ethnology — meaning, objectives, data collection, comparative study.",
    "Research design — problem, hypothesis, variables, sampling, data collection, analysis.",
    "Methods — observation, interview, questionnaire, case study, life history, genealogy, oral history, focus groups, survey.",
    "Contemporary ethnography — multi-sited, critical, digital, multispecies; reflexivity, ethics, positionality.",

    // 22. HUMAN GENETICS
    "Basic genetics — gene, allele, genotype, phenotype, chromosome, DNA, RNA, mutation, recombination.",
    "Cell biology and cell division — mitosis, meiosis, crossing over, genetic recombination.",
    "DNA — structure, replication, transcription, translation, protein synthesis, genetic code.",
    "Mendelian Genetics — dominance, segregation, independent assortment; monohybrid and dihybrid inheritance.",
    "Non-Mendelian Genetics — incomplete dominance, codominance, multiple alleles, polygenic, sex-linked, pleiotropy.",
    "Population Genetics — gene pool, allele frequency, Hardy-Weinberg principle, conditions for equilibrium.",
    "Forces affecting gene frequencies — mutation, selection, drift, gene flow, migration, isolation, inbreeding.",

    // 23. HUMAN VARIATION
    "Race — historical/typological concept, biological limitations, race vs ethnicity, racism, modern population approach.",
    "Human variation — morphological (skin, hair, body proportions) and physiological (blood, haemoglobin, metabolism).",
    "Population markers — ABO, Rh, HLA, serum proteins, enzymes, genetic markers.",

    // 24. CHROMOSOMAL ABNORMALITIES
    "Numerical abnormalities — Down, Edwards, Patau, Turner, Klinefelter, Triple-X, XYY syndromes.",
    "Structural abnormalities — deletion, duplication, inversion, translocation.",

    // 25. METHODS OF HUMAN GENETIC STUDIES
    "Methods — family studies, pedigree, twin studies, adoption studies, cytogenetics, karyotyping, DNA analysis.",

    // 26–28. HUMAN ADAPTATION, ECOLOGY, EPIDEMIOLOGY
    "Biological adaptation — genetic, physiological, developmental adaptation to cold, heat, high altitude, desert.",
    "High-altitude adaptation — Tibetans, Andeans, Ethiopians; haemoglobin, respiration, genetic adaptation.",
    "Ecological Anthropology — human-environment relationship, cultural ecology, carrying capacity, resource use.",
    "Epidemiological Anthropology — disease ecology, infectious/non-communicable/nutritional diseases, cultural determinants.",

    // 29–31. GROWTH, AGEING, DEMOGRAPHY
    "Human growth stages — prenatal, infancy, childhood, adolescence, adulthood, old age.",
    "Factors influencing growth — genetic, nutritional, environmental, socio-economic, disease.",
    "Growth studies — longitudinal, cross-sectional; anthropometry, growth curves, growth standards.",
    "Human physique — Somatotypes: endomorph, mesomorph, ectomorph; Sheldon, Heath-Carter method.",
    "Ageing — biological vs chronological age, senescence, longevity, life expectancy.",
    "Reproduction and bio-events — menarche, menopause, puberty, fertility, fecundity.",
    "Mortality — infant mortality, maternal mortality, life expectancy; demographic theories.",

    // 32. APPLICATIONS
    "Anthropology of Sports — anthropometry, somatotyping, body composition, talent identification.",
    "Nutritional Anthropology — food habits, malnutrition, obesity, cultural food practices, assessment.",
    "Defence equipment — anthropometry, ergonomics, human-machine interaction, equipment design.",
    "Forensic Anthropology — skeletal identification, age/sex/stature estimation, ancestry, trauma, facial reconstruction.",
    "Personal identification — skeletal, dental, anthropometric and DNA methods.",
    "Applied Human Genetics — paternity diagnosis, genetic counselling, eugenics, genetic screening.",
    "DNA Technology — fingerprinting, genetic diagnosis, molecular anthropology.",
    "Medical Anthropology — disease, health, culture, reproductive health, traditional medicine.",
    "Serogenetics and Cytogenetics — blood groups, population variation, karyotyping, genetic disorders."
];

// ═══════════════════════════════════════════════════════════════
// PAPER II — ANTHROPOLOGY OF INDIA
// ═══════════════════════════════════════════════════════════════

const paper2Topics = [
    // 1. EVOLUTION OF INDIAN CULTURE
    "Prehistoric India — Lower, Middle, Upper Palaeolithic; tools, subsistence, settlement, sites.",
    "Mesolithic India — microliths, hunting, fishing, gathering, rock art, early domestication.",
    "Neolithic India — agriculture, domestication, pottery, polished tools, settlement, food production.",
    "Neolithic-Chalcolithic India — copper, pastoralism, settlements, craft production, trade.",
    "Indus Civilization — Pre-Harappan, Early, Mature, Late Harappan; urbanisation, cities, drainage.",
    "Indus Civilization — economy, agriculture, craft, internal and external trade.",
    "Indus Civilization — technology, metallurgy, pottery, bead-making.",
    "Indus Civilization — social organisation, stratification, occupation, settlement hierarchy.",
    "Indus Civilization — religion, burial, ritual, symbols, script, decline theories.",
    "Tribal contributions to Indian civilization — technology, agriculture, forest knowledge, art, crafts, ecological knowledge.",

    // 2. PALAEO-ANTHROPOLOGICAL EVIDENCE
    "Siwalik evidence — Ramapithecus: discovery, dating, morphology, evolutionary interpretation.",
    "Sivapithecus — anatomy, distribution, significance.",
    "Narmada Man — Hathnora discovery, dating, cranial morphology, interpretation, Indian human evolution.",

    // 3. ETHNO-ARCHAEOLOGY
    "Ethno-archaeology — definition, scope, objectives, methods, analogy, archaeological interpretation.",
    "Survivals and parallels — hunting, foraging, fishing, pastoral, peasant, craft, art-producing communities.",

    // 4. DEMOGRAPHIC PROFILE
    "Ethnic elements in Indian population — physical diversity, population variation, modern understanding.",
    "Linguistic elements — Indo-European, Dravidian, Austroasiatic, Tibeto-Burman, Andamanese.",
    "Indian population structure — fertility, mortality, migration, marriage, urbanisation, industrialisation.",
    "Population growth — demographic transition, age structure, sex ratio, dependency, migration.",

    // 5. TRADITIONAL INDIAN SOCIAL SYSTEM
    "Varna system — Brahmana, Kshatriya, Vaishya, Shudra; Varna vs Caste.",
    "Ashrama system — Brahmacharya, Grihastha, Vanaprastha, Sannyasa.",
    "Purushartha — Dharma, Artha, Kama, Moksha.",
    "Karma, Rina (Deva/Rishi/Pitri), and Rebirth — meanings and social implications.",

    // 6. CASTE SYSTEM
    "Caste — definition, characteristics: endogamy, hierarchy, hereditary occupation, purity/pollution, commensality.",
    "Varna and Jati — structure, scope, hierarchy, locality, occupation, ritual status.",
    "Theories of origin of caste — racial, religious, occupational, political, economic, evolutionary, critiques.",
    "Features of caste — segmental division, hierarchy, restrictions, occupational association, social control.",
    "Dominant Caste (Srinivas) — land ownership, numerical strength, political influence, education.",
    "Sanskritization — meaning, process, preconditions, effects, limitations, criticism.",
    "Westernization (Srinivas) — British influence, education, law, technology, institutions, lifestyle.",
    "Modernization and Caste — urbanisation, education, industrialisation, democracy, reservation, caste associations.",
    "Caste and Politics — electoral mobilisation, vote banks, caste associations, reservation, identity politics.",
    "Jajmani System — definition, structure, functions, exchange, hereditary relations, decline.",
    "Tribe-Caste Continuum — Sanskritization, assimilation, acculturation, integration.",

    // 7–8. SACRED COMPLEX, NATURE-MAN-SPIRIT
    "Sacred Complex — sacred geography, specialists, ritual, pilgrimage; Universalisation, Parochialisation, Great/Little Tradition.",
    "Nature-Man-Spirit Complex — cosmology, ritual, ecology, resource use, indigenous ecological knowledge.",

    // 9. INDIAN ANTHROPOLOGISTS
    "Sarat Chandra Roy — Indian ethnography, tribal studies, fieldwork tradition.",
    "L. K. Ananthakrishna Iyer — anthropological surveys, caste, tribal studies.",
    "H. H. Risley — caste, race, anthropometry, colonial classification.",
    "G. S. Ghurye — caste, tribe, assimilation, Indian society.",
    "D. N. Majumdar — tribe, caste, rural society, cultural change.",
    "N. K. Bose — tribal integration, Hindu society, cultural change.",
    "Verrier Elwin — tribal culture, tribal policy, isolation vs integration.",
    "Irawati Karve — kinship, Indian social organisation, regional variation.",
    "S. C. Dube — Indian village, community development, social change.",
    "M. N. Srinivas — Sanskritization, Westernization, dominant caste, village studies.",
    "L. P. Vidyarthi — Sacred Complex, tribal studies, Indian anthropology.",
    "K. S. Singh — People of India project, tribal movements, ethnicity.",

    // 10. INDIAN VILLAGE
    "Village as social system — social organisation, kinship, caste, economy, religion, politics.",
    "Village studies — contributions of Srinivas, Dube, Majumdar, Béteille.",
    "Village economy — agriculture, land, labour, tenancy, Jajmani, rural markets.",
    "Village social structure — caste, class, kinship, faction, gender.",
    "Factionalism — meaning, causes, leadership, caste, politics, land, panchayat.",
    "Panchayati Raj — decentralisation, participation, representation, women, SC/ST.",
    "Rural transformation — Green Revolution, mechanisation, migration, urbanisation, globalisation.",

    // 11. MINORITIES
    "Linguistic minorities — language, identity, regionalism, political representation, cultural rights.",
    "Religious minorities — identity, social integration, communalism, political participation, socio-economic issues.",

    // 12. SOCIAL-CULTURAL CHANGE
    "Sanskritization and Westernization — processes, agents, effects, limitations.",
    "Modernization — rationalisation, secularisation, urbanisation, industrialisation.",
    "Little Tradition and Great Tradition (Redfield) — interaction, universalisation, parochialization.",
    "Social change through democracy, constitution, education, urbanisation, globalisation, media, technology.",

    // 13. TRIBAL INDIA — CONCEPT & ORGANISATION
    "Concept of Tribe — definition, characteristics, tribe vs caste, tribe vs peasant, tribe vs ethnic group.",
    "Tribal social organisation — family, marriage, kinship, clan, lineage, age grades, youth dormitories.",
    "Tribal economy — hunting-gathering, fishing, shifting cultivation, pastoralism, agriculture, forest economy, wage labour.",
    "Tribal political organisation — village councils, chiefs, elders, customary law, modern Panchayati Raj.",
    "Tribal religion — animism, ancestor worship, nature worship, totemism, sacred groves, shamanism.",
    "Tribal art and culture — music, dance, painting, craft, architecture, oral traditions, festivals.",

    // 14. TRIBAL DISTRIBUTION
    "Tribal distribution: Central India — Gond, Santhal, Munda, Oraon, Bhil.",
    "Tribal distribution: Northeast India — Naga, Mizo, Khasi, Garo, Bodo, Arunachal tribes.",
    "Tribal distribution: Western and Southern India — Bhil, Garasia, Warli, Toda, Kota, Irula, Chenchu.",
    "Tribal distribution: Himalayan, Andaman & Nicobar — Great Andamanese, Onge, Jarawa, Sentinelese, Nicobarese, Shompen.",

    // 15. TRIBAL PROBLEMS
    "Land alienation — causes, non-tribal encroachment, legal safeguards.",
    "Indebtedness — moneylending, poverty, exploitation, informal credit.",
    "Tribal poverty — subsistence economy, low productivity, market exclusion, landlessness.",
    "Tribal education — access, language barriers, dropouts, residential schooling, digital divide.",
    "Tribal health — malnutrition, maternal health, infant mortality, infectious disease, access to healthcare.",
    "Displacement — dams, mining, industries, infrastructure; land loss, livelihood loss, cultural loss.",
    "Forest-related problems — forest dependence, colonial policies, conservation conflicts, forest rights.",
    "Tribal migration — seasonal, distress, labour, urban migration, cultural consequences.",

    // 16. TRIBAL DEVELOPMENT
    "Approaches to tribal policy — isolation, assimilation, integration, participation.",
    "Tribal development programmes — ITDP, Special Central Assistance, livelihood, education, health schemes.",
    "Tribal development challenges — implementation, leakage, administrative problems, cultural mismatch.",

    // 17. TRIBAL ADMINISTRATION
    "Colonial tribal administration — exclusion, Scheduled/Excluded Areas.",
    "Fifth Schedule — Scheduled Areas, Governor, Tribes Advisory Council.",
    "Sixth Schedule — Autonomous District Councils, Regional Councils, Northeast tribal governance.",
    "PESA — Gram Sabha, Scheduled Areas, community resources, self-governance, customary practices.",
    "Forest Rights Act — individual rights, community rights, community forest resource, recognition.",
    "Constitutional safeguards — fundamental rights, protective discrimination, reservation, political/educational/employment safeguards.",

    // 18. PVTGs
    "PVTGs — meaning, characteristics (small population, isolation, low literacy, subsistence economy), distribution, problems, development.",

    // 19. TRIBAL MOVEMENTS
    "Colonial tribal movements — Santhal rebellion, Birsa Munda, Tana Bhagat; background, causes, nature, outcome.",
    "Post-independence tribal movements — Naga, Mizo, Jharkhand, Bodo, Gond; autonomy and statehood.",
    "Tribal movements and ethnicity — identity, autonomy, regionalism, self-determination.",

    // 20–22. RELIGION, CONTINUUM, NATION-STATE
    "Impact of Hinduism, Christianity, Islam, Buddhism on tribes — identity, conversion, political mobilisation.",
    "Tribe-Caste Continuum — cultural contact, acculturation, assimilation, Sanskritization, Hinduization.",
    "Tribe and Nation-State — national integration, autonomy, self-governance, ethnic nationalism, secessionism.",

    // 23–25. DEVELOPMENT, RESETTLEMENT, ANTHROPOLOGY ROLE
    "Industrialisation, urbanisation and tribes — employment, displacement, labour migration, cultural change.",
    "Development projects and tribes — dams, mining, infrastructure, protected areas; displacement consequences.",
    "Rehabilitation and resettlement — compensation, livelihood restoration, social/cultural rehabilitation, rights-based approach.",
    "Role of anthropologists in tribal development — policy, surveys, impact assessment, participatory development, conflict resolution.",

    // 26. REGIONALISM, COMMUNALISM, ETHNICITY
    "Regionalism, communalism and ethnicity — anthropological interpretation; ethnic conflict, identity politics, national integration."
];


// ═══════════════════════════════════════════════════════════════
// SEEDER
// ═══════════════════════════════════════════════════════════════

const emptyNotes = {
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
};

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

        // Clear existing anthropology topics
        const deleteRes = await Topic.deleteMany({ subjectId });
        console.log(`Deleted ${deleteRes.deletedCount} existing Anthropology topics.`);

        const topicsToInsert = [];

        paper1Topics.forEach(title => {
            topicsToInsert.push({
                title,
                tags: ['Anthropology Paper I', 'Anthropology'],
                difficulty: 'Medium',
                subjectId,
                status: 'Pending',
                notes: { ...emptyNotes }
            });
        });

        paper2Topics.forEach(title => {
            topicsToInsert.push({
                title,
                tags: ['Anthropology Paper II', 'Anthropology'],
                difficulty: 'Medium',
                subjectId,
                status: 'Pending',
                notes: { ...emptyNotes }
            });
        });

        const inserted = await Topic.insertMany(topicsToInsert);
        console.log(`\n✅ Successfully seeded ${inserted.length} Anthropology topics into MongoDB!`);
        console.log(`  - Anthropology Paper I: ${paper1Topics.length} topics`);
        console.log(`  - Anthropology Paper II: ${paper2Topics.length} topics`);
        console.log(`  - Total: ${paper1Topics.length + paper2Topics.length} topics`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
