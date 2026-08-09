const mongoose = require('mongoose');
require('dotenv').config();
const Topic = require('./models/Topic');
const Subject = require('./models/Subject');

const CSAT_SYLLABUS = [
  // --- QUANTITATIVE APTITUDE ---
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Number System & Basic Numeracy',
    title: 'Number Types, Divisibility Rules & Remainder Theorem',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Number System & Basic Numeracy',
    title: 'LCM & HCF Problems and Properties',
    difficulty: 'Easy'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Number System & Basic Numeracy',
    title: 'Unit Digits, Factorials & Decimal Fractions',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Percentages & Financial Math',
    title: 'Percentages & Percentage Change Calculations',
    difficulty: 'Easy'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Percentages & Financial Math',
    title: 'Profit, Loss & Marked Price Discounts',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Percentages & Financial Math',
    title: 'Simple Interest & Compound Interest Applications',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Ratios, Averages & Mixtures',
    title: 'Ratio, Proportion & Variation Concepts',
    difficulty: 'Easy'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Ratios, Averages & Mixtures',
    title: 'Averages, Weighted Averages & Weighted Means',
    difficulty: 'Easy'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Ratios, Averages & Mixtures',
    title: 'Mixtures, Alligation & Replacement Problems',
    difficulty: 'Hard'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Speed, Time & Work',
    title: 'Time & Work, Pipes & Cisterns',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Speed, Time & Work',
    title: 'Speed, Distance & Time (Relative Speed & Average Speed)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Speed, Time & Work',
    title: 'Problems on Trains, Boats & Streams',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Combinatorics & Probability',
    title: 'Permutations & Combinations (Fundamental Counting Principles)',
    difficulty: 'Hard'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Combinatorics & Probability',
    title: 'Probability of Events & Independent Trials',
    difficulty: 'Hard'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Data Interpretation & Sufficiency',
    title: 'Bar Charts, Pie Charts & Line Graphs Interpretation',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Data Interpretation & Sufficiency',
    title: 'Data Tables & Tabular Caselets',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: 'Data Interpretation & Sufficiency',
    title: 'Data Sufficiency Questions (Quant & Reasoning)',
    difficulty: 'Hard'
  },

  // --- LOGICAL REASONING & ANALYTICAL ABILITY ---
  {
    chapter: 'Logical Reasoning',
    heading: 'Deductive & Verbal Reasoning',
    title: 'Syllogisms & Venn Diagram Based Deductions',
    difficulty: 'Medium'
  },
  {
    chapter: 'Logical Reasoning',
    heading: 'Deductive & Verbal Reasoning',
    title: 'Blood Relations & Family Tree Relations',
    difficulty: 'Easy'
  },
  {
    chapter: 'Logical Reasoning',
    heading: 'Deductive & Verbal Reasoning',
    title: 'Coding, Decoding & Pattern Matching',
    difficulty: 'Easy'
  },
  {
    chapter: 'Logical Reasoning',
    heading: 'Analytical Puzzles & Arrangements',
    title: 'Linear & Circular Seating Arrangements',
    difficulty: 'Medium'
  },
  {
    chapter: 'Logical Reasoning',
    heading: 'Analytical Puzzles & Arrangements',
    title: 'Complex Floor & Grouping Puzzles',
    difficulty: 'Hard'
  },
  {
    chapter: 'Logical Reasoning',
    heading: 'Analytical Puzzles & Arrangements',
    title: 'Clocks, Hands Angle & Leap Year Calendars',
    difficulty: 'Medium'
  },
  {
    chapter: 'Logical Reasoning',
    heading: 'Analytical Puzzles & Arrangements',
    title: 'Direction Sense Test & Shortest Path Problems',
    difficulty: 'Easy'
  },
  {
    chapter: 'Logical Reasoning',
    heading: 'Critical & Statement Reasoning',
    title: 'Statement & Assumptions / Premises',
    difficulty: 'Hard'
  },
  {
    chapter: 'Logical Reasoning',
    heading: 'Critical & Statement Reasoning',
    title: 'Statement & Arguments (Strong vs Weak)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Logical Reasoning',
    heading: 'Critical & Statement Reasoning',
    title: 'Statement & Courses of Action',
    difficulty: 'Medium'
  },

  // --- READING COMPREHENSION & DECISION MAKING ---
  {
    chapter: 'Reading Comprehension',
    heading: 'Passage Inferences & Assumptions',
    title: 'UPSC Passage Reading & Crux Extraction',
    difficulty: 'Medium'
  },
  {
    chapter: 'Reading Comprehension',
    heading: 'Passage Inferences & Assumptions',
    title: 'Identifying Underlying Assumptions in Passages',
    difficulty: 'Hard'
  },
  {
    chapter: 'Reading Comprehension',
    heading: 'Passage Inferences & Assumptions',
    title: 'Drawing Valid Inferences & Logical Corollaries',
    difficulty: 'Hard'
  },
  {
    chapter: 'Reading Comprehension',
    heading: 'Passage Inferences & Assumptions',
    title: 'Best Practical & Rational Message Extraction',
    difficulty: 'Medium'
  },
  {
    chapter: 'Reading Comprehension',
    heading: 'Decision Making',
    title: 'Administrative Decision Making & Problem Solving Scenarios',
    difficulty: 'Medium'
  }
];

async function seedCSAT() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Find or create CSAT Subject
    let csatSubject = await Subject.findOne({ name: 'CSAT' });
    if (!csatSubject) {
      csatSubject = await Subject.create({
        name: 'CSAT',
        description: 'Civil Services Aptitude Test (Prelims Paper II)'
      });
      console.log('Created CSAT Subject:', csatSubject._id);
    }

    let insertedCount = 0;
    for (const item of CSAT_SYLLABUS) {
      const existing = await Topic.findOne({
        subjectId: csatSubject._id,
        title: item.title
      });

      if (!existing) {
        await Topic.create({
          subjectId: csatSubject._id,
          paper: 'CSAT',
          subjectName: 'CSAT',
          chapter: item.chapter,
          heading: item.heading,
          title: item.title,
          difficulty: item.difficulty,
          completed: false,
          status: 'Pending'
        });
        insertedCount++;
      }
    }

    console.log(`Successfully seeded ${insertedCount} CSAT subtopics!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding CSAT:', err);
    process.exit(1);
  }
}

seedCSAT();
