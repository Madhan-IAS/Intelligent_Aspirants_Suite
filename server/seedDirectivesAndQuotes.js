const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Directive = require('./models/Directive');
const Quote = require('./models/Quote');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const directives = [
  {
    name: 'Comment',
    definition: 'Give your opinion based on facts + balanced arguments',
    depth: 'Medium',
    structure: {
      intro: 'Define the issue or core concept.',
      body: 'Present your balanced viewpoint supported by facts, examples, or data.',
      conclusion: 'Give a short personal assessment or forward-looking stance.',
      tip: 'Keep it balanced and analytical.'
    },
    smartAddon: 'Add 1 value-add component (e.g. recent news reference or data).'
  },
  {
    name: 'Examine',
    definition: 'Investigate closely to reveal facts, causes, and implications',
    depth: 'High',
    structure: {
      intro: 'Define the topic/concept and context.',
      body: 'Probe into the causes, functioning, and facts. Go beneath the surface.',
      conclusion: 'Summarize what your examination reveals.',
      tip: 'Bring hidden facts and underlying causes to light.'
    },
    smartAddon: 'Quote relevant committee reports or policy references.'
  },
  {
    name: 'Critically Examine',
    definition: 'Investigate closely and mention positives and negatives before a conclusion',
    depth: 'High',
    structure: {
      intro: 'Define the topic/concept and current context.',
      body: 'Detail both strengths/positives and gaps/limitations/challenges.',
      conclusion: 'Provide a balanced final assessment (e.g., "Despite challenges, it remains essential...").',
      tip: 'Highlight limitations clearly before concluding.'
    },
    smartAddon: 'Use a pros/cons comparison and close with a realistic vision.'
  },
  {
    name: 'Discuss',
    definition: 'Present multiple viewpoints and wider explanation',
    depth: 'Medium–High',
    structure: {
      intro: 'Provide context and definition of the issue.',
      body: 'Provide a multi-dimensional explanation (political, economic, social, environmental, etc.).',
      conclusion: 'Sum up with a future-oriented outlook.',
      tip: 'Cover a wide range of aspects rather than a single deep critique.'
    },
    smartAddon: 'Include a simple cause-and-effect flowchart or mind map.'
  },
  {
    name: 'Critically Discuss',
    definition: 'Present multiple viewpoints with critical analysis and a balanced conclusion',
    depth: 'High',
    structure: {
      intro: 'Define the topic and context.',
      body: 'Analyze the positives/significance, negatives/challenges, and back them with examples/data.',
      conclusion: 'Provide a balanced final judgment.',
      tip: 'Always include both sides of the argument.'
    },
    smartAddon: 'Support with data, committee recommendations, and SDGs.'
  },
  {
    name: 'Evaluate',
    definition: 'Assess the value, pros & cons, judging impact to form a final verdict',
    depth: 'High',
    structure: {
      intro: 'Define the objective or context of the policy/scheme.',
      body: 'Weigh the pros vs cons with evidence/achievements vs failures.',
      conclusion: 'Deliver a final value judgment based on the evidence.',
      tip: 'Give a clear verdict rather than just listing facts.'
    },
    smartAddon: 'Use an impact summary table (e.g. Parameter | Status).'
  },
  {
    name: 'Critically Evaluate',
    definition: 'Assess value, pros & cons, and point out shortcomings clearly before forming a verdict',
    depth: 'Very High',
    structure: {
      intro: 'Define the objective and baseline context.',
      body: 'Assess strengths and weaknesses with strong evidence. Detail where it falls short.',
      conclusion: 'Provide an evidence-based final judgment.',
      tip: 'Point out critical systemic shortcomings clearly.'
    },
    smartAddon: 'Cite official reports (e.g. CAG, World Bank) to back your evaluation.'
  },
  {
    name: 'Analyze',
    definition: 'Break the issue into components (causes, effects, stakeholders)',
    depth: 'High',
    structure: {
      intro: 'Give a brief introduction to the concept.',
      body: 'Divide the issue into logical parts: causes, effects, and stakeholders involved.',
      conclusion: 'Summarize the key takeaway of the analysis.',
      tip: 'Structure your answer in logical, distinct components.'
    },
    smartAddon: 'Add a stakeholder mapping or cause-effect diagram.'
  },
  {
    name: 'Critically Analyze',
    definition: 'Break issue into components, highlight limitations, and provide a judgment',
    depth: 'Very High',
    structure: {
      intro: 'Provide a short introduction and define the core issue.',
      body: 'Break the issue into components, discuss pros and cons, and highlight constraints.',
      conclusion: 'State a clear and balanced stance based on the analysis.',
      tip: 'Offer a critical evaluation of each component.'
    },
    smartAddon: 'Incorporate relevant constitutional articles or landmark judgments.'
  },
  {
    name: 'Elaborate / Explain / Elucidate',
    definition: 'Make the idea clear with details, how, and why',
    depth: 'Medium',
    structure: {
      intro: 'Define the core term or concept.',
      body: 'Provide a clear, logical explanation of how and why the concept works.',
      conclusion: 'Summarize the essence of the concept in one line.',
      tip: 'Keep it clean, simple, and clarity-focused.'
    },
    smartAddon: 'Include a simple flowchart to illustrate process steps.'
  },
  {
    name: 'Justify',
    definition: 'Prove the statement correct with strong arguments and examples',
    depth: 'Medium',
    structure: {
      intro: 'Rephrase the statement and define context.',
      body: 'Provide strong arguments and examples that prove the statement correct.',
      conclusion: 'Reinforce the correctness of the statement.',
      tip: 'Do not include counterpoints; UPSC wants you to support the statement.'
    },
    smartAddon: 'Use high-profile examples, reports, and national/global indices.'
  },
  {
    name: 'Substantiate',
    definition: 'Support the argument with data, facts, reports, and examples',
    depth: 'Medium–High',
    structure: {
      intro: 'Introduce the core argument/statement.',
      body: 'Provide solid evidence: reports, statistics, committee names, and indices.',
      conclusion: 'Confirm the validity of the argument based on the data.',
      tip: 'Ensure every point is backed by a specific data source or report.'
    },
    smartAddon: 'Cite institutions like NITI Aayog, NCRB, WHO, or SDG targets.'
  },
  {
    name: 'Illustrate',
    definition: 'Explain using examples, case studies, and diagrams',
    depth: 'Medium',
    structure: {
      intro: 'Define the concept briefly.',
      body: 'Provide detailed examples, case studies, or draw a diagram to explain.',
      conclusion: 'Summarize the takeaway from the illustrations.',
      tip: 'Your answer must be highly example-driven.'
    },
    smartAddon: 'Draw a small flowchart or diagram (e.g. cycle, pyramid).'
  },
  {
    name: 'Enumerate',
    definition: 'List points systematically without deep explanation',
    depth: 'Low',
    structure: {
      intro: 'Briefly define the context in one line.',
      body: 'List out the features, initiatives, or points in clean, numbered bullet points.',
      conclusion: 'Wrap up with a brief one-line summary.',
      tip: 'Bullet points are best. Do not waste time writing long paragraphs.'
    },
    smartAddon: 'Group the list under subheadings (e.g., Financial, Operational).'
  },
  {
    name: 'Differentiate / Distinguish',
    definition: 'Show clear differences using a comparison table',
    depth: 'Medium',
    structure: {
      intro: 'Define the two terms/concepts being compared.',
      body: 'Use a clean comparison table: Feature | Term A | Term B.',
      conclusion: 'Summarize how they complement or differ in one line.',
      tip: 'Ensure the features compared are directly parallel.'
    },
    smartAddon: 'Format the response as a clear Markdown Table.'
  },
  {
    name: 'Highlight',
    definition: 'Focus only on key significant points',
    depth: 'Low–Medium',
    structure: {
      intro: 'Briefly introduce the topic.',
      body: 'Focus strictly on the key features, significance, or most important aspects.',
      conclusion: 'Provide a one-line summary of its significance.',
      tip: 'Do not go into background history; highlight the current key points.'
    },
    smartAddon: 'Bold critical keywords to make the layout easy to read.'
  },
  {
    name: 'Throw light on',
    definition: 'Provide main features and significance',
    depth: 'Medium',
    structure: {
      intro: 'Briefly introduce the topic.',
      body: 'Provide the main features, objectives, and contribution/value.',
      conclusion: 'Conclude with a forward-looking summary.',
      tip: 'Explain the contribution or value clearly.'
    },
    smartAddon: 'Mention any immediate relevance or recent milestones.'
  },
  {
    name: 'Assess',
    definition: 'Estimate the impact, significance, or value',
    depth: 'High',
    structure: {
      intro: 'Define the baseline or scope of the assessment.',
      body: 'Weigh the effectiveness and impacts based on evidence and facts.',
      conclusion: 'Conclude with an evidence-based summary of impact.',
      tip: 'Provide a balanced evaluation of effectiveness.'
    },
    smartAddon: 'Quote standard indicators or index rankings.'
  },
  {
    name: 'To what extent do you agree?',
    definition: 'State your stand clearly with justification and a counter-view',
    depth: 'High',
    structure: {
      intro: 'State your stance clearly (e.g. "Largely agree but with limitations").',
      body: 'Provide arguments supporting your stance, then provide the counter-view.',
      conclusion: 'Conclude with a balanced, measurable summary stance.',
      tip: 'Do not take an extreme stand; represent both sides.'
    },
    smartAddon: 'Align the conclusion with a constitutional or developmental value.'
  },
  {
    name: 'Suggest Measures / Way Forward',
    definition: 'Provide feasible and structured solutions',
    depth: 'Medium',
    structure: {
      intro: 'Summarize the core problem context.',
      body: 'Provide structured solutions: Short-term, Long-term, and Governance reforms.',
      conclusion: 'End with a progressive vision for the future.',
      tip: 'Make sure your solutions are practical and administrative.'
    },
    smartAddon: 'Suggest 1-2 constitutional articles or SDG targets.'
  }
];

