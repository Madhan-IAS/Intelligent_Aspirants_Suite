export interface CSATDay {
    day: number;
    date: string;
    week: number;
    month: number;
    monthLabel: string;
    weekLabel: string;
    topic: string;
    category: 'learn' | 'revision' | 'test' | 'pyq' | 'mock';
}

export const CSAT_MONTH_LABELS: Record<number, string> = {
    1: 'Basic Numeracy Foundations',
    2: 'Advanced Numeracy & Mental Ability I',
    3: 'Mental Ability II & Logical Reasoning',
    4: 'Communication, Crack Sets & Assessment',
};

export const CSAT_WEEK_LABELS: Record<number, string> = {
    1: 'Basic Numeracy I: Number System & HCF/LCM',
    2: 'Basic Numeracy II: Ratios, Commercial Arithmetic & Interest',
    3: 'Basic Numeracy III: Work, Speed, Time & Algebra',
    4: 'Basic Numeracy IV: Geometry, Mensuration & Combinatorics',
    5: 'Basic Numeracy V: Advanced Numeracy & Data Interpretation',
    6: 'General Mental Ability I: Alphabet, Coding & Series',
    7: 'General Mental Ability II: Words, Directions, Relations & Ranking',
    8: 'General Mental Ability III: Arrangements, Puzzles & Math Operations',
    9: 'General Mental Ability IV: Clocks, Calendars, Cubes & Non-Verbal',
    10: 'Logical Reasoning I: Syllogisms & Statements',
    11: 'Logical Reasoning II: Analytical Reasoning, Cause/Effect & PYQs',
    12: 'Decision Making & Problem Solving',
    13: 'Interpersonal & Communication Skills',
    14: 'Crack Sets 1–5 (Full Mocks & Diagnostics)',
    15: 'Crack Sets 6–10 (Book & PDF Sets)',
    16: 'Reading Comprehension, Solved Papers & Final Audit',
};

