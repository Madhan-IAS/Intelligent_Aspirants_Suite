/**
 * seedEnglishLiterature.js
 * 
 * Master English Literature Framework (39 Major Units)
 * Paper I: 15 Units
 * Paper II: 24 Units
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

// ═══════════════════════════════════════════════════════════════
// PAPER I — ENGLISH LITERATURE: 1600–1900
// ═══════════════════════════════════════════════════════════════

const PAPER_1_DATA = [
    {
        chapter: "1. William Shakespeare",
        topics: [
            "King Lear: Plot & Structure", "King Lear: Opening situation", "King Lear: Love-test", "King Lear: Division of kingdom",
            "King Lear: Lear's rejection of Cordelia", "King Lear: Gloucester subplot", "King Lear: Lear's madness",
            "King Lear: Storm scenes", "King Lear: Recognition", "King Lear: Reconciliation", "King Lear: Death of Cordelia",
            "King Lear: Lear's death", "King Lear: Tragic closure",
            "King Lear: Characters", "King Lear", "Cordelia", "Goneril", "Regan", "Edmund", "Edgar", "Gloucester", "Kent", "Fool", "Albany", "Cornwall",
            "King Lear: Themes", "Kingship", "Authority", "Political power", "Family relationships", "Filial ingratitude", "Justice", "Madness", "Nature", "Blindness", "Appearance vs reality", "Suffering", "Redemption", "Human condition", "Order and disorder",
            "King Lear: Literary Aspects", "Shakespearean tragedy", "Tragic hero", "Parallel plots", "Dramatic irony", "Soliloquy", "Fool as commentator", "Storm imagery", "Animal imagery", "Clothing imagery", "Nature imagery", "Symbolism", "Tragic recognition", "Catharsis",
            "King Lear: Critical Approaches", "Lear as tragic hero", "Political reading", "Psychological reading", "Feminist reading", "Marxist/class reading", "Existential reading", "Christian interpretation", "Humanist interpretation",
            "The Tempest: Plot", "Shipwreck", "Prospero's island", "Miranda and Ferdinand", "Ariel", "Caliban", "Antonio and Sebastian", "Alonso", "Prospero's revenge", "Forgiveness", "Restoration", "Departure",
            "The Tempest: Characters", "Prospero", "Miranda", "Ariel (Character)", "Caliban (Character)", "Ferdinand (Character)", "Alonso (Character)", "Antonio (Character)", "Sebastian", "Gonzalo",
            "The Tempest: Themes", "Power", "Colonialism", "Authority (Tempest)", "Magic", "Knowledge", "Revenge", "Forgiveness (Tempest)", "Freedom", "Slavery", "Civilization vs nature", "Father-daughter relationship", "Political legitimacy",
            "The Tempest: Literary Concepts", "Romance", "Masque", "Symbolism (Tempest)", "Metatheatre", "Supernatural elements", "Dramatic spectacle", "Colonial/postcolonial interpretation"
        ]
    },
    {
        chapter: "2. John Donne",
        topics: [
            "Metaphysical Poetry", "Metaphysical conceit", "Wit", "Paradox", "Intellectualism", "Argumentative structure", "Dramatic opening", "Colloquial language", "Religious imagery", "Scientific imagery", "Geographical imagery", "Fusion of thought and emotion",
            "The Canonization", "Love", "Immortality", "Lovers as saints", "Religious imagery", "Paradox (Canonization)", "Metaphysical conceit (Canonization)", "Hyperbole",
            "Death be not proud", "Death", "Mortality", "Christian faith", "Resurrection", "Personification", "Paradox (Death)", "Sonnet structure",
            "The Good Morrow", "Awakening of love", "Spiritual union", "Mutuality", "Discovery", "World of lovers", "Metaphysical conceit (Morrow)",
            "On His Mistress Going to Bed", "Erotic love", "Desire", "Marriage imagery", "Sexuality", "Religious symbolism", "Extended metaphor",
            "The Sun Rising", "Love vs external world", "Time (Sun Rising)", "Authority (Sun Rising)", "Lover's world", "Personification (Sun Rising)", "Hyperbole (Sun Rising)", "Metaphysical wit",
            "A Valediction: Forbidding Mourning", "Separation", "Spiritual love", "Physical vs spiritual union", "Compass conceit", "Earthquake imagery", "Gold imagery", "Metaphysical conceit (Valediction)"
        ]
    },
    {
        chapter: "3. John Milton",
        topics: [
            "L'Allegro", "Mirth", "Pleasure", "Rural life", "Nature (Allegro)", "Music", "Classical references", "Allegory", "Personification", "Pastoral tradition",
            "Il Penseroso", "Melancholy", "Contemplation", "Solitude", "Learning", "Religion", "Night imagery", "Contrast with L'Allegro",
            "L'Allegro vs Il Penseroso", "Mirth vs melancholy", "Activity vs contemplation", "Day vs night", "External world vs inner world", "Pleasure vs intellectual fulfilment",
            "Lycidas: Themes", "Death (Lycidas)", "Friendship", "Pastoral elegy", "Religion (Lycidas)", "Clerical corruption", "Immortality (Lycidas)", "Nature (Lycidas)", "Poetry",
            "Lycidas: Literary Features", "Pastoral elegy format", "Classical mythology", "Christian symbolism", "Allegory (Lycidas)", "Imagery", "Apostrophe",
            "On His Blindness", "Blindness", "Faith", "Duty", "Service", "Divine will", "Patience", "Sonnet", "Religious poetry", "Paradox", "Biblical references",
            "Paradise Lost: Book I", "Invocation", "Epic convention", "Satan", "Fall of angels", "Hell", "Pandemonium", "Epic similes", "Blank verse",
            "Paradise Lost: Satan", "Heroic qualities", "Pride", "Ambition", "Rebellion", "Rhetoric", "Leadership", "Tragic dimensions",
            "Paradise Lost: Book II", "Satan's council", "Pandemonium debate", "Debate", "Sin", "Death (PL)", "Satan's journey", "Hell (Book II)", "Chaos",
            "Paradise Lost: Book IV", "Satan in Eden", "Garden of Eden", "Adam and Eve", "Satan's temptation", "Innocence", "Knowledge (PL)", "Free will (Book 4)", "Good vs evil",
            "Paradise Lost: Book IX", "Temptation", "Fall of Man", "Eve", "Adam", "Satan (Book 9)", "Free will (Book 9)", "Disobedience", "Gender (PL)", "Consequences of sin",
            "Paradise Lost: Major Concepts", "Epic", "Christian epic", "Free will", "Predestination", "Theodicy", "Satan as character", "Heroism", "Blank verse", "Epic simile", "Invocation (Concept)", "Classical influence"
        ]
    },
    {
        chapter: "4. Alexander Pope",
        topics: [
            "The Rape of the Lock: Study", "Mock-epic", "Satire (Rape)", "Heroic couplet", "Social criticism", "Aristocratic society", "Gender", "Vanity", "Honour", "Supernatural machinery",
            "The Rape of the Lock: Characters", "Belinda", "Baron", "Ariel (Pope)", "Clarissa", "Umbriel",
            "The Rape of the Lock: Concepts", "Mock-heroic treatment", "Epic parody", "Social satire", "Wit", "Neoclassicism", "Order", "Reason", "Decorum"
        ]
    },
    {
        chapter: "5. William Wordsworth",
        topics: [
            "Wordsworthian Romanticism", "Nature (Wordsworth)", "Childhood", "Imagination", "Memory", "Emotion", "Individualism", "Rural life (Wordsworth)", "Common man", "Spirituality (Wordsworth)", "Nature as teacher", "Nature as moral force",
            "Ode: Intimations of Immortality", "Childhood (Ode)", "Memory (Ode)", "Loss", "Immortality (Ode)", "Nature (Ode)", "Spiritual development",
            "Tintern Abbey", "Nature (Tintern)", "Memory (Tintern)", "Imagination (Tintern)", "Spirituality (Tintern)", "Childhood (Tintern)", "Growth of consciousness",
            "Three Years She Grew", "Nature (Three Years)", "Lucy", "Death (Three Years)", "Human-nature relationship",
            "She Dwelt among the Untrodden Ways", "Lucy poems", "Isolation", "Death (She Dwelt)", "Simplicity",
            "Michael", "Rural life (Michael)", "Family (Michael)", "Industrialisation (Michael)", "Human suffering", "Father-son relationship",
            "Resolution and Independence", "Aging", "Despair", "Hope", "Nature (Resolution)", "Leech-gatherer", "Poet's crisis",
            "The World is Too Much With Us", "Materialism", "Industrialisation (World)", "Nature (World)", "Spiritual alienation",
            "Milton (Poem)", "National morality", "Political freedom", "Moral leadership", "Miltonic ideal",
            "Upon Westminster Bridge", "Urban beauty", "Nature (Bridge)", "Stillness", "Industrial landscape"
        ]
    },
    {
        chapter: "6. Alfred Tennyson",
        topics: [
            "In Memoriam A.H.H.: Themes", "Death (Memoriam)", "Grief", "Faith", "Doubt", "Science", "Religion (Memoriam)", "Immortality (Memoriam)", "Evolution", "Nature (Memoriam)", "Human suffering (Memoriam)", "Love (Memoriam)", "Memory (Memoriam)", "Victorian anxiety",
            "In Memoriam A.H.H.: Literary Features", "Elegy", "Dramatic monologue elements", "Lyric sequence", "Symbolism (Memoriam)", "Nature imagery", "Religious imagery (Memoriam)", "Musicality", "Victorian sensibility",
            "In Memoriam: Context", "Victorian Age", "Scientific advancement", "Crisis of faith", "Darwinian thought", "Industrial society"
        ]
    },
    {
        chapter: "7. Henrik Ibsen",
        topics: [
            "A Doll's House: Plot", "Nora and Torvald", "Krogstad", "Mrs Linde", "Dr Rank", "Loan", "Forgery", "Revelation", "Confrontation", "Nora's departure",
            "A Doll's House: Characters", "Nora", "Torvald", "Krogstad (Character)", "Mrs Linde (Character)", "Dr Rank (Character)",
            "A Doll's House: Themes", "Marriage (Doll's House)", "Patriarchy", "Women's freedom", "Individual identity", "Gender roles", "Social morality", "Economic dependence", "Reputation", "Individual vs society",
            "A Doll's House: Dramatic Concepts", "Realism", "Problem play", "Modern drama", "Symbolism (Doll's House)", "Psychological drama", "Stagecraft"
        ]
    },
    {
        chapter: "8. Jonathan Swift",
        topics: [
            "Gulliver's Travels: Voyage I — Lilliput", "Politics (Lilliput)", "War", "Human pride", "Satire", "Court politics",
            "Gulliver's Travels: Voyage II — Brobdingnag", "Human physicality", "European politics", "Relative morality", "Perspective",
            "Gulliver's Travels: Voyage III — Laputa", "Science (Laputa)", "Abstract knowledge", "Government (Laputa)", "Intellectual absurdity",
            "Gulliver's Travels: Voyage IV — Houyhnhnms", "Yahoos", "Reason (Houyhnhnms)", "Human nature (Houyhnhnms)", "Civilization (Houyhnhnms)", "Misogyny/debate", "Colonial interpretation",
            "Gulliver's Travels: Themes", "Satire (Themes)", "Human nature", "Politics", "Science", "Reason", "Colonialism", "Imperialism", "European society",
            "Gulliver's Travels: Literary Techniques", "Irony (Swift)", "Satire (Technique)", "Allegory (Swift)", "Parody", "Traveller narrative", "Defamiliarisation"
        ]
    },
    {
        chapter: "9. Jane Austen",
        topics: [
            "Pride and Prejudice: Characters", "Elizabeth Bennet", "Fitzwilliam Darcy", "Jane Bennet", "Bingley", "Lydia", "Wickham", "Mr Bennet", "Mrs Bennet", "Lady Catherine",
            "Pride and Prejudice: Themes", "Marriage (Pride)", "Class (Pride)", "Gender (Pride)", "Money", "Social status", "Reputation (Pride)", "Prejudice", "Pride", "Individual judgement",
            "Pride and Prejudice: Literary Features", "Irony (Austen)", "Free indirect discourse", "Characterisation (Austen)", "Social comedy", "Dialogue", "Narrative perspective"
        ]
    },
    {
        chapter: "10. Henry Fielding",
        topics: [
            "Tom Jones: Areas", "Picaresque elements", "Narrative structure", "Comedy (Tom Jones)", "Morality (Tom Jones)", "Social class", "Love (Tom Jones)", "Marriage (Tom Jones)", "Human nature (Tom Jones)", "Providence",
            "Tom Jones: Characters", "Tom Jones", "Sophia Western", "Blifil", "Squire Allworthy", "Squire Western",
            "Tom Jones: Literary Features", "Omniscient narrator", "Digression", "Satire (Tom Jones)", "Comedy (Literary Feature)", "Realism (Tom Jones)", "Characterisation"
        ]
    },
    {
        chapter: "11. Charles Dickens",
        topics: [
            "Hard Times: Themes", "Industrialisation (Hard Times)", "Utilitarianism", "Education (Hard Times)", "Imagination (Hard Times)", "Class (Hard Times)", "Labour", "Capitalism", "Factory system", "Human relationships",
            "Hard Times: Characters", "Thomas Gradgrind", "Louisa Gradgrind", "Tom Gradgrind", "Stephen Blackpool", "Josiah Bounderby", "Sissy Jupe",
            "Hard Times: Literary Features", "Satire (Hard Times)", "Symbolism (Hard Times)", "Characterisation (Dickens)", "Social criticism", "Industrial novel"
        ]
    },
    {
        chapter: "12. George Eliot",
        topics: [
            "The Mill on the Floss: Characters", "Maggie Tulliver", "Tom Tulliver", "Philip Wakem", "Stephen Guest", "Lucy Deane", "Mr Tulliver",
            "The Mill on the Floss: Themes", "Gender (Mill)", "Family (Mill)", "Society (Mill)", "Education (Mill)", "Desire", "Morality", "Social restrictions", "Class (Mill)", "Fate (Mill)",
            "The Mill on the Floss: Literary Features", "Psychological realism", "Narrator (Mill)", "Social realism", "Character development", "Tragedy (Mill)"
        ]
    },
    {
        chapter: "13. Thomas Hardy",
        topics: [
            "Tess: Characters", "Tess", "Angel Clare", "Alec d'Urberville", "Joan Durbeyfield", "John Durbeyfield",
            "Tess: Themes", "Fate (Tess)", "Gender (Tess)", "Sexual morality", "Victorian society (Tess)", "Religion (Tess)", "Class (Tess)", "Rural life (Tess)", "Industrialisation (Tess)", "Nature (Tess)", "Determinism",
            "Tess: Critical Approaches", "Feminist (Tess)", "Marxist (Tess)", "Psychological (Tess)", "Naturalistic", "Tragic (Tess)"
        ]
    },
    {
        chapter: "14. Mark Twain",
        topics: [
            "The Adventures of Huckleberry Finn: Themes", "Slavery", "Racism", "Freedom", "Morality (Huck)", "Childhood (Huck)", "Individual conscience", "Civilisation (Huck)", "Religion (Huck)", "Mississippi River",
            "Huckleberry Finn: Characters", "Huck Finn", "Jim", "Tom Sawyer", "Pap Finn", "Widow Douglas", "Duke and King",
            "Huckleberry Finn: Literary Features", "First-person narration", "Vernacular", "Satire (Twain)", "Irony (Twain)", "Regionalism", "Picaresque structure"
        ]
    },
    {
        chapter: "15. Literary Movements & Periods (1600-1900)",
        topics: [
            "Renaissance", "Humanism", "Classical revival", "Individualism", "Religious change",
            "Elizabethan Drama", "Shakespeare (Movement)", "Tragedy", "Comedy", "Dramatic conventions",
            "Jacobean Drama", "Revenge tragedy", "Darker themes", "Corruption",
            "Metaphysical Poetry Movement", "Conceit", "Wit Movement", "Paradox Movement", "Intellectualism",
            "Epic", "Conventions", "Invocation", "Hero", "Supernatural machinery",
            "Mock-Epic", "Parody", "Satire Movement", "Heroic treatment of trivial subjects",
            "Neoclassicism", "Reason (Movement)", "Order (Movement)", "Decorum (Movement)", "Imitation of classics",
            "Satire (Movement)", "Horatian", "Juvenalian", "Irony (Movement)", "Parody (Movement)",
            "Romantic Movement", "Nature (Movement)", "Imagination (Movement)", "Emotion", "Individualism (Movement)",
            "Rise of Novel", "Realism (Movement)", "Narrative", "Middle-class readership",
            "Victorian Age", "Industrialisation (Movement)", "Morality (Movement)", "Religion (Movement)", "Science (Movement)", "Social problems"
        ]
    }
];

// ═══════════════════════════════════════════════════════════════
// PAPER II — ENGLISH LITERATURE: 1900–1990
// ═══════════════════════════════════════════════════════════════

const PAPER_2_DATA = [
    {
        chapter: "16. W.B. Yeats",
        topics: [
            "Easter 1916", "The Second Coming", "A Prayer for My Daughter", "Sailing to Byzantium", "The Tower", "Among School Children", "Leda and the Swan", "Meru", "Lapis Lazuli", "Byzantium",
            "Yeats: Major Themes", "Irish nationalism", "Politics", "History (Yeats)", "Violence", "Civilisation", "Modernity", "Aging (Yeats)", "Art", "Immortality (Yeats)", "Spirituality (Yeats)", "Gyres", "Byzantium (Theme)", "Myth",
            "Yeats: Important Concepts", "Yeats's gyres", "Unity of Being", "Byzantium symbolism", "Historical cycles", "Mask", "Anti-self", "Myth-making"
        ]
    },
    {
        chapter: "17. T.S. Eliot",
        topics: [
            "The Love Song of J. Alfred Prufrock", "Alienation", "Urban life", "Paralysis", "Time (Prufrock)", "Fragmentation", "Modern consciousness", "Identity (Prufrock)",
            "Journey of the Magi", "Faith (Magi)", "Spiritual transformation", "Birth/death", "Religious symbolism",
            "Burnt Norton", "Time (Norton)", "Memory (Norton)", "Possibility", "Spirituality (Norton)", "Stillness",
            "Eliot: Literary Concepts", "Modernism (Eliot)", "Objective correlative", "Fragmentation (Eliot)", "Allusion", "Myth (Eliot)", "Impersonality", "Tradition"
        ]
    },
    {
        chapter: "18. W.H. Auden",
        topics: [
            "Partition", "Musée des Beaux Arts", "In Memory of W.B. Yeats", "Lay Your Sleeping Head, My Love", "The Unknown Citizen", "Consider", "Mundus et Infans", "The Shield of Achilles", "September 1, 1939", "Petition",
            "Auden: Themes", "War (Auden)", "Politics (Auden)", "Society (Auden)", "Love (Auden)", "Death (Auden)", "Modern civilisation", "Individual vs state", "Totalitarianism", "Moral responsibility", "History (Auden)",
            "Auden: Literary Features", "Irony (Auden)", "Political poetry", "Classical allusion", "Myth (Auden)", "Formal experimentation"
        ]
    },
    {
        chapter: "19. John Osborne",
        topics: [
            "Look Back in Anger: Characters", "Jimmy Porter", "Alison Porter", "Cliff Lewis", "Helena Charles", "Colonel Redfern",
            "Look Back in Anger: Themes", "Angry Young Men", "Class (Osborne)", "Marriage (Osborne)", "Gender (Osborne)", "Post-war Britain", "Alienation (Osborne)", "Frustration", "Social change (Osborne)",
            "Look Back in Anger: Literary Features", "Kitchen-sink realism", "Social drama", "Psychological realism (Osborne)", "Natural dialogue"
        ]
    },
    {
        chapter: "20. Samuel Beckett",
        topics: [
            "Waiting for Godot: Characters", "Vladimir", "Estragon", "Pozzo", "Lucky", "The Boy",
            "Waiting for Godot: Themes", "Meaninglessness", "Waiting", "Time (Beckett)", "Memory (Beckett)", "Existence", "Death (Beckett)", "Communication", "Absurdity",
            "Waiting for Godot: Concepts", "Theatre of the Absurd", "Circular structure", "Minimalism", "Repetition (Beckett)", "Existentialism", "Anti-drama"
        ]
    },
    {
        chapter: "21. Philip Larkin",
        topics: [
            "Next", "Please", "Deceptions", "Afternoons", "Days", "Mr Bleaney",
            "Larkin: Themes", "Ordinary life", "Death (Larkin)", "Aging (Larkin)", "Loneliness", "Marriage (Larkin)", "Sexuality (Larkin)", "Disillusionment", "Post-war society", "Meaninglessness (Larkin)",
            "Larkin: Literary Features", "Plain language", "Irony (Larkin)", "Colloquial style", "Formal verse", "Everyday experience"
        ]
    },
    {
        chapter: "22. A.K. Ramanujan",
        topics: [
            "Looking for a Cousin on a Swing", "A River", "Of Mothers, among Other Things", "Love Poem for a Wife 1", "Small-Scale Reflections on a Great House", "Obituary",
            "Ramanujan: Themes", "Indian society (Ramanujan)", "Family (Ramanujan)", "Memory (Ramanujan)", "Tradition", "Modernity (Ramanujan)", "Marriage (Ramanujan)", "Caste/class", "Cultural identity", "Diaspora", "Generational conflict",
            "Ramanujan: Literary Features", "Indian English poetry", "Cultural symbolism", "Irony (Ramanujan)", "Myth (Ramanujan)", "Memory (Literary)", "Translation consciousness"
        ]
    },
    {
        chapter: "23. Joseph Conrad",
        topics: [
            "Lord Jim: Topics", "Colonialism (Conrad)", "Imperialism (Conrad)", "Guilt", "Honour (Conrad)", "Heroism", "Failure", "Redemption (Conrad)", "Identity (Conrad)", "Moral responsibility (Conrad)",
            "Lord Jim: Literary Features", "Frame narrative", "Marlow", "Multiple perspectives (Conrad)", "Psychological narration", "Colonial discourse (Conrad)"
        ]
    },
    {
        chapter: "24. James Joyce",
        topics: [
            "A Portrait of the Artist: Topics", "Stephen Dedalus", "Coming of age", "Religion (Joyce)", "Nationalism (Joyce)", "Art (Joyce)", "Exile", "Identity (Joyce)", "Irish society",
            "A Portrait of the Artist: Literary Features", "Stream of consciousness (Joyce)", "Epiphany", "Interior monologue (Joyce)", "Narrative development", "Modernism (Joyce)"
        ]
    },
    {
        chapter: "25. D.H. Lawrence",
        topics: [
            "Sons and Lovers: Topics", "Family (Lawrence)", "Mother-son relationship", "Sexuality (Lawrence)", "Industrial society (Lawrence)", "Class (Lawrence)", "Psychology", "Marriage (Lawrence)", "Oedipal dimensions",
            "Sons and Lovers: Literary Features", "Psychological novel", "Naturalism (Lawrence)", "Symbolism (Lawrence)", "Autobiographical elements"
        ]
    },
    {
        chapter: "26. E.M. Forster",
        topics: [
            "A Passage to India: Topics", "Colonialism (Forster)", "British Raj", "Indian society (Forster)", "Race (Forster)", "Religion (Forster)", "Friendship", "Cultural misunderstanding", "Marabar Caves", "Identity (Forster)",
            "A Passage to India: Characters", "Dr Aziz", "Cyril Fielding", "Adela Quested", "Mrs Moore", "Ronny Heaslop",
            "A Passage to India: Critical Approaches", "Postcolonial (Forster)", "Humanist (Forster)", "Orientalism", "Race/class analysis"
        ]
    },
    {
        chapter: "27. Virginia Woolf",
        topics: [
            "Mrs Dalloway: Topics", "Stream of consciousness (Woolf)", "Time (Woolf)", "Memory (Woolf)", "Trauma", "War (Woolf)", "Gender (Woolf)", "Mental interiority", "Social class (Woolf)", "Modernity (Woolf)",
            "Mrs Dalloway: Characters", "Clarissa Dalloway", "Septimus Smith", "Richard Dalloway", "Peter Walsh", "Sally Seton",
            "Mrs Dalloway: Literary Techniques", "Interior monologue (Woolf)", "Free indirect discourse (Woolf)", "Multiple perspectives (Woolf)", "Temporal shifts", "Psychological realism (Woolf)"
        ]
    },
    {
        chapter: "28. Raja Rao",
        topics: [
            "Kanthapura: Topics", "Gandhian nationalism", "Indian freedom movement", "Village society", "Caste (Rao)", "Religion (Rao)", "Women (Rao)", "Colonialism (Rao)", "Community", "Myth and history",
            "Kanthapura: Literary Features", "Indian English (Rao)", "Oral narrative", "Mythic structure", "Folk traditions", "Nationalism (Literary)"
        ]
    },
    {
        chapter: "29. V.S. Naipaul",
        topics: [
            "A House for Mr Biswas: Topics", "Identity (Naipaul)", "Colonial society", "Indo-Caribbean experience", "Family (Naipaul)", "Migration (Naipaul)", "Alienation (Naipaul)", "Individualism (Naipaul)", "Cultural displacement",
            "A House for Mr Biswas: Literary Features", "Postcolonial fiction", "Satire (Naipaul)", "Realism (Naipaul)", "Autobiographical elements (Naipaul)"
        ]
    },
    {
        chapter: "30. Modernism",
        topics: [
            "Historical background (Modernism)", "World War I", "Fragmentation (Modernism)", "Alienation (Modernism)", "Loss of faith", "Urbanisation", "Psychological interiority", "Myth (Modernism)", "Experimentation", "Non-linear narrative", "Major Writers: Yeats, Eliot, Joyce, Woolf, Conrad"
        ]
    },
    {
        chapter: "31. Poets of the Thirties",
        topics: [
            "Political poetry (Thirties)", "Marxism (Thirties)", "Fascism", "War (Thirties)", "Social commitment", "Auden generation", "Political consciousness"
        ]
    },
    {
        chapter: "32. Stream-of-Consciousness Novel",
        topics: [
            "Interior monologue (SOC)", "Free association", "Psychological time", "Subjectivity", "Memory (SOC)", "Fragmentation (SOC)", "Multiple consciousness", "Major Texts: Joyce, Woolf"
        ]
    },
    {
        chapter: "33. Absurd Drama",
        topics: [
            "Meaninglessness (Absurd)", "Existentialism (Absurd)", "Circularity", "Waiting (Absurd)", "Repetition (Absurd)", "Breakdown of language", "Anti-plot", "Minimalism (Absurd)", "Major Text: Waiting for Godot"
        ]
    },
    {
        chapter: "34. Colonialism & Post-Colonialism",
        topics: [
            "Colonial discourse", "Imperialism (Colonialism)", "Othering", "Cultural domination", "Identity (Colonialism)", "Hybridity", "Resistance", "Nationalism (Colonialism)", "Mimicry", "Cultural displacement", "Text Connections: Lord Jim, Passage to India, Kanthapura, Mr Biswas"
        ]
    },
    {
        chapter: "35. Indian Writing in English",
        topics: [
            "Colonial education", "Indian identity", "Language (IWE)", "Nationalism (IWE)", "Tradition vs modernity", "Caste (IWE)", "Family (IWE)", "Religion (IWE)", "Indianisation of English", "Major Text: Kanthapura, A.K. Ramanujan"
        ]
    },
    {
        chapter: "36. Marxist Approach",
        topics: [
            "Class (Marxist)", "Capital", "Labour (Marxist)", "Ideology", "Material conditions", "Class conflict", "Alienation (Marxist)", "Hegemony", "Base/superstructure", "Application: Hard Times, Tess, Passage to India, Look Back in Anger, Kanthapura"
        ]
    },
    {
        chapter: "37. Psychoanalytical Approach",
        topics: [
            "Freud", "Conscious/unconscious", "Id", "Ego", "Superego", "Repression", "Desire (Psychoanalytical)", "Oedipus complex", "Dream symbolism", "Application: Sons and Lovers, Mrs Dalloway, King Lear, Tess"
        ]
    },
    {
        chapter: "38. Feminist Approach",
        topics: [
            "Patriarchy (Feminist)", "Gender roles (Feminist)", "Women's agency", "Sexual politics", "Marriage (Feminist)", "Economic dependence (Feminist)", "Representation of women", "Male gaze", "Application: Doll's House, Pride and Prejudice, Tess, Mrs Dalloway, Mill on the Floss"
        ]
    },
    {
        chapter: "39. Post-Modernism",
        topics: [
            "Fragmentation (Post-Modernism)", "Intertextuality", "Metafiction", "Questioning grand narratives", "Relativism", "Pastiche", "Parody (Post-Modernism)", "Unstable meaning", "Multiple realities"
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

        let litSubject = await Subject.findOne({ name: 'English Literature' });
        if (!litSubject) {
            console.log('English Literature subject not found, creating it...');
            litSubject = await Subject.create({ name: 'English Literature', description: 'English Literature Optional Subject' });
        }
        const subjectId = litSubject._id;

        const deleteRes = await Topic.deleteMany({ subjectId });
        console.log(`Deleted ${deleteRes.deletedCount} existing English Literature topics.`);

        const topicsToInsert = [];
        let p1Count = 0;
        let p2Count = 0;

        PAPER_1_DATA.forEach((chapterObj, cIndex) => {
            const chapterCleanName = chapterObj.chapter;

            chapterObj.topics.forEach((title, tIndex) => {
                p1Count++;
                topicsToInsert.push({
                    subjectId,
                    paper: 'English Literature',
                    subjectName: 'English Literature Paper I',
                    chapter: chapterCleanName,
                    heading: chapterCleanName,
                    topicCode: `ENGL1-${String(cIndex + 1).padStart(2, '0')}-${String(tIndex + 1).padStart(2, '0')}`,
                    title,
                    tags: ['English Literature', 'English Literature Paper I', chapterCleanName],
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
                    paper: 'English Literature',
                    subjectName: 'English Literature Paper II',
                    chapter: chapterCleanName,
                    heading: chapterCleanName,
                    topicCode: `ENGL2-${String(cIndex + 16).padStart(2, '0')}-${String(tIndex + 1).padStart(2, '0')}`,
                    title,
                    tags: ['English Literature', 'English Literature Paper II', chapterCleanName],
                    difficulty: 'Medium',
                    status: 'Pending',
                    completed: false,
                    notes: { theory: '' }
                });
            });
        });

        const inserted = await Topic.insertMany(topicsToInsert);
        console.log(`\n✅ Successfully seeded ${inserted.length} English Literature topics across 39 Major Units!`);
        console.log(`  - English Literature Paper I (15 Units): ${p1Count} micro-topics`);
        console.log(`  - English Literature Paper II (24 Units): ${p2Count} micro-topics`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
