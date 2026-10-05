/**
 * seedEnglishLiterature.js
 * 
 * Seeds the complete English Literature optional syllabus (Paper I + Paper II)
 * with proper paper, subjectName, chapter, topicCode fields.
 * 
 * Run: node seedEnglishLiterature.js
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
        chapter: "Shakespeare — King Lear",
        topics: [
            "King Lear — plot, structure: love-test, division of kingdom, rejection of Cordelia, Gloucester subplot, storm, madness, reconciliation, tragic closure.",
            "King Lear — characters: Lear, Cordelia, Goneril, Regan, Edmund, Edgar, Gloucester, Kent, Fool, Albany, Cornwall.",
            "King Lear — themes: kingship, authority, filial ingratitude, justice, madness, nature, blindness, appearance vs reality, suffering, redemption.",
            "King Lear — literary aspects: Shakespearean tragedy, tragic hero, parallel plots, dramatic irony, soliloquy, Fool as commentator, storm/animal/clothing imagery, catharsis.",
            "King Lear — critical approaches: political, psychological, feminist, Marxist, existential, Christian, humanist readings."
        ]
    },
    {
        chapter: "Shakespeare — The Tempest",
        topics: [
            "The Tempest — plot: shipwreck, Prospero's island, Miranda and Ferdinand, Ariel, Caliban, revenge, forgiveness, restoration, departure.",
            "The Tempest — characters: Prospero, Miranda, Ariel, Caliban, Ferdinand, Alonso, Antonio, Sebastian, Gonzalo.",
            "The Tempest — themes: power, colonialism, authority, magic, knowledge, revenge, forgiveness, freedom, slavery, civilisation vs nature, political legitimacy.",
            "The Tempest — literary concepts: romance, masque, symbolism, metatheatre, supernatural elements, colonial/postcolonial interpretation."
        ]
    },
    {
        chapter: "John Donne — Metaphysical Poetry",
        topics: [
            "Metaphysical Poetry — conceit, wit, paradox, intellectualism, argumentative structure, dramatic opening, colloquial language, religious/scientific/geographical imagery.",
            "Donne: The Canonization — love, immortality, lovers as saints, religious imagery, paradox, metaphysical conceit, hyperbole.",
            "Donne: Death be not proud — death, mortality, Christian faith, resurrection, personification, paradox, sonnet structure.",
            "Donne: The Good Morrow — awakening of love, spiritual union, mutuality, discovery, world of lovers, metaphysical conceit.",
            "Donne: On His Mistress Going to Bed — erotic love, desire, marriage imagery, sexuality, religious symbolism, extended metaphor.",
            "Donne: The Sun Rising — love vs external world, time, authority, lover's world, personification, hyperbole, metaphysical wit.",
            "Donne: A Valediction: Forbidding Mourning — separation, spiritual love, compass conceit, earthquake imagery, gold imagery, physical vs spiritual union."
        ]
    },
    {
        chapter: "John Milton — Shorter Poems",
        topics: [
            "Milton: L'Allegro — mirth, pleasure, rural life, nature, music, classical references, allegory, personification, pastoral tradition.",
            "Milton: Il Penseroso — melancholy, contemplation, solitude, learning, religion, night imagery; L'Allegro vs Il Penseroso comparison.",
            "Milton: Lycidas — death, friendship, pastoral elegy, religion, clerical corruption, immortality, classical mythology, Christian symbolism.",
            "Milton: On His Blindness — blindness, faith, duty, service, divine will, patience; sonnet, religious poetry, paradox."
        ]
    },
    {
        chapter: "John Milton — Paradise Lost",
        topics: [
            "Paradise Lost Book I — invocation, epic convention, Satan, fall of angels, Hell, Pandemonium, epic similes, blank verse.",
            "Paradise Lost Book I — Satan: heroic qualities, pride, ambition, rebellion, rhetoric, leadership, tragic dimensions.",
            "Paradise Lost Book II — Satan's council, Pandemonium debate, Sin and Death, Satan's journey, Hell, Chaos.",
            "Paradise Lost Book IV — Satan in Eden, Garden of Eden, Adam and Eve, innocence, knowledge, free will, good vs evil.",
            "Paradise Lost Book IX — temptation, Fall of Man, Eve, Adam, Satan, free will, disobedience, gender, consequences of sin.",
            "Paradise Lost — major concepts: Christian epic, theodicy, free will vs predestination, Satan as character, heroism, blank verse, epic simile, classical influence."
        ]
    },
    {
        chapter: "Alexander Pope — The Rape of the Lock",
        topics: [
            "Pope: The Rape of the Lock — mock-epic, satire, heroic couplet, social criticism, aristocratic society, gender, vanity, honour, supernatural machinery.",
            "Pope: The Rape of the Lock — characters: Belinda, Baron, Ariel, Clarissa, Umbriel; mock-heroic treatment, epic parody, neoclassicism, wit, reason, decorum."
        ]
    },
    {
        chapter: "William Wordsworth — Romantic Poetry",
        topics: [
            "Wordsworthian Romanticism — nature, childhood, imagination, memory, emotion, individualism, rural life, common man, spirituality, nature as teacher/moral force.",
            "Wordsworth: Ode: Intimations of Immortality — childhood, memory, loss, immortality, nature, spiritual development.",
            "Wordsworth: Tintern Abbey — nature, memory, imagination, spirituality, childhood, growth of consciousness.",
            "Wordsworth: Three Years She Grew / She Dwelt among the Untrodden Ways — Lucy poems, nature, isolation, death, simplicity, human-nature relationship.",
            "Wordsworth: Michael — rural life, family, industrialisation, human suffering, father-son relationship.",
            "Wordsworth: Resolution and Independence — aging, despair, hope, nature, leech-gatherer, poet's crisis.",
            "Wordsworth: The World is Too Much With Us — materialism, industrialisation, nature, spiritual alienation.",
            "Wordsworth: Milton, thou shouldst be living at this hour — national morality, political freedom, moral leadership, Miltonic ideal.",
            "Wordsworth: Upon Westminster Bridge — urban beauty, nature, stillness, industrial landscape."
        ]
    },
    {
        chapter: "Alfred Tennyson — In Memoriam",
        topics: [
            "Tennyson: In Memoriam A.H.H. — death, grief, faith, doubt, science, religion, immortality, evolution, nature, human suffering, love, memory, Victorian anxiety.",
            "Tennyson: In Memoriam — literary features: elegy, lyric sequence, symbolism, nature imagery, religious imagery, musicality, Victorian sensibility.",
            "Tennyson: In Memoriam — context: Victorian Age, scientific advancement, crisis of faith, Darwinian thought, industrial society."
        ]
    },
    {
        chapter: "Henrik Ibsen — A Doll's House",
        topics: [
            "Ibsen: A Doll's House — plot: Nora and Torvald, Krogstad, Mrs Linde, Dr Rank, loan, forgery, revelation, confrontation, Nora's departure.",
            "Ibsen: A Doll's House — themes: marriage, patriarchy, women's freedom, individual identity, gender roles, social morality, economic dependence, reputation.",
            "Ibsen: A Doll's House — dramatic concepts: realism, problem play, modern drama, symbolism, psychological drama, stagecraft."
        ]
    },
    {
        chapter: "Jonathan Swift — Gulliver's Travels",
        topics: [
            "Swift: Gulliver's Travels — Voyage I (Lilliput): politics, war, human pride, satire, court politics.",
            "Swift: Gulliver's Travels — Voyage II (Brobdingnag): human physicality, European politics, relative morality, perspective.",
            "Swift: Gulliver's Travels — Voyage III (Laputa): science, abstract knowledge, government, intellectual absurdity.",
            "Swift: Gulliver's Travels — Voyage IV (Houyhnhnms): Yahoos, reason, human nature, civilisation, colonial interpretation.",
            "Swift: Gulliver's Travels — themes and techniques: satire, irony, allegory, parody, traveller narrative, defamiliarisation, colonialism, imperialism."
        ]
    },
    {
        chapter: "Jane Austen — Pride and Prejudice",
        topics: [
            "Austen: Pride and Prejudice — characters: Elizabeth, Darcy, Jane, Bingley, Lydia, Wickham, Mr/Mrs Bennet, Lady Catherine.",
            "Austen: Pride and Prejudice — themes: marriage, class, gender, money, social status, reputation, prejudice, pride, individual judgement.",
            "Austen: Pride and Prejudice — literary features: irony, free indirect discourse, characterisation, social comedy, dialogue, narrative perspective."
        ]
    },
    {
        chapter: "Henry Fielding — Tom Jones",
        topics: [
            "Fielding: Tom Jones — picaresque elements, narrative structure, comedy, morality, social class, love, marriage, human nature, providence.",
            "Fielding: Tom Jones — characters: Tom, Sophia Western, Blifil, Allworthy, Squire Western; omniscient narrator, digression, satire, realism."
        ]
    },
    {
        chapter: "Charles Dickens — Hard Times",
        topics: [
            "Dickens: Hard Times — themes: industrialisation, utilitarianism, education, imagination, class, labour, capitalism, factory system.",
            "Dickens: Hard Times — characters: Gradgrind, Louisa, Tom, Blackpool, Bounderby, Sissy Jupe; satire, symbolism, social criticism, industrial novel."
        ]
    },
    {
        chapter: "George Eliot — The Mill on the Floss",
        topics: [
            "Eliot: The Mill on the Floss — characters: Maggie, Tom Tulliver, Philip Wakem, Stephen Guest, Lucy Deane, Mr Tulliver.",
            "Eliot: The Mill on the Floss — themes: gender, family, society, education, desire, morality, social restrictions, class, fate.",
            "Eliot: The Mill on the Floss — literary features: psychological realism, social realism, narrator, character development, tragedy."
        ]
    },
    {
        chapter: "Thomas Hardy — Tess of the d'Urbervilles",
        topics: [
            "Hardy: Tess of the d'Urbervilles — characters: Tess, Angel Clare, Alec d'Urberville, Joan/John Durbeyfield.",
            "Hardy: Tess of the d'Urbervilles — themes: fate, gender, sexual morality, Victorian society, religion, class, rural life, nature, determinism.",
            "Hardy: Tess of the d'Urbervilles — critical approaches: feminist, Marxist, psychological, naturalistic, tragic readings."
        ]
    },
    {
        chapter: "Mark Twain — Huckleberry Finn",
        topics: [
            "Twain: Huckleberry Finn — themes: slavery, racism, freedom, morality, childhood, individual conscience, civilisation, religion, Mississippi River.",
            "Twain: Huckleberry Finn — characters: Huck, Jim, Tom Sawyer, Pap Finn, Duke and King; first-person narration, vernacular, satire, irony, picaresque."
        ]
    },
    {
        chapter: "Literary Movements & Periods (1600–1900)",
        topics: [
            "Renaissance — humanism, classical revival, individualism, religious change.",
            "Elizabethan and Jacobean Drama — Shakespeare, tragedy, comedy, dramatic conventions, revenge tragedy, darker themes.",
            "Metaphysical Poetry — conceit, wit, paradox, intellectualism; Donne and the metaphysical tradition.",
            "Epic and Mock-Epic — conventions, invocation, hero, supernatural machinery; parody, satire, heroic treatment of trivial subjects.",
            "Neoclassicism — reason, order, decorum, imitation of classics; Pope and the Augustan age.",
            "Satire — Horatian, Juvenalian, irony, parody; Swift and Pope.",
            "Romantic Movement — nature, imagination, emotion, individualism; Wordsworth and the Romantic tradition.",
            "Rise of the Novel — realism, narrative, middle-class readership; Fielding, Austen, Dickens.",
            "Victorian Age — industrialisation, morality, religion, science, social problems; Tennyson, Dickens, Eliot, Hardy."
        ]
    }
];

// ═══════════════════════════════════════════════════════════════
// PAPER II — ENGLISH LITERATURE: 1900–1990
// ═══════════════════════════════════════════════════════════════

const PAPER_2_DATA = [
    {
        chapter: "W.B. Yeats — Poetry",
        topics: [
            "Yeats: Easter 1916 — Irish nationalism, sacrifice, violence, transformation, political commitment.",
            "Yeats: The Second Coming — civilisation collapse, historical cycles, gyres, apocalypse, modernity.",
            "Yeats: A Prayer for My Daughter — fatherhood, innocence, turbulence, civilisation, beauty, opinion.",
            "Yeats: Sailing to Byzantium — aging, art, immortality, spirituality, Byzantium symbolism.",
            "Yeats: The Tower — aging, memory, art, creativity, Irish landscape, poetic legacy.",
            "Yeats: Among School Children — aging, education, memory, youth, unity of being, body and soul.",
            "Yeats: Leda and the Swan — myth, violence, history, divine-human encounter, political allegory.",
            "Yeats: Meru / Lapis Lazuli — civilisation, destruction, art, tragedy, gaiety, Eastern philosophy.",
            "Yeats: Byzantium — spiritual transcendence, art, death, imagination, afterlife, symbolism.",
            "Yeats — major concepts: gyres, Unity of Being, Byzantium symbolism, historical cycles, mask, anti-self, myth-making."
        ]
    },
    {
        chapter: "T.S. Eliot — Poetry",
        topics: [
            "Eliot: The Love Song of J. Alfred Prufrock — alienation, urban life, paralysis, time, fragmentation, modern consciousness, identity.",
            "Eliot: Journey of the Magi — faith, spiritual transformation, birth/death, religious symbolism.",
            "Eliot: Burnt Norton — time, memory, possibility, spirituality, stillness, Four Quartets.",
            "Eliot — literary concepts: Modernism, objective correlative, fragmentation, allusion, myth, impersonality, tradition and the individual talent."
        ]
    },
    {
        chapter: "W.H. Auden — Poetry",
        topics: [
            "Auden: Partition / Musée des Beaux Arts — politics, suffering, indifference, art, human condition.",
            "Auden: In Memory of W.B. Yeats — poetry, death, legacy, relationship between art and society.",
            "Auden: Lay Your Sleeping Head, My Love / Mundus et Infans — love, mortality, innocence, transience.",
            "Auden: The Unknown Citizen / Consider — individual vs state, totalitarianism, bureaucracy, modern society.",
            "Auden: The Shield of Achilles / September 1, 1939 / Petition — war, politics, moral responsibility, civilisation, history.",
            "Auden — literary features: irony, political poetry, classical allusion, myth, formal experimentation, Auden generation."
        ]
    },
    {
        chapter: "John Osborne — Look Back in Anger",
        topics: [
            "Osborne: Look Back in Anger — characters: Jimmy Porter, Alison, Cliff, Helena, Colonel Redfern.",
            "Osborne: Look Back in Anger — themes: Angry Young Men, class, marriage, gender, post-war Britain, alienation, frustration, social change.",
            "Osborne: Look Back in Anger — literary features: kitchen-sink realism, social drama, psychological realism, natural dialogue."
        ]
    },
    {
        chapter: "Samuel Beckett — Waiting for Godot",
        topics: [
            "Beckett: Waiting for Godot — characters: Vladimir, Estragon, Pozzo, Lucky, the Boy.",
            "Beckett: Waiting for Godot — themes: meaninglessness, waiting, time, memory, existence, death, communication, absurdity.",
            "Beckett: Waiting for Godot — concepts: Theatre of the Absurd, circular structure, minimalism, repetition, existentialism, anti-drama."
        ]
    },
    {
        chapter: "Philip Larkin — Poetry",
        topics: [
            "Larkin: Next Please / Deceptions / Afternoons — disillusionment, aging, ordinary life, lost opportunity, suburban existence.",
            "Larkin: Days / Mr Bleaney — death, meaning, loneliness, post-war society, identity, emptiness.",
            "Larkin — literary features: plain language, irony, colloquial style, formal verse, Movement poetry, everyday experience."
        ]
    },
    {
        chapter: "A.K. Ramanujan — Poetry",
        topics: [
            "Ramanujan: Looking for a Cousin on a Swing / A River — Indian society, tradition, modernity, cultural critique, irony.",
            "Ramanujan: Of Mothers, among Other Things / Love Poem for a Wife 1 — family, memory, marriage, generational conflict.",
            "Ramanujan: Small-Scale Reflections on a Great House / Obituary — tradition, family structure, cultural identity, diaspora, irony.",
            "Ramanujan — literary features: Indian English poetry, cultural symbolism, myth, memory, translation consciousness."
        ]
    },
    {
        chapter: "Joseph Conrad — Lord Jim",
        topics: [
            "Conrad: Lord Jim — colonialism, imperialism, guilt, honour, heroism, failure, redemption, identity, moral responsibility.",
            "Conrad: Lord Jim — literary features: frame narrative, Marlow, multiple perspectives, psychological narration, colonial discourse."
        ]
    },
    {
        chapter: "James Joyce — A Portrait of the Artist",
        topics: [
            "Joyce: A Portrait of the Artist as a Young Man — Stephen Dedalus, coming of age, religion, nationalism, art, exile, Irish society.",
            "Joyce: A Portrait — literary features: stream of consciousness, epiphany, interior monologue, narrative development, Modernism."
        ]
    },
    {
        chapter: "D.H. Lawrence — Sons and Lovers",
        topics: [
            "Lawrence: Sons and Lovers — family, mother-son relationship, sexuality, industrial society, class, psychology, Oedipal dimensions.",
            "Lawrence: Sons and Lovers — literary features: psychological novel, naturalism, symbolism, autobiographical elements."
        ]
    },
    {
        chapter: "E.M. Forster — A Passage to India",
        topics: [
            "Forster: A Passage to India — colonialism, British Raj, Indian society, race, religion, friendship, cultural misunderstanding, Marabar Caves.",
            "Forster: A Passage to India — characters: Dr Aziz, Fielding, Adela Quested, Mrs Moore, Ronny Heaslop.",
            "Forster: A Passage to India — critical approaches: postcolonial, humanist, Orientalism, race/class analysis."
        ]
    },
    {
        chapter: "Virginia Woolf — Mrs Dalloway",
        topics: [
            "Woolf: Mrs Dalloway — stream of consciousness, time, memory, trauma, war, gender, mental interiority, social class, modernity.",
            "Woolf: Mrs Dalloway — characters: Clarissa, Septimus Smith, Richard Dalloway, Peter Walsh, Sally Seton.",
            "Woolf: Mrs Dalloway — literary techniques: interior monologue, free indirect discourse, multiple perspectives, temporal shifts, psychological realism."
        ]
    },
    {
        chapter: "Raja Rao — Kanthapura",
        topics: [
            "Raja Rao: Kanthapura — Gandhian nationalism, Indian freedom movement, village society, caste, religion, women, colonialism, myth and history.",
            "Raja Rao: Kanthapura — literary features: Indian English, oral narrative, mythic structure, folk traditions, nationalism."
        ]
    },
    {
        chapter: "V.S. Naipaul — A House for Mr Biswas",
        topics: [
            "Naipaul: A House for Mr Biswas — identity, colonial society, Indo-Caribbean experience, family, migration, alienation, individualism, cultural displacement.",
            "Naipaul: A House for Mr Biswas — literary features: postcolonial fiction, satire, realism, autobiographical elements."
        ]
    },
    {
        chapter: "Literary Movements & Critical Approaches (1900–1990)",
        topics: [
            "Modernism — World War I, fragmentation, alienation, loss of faith, urbanisation, psychological interiority, myth, experimentation, non-linear narrative.",
            "Modernism — major writers: Yeats, Eliot, Joyce, Woolf, Conrad; formal innovation and thematic transformation.",
            "Poets of the Thirties — political poetry, Marxism, fascism, war, social commitment, Auden generation, political consciousness.",
            "Stream-of-Consciousness Novel — interior monologue, free association, psychological time, subjectivity, memory, fragmentation; Joyce, Woolf.",
            "Absurd Drama — meaninglessness, existentialism, circularity, breakdown of language, anti-plot, minimalism; Waiting for Godot.",
            "Colonialism and Post-Colonialism — colonial discourse, imperialism, othering, cultural domination, identity, hybridity, resistance, mimicry.",
            "Post-Colonialism — text connections: Lord Jim, A Passage to India, Kanthapura, A House for Mr Biswas.",
            "Indian Writing in English — colonial education, Indian identity, language, nationalism, tradition vs modernity, Indianisation of English; Rao, Ramanujan.",
            "Marxist Approach — class, capital, labour, ideology, alienation, hegemony; applied to Hard Times, Tess, A Passage to India, Look Back in Anger.",
            "Psychoanalytical Approach — Freud, conscious/unconscious, id/ego/superego, repression, Oedipus complex; applied to Sons and Lovers, Mrs Dalloway, King Lear.",
            "Feminist Approach — patriarchy, gender roles, women's agency, sexual politics, male gaze; applied to A Doll's House, Pride and Prejudice, Tess, Mrs Dalloway.",
            "Post-Modernism — fragmentation, intertextuality, metafiction, questioning grand narratives, relativism, pastiche, parody, unstable meaning."
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

        let engLitSubject = await Subject.findOne({ name: 'English Literature' });
        if (!engLitSubject) {
            console.log('English Literature subject not found, creating it...');
            engLitSubject = await Subject.create({ name: 'English Literature', description: 'English Literature Optional Subject' });
        }
        const subjectId = engLitSubject._id;

        const deleteRes = await Topic.deleteMany({ subjectId });
        console.log(`Deleted ${deleteRes.deletedCount} existing English Literature topics.`);

        const topicsToInsert = [];
        let p1Count = 0;
        let p2Count = 0;

        PAPER_1_DATA.forEach(chapterObj => {
            chapterObj.topics.forEach(title => {
                p1Count++;
                topicsToInsert.push({
                    subjectId,
                    paper: 'English Literature',
                    subjectName: 'English Literature Paper I',
                    chapter: chapterObj.chapter,
                    heading: chapterObj.chapter,
                    topicCode: `EL1-${String(p1Count).padStart(3, '0')}`,
                    title,
                    tags: ['English Literature', 'English Literature Paper I', chapterObj.chapter],
                    difficulty: 'Medium',
                    status: 'Pending',
                    completed: false,
                    notes: { theory: '' }
                });
            });
        });

        PAPER_2_DATA.forEach(chapterObj => {
            chapterObj.topics.forEach(title => {
                p2Count++;
                topicsToInsert.push({
                    subjectId,
                    paper: 'English Literature',
                    subjectName: 'English Literature Paper II',
                    chapter: chapterObj.chapter,
                    heading: chapterObj.chapter,
                    topicCode: `EL2-${String(p2Count).padStart(3, '0')}`,
                    title,
                    tags: ['English Literature', 'English Literature Paper II', chapterObj.chapter],
                    difficulty: 'Medium',
                    status: 'Pending',
                    completed: false,
                    notes: { theory: '' }
                });
            });
        });

        const inserted = await Topic.insertMany(topicsToInsert);
        console.log(`\n✅ Successfully seeded ${inserted.length} English Literature topics!`);
        console.log(`  - English Literature Paper I: ${p1Count} topics`);
        console.log(`  - English Literature Paper II: ${p2Count} topics`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