const categoryHeaderMap = {
  'A. POLITY & CONSTITUTION': 'Polity',
  'B. INTERNATIONAL RELATIONS': 'International Relations',
  'C. ECONOMY': 'Economy',
  'D. SOCIAL ISSUES': 'Social Issues',
  'E. ENVIRONMENT & DISASTER MANAGEMENT': 'Environment',
  'F. INTERNAL SECURITY': 'Security',
  'G. ETHICS': 'Ethics'
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('CONNECTED TO MONGO');

    // Reset collections
    await Directive.deleteMany({});
    await Quote.deleteMany({});
    console.log('CLEARED DIRECTIVES & QUOTES');

    // 1. Seed Directives
    await Directive.insertMany(directives);
    console.log(`✅ Seeded ${directives.length} directives successfully.`);

    // 2. Parse and Seed Quotes
    const filePath = path.join(__dirname, '..', 'Directives.txt');
    if (!fs.existsSync(filePath)) {
      throw new Error(`Directives.txt not found at ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let currentCategory = 'Polity'; // default fallback
    const quotesToInsert = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Detect category headers
      let headerDetected = false;
      for (const [header, catName] of Object.entries(categoryHeaderMap)) {
        if (line.includes(header)) {
          currentCategory = catName;
          headerDetected = true;
          break;
        }
      }
      if (headerDetected) continue;

      // Match quote lines (e.g., "1. Strengthening..." or "132. Oceans...")
      const match = line.match(/^(\d+)\.\s*(.*)$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const text = match[2].trim();

        // Safety filter to prevent garbage matching on sample questions
        if (index > 0 && index <= 200 && text.length > 10 && !text.includes('?')) {
          quotesToInsert.push({
            category: currentCategory,
            text,
            index
          });
        }
      }
    }

    if (quotesToInsert.length > 0) {
      await Quote.insertMany(quotesToInsert);
      console.log(`✅ Seeded ${quotesToInsert.length} quotes successfully.`);
    } else {
      console.log('⚠️ No quotes extracted. Check parse criteria.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
  }
}

seed();
