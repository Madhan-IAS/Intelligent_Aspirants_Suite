const mongoose = require('mongoose');
require('dotenv').config();
const Topic = require('./models/Topic');
const Subject = require('./models/Subject');

const COMPREHENSIVE_CSAT_SYLLABUS = [
  // ==========================================
  // MODULE 1: BASIC NUMERACY & QUANTITATIVE APTITUDE (Class X Level)
  // Expected Weightage: 35–40 Questions
  // ==========================================

  // 1. Advanced Number System & Theory (Highest Yield: 18-22 Qs)
  {
    chapter: 'Quantitative Aptitude',
    heading: '1. Advanced Number System & Theory',
    title: 'Divisibility Dynamics (Complex Prime Tests 7, 11, 13, 19, 29 & Missing Digit Chains)',
    difficulty: 'Hard'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '1. Advanced Number System & Theory',
    title: 'Remainder Theorems (Fermat\'s Little Theorem, Euler\'s Totient Theorem & Exponential Reminders)',
    difficulty: 'Hard'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '1. Advanced Number System & Theory',
    title: 'Cyclicity & Power Endings (Unit Digit, Tens Digit & Trailing Zeros in Factorials)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '1. Advanced Number System & Theory',
    title: 'Factors & Multiples (Count & Sum of Even/Odd Factors, Product of Factors)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '1. Advanced Number System & Theory',
    title: 'LCM & HCF Word Models (Traffic Lights Synchronisation, Circular Track Intersections)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '1. Advanced Number System & Theory',
    title: 'Parity & Equations (Prime Integer Equations, Odd-Even Algebraic Properties & Linear Solutions)',
    difficulty: 'Medium'
  },

  // 2. Core Arithmetic Modules
  {
    chapter: 'Quantitative Aptitude',
    heading: '2. Core Arithmetic Modules',
    title: 'Percentages & Sequential Updates (Compounding Models, Election Tallies & Expenditure Balancing)',
    difficulty: 'Easy'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '2. Core Arithmetic Modules',
    title: 'Profit, Loss & Discount (Fraudulent Trader Metrics, Consecutive Discounts & MP Shifts)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '2. Core Arithmetic Modules',
    title: 'Ratio, Proportion & Partnerships (Compounding Ratios, Capital-Time Distributions)',
    difficulty: 'Easy'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '2. Core Arithmetic Modules',
    title: 'Mixture & Alligation (Multi-Vessel Milk-Water Replacement Rounds)',
    difficulty: 'Hard'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '2. Core Arithmetic Modules',
    title: 'Averages & Age Progression (Weighted Averages, Group Deviation Errors & Family Timeline Puzzles)',
    difficulty: 'Medium'
  },

  // 3. Time, Speed, Distance & Work Dynamics
  {
    chapter: 'Quantitative Aptitude',
    heading: '3. Time, Speed, Distance & Work Dynamics',
    title: 'Time & Work Matrix (Worker Efficiencies, Pipe Leakages, Alternate-Day Rotas & Output Wages)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '3. Time, Speed, Distance & Work Dynamics',
    title: 'Linear & Relative Motion (Average Speed Thresholds, Relative Interceptions & Platform Trains)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '3. Time, Speed, Distance & Work Dynamics',
    title: 'Specialised TSD Vectors (Upstream/Downstream Boating Vectors, Escalator Steps & Sound Echoes)',
    difficulty: 'Hard'
  },

  // 4. Counting Principles, Probability & Progressions
  {
    chapter: 'Quantitative Aptitude',
    heading: '4. Counting Principles & Probability',
    title: 'Permutations & Combinations (Fundamental Counting, Restricted Seating, Vowel Blocks, Identical Distributions)',
    difficulty: 'Hard'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '4. Counting Principles & Probability',
    title: 'Probability Structures (Multi-Event Sample Spaces, Non-Replacement Cards, Dice & Conditional Probability)',
    difficulty: 'Hard'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '4. Counting Principles & Probability',
    title: 'Sequences & Progressions (Arithmetic & Geometric AP/GP Limits & Alphanumeric Pattern Blocks)',
    difficulty: 'Medium'
  },

  // 5. Mensuration & Geometry Basics
  {
    chapter: 'Quantitative Aptitude',
    heading: '5. Mensuration & Geometry Basics',
    title: '2D Boundaries (Area & Perimeter Metric Shifts for Triangles, Circles, & Quadrants)',
    difficulty: 'Easy'
  },
  {
    chapter: 'Quantitative Aptitude',
    heading: '5. Mensuration & Geometry Basics',
    title: '3D Configurations (Surface Area & Volume Recasting for Spheres, Cones, Cylinders & Cubes)',
    difficulty: 'Medium'
  },

  // ==========================================
  // MODULE 2: LOGICAL REASONING & ANALYTICAL ABILITY
  // Expected Weightage: 20–25 Questions
  // ==========================================

  // 1. Structural Arrangements & Puzzles
  {
    chapter: 'Logical Reasoning',
    heading: '1. Structural Arrangements & Puzzles',
    title: 'Linear & Parallel Formations (North-facing vs South-facing Facing Parallel Rows)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Logical Reasoning',
    heading: '1. Structural Arrangements & Puzzles',
    title: 'Circular & Polygonal Paths (Inward, Outward & Alternating Orientations)',
    difficulty: 'Hard'
  },
  {
    chapter: 'Logical Reasoning',
    heading: '1. Structural Arrangements & Puzzles',
    title: 'Multi-Attribute Matrix Puzzles (Cross-Referencing 3 to 5 Parameters with Elimination Grids)',
    difficulty: 'Hard'
  },

  // 2. Relational & Spatial Tracking
  {
    chapter: 'Logical Reasoning',
    heading: '2. Relational & Spatial Tracking',
    title: 'Blood Relations Maps (Multi-Generational Lineage Charts, Symbol-Coded & Portrait Decoders)',
    difficulty: 'Easy'
  },
  {
    chapter: 'Logical Reasoning',
    heading: '2. Relational & Spatial Tracking',
    title: 'Direction Sense Coordinates (Multi-Turn Vector Pathways, Angular Transitions & Sunrise/Sunset Shadows)',
    difficulty: 'Medium'
  },

  // 3. Verbal Reasoning & Critical Logic
  {
    chapter: 'Logical Reasoning',
    heading: '3. Verbal Reasoning & Critical Logic',
    title: 'Syllogisms & Restrictive Deductions ("Only a few A are B", Possibility Cases & Euler/Venn Logic)',
    difficulty: 'Hard'
  },
  {
    chapter: 'Logical Reasoning',
    heading: '3. Verbal Reasoning & Critical Logic',
    title: 'Analytical Premises (Statement-Assumptions, Strong vs Weak Arguments, Administrative Action, Cause & Effect)',
    difficulty: 'Medium'
  },

  // 4. Coding, Series & Structural Math Logic
  {
    chapter: 'Logical Reasoning',
    heading: '4. Coding, Series & Structural Math Logic',
    title: 'Coding-Decoding Mechanics (Shift Patterns, Reverse Alphabet Pairing & Matrix Location Codes)',
    difficulty: 'Easy'
  },
  {
    chapter: 'Logical Reasoning',
    heading: '4. Coding, Series & Structural Math Logic',
    title: 'Clocks (Exact Hand Angles, Total Overlaps & Gaining/Losing Time Corrections)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Logical Reasoning',
    heading: '4. Coding, Series & Structural Math Logic',
    title: 'Calendars (Historical Date Days, Leap Year Tracking, Odd-Days Arithmetic & Cycle Repetitions)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Logical Reasoning',
    heading: '4. Coding, Series & Structural Math Logic',
    title: 'Cubes & Dice (Opposing Face Identification & Sliced Miniature Cube Paint Metrics 0,1,2,3 Faces)',
    difficulty: 'Medium'
  },

  // ==========================================
  // MODULE 3: READING COMPREHENSION & DATA PROCESSING
  // Expected Weightage: 25–30 Questions
  // ==========================================

  // 1. Exhaustive Reading Comprehension (RC)
  {
    chapter: 'Reading Comprehension',
    heading: '1. Exhaustive Reading Comprehension (RC)',
    title: 'Critical Inferences (Pinpointing Unwritten Logical Deductions from Passage Context)',
    difficulty: 'Hard'
  },
  {
    chapter: 'Reading Comprehension',
    heading: '1. Exhaustive Reading Comprehension (RC)',
    title: 'Central Crux / Theme (Isolating Macro Intent, Primary Solution & Author\'s Main Thesis)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Reading Comprehension',
    heading: '1. Exhaustive Reading Comprehension (RC)',
    title: 'Assumptions & Corollaries (Unmasking Unstated Premises & Direct Spin-off Impacts across Climate, AI, Economics)',
    difficulty: 'Hard'
  },

  // 2. Data Interpretation (DI) & Data Sufficiency (DS)
  {
    chapter: 'Reading Comprehension',
    heading: '2. Data Interpretation & Sufficiency',
    title: 'Data Interpretation Visuals (Multi-Variable Tables, Segmented Bar Charts, Pie Diagrams & Growth Rates)',
    difficulty: 'Medium'
  },
  {
    chapter: 'Reading Comprehension',
    heading: '2. Data Interpretation & Sufficiency',
    title: 'Data Sufficiency Matrices (Evaluating Statement 1, Statement 2, Both Combined vs Insufficient Data)',
    difficulty: 'Hard'
  }
];

async function seedComprehensiveCSAT() {
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

    // Clear existing CSAT topics to ensure clean seeding of the master syllabus
    await Topic.deleteMany({ subjectId: csatSubject._id });
    console.log('Cleared existing CSAT topics for fresh micro-breakdown seeding.');

    let insertedCount = 0;
    for (const item of COMPREHENSIVE_CSAT_SYLLABUS) {
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

    console.log(`Successfully seeded ${insertedCount} exhaustive CSAT micro-topics!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding CSAT:', err);
    process.exit(1);
  }
}

seedComprehensiveCSAT();