export const CSAT_112_PLAN: CSATDay[] = [
    // ═══════════════════════════════════════════════════════════════
    // MONTH 1 — Basic Numeracy Foundations (12 Oct – 8 Nov)
    // ═══════════════════════════════════════════════════════════════

    // Week 1: 12–18 October — Basic Numeracy I: Number System & HCF/LCM
    { day: 1, date: '2026-10-12', week: 1, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy I: Number System & HCF/LCM', topic: 'Number System: Classification, digits, divisibility & place value', category: 'learn' },
    { day: 2, date: '2026-10-13', week: 1, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy I: Number System & HCF/LCM', topic: 'Number System: Remainders, cyclicity, units digit & powers', category: 'learn' },
    { day: 3, date: '2026-10-14', week: 1, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy I: Number System & HCF/LCM', topic: 'HCF and LCM: Core concepts, factorisation & practice', category: 'learn' },
    { day: 4, date: '2026-10-15', week: 1, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy I: Number System & HCF/LCM', topic: 'Number System & HCF/LCM: Advanced exercises & PYQs', category: 'pyq' },
    { day: 5, date: '2026-10-16', week: 1, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy I: Number System & HCF/LCM', topic: 'Average: Arithmetic mean, weighted average & missing values', category: 'learn' },
    { day: 6, date: '2026-10-17', week: 1, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy I: Number System & HCF/LCM', topic: 'Percentage: Fraction conversions, increases/decreases & successive change', category: 'learn' },
    { day: 7, date: '2026-10-18', week: 1, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy I: Number System & HCF/LCM', topic: 'Week 1 Revision: Number System, Averages & Percentages timed test', category: 'test' },

    // Week 2: 19–25 October — Basic Numeracy II: Ratios, Commercial Arithmetic & Interest
    { day: 8, date: '2026-10-19', week: 2, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy II: Ratios, Commercial Arithmetic & Interest', topic: 'Ratio–Proportion: Ratios, direct/inverse proportion & proportions', category: 'learn' },
    { day: 9, date: '2026-10-20', week: 2, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy II: Ratios, Commercial Arithmetic & Interest', topic: 'Mixture and Partnership: Alligation rules, replacement & capital-time ratio', category: 'learn' },
    { day: 10, date: '2026-10-21', week: 2, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy II: Ratios, Commercial Arithmetic & Interest', topic: 'Profit, Loss and Discount: CP/SP relations, marked price & successive discounts', category: 'learn' },
    { day: 11, date: '2026-10-22', week: 2, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy II: Ratios, Commercial Arithmetic & Interest', topic: 'Simple Interest: SI formula, rate-time relationships & doubling sums', category: 'learn' },
    { day: 12, date: '2026-10-23', week: 2, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy II: Ratios, Commercial Arithmetic & Interest', topic: 'Compound Interest: CI formula, difference between CI & SI, revision', category: 'learn' },
    { day: 13, date: '2026-10-24', week: 2, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy II: Ratios, Commercial Arithmetic & Interest', topic: 'Commercial Arithmetic Practice: Profit/Loss, SI & CI mixed problems', category: 'pyq' },
    { day: 14, date: '2026-10-25', week: 2, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy II: Ratios, Commercial Arithmetic & Interest', topic: 'Week 2 Revision: Commercial Arithmetic sectional test', category: 'test' },

    // Week 3: 26 October – 1 November — Basic Numeracy III: Work, Speed, Time & Algebra
    { day: 15, date: '2026-10-26', week: 3, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy III: Work, Speed, Time & Algebra', topic: 'Time and Work: Individual rates, combined work & pipes/cisterns', category: 'learn' },
    { day: 16, date: '2026-10-27', week: 3, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy III: Work, Speed, Time & Algebra', topic: 'Time and Work: Efficiency, wages, PYQs and advanced practice', category: 'pyq' },
    { day: 17, date: '2026-10-28', week: 3, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy III: Work, Speed, Time & Algebra', topic: 'Speed, Time and Distance: Conversions, average speed & relative speed', category: 'learn' },
    { day: 18, date: '2026-10-29', week: 3, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy III: Work, Speed, Time & Algebra', topic: 'Speed, Time and Distance: Trains crossing & boats/streams', category: 'learn' },
    { day: 19, date: '2026-10-30', week: 3, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy III: Work, Speed, Time & Algebra', topic: 'Elementary Algebra: Expressions, identities & linear equations', category: 'learn' },
    { day: 20, date: '2026-10-31', week: 3, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy III: Work, Speed, Time & Algebra', topic: 'Elementary Algebra: Simultaneous equations & quadratic expressions', category: 'learn' },
    { day: 21, date: '2026-11-01', week: 3, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy III: Work, Speed, Time & Algebra', topic: 'Week 3 Revision: Work, Speed & Algebra mixed test and error correction', category: 'test' },

    // Week 4: 2–8 November — Basic Numeracy IV: Geometry, Mensuration & Combinatorics
    { day: 22, date: '2026-11-02', week: 4, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy IV: Geometry, Mensuration & Combinatorics', topic: 'Geometry: Lines, angles, parallel lines & triangles', category: 'learn' },
    { day: 23, date: '2026-11-03', week: 4, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy IV: Geometry, Mensuration & Combinatorics', topic: 'Geometry: Quadrilaterals, circles & polygon properties', category: 'learn' },
    { day: 24, date: '2026-11-04', week: 4, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy IV: Geometry, Mensuration & Combinatorics', topic: 'Mensuration: Perimeter & area of plane 2D figures', category: 'learn' },
    { day: 25, date: '2026-11-05', week: 4, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy IV: Geometry, Mensuration & Combinatorics', topic: 'Mensuration: Surface area and volume of 3D solids', category: 'learn' },
    { day: 26, date: '2026-11-06', week: 4, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy IV: Geometry, Mensuration & Combinatorics', topic: 'Permutation and Combination: Fundamental counting & arrangements', category: 'learn' },
    { day: 27, date: '2026-11-07', week: 4, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy IV: Geometry, Mensuration & Combinatorics', topic: 'Permutation and Combination: Selections, distributions & circular permutations', category: 'learn' },
    { day: 28, date: '2026-11-08', week: 4, month: 1, monthLabel: 'Basic Numeracy Foundations', weekLabel: 'Basic Numeracy IV: Geometry, Mensuration & Combinatorics', topic: 'Probability: Classical probability, addition/multiplication rules & practice', category: 'test' },

    // ═══════════════════════════════════════════════════════════════
    // MONTH 2 — Advanced Numeracy & Mental Ability I (9 Nov – 6 Dec)
    // ═══════════════════════════════════════════════════════════════

    // Week 5: 9–15 November — Basic Numeracy V: Advanced Numeracy & Data Interpretation
    { day: 29, date: '2026-11-09', week: 5, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'Basic Numeracy V: Advanced Numeracy & Data Interpretation', topic: 'Sequence and Progression: AP, GP, series sums & pattern recognition', category: 'learn' },
    { day: 30, date: '2026-11-10', week: 5, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'Basic Numeracy V: Advanced Numeracy & Data Interpretation', topic: 'Statistics: Mean, median, mode, variance & data dispersion', category: 'learn' },
    { day: 31, date: '2026-11-11', week: 5, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'Basic Numeracy V: Advanced Numeracy & Data Interpretation', topic: 'Data Interpretation: Tables and tabular data sets', category: 'learn' },
    { day: 32, date: '2026-11-12', week: 5, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'Basic Numeracy V: Advanced Numeracy & Data Interpretation', topic: 'Data Interpretation: Bar graphs, line graphs & pie charts', category: 'learn' },
    { day: 33, date: '2026-11-13', week: 5, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'Basic Numeracy V: Advanced Numeracy & Data Interpretation', topic: 'Data Sufficiency: Basic numerical data sufficiency principles', category: 'learn' },
    { day: 34, date: '2026-11-14', week: 5, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'Basic Numeracy V: Advanced Numeracy & Data Interpretation', topic: 'Data Sufficiency: Advanced multi-statement data sufficiency', category: 'learn' },
    { day: 35, date: '2026-11-15', week: 5, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'Basic Numeracy V: Advanced Numeracy & Data Interpretation', topic: 'Quantity Comparison: Comprehensive Basic Numeracy revision & test', category: 'test' },

    // Week 6: 16–22 November — General Mental Ability I: Alphabet, Coding & Series
    { day: 36, date: '2026-11-16', week: 6, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability I: Alphabet, Coding & Series', topic: 'Alphabet Test: Positions, letter series & alphabetical order', category: 'learn' },
    { day: 37, date: '2026-11-17', week: 6, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability I: Alphabet, Coding & Series', topic: 'Analogy: Word, number & letter analogy relationships', category: 'learn' },
    { day: 38, date: '2026-11-18', week: 6, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability I: Alphabet, Coding & Series', topic: 'Classification: Odd one out & category discrimination', category: 'learn' },
    { day: 39, date: '2026-11-19', week: 6, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability I: Alphabet, Coding & Series', topic: 'Series: Number series, alphanumeric series & pattern gaps', category: 'learn' },
    { day: 40, date: '2026-11-20', week: 6, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability I: Alphabet, Coding & Series', topic: 'Coding–Decoding: Letter shifting, substitution & matrix coding', category: 'learn' },
    { day: 41, date: '2026-11-21', week: 6, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability I: Alphabet, Coding & Series', topic: 'Coding–Decoding Practice: Advanced symbol patterns & PYQs', category: 'pyq' },
    { day: 42, date: '2026-11-22', week: 6, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability I: Alphabet, Coding & Series', topic: 'Week 6 Revision: Alphabet, Analogy, Series & Coding test', category: 'test' },

    // Week 7: 23–29 November — General Mental Ability II: Words, Directions, Relations & Ranking
    { day: 43, date: '2026-11-23', week: 7, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability II: Words, Directions, Relations & Ranking', topic: 'Word Formation & Logical Arrangement of Words', category: 'learn' },
    { day: 44, date: '2026-11-24', week: 7, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability II: Words, Directions, Relations & Ranking', topic: 'Direction and Distance Test: Turns, angles & shortest distance', category: 'learn' },
    { day: 45, date: '2026-11-25', week: 7, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability II: Words, Directions, Relations & Ranking', topic: 'Blood Relation: Family trees, coded relations & generation charts', category: 'learn' },
    { day: 46, date: '2026-11-26', week: 7, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability II: Words, Directions, Relations & Ranking', topic: 'Blood Relation Practice: Multi-generation puzzles & PYQs', category: 'pyq' },
    { day: 47, date: '2026-11-27', week: 7, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability II: Words, Directions, Relations & Ranking', topic: 'Order and Ranking: Total count, interchange positions & ranks', category: 'learn' },
    { day: 48, date: '2026-11-28', week: 7, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability II: Words, Directions, Relations & Ranking', topic: 'Seating Arrangement: Linear seating rows & dual-row facing', category: 'learn' },
    { day: 49, date: '2026-11-29', week: 7, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability II: Words, Directions, Relations & Ranking', topic: 'Week 7 Revision: Directions, Relations & Ranking timed test', category: 'test' },

    // Week 8: 30 November – 6 December — General Mental Ability III: Arrangements, Puzzles & Math Operations
    { day: 50, date: '2026-11-30', week: 8, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability III: Arrangements, Puzzles & Math Operations', topic: 'Seating Arrangement: Circular & rectangular arrangements, inward/outward facing', category: 'learn' },
    { day: 51, date: '2026-12-01', week: 8, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability III: Arrangements, Puzzles & Math Operations', topic: 'Puzzle: Scheduling, floor puzzles & matrix distribution', category: 'learn' },
    { day: 52, date: '2026-12-02', week: 8, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability III: Arrangements, Puzzles & Math Operations', topic: 'Puzzle: Advanced constraint-based puzzles & elimination practice', category: 'pyq' },
    { day: 53, date: '2026-12-03', week: 8, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability III: Arrangements, Puzzles & Math Operations', topic: 'Mathematical Operations: Symbol swapping & sign substitution', category: 'learn' },
    { day: 54, date: '2026-12-04', week: 8, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability III: Arrangements, Puzzles & Math Operations', topic: 'Inequalities: Coded inequalities & transitive relations', category: 'learn' },
    { day: 55, date: '2026-12-05', week: 8, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability III: Arrangements, Puzzles & Math Operations', topic: 'Insert the Missing Character: Matrix, circular & geometric character puzzles', category: 'learn' },
    { day: 56, date: '2026-12-06', week: 8, month: 2, monthLabel: 'Advanced Numeracy & Mental Ability I', weekLabel: 'General Mental Ability III: Arrangements, Puzzles & Math Operations', topic: 'Week 8 Revision: Puzzles, Operations & Missing Character test', category: 'test' },

    // ═══════════════════════════════════════════════════════════════
    // MONTH 3 — Mental Ability II & Logical Reasoning (7 Dec – 3 Jan)
    // ═══════════════════════════════════════════════════════════════

    // Week 9: 7–13 December — General Mental Ability IV: Clocks, Calendars, Cubes & Non-Verbal
    { day: 57, date: '2026-12-07', week: 9, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'General Mental Ability IV: Clocks, Calendars, Cubes & Non-Verbal', topic: 'Clock and Calendar: Hand angles, coincidence, odd days & leap years', category: 'learn' },
    { day: 58, date: '2026-12-08', week: 9, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'General Mental Ability IV: Clocks, Calendars, Cubes & Non-Verbal', topic: 'Cube and Dice: Painted cubes, unfoldings & opposite faces', category: 'learn' },
    { day: 59, date: '2026-12-09', week: 9, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'General Mental Ability IV: Clocks, Calendars, Cubes & Non-Verbal', topic: 'Venn Diagram: Two-set and three-set geometric diagrams', category: 'learn' },
    { day: 60, date: '2026-12-10', week: 9, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'General Mental Ability IV: Clocks, Calendars, Cubes & Non-Verbal', topic: 'Routes and Networks: Path finding, shortest routes & tree networks', category: 'learn' },
    { day: 61, date: '2026-12-11', week: 9, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'General Mental Ability IV: Clocks, Calendars, Cubes & Non-Verbal', topic: 'Non-Verbal Reasoning: Figure series, pattern completion & paper folding', category: 'learn' },
    { day: 62, date: '2026-12-12', week: 9, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'General Mental Ability IV: Clocks, Calendars, Cubes & Non-Verbal', topic: 'Revise GMA Chapters & Core Reasoning Shortcuts', category: 'revision' },
    { day: 63, date: '2026-12-13', week: 9, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'General Mental Ability IV: Clocks, Calendars, Cubes & Non-Verbal', topic: 'Timed GMA Comprehensive Test & Error Analysis', category: 'test' },

    // Week 10: 14–20 December — Logical Reasoning I: Syllogisms & Statements
    { day: 64, date: '2026-12-14', week: 10, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning I: Syllogisms & Statements', topic: 'Syllogism: Standard categorical propositions & Venn method', category: 'learn' },
    { day: 65, date: '2026-12-15', week: 10, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning I: Syllogisms & Statements', topic: 'Syllogism: Possibility cases, either-or & negative deductions', category: 'learn' },
    { day: 66, date: '2026-12-16', week: 10, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning I: Syllogisms & Statements', topic: 'Statement and Argument: Strong vs weak arguments & relevance criteria', category: 'learn' },
    { day: 67, date: '2026-12-17', week: 10, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning I: Syllogisms & Statements', topic: 'Statement and Assumptions: Implicit premises & negation test', category: 'learn' },
    { day: 68, date: '2026-12-18', week: 10, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning I: Syllogisms & Statements', topic: 'Statement and Course of Action: Feasible solutions & administrative logic', category: 'learn' },
    { day: 69, date: '2026-12-19', week: 10, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning I: Syllogisms & Statements', topic: 'Statement and Conclusions: Direct derivations vs over-reach', category: 'learn' },
    { day: 70, date: '2026-12-20', week: 10, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning I: Syllogisms & Statements', topic: 'Evaluating Inference: True/false/probably true scale & practice', category: 'test' },

    // Week 11: 21–27 December — Logical Reasoning II: Analytical Reasoning, Cause/Effect & PYQs
    { day: 71, date: '2026-12-21', week: 11, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning II: Analytical Reasoning, Cause/Effect & PYQs', topic: 'Assertion and Reason: Validity, factual correctness & causal link', category: 'learn' },
    { day: 72, date: '2026-12-22', week: 11, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning II: Analytical Reasoning, Cause/Effect & PYQs', topic: 'Cause and Effect: Principal cause, common cause & independent effects', category: 'learn' },
    { day: 73, date: '2026-12-23', week: 11, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning II: Analytical Reasoning, Cause/Effect & PYQs', topic: 'Verification of Truth/Lie: Truth-teller and liar logic', category: 'learn' },
    { day: 74, date: '2026-12-24', week: 11, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning II: Analytical Reasoning, Cause/Effect & PYQs', topic: 'Data Sufficiency: Logical and analytical data sufficiency', category: 'learn' },
    { day: 75, date: '2026-12-25', week: 11, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning II: Analytical Reasoning, Cause/Effect & PYQs', topic: 'Revise Syllogisms & Statement Questions: Common trap identification', category: 'revision' },
    { day: 76, date: '2026-12-26', week: 11, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning II: Analytical Reasoning, Cause/Effect & PYQs', topic: 'Solve Logical Reasoning PYQs: 2015–2024 UPSC Prelims Paper II', category: 'pyq' },
    { day: 77, date: '2026-12-27', week: 11, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Logical Reasoning II: Analytical Reasoning, Cause/Effect & PYQs', topic: 'Timed Reasoning Test & Error Analysis', category: 'test' },

    // Week 12: 28 December – 3 January — Decision Making & Problem Solving
    { day: 78, date: '2026-12-28', week: 12, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Decision Making & Problem Solving', topic: 'Decision Making: Fundamentals, ethical dilemmas & administrative principles', category: 'learn' },
    { day: 79, date: '2026-12-29', week: 12, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Decision Making & Problem Solving', topic: 'Decision Making: Crisis management and public policy scenarios', category: 'learn' },
    { day: 80, date: '2026-12-30', week: 12, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Decision Making & Problem Solving', topic: 'Decision Making: Resource allocation, conflicting priorities & frameworks', category: 'learn' },
    { day: 81, date: '2026-12-31', week: 12, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Decision Making & Problem Solving', topic: 'Decision Making: Stakeholder analysis & multi-criterion evaluation', category: 'learn' },
    { day: 82, date: '2027-01-01', week: 12, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Decision Making & Problem Solving', topic: 'Decision Making PYQs: Previous UPSC questions & model case studies', category: 'pyq' },
    { day: 83, date: '2027-01-02', week: 12, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Decision Making & Problem Solving', topic: 'Decision Making Drills: Timed situational drills & trap elimination', category: 'test' },
    { day: 84, date: '2027-01-03', week: 12, month: 3, monthLabel: 'Mental Ability II & Logical Reasoning', weekLabel: 'Decision Making & Problem Solving', topic: 'Decision Making Assessment: Comprehensive test & performance review', category: 'revision' },

    // ═══════════════════════════════════════════════════════════════
    // MONTH 4 — Communication, Crack Sets & Assessment (4 Jan – 31 Jan)
    // ═══════════════════════════════════════════════════════════════

    // Week 13: 4–10 January — Interpersonal & Communication Skills
    { day: 85, date: '2027-01-04', week: 13, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Interpersonal & Communication Skills', topic: 'Communication Skills: Models, verbal/non-verbal cues & active listening', category: 'learn' },
    { day: 86, date: '2027-01-05', week: 13, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Interpersonal & Communication Skills', topic: 'Communication Skills: Barriers to effective communication & strategies', category: 'learn' },
    { day: 87, date: '2027-01-06', week: 13, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Interpersonal & Communication Skills', topic: 'Interpersonal Dynamics: Emotional intelligence & conflict resolution', category: 'learn' },
    { day: 88, date: '2027-01-07', week: 13, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Interpersonal & Communication Skills', topic: 'Leadership & Teamwork: Administrative communication caselets', category: 'learn' },
    { day: 89, date: '2027-01-08', week: 13, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Interpersonal & Communication Skills', topic: 'Dialogue & Comprehension: Practice on situational dialogue', category: 'learn' },
    { day: 90, date: '2027-01-09', week: 13, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Interpersonal & Communication Skills', topic: 'Interpersonal Skills PYQs: Mixed questions & pattern review', category: 'pyq' },
    { day: 91, date: '2027-01-10', week: 13, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Interpersonal & Communication Skills', topic: 'Interpersonal & Communication Skills Sectional Test & Review', category: 'test' },

    // Week 14: 11–17 January — Crack Sets 1–5 (Full Mocks & Diagnostics)
    { day: 92, date: '2027-01-11', week: 14, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 1–5 (Full Mocks & Diagnostics)', topic: 'Crack Set 1: Full-length simulation (timed attempt)', category: 'mock' },
    { day: 93, date: '2027-01-12', week: 14, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 1–5 (Full Mocks & Diagnostics)', topic: 'Crack Set 1: Detailed analysis, score check & error logging', category: 'revision' },
    { day: 94, date: '2027-01-13', week: 14, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 1–5 (Full Mocks & Diagnostics)', topic: 'Crack Set 2: Full-length simulation (timed attempt)', category: 'mock' },
    { day: 95, date: '2027-01-14', week: 14, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 1–5 (Full Mocks & Diagnostics)', topic: 'Crack Set 2: Analysis & review of incorrect quant/LR questions', category: 'revision' },
    { day: 96, date: '2027-01-15', week: 14, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 1–5 (Full Mocks & Diagnostics)', topic: 'Crack Set 3: Full-length simulation (timed attempt)', category: 'mock' },
    { day: 97, date: '2027-01-16', week: 14, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 1–5 (Full Mocks & Diagnostics)', topic: 'Crack Set 4: Full-length simulation (timed attempt)', category: 'mock' },
    { day: 98, date: '2027-01-17', week: 14, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 1–5 (Full Mocks & Diagnostics)', topic: 'Crack Set 5: Full-length simulation & Mid-Mock diagnostic review', category: 'mock' },

    // Week 15: 18–24 January — Crack Sets 6–10 (Book & PDF Sets)
    { day: 99, date: '2027-01-18', week: 15, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 6–10 (Book & PDF Sets)', topic: 'Crack Set 6: Full-length simulation (timed attempt)', category: 'mock' },
    { day: 100, date: '2027-01-19', week: 15, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 6–10 (Book & PDF Sets)', topic: 'Crack Set 6: Analysis & formula refresh on recurring mistakes', category: 'revision' },
    { day: 101, date: '2027-01-20', week: 15, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 6–10 (Book & PDF Sets)', topic: 'Crack Set 7: Full-length simulation (timed attempt)', category: 'mock' },
    { day: 102, date: '2027-01-21', week: 15, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 6–10 (Book & PDF Sets)', topic: 'Crack Set 8: Full-length simulation (PDF Set attempt)', category: 'mock' },
    { day: 103, date: '2027-01-22', week: 15, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 6–10 (Book & PDF Sets)', topic: 'Crack Set 9: Full-length simulation (PDF Set attempt)', category: 'mock' },
    { day: 104, date: '2027-01-23', week: 15, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 6–10 (Book & PDF Sets)', topic: 'Crack Set 10: Full-length simulation (PDF Set attempt)', category: 'mock' },
    { day: 105, date: '2027-01-24', week: 15, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Crack Sets 6–10 (Book & PDF Sets)', topic: 'Crack Sets 6–10: Aggregated error review & weak topic identification', category: 'revision' },

    // Week 16: 25–31 January — Reading Comprehension, Solved Papers & Final Audit
    { day: 106, date: '2027-01-25', week: 16, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Reading Comprehension, Solved Papers & Final Audit', topic: 'Type I Passages: Main idea, tone & inference techniques', category: 'learn' },
    { day: 107, date: '2027-01-26', week: 16, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Reading Comprehension, Solved Papers & Final Audit', topic: 'Type I & II Passages: Assumptions, corollaries & passage structure', category: 'learn' },
    { day: 108, date: '2027-01-27', week: 16, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Reading Comprehension, Solved Papers & Final Audit', topic: 'CSAT RC Practice: Mixed passages & timed comprehension practice', category: 'learn' },
    { day: 109, date: '2027-01-28', week: 16, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Reading Comprehension, Solved Papers & Final Audit', topic: 'Solve 2026 Paper: Diagnostic full attempt under exam conditions', category: 'pyq' },
    { day: 110, date: '2027-01-29', week: 16, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Reading Comprehension, Solved Papers & Final Audit', topic: 'Analyse 2026 Paper: Identify weak areas & revise core formulas', category: 'revision' },
    { day: 111, date: '2027-01-30', week: 16, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Reading Comprehension, Solved Papers & Final Audit', topic: 'Solve 2025 Paper: Timed full exam simulation (2-Hour Mock)', category: 'mock' },
    { day: 112, date: '2027-01-31', week: 16, month: 4, monthLabel: 'Communication, Crack Sets & Assessment', weekLabel: 'Reading Comprehension, Solved Papers & Final Audit', topic: 'Analyse 2025 Paper: Error notebook update, syllabus audit & final strategy', category: 'revision' },
];

// Helper: get category display info
export const CATEGORY_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
    learn: { emoji: '📖', label: 'Learn', color: '#3b82f6' },
    revision: { emoji: '🔄', label: 'Revision', color: '#f59e0b' },
    test: { emoji: '📝', label: 'Test', color: '#8b5cf6' },
    pyq: { emoji: '📋', label: 'PYQ', color: '#10b981' },
    mock: { emoji: '🎯', label: 'Mock', color: '#ef4444' },
};

// Helper: get the 90-min daily routine structure (Daily 9:00 PM – 10:30 PM slot)
export const CSAT_DAILY_SLOT = {
    start: '9:00 PM',
    end: '10:30 PM',
    duration: '90 Mins',
    label: '9:00 PM – 10:30 PM (90 Mins)',
};

export const DAILY_ROUTINE = [
    { time: '9:00 PM – 9:10 PM', minutes: 10, label: 'Revise previous topics & formulas', color: '#f59e0b' },
    { time: '9:10 PM – 9:40 PM', minutes: 30, label: 'Learn the day\'s main topic', color: '#3b82f6' },
    { time: '9:40 PM – 10:05 PM', minutes: 25, label: 'Solve practice questions or PYQs', color: '#10b981' },
    { time: '10:05 PM – 10:20 PM', minutes: 15, label: 'Reading comprehension or reasoning', color: '#8b5cf6' },
    { time: '10:20 PM – 10:30 PM', minutes: 10, label: 'Error notebook & revision planning', color: '#ec4899' },
];
