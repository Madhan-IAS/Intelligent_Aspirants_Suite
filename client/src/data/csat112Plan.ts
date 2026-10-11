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
    1: 'Arithmetic Foundations',
    2: 'Quant Aptitude & DI',
    3: 'Reasoning & Comprehension',
    4: 'PYQs, Revision & Mocks',
};

export const CSAT_WEEK_LABELS: Record<number, string> = {
    1: 'Number System Foundations',
    2: 'Powers, Percentages & Ratios',
    3: 'Averages & Commercial Arithmetic',
    4: 'Mixtures, Work & Time',
    5: 'Speed, Distance & Ages',
    6: 'Algebra & Numerical Patterns',
    7: 'Geometry & Mensuration I',
    8: 'Mensuration II & Data Interpretation',
    9: 'Logical Reasoning I',
    10: 'Logical Reasoning II',
    11: 'Critical Reasoning',
    12: 'Reading Comprehension',
    13: 'Integrated PYQ Practice',
    14: 'Topic-wise PYQ Completion',
    15: 'Sectional Tests',
    16: 'Final Assessment & Completion',
};

export const CSAT_112_PLAN: CSATDay[] = [
    // ═══════════════════════════════════════════════════════════════
    // MONTH 1 — Arithmetic Foundations (12 Oct – 8 Nov)
    // ═══════════════════════════════════════════════════════════════

    // Week 1: 12–18 October — Number System Foundations
    { day: 1, date: '2026-10-12', week: 1, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Number System Foundations', topic: 'Diagnostic CSAT set; identify strengths and weaknesses', category: 'test' },
    { day: 2, date: '2026-10-13', week: 1, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Number System Foundations', topic: 'Number system: natural numbers, integers, rational numbers, prime and composite numbers', category: 'learn' },
    { day: 3, date: '2026-10-14', week: 1, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Number System Foundations', topic: 'Divisibility, factors, multiples, HCF and LCM', category: 'learn' },
    { day: 4, date: '2026-10-15', week: 1, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Number System Foundations', topic: 'Remainders, cyclicity and units digits', category: 'learn' },
    { day: 5, date: '2026-10-16', week: 1, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Number System Foundations', topic: 'Fractions, decimals and conversions', category: 'learn' },
    { day: 6, date: '2026-10-17', week: 1, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Number System Foundations', topic: 'BODMAS, simplification, squares, cubes and roots', category: 'learn' },
    { day: 7, date: '2026-10-18', week: 1, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Number System Foundations', topic: 'Weekly revision, number-system questions and comprehension', category: 'revision' },

    // Week 2: 19–25 October — Powers, Percentages & Ratios
    { day: 8, date: '2026-10-19', week: 2, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Powers, Percentages & Ratios', topic: 'Powers, indices and numerical simplification', category: 'learn' },
    { day: 9, date: '2026-10-20', week: 2, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Powers, Percentages & Ratios', topic: 'Percentage fundamentals and fraction-to-percentage conversions', category: 'learn' },
    { day: 10, date: '2026-10-21', week: 2, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Powers, Percentages & Ratios', topic: 'Percentage increase, decrease and successive changes', category: 'learn' },
    { day: 11, date: '2026-10-22', week: 2, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Powers, Percentages & Ratios', topic: 'Population growth, depreciation and percentage comparison', category: 'learn' },
    { day: 12, date: '2026-10-23', week: 2, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Powers, Percentages & Ratios', topic: 'Ratio, proportion and equivalent ratios', category: 'learn' },
    { day: 13, date: '2026-10-24', week: 2, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Powers, Percentages & Ratios', topic: 'Direct and inverse proportion; mixed questions', category: 'learn' },
    { day: 14, date: '2026-10-25', week: 2, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Powers, Percentages & Ratios', topic: 'Revision and a short quantitative test', category: 'test' },

    // Week 3: 26 Oct – 1 Nov — Averages & Commercial Arithmetic
    { day: 15, date: '2026-10-26', week: 3, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Averages & Commercial Arithmetic', topic: 'Arithmetic mean and weighted averages', category: 'learn' },
    { day: 16, date: '2026-10-27', week: 3, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Averages & Commercial Arithmetic', topic: 'Combined averages, missing values and applications', category: 'learn' },
    { day: 17, date: '2026-10-28', week: 3, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Averages & Commercial Arithmetic', topic: 'Profit, loss, cost price and selling price', category: 'learn' },
    { day: 18, date: '2026-10-29', week: 3, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Averages & Commercial Arithmetic', topic: 'Marked price, discounts and successive discounts', category: 'learn' },
    { day: 19, date: '2026-10-30', week: 3, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Averages & Commercial Arithmetic', topic: 'Simple interest', category: 'learn' },
    { day: 20, date: '2026-10-31', week: 3, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Averages & Commercial Arithmetic', topic: 'Compound interest and comparison with simple interest', category: 'learn' },
    { day: 21, date: '2026-11-01', week: 3, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Averages & Commercial Arithmetic', topic: 'Revision and a mixed arithmetic test', category: 'test' },

    // Week 4: 2–8 November — Mixtures, Work & Time
    { day: 22, date: '2026-11-02', week: 4, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Mixtures, Work & Time', topic: 'Mixtures and ratio-based concentration problems', category: 'learn' },
    { day: 23, date: '2026-11-03', week: 4, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Mixtures, Work & Time', topic: 'Alligation and replacement problems', category: 'learn' },
    { day: 24, date: '2026-11-04', week: 4, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Mixtures, Work & Time', topic: 'Time and work; individual work rates', category: 'learn' },
    { day: 25, date: '2026-11-05', week: 4, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Mixtures, Work & Time', topic: 'Combined work, efficiency and work fractions', category: 'learn' },
    { day: 26, date: '2026-11-06', week: 4, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Mixtures, Work & Time', topic: 'Pipes and cisterns', category: 'learn' },
    { day: 27, date: '2026-11-07', week: 4, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Mixtures, Work & Time', topic: 'Mixed work-rate questions and related PYQs', category: 'pyq' },
    { day: 28, date: '2026-11-08', week: 4, month: 1, monthLabel: 'Arithmetic Foundations', weekLabel: 'Mixtures, Work & Time', topic: 'Month 1 revision and error-log review', category: 'revision' },

    // ═══════════════════════════════════════════════════════════════
    // MONTH 2 — Speed, Algebra, Geometry, Mensuration & DI (9 Nov – 6 Dec)
    // ═══════════════════════════════════════════════════════════════

    // Week 5: 9–15 November — Speed, Distance & Ages
    { day: 29, date: '2026-11-09', week: 5, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Speed, Distance & Ages', topic: 'Speed, distance, time and unit conversions', category: 'learn' },
    { day: 30, date: '2026-11-10', week: 5, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Speed, Distance & Ages', topic: 'Relative speed and average speed', category: 'learn' },
    { day: 31, date: '2026-11-11', week: 5, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Speed, Distance & Ages', topic: 'Trains crossing platforms and objects', category: 'learn' },
    { day: 32, date: '2026-11-12', week: 5, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Speed, Distance & Ages', topic: 'Boats, streams and upstream/downstream', category: 'learn' },
    { day: 33, date: '2026-11-13', week: 5, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Speed, Distance & Ages', topic: 'Problems on present and past ages', category: 'learn' },
    { day: 34, date: '2026-11-14', week: 5, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Speed, Distance & Ages', topic: 'Future ages and combined age problems', category: 'learn' },
    { day: 35, date: '2026-11-15', week: 5, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Speed, Distance & Ages', topic: 'Speed, work and ages: sectional test', category: 'test' },

    // Week 6: 16–22 November — Algebra & Numerical Patterns
    { day: 36, date: '2026-11-16', week: 6, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Algebra & Numerical Patterns', topic: 'Algebraic expressions, identities and simplification', category: 'learn' },
    { day: 37, date: '2026-11-17', week: 6, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Algebra & Numerical Patterns', topic: 'Linear equations in one variable', category: 'learn' },
    { day: 38, date: '2026-11-18', week: 6, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Algebra & Numerical Patterns', topic: 'Simultaneous linear equations', category: 'learn' },
    { day: 39, date: '2026-11-19', week: 6, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Algebra & Numerical Patterns', topic: 'Inequalities and comparison of quantities', category: 'learn' },
    { day: 40, date: '2026-11-20', week: 6, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Algebra & Numerical Patterns', topic: 'Number sequences and numerical patterns', category: 'learn' },
    { day: 41, date: '2026-11-21', week: 6, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Algebra & Numerical Patterns', topic: 'Mixed algebra and numerical reasoning', category: 'learn' },
    { day: 42, date: '2026-11-22', week: 6, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Algebra & Numerical Patterns', topic: 'Algebra revision and PYQs', category: 'pyq' },

    // Week 7: 23–29 November — Geometry & Mensuration I
    { day: 43, date: '2026-11-23', week: 7, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Geometry & Mensuration I', topic: 'Lines, angles, parallel lines and transversals', category: 'learn' },
    { day: 44, date: '2026-11-24', week: 7, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Geometry & Mensuration I', topic: 'Triangles and their properties', category: 'learn' },
    { day: 45, date: '2026-11-25', week: 7, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Geometry & Mensuration I', topic: 'Congruence, similarity and Pythagoras\' theorem', category: 'learn' },
    { day: 46, date: '2026-11-26', week: 7, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Geometry & Mensuration I', topic: 'Quadrilaterals and polygons', category: 'learn' },
    { day: 47, date: '2026-11-27', week: 7, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Geometry & Mensuration I', topic: 'Circles: radius, chords, arcs and related properties', category: 'learn' },
    { day: 48, date: '2026-11-28', week: 7, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Geometry & Mensuration I', topic: 'Perimeter and area of plane figures', category: 'learn' },
    { day: 49, date: '2026-11-29', week: 7, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Geometry & Mensuration I', topic: 'Geometry revision and sectional test', category: 'test' },

    // Week 8: 30 Nov – 6 Dec — Mensuration II & Data Interpretation
    { day: 50, date: '2026-11-30', week: 8, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Mensuration II & Data Interpretation', topic: 'Cubes, cuboids and prisms', category: 'learn' },
    { day: 51, date: '2026-12-01', week: 8, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Mensuration II & Data Interpretation', topic: 'Cylinders, cones and spheres', category: 'learn' },
    { day: 52, date: '2026-12-02', week: 8, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Mensuration II & Data Interpretation', topic: 'Composite shapes, surface area, volume and unit conversions', category: 'learn' },
    { day: 53, date: '2026-12-03', week: 8, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Mensuration II & Data Interpretation', topic: 'Tables and tabular data interpretation', category: 'learn' },
    { day: 54, date: '2026-12-04', week: 8, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Mensuration II & Data Interpretation', topic: 'Bar graphs and line graphs', category: 'learn' },
    { day: 55, date: '2026-12-05', week: 8, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Mensuration II & Data Interpretation', topic: 'Pie charts, percentages and mixed data sets', category: 'learn' },
    { day: 56, date: '2026-12-06', week: 8, month: 2, monthLabel: 'Quant Aptitude & DI', weekLabel: 'Mensuration II & Data Interpretation', topic: 'Quantitative aptitude revision and timed test', category: 'test' },

    // ═══════════════════════════════════════════════════════════════
    // MONTH 3 — Logical Reasoning & Comprehension (7 Dec – 3 Jan)
    // ═══════════════════════════════════════════════════════════════

    // Week 9: 7–13 December — Logical Reasoning I
    { day: 57, date: '2026-12-07', week: 9, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning I', topic: 'Number series and letter series', category: 'learn' },
    { day: 58, date: '2026-12-08', week: 9, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning I', topic: 'Analogy, classification and odd one out', category: 'learn' },
    { day: 59, date: '2026-12-09', week: 9, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning I', topic: 'Coding and decoding', category: 'learn' },
    { day: 60, date: '2026-12-10', week: 9, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning I', topic: 'Directions, turns and distance', category: 'learn' },
    { day: 61, date: '2026-12-11', week: 9, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning I', topic: 'Blood relations and family-tree problems', category: 'learn' },
    { day: 62, date: '2026-12-12', week: 9, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning I', topic: 'Ranking, ordering and positions', category: 'learn' },
    { day: 63, date: '2026-12-13', week: 9, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning I', topic: 'Reasoning revision and mixed test', category: 'test' },

    // Week 10: 14–20 December — Logical Reasoning II
    { day: 64, date: '2026-12-14', week: 10, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning II', topic: 'Linear seating arrangements', category: 'learn' },
    { day: 65, date: '2026-12-15', week: 10, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning II', topic: 'Circular seating arrangements', category: 'learn' },
    { day: 66, date: '2026-12-16', week: 10, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning II', topic: 'Grouping, selection and distribution puzzles', category: 'learn' },
    { day: 67, date: '2026-12-17', week: 10, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning II', topic: 'Syllogisms and logical validity', category: 'learn' },
    { day: 68, date: '2026-12-18', week: 10, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning II', topic: 'Venn diagrams and set relationships', category: 'learn' },
    { day: 69, date: '2026-12-19', week: 10, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning II', topic: 'Statements and conclusions', category: 'learn' },
    { day: 70, date: '2026-12-20', week: 10, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Logical Reasoning II', topic: 'Reasoning revision and sectional test', category: 'test' },

    // Week 11: 21–27 December — Critical Reasoning
    { day: 71, date: '2026-12-21', week: 11, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Critical Reasoning', topic: 'Statements and assumptions', category: 'learn' },
    { day: 72, date: '2026-12-22', week: 11, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Critical Reasoning', topic: 'Arguments, inference and deduction', category: 'learn' },
    { day: 73, date: '2026-12-23', week: 11, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Critical Reasoning', topic: 'Cause and effect', category: 'learn' },
    { day: 74, date: '2026-12-24', week: 11, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Critical Reasoning', topic: 'Course of action and practical problem-solving', category: 'learn' },
    { day: 75, date: '2026-12-25', week: 11, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Critical Reasoning', topic: 'Calendars and clocks', category: 'learn' },
    { day: 76, date: '2026-12-26', week: 11, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Critical Reasoning', topic: 'Constraint-based puzzles and multi-step reasoning', category: 'learn' },
    { day: 77, date: '2026-12-27', week: 11, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Critical Reasoning', topic: 'Critical reasoning revision and PYQs', category: 'pyq' },

    // Week 12: 28 Dec – 3 Jan — Reading Comprehension
    { day: 78, date: '2026-12-28', week: 12, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Reading Comprehension', topic: 'Reading comprehension: main idea and argument', category: 'learn' },
    { day: 79, date: '2026-12-29', week: 12, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Reading Comprehension', topic: 'Facts, opinions, claims and supporting evidence', category: 'learn' },
    { day: 80, date: '2026-12-30', week: 12, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Reading Comprehension', topic: 'Inference and implied meaning', category: 'learn' },
    { day: 81, date: '2026-12-31', week: 12, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Reading Comprehension', topic: 'Assumptions and conclusions in passages', category: 'learn' },
    { day: 82, date: '2027-01-01', week: 12, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Reading Comprehension', topic: 'Author\'s tone, purpose and attitude', category: 'learn' },
    { day: 83, date: '2027-01-02', week: 12, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Reading Comprehension', topic: 'Strengthening/weakening arguments and contextual vocabulary', category: 'learn' },
    { day: 84, date: '2027-01-03', week: 12, month: 3, monthLabel: 'Reasoning & Comprehension', weekLabel: 'Reading Comprehension', topic: 'Timed comprehension test and error analysis', category: 'test' },

    // ═══════════════════════════════════════════════════════════════
    // MONTH 4 — PYQs, Revision & Mocks (4 Jan – 31 Jan)
    // ═══════════════════════════════════════════════════════════════

    // Week 13: 4–10 January — Integrated PYQ Practice
    { day: 85, date: '2027-01-04', week: 13, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Integrated PYQ Practice', topic: 'Mixed PYQs: number system, fractions and percentages', category: 'pyq' },
    { day: 86, date: '2027-01-05', week: 13, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Integrated PYQ Practice', topic: 'Mixed PYQs: ratios, averages, profit/loss and interest', category: 'pyq' },
    { day: 87, date: '2027-01-06', week: 13, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Integrated PYQ Practice', topic: 'Mixed PYQs: work, speed, ages and algebra', category: 'pyq' },
    { day: 88, date: '2027-01-07', week: 13, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Integrated PYQ Practice', topic: 'Mixed PYQs: geometry, mensuration and data interpretation', category: 'pyq' },
    { day: 89, date: '2027-01-08', week: 13, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Integrated PYQ Practice', topic: 'Mixed PYQs: series, coding, directions and blood relations', category: 'pyq' },
    { day: 90, date: '2027-01-09', week: 13, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Integrated PYQ Practice', topic: 'Mixed PYQs: arrangements, syllogisms and critical reasoning', category: 'pyq' },
    { day: 91, date: '2027-01-10', week: 13, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Integrated PYQ Practice', topic: 'Comprehensive sectional test and weak-area analysis', category: 'test' },

    // Week 14: 11–17 January — Topic-wise PYQ Completion
    { day: 92, date: '2027-01-11', week: 14, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Topic-wise PYQ Completion', topic: 'PYQs: number system, percentages and ratios', category: 'pyq' },
    { day: 93, date: '2027-01-12', week: 14, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Topic-wise PYQ Completion', topic: 'PYQs: averages, commercial arithmetic and mixtures', category: 'pyq' },
    { day: 94, date: '2027-01-13', week: 14, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Topic-wise PYQ Completion', topic: 'PYQs: work, speed, ages and algebra', category: 'pyq' },
    { day: 95, date: '2027-01-14', week: 14, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Topic-wise PYQ Completion', topic: 'PYQs: geometry, mensuration and data interpretation', category: 'pyq' },
    { day: 96, date: '2027-01-15', week: 14, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Topic-wise PYQ Completion', topic: 'PYQs: logical and analytical reasoning', category: 'pyq' },
    { day: 97, date: '2027-01-16', week: 14, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Topic-wise PYQ Completion', topic: 'PYQs: reading comprehension', category: 'pyq' },
    { day: 98, date: '2027-01-17', week: 14, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Topic-wise PYQ Completion', topic: 'Reattempt incorrect PYQs and update the error notebook', category: 'revision' },

    // Week 15: 18–24 January — Sectional Tests
    { day: 99, date: '2027-01-18', week: 15, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Sectional Tests', topic: 'Quantitative aptitude sectional test', category: 'test' },
    { day: 100, date: '2027-01-19', week: 15, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Sectional Tests', topic: 'Analyse quantitative errors and revise formulas', category: 'revision' },
    { day: 101, date: '2027-01-20', week: 15, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Sectional Tests', topic: 'Timed comprehension sectional test', category: 'test' },
    { day: 102, date: '2027-01-21', week: 15, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Sectional Tests', topic: 'Analyse passages, inferences and incorrect options', category: 'revision' },
    { day: 103, date: '2027-01-22', week: 15, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Sectional Tests', topic: 'Logical reasoning sectional test', category: 'test' },
    { day: 104, date: '2027-01-23', week: 15, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Sectional Tests', topic: 'Mixed CSAT test with question-selection practice', category: 'test' },
    { day: 105, date: '2027-01-24', week: 15, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Sectional Tests', topic: 'Revise the five weakest subtopics', category: 'revision' },

    // Week 16: 25–31 January — Final Assessment & Completion
    { day: 106, date: '2027-01-25', week: 16, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Final Assessment & Completion', topic: 'Formula revision, comprehension strategy and mock preparation', category: 'revision' },
    { day: 107, date: '2027-01-26', week: 16, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Final Assessment & Completion', topic: 'Full-length CSAT mock under actual exam conditions', category: 'mock' },
    { day: 108, date: '2027-01-27', week: 16, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Final Assessment & Completion', topic: 'Analyse mock score, accuracy, timing and mistakes', category: 'revision' },
    { day: 109, date: '2027-01-28', week: 16, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Final Assessment & Completion', topic: 'Repair the two weakest quantitative topics', category: 'revision' },
    { day: 110, date: '2027-01-29', week: 16, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Final Assessment & Completion', topic: 'Repair the weakest comprehension and reasoning topics', category: 'revision' },
    { day: 111, date: '2027-01-30', week: 16, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Final Assessment & Completion', topic: 'Mixed PYQs, formula revision and reattempts', category: 'pyq' },
    { day: 112, date: '2027-01-31', week: 16, month: 4, monthLabel: 'PYQs, Revision & Mocks', weekLabel: 'Final Assessment & Completion', topic: 'Final syllabus audit, performance review and February revision plan', category: 'revision' },
];

// Helper: get category display info
export const CATEGORY_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
    learn: { emoji: '📖', label: 'Learn', color: '#3b82f6' },
    revision: { emoji: '🔄', label: 'Revision', color: '#f59e0b' },
    test: { emoji: '📝', label: 'Test', color: '#8b5cf6' },
    pyq: { emoji: '📋', label: 'PYQ', color: '#10b981' },
    mock: { emoji: '🎯', label: 'Mock', color: '#ef4444' },
};

// Helper: get the 90-min daily routine structure
export const DAILY_ROUTINE = [
    { minutes: 10, label: 'Revise previous topics & formulas', color: '#f59e0b' },
    { minutes: 30, label: 'Learn the day\'s main topic', color: '#3b82f6' },
    { minutes: 25, label: 'Solve practice questions or PYQs', color: '#10b981' },
    { minutes: 15, label: 'Reading comprehension or reasoning', color: '#8b5cf6' },
    { minutes: 10, label: 'Error notebook & revision planning', color: '#ec4899' },
];
