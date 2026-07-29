/**
 * Seed Ethics, Integrity & Aptitude Syllabus (GS IV) Offline (Bypassing Gemini Quota)
 * Run: node seedEthicsAsIs.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

// Group 1: Ethics & Integrity (Tag: 'Ethics & Integrity')
const ETHICS_INTEGRITY_TOPICS = [
  // Basic Introduction
  "Ethics Basic Introduction",
  "Dimensions of Ethics",
  "Essence of Ethics",
  "Approaches of Ethical Study as Indian Perspective and Western Perspective",
  "Basic concept of ethics morality and value",
  "Ethics in public life",
  "Ethics in Economic Life",
  "Freedom and Discipline",
  "Duties and Rights",
  "Virtue Ethics",
  "Consequences of Ethics in Human Actions",
  "Values and Ethics in Government: Contribution of Family in Value Education",
  "Human Values & Socialization",
  "Individual Personality and Value",
  "Values and Skill",
  "Fundamental and Instrumental Values",
  "Democratic values",
  "Role of ethical value in governance and society",
  "Significance of value in Civil Services",
  "Contribution of Society in Inculcating Values",
  "Role of Educational Institutions in Inculcating Values",
  "Aesthetic values",
  "Values in work life and professional ethics",
  
  // Thinkers
  "Mahatma Gandhi (Swaraj, Satyagraha, Trusteeship)",
  "Dr. S. Radhakrishnan",
  "Rabindranath Tagore",
  "Swami Dayanand Saraswati",
  "Mahadeva Govinda Ranade",
  "Sri Aurobindo",
  "Swami Vivekananda",
  "Sardar Patel",
  "Buddha and Bhim Rao Ambedkar",
  "Raja Ram Mohan Roy",
  "Chhatrapati Shahu Maharaj",
  "Mother Teresa",
  "Amitabha Chowdhury",
  "Aruna Roy",
  "T. N. Seshan",
  "E. Sreedharan",
  "Administrative Thinkers: Max Weber",
  "Administrative Thinkers: Elton Mayo",
  "Administrative Thinkers: Peter Drucker",
  "Administrative Thinkers: Chestar Barnard",
  "Administrative Thinkers: Mary Parker Follet",
  "Western Thinkers: Plato",
  "Western Thinkers: Aristotle",
  "Western Thinkers: Socrates",
  "Western Thinkers: Jeremy Bentham",
  "Western Thinkers: JS Mill",
  "Western Thinkers: Thomas Hobbes",
  "Western Thinkers: John Locke",
  "Western Thinkers: Jean Jacques Rousseau",
  "Western Thinkers: John Rawls",
  "Western Thinkers: Immanuel Kant",
  "Western Thinkers: Carol Gilligan",
  "Western Thinkers: Jean Paul Sartre",
  "Western Thinkers: Georg Wilhelm Friedrich Hegel",
  "Western Thinkers: Confucius",
  "Western Thinkers: René Descartes",
  "Western Thinkers: Karl Marx",
  "Western Thinkers: Adam Smith",
  "Western Thinkers: Thomas Aquinas",
  "Western Thinkers: David Hume",
  "Western Thinkers: Democritus",
  "Western Thinkers: Galileo",
  "Western Thinkers: Friedrich Nietzsche",
  "Western Thinkers: Montesquieu",
  "Western Thinkers: Voltaire",
  "Western Thinkers: Thomas Jefferson",
  "Western Thinkers: Benjamin Franklin",
  "Western Thinkers: Martin Luther King",
  "Western Thinkers: Dalai Lama",
  "Western Thinkers: Nelson Mandela",
  "Western Thinkers: Siddhartha Gautama",
  "Western Thinkers: Aung San Suu Kyi",
  "Western Thinkers: Albert Einstein",
  "Western Thinkers: Abraham Lincoln",
  "Western Thinkers: J. L. Nehru",
  "Western Thinkers: Lee Kuan Yew",
  "Western Thinkers: Henry Ford",
  "Western Thinkers: Abdul Kalam",
  "Western Thinkers: Muhammad Yunus",
  "Western Thinkers: Wangari Maathai",
  "Western Thinkers: Kofi Annan",
  "Western Thinkers: Lech Walesa",
  "Western Thinkers: Desmond Tutu",
  "Western Thinkers: Isaac Newton",
  "Western Thinkers: Elie Wiesel",
  "Western Thinkers: King Ashoka",
  "Western Thinkers: Sun Yat Sen",

  // Values & Ethics in Public Administration
  "Ethical Concerns in Public Institution",
  "Ethical Concerns in Private Institutions",
  "Ethical Dilemmas in Public and Private Institutions",
  "Laws, Rules and Regulations as Source of Ethical Guidance",
  "Accountability and Ethical Governance",
  "Strengthening of Ethical and Moral Values in Governance",
  "Moral Judgements in International Relations",
  "Ethical Relation in Funding International Relations and concept of Moral Responsibility",
  "Ethics in working of international organizations",
  "What is Corporate Governance?",
  "Models of Corporate Social Responsibility",
  "Steps taken by World Bank for Good Corporate Governance",
  "Norms for Corporate Government in India",
  "Concept of business ethics",

  // Probity in Governance
  "Concept of Public Service",
  "Philosophical basis of Governance and Probity",
  "Information Sharing, Transparency and Right to Information",
  "Flaws in RTI and recommendations for improvement",
  "Importance of vigilant citizens",
  "Information sharing and participation",
  "Importance of Code of ethics",
  "Code of Ethics in Professions",
  "Code of Conduct for Ministers, Legislators and Civil Servants",
  "Code of Conduct for Regulators and Judiciary",
  "Components of a Citizen Charter",
  "Steps in formulation of a Citizen’s Charter",
  "Concept of Work Culture",
  "The Indian Approach to Work",
  "Methods of improving Work Culture",
  "Quality of Service Delivery",
  "Utilisation of Public Funds",
  "Problems in Fund Release and Utilization",
  "Parliamentary Control on Expenditure",
  "Corruption in India: extent, dimension, and response",
  "Corruption as a Social Evil",
  "Probity in public life: Corrupt practice among civil servants and official misconduct",
  "Exposing corruption: Civil Society initiatives and role of Whistleblower Act",
  "Tackling corruption: Role of government and institutions of governance",
  "Controlling corruption: Various approaches and efficacy",

  // Applied Ethics
  "Applied Ethics: Euthanasia Issue",
  "Applied Ethics: Surrogacy Ethics & Legal Framework",
  "Applied Ethics: Ethics & Sports (Doping, Commercialization, Discrimination)",
  "Applied Ethics: Media Ethics & Digital Media Ethics (Paid News, Media Trial)",
  "Applied Ethics: Business Ethics & CSR Journey",
  "Applied Ethics: Economic Sanctions & Humanitarian Dilemmas",
  "Applied Ethics: Refugees & Ethics of Migration (Syrian Crisis)",
  "Applied Ethics: Ethical Dilemmas of Globalization",
  "Applied Ethics: Ethics of War & Just War Theory",
  "Applied Ethics: Environmental Ethics (Individual Role & Eco-centrism)",
  "Applied Ethics: Ethical Issues in Biotechnology (Stem Cell, Cloning, Designer Babies)",
  "Applied Ethics: Animal Ethics (Research, Pets, Cruelty)",
  "Applied Ethics: Food Adulteration and Food Additives Ethics",
  "Applied Ethics: Abortion (Women Rights vs Fetus Health)",
  "Applied Ethics: Honour Killing & Role of Khap Panchayats",
  "Applied Ethics: Marital Rape Criminalization debate",
  "Applied Ethics: Child Labour & Corporate Responsibility",
  "Applied Ethics: Treating Juvenile as Adult (Negative Implications)",
  "Applied Ethics: Ethics and Old Age Care & Autonomy",
  "Applied Ethics: Ethics in Public and Private Relationships",
  "Applied Ethics: Moonlighting and Work Ethics",
  "Applied Ethics: Ethics of Public Interest Litigation (PIL)",
  "Applied Ethics: Influence of Opinion Polls on Democratic Ethics"
];

// Group 2: Attitude & Aptitude (Tag: 'Attitude & Aptitude')
const ATTITUDE_APTITUDE_TOPICS = [
  // Aptitude
  "Essential Aptitude for civil servants",
  "Foundational Values of Civil Services",
  "Neutrality and Anonymity in Civil Services",
  "Civil Services Accountability",
  "Integrity and Humility",
  "Adaptability and Magnanimity",
  "Perseverance",
  "Impartiality and Non-Partisanship",
  "Tolerance and compassion for the weaker section",
  "Contribution to society",

  // Attitude
  "Components of Attitude (Affective, Cognitive, Behavioral)",
  "Functions of Attitude (Adjustive, Ego-Defensive, Value-Expressive, Knowledge)",
  "Attitude Formation Model",
  "Impact of Beliefs and Values on Attitude",
  "Group Influences & Social Influence",
  "Persuasion Tactics & Tools of Persuasion",
  "Moral Attitude formation",
  "Political Attitude formation",

  // Emotional Intelligence
  "Theories Associated with Emotional Intelligence",
  "Can Emotional Intelligence be Developed?",
  "Components of Emotional Competencies",
  "Self-Awareness Cluster: Understanding Feelings and Accurate Self-Assessment",
  "Self-Management Cluster: Managing Internal States, Impulses, and Resources",
  "Social Awareness Cluster: Reading People and Groups Accurately",
  "Relationship Management Cluster: Inducing Desirable Responses",
  "Importance of Emotional Intelligence at Workplace & Civil Services"
];

// Group 3: Case Studies (Tag: 'Case Studies')
const CASE_STUDIES_TOPICS = [
  "Case Studies on Ethical Dilemmas in Public Administration",
  "Case Studies on Conflict of Interest & Code of Conduct",
  "Case Studies on Corruption and Integrity Challenges",
  "Case Studies on Public Service Delivery & Citizen Charters",
  "Case Studies on Corporate Governance & Business Ethics",
  "Case Studies on Applied Ethics (Refugees, Environment, Surrogacy)",
  "Case Studies on Compassion & Impartiality in Civil Services"
];

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS IV Subject
    const subject = await Subject.findOne({ name: 'GS IV' });
    if (!subject) {
      console.error('❌ Subject GS IV not found.');
      process.exit(1);
    }

    const totalTopicsToInsert = 
      ETHICS_INTEGRITY_TOPICS.length + 
      ATTITUDE_APTITUDE_TOPICS.length + 
      CASE_STUDIES_TOPICS.length;

    console.log(`Seeding ${totalTopicsToInsert} pre-cleaned GS IV topics...`);

    // Delete any existing GS IV topics
    const deleteRes = await Topic.deleteMany({ subjectId: subject._id });
    console.log(`Deleted ${deleteRes.deletedCount} old GS IV topics.`);

    const topicsToInsert = [];

    // Add Ethics & Integrity
    ETHICS_INTEGRITY_TOPICS.forEach(title => {
      topicsToInsert.push({
        title,
        tags: ["Ethics & Integrity"],
        difficulty: "Medium",
        subjectId: subject._id,
        status: 'Pending',
        notes: createEmptyNotes()
      });
    });

    // Add Attitude & Aptitude
    ATTITUDE_APTITUDE_TOPICS.forEach(title => {
      topicsToInsert.push({
        title,
        tags: ["Attitude & Aptitude"],
        difficulty: "Medium",
        subjectId: subject._id,
        status: 'Pending',
        notes: createEmptyNotes()
      });
    });

    // Add Case Studies
    CASE_STUDIES_TOPICS.forEach(title => {
      topicsToInsert.push({
        title,
        tags: ["Case Studies"],
        difficulty: "Hard",
        subjectId: subject._id,
        status: 'Pending',
        notes: createEmptyNotes()
      });
    });

    const inserted = await Topic.insertMany(topicsToInsert);
    console.log(`✅ Successfully seeded all ${inserted.length} GS IV Ethics topics!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

function createEmptyNotes() {
  return {
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
}

main();
