import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';
import { CSAT_112_PLAN, CSAT_WEEK_LABELS, CATEGORY_CONFIG, DAILY_ROUTINE } from '../src/data/csat112Plan';

const BLUEPRINT = [
  { segment: 'Number System & Permutations', count: '18–22 Qs', priority: 'Extreme High', color: '#ef4444' },
  { segment: 'Reading Comprehension (RC)', count: '25–27 Qs', priority: 'High Priority', color: '#f59e0b' },
  { segment: 'General Arithmetic & TSD', count: '12–15 Qs', priority: 'Moderate-High', color: '#3b82f6' },
  { segment: 'Analytical Puzzles & Arrangements', count: '8–10 Qs', priority: 'Moderate', color: '#8b5cf6' },
  { segment: 'Data Interpretation & Sufficiency', count: '5–8 Qs', priority: 'Increasing Trend', color: '#10b981' },
  { segment: 'Clocks, Calendars & Cubes', count: '3–5 Qs', priority: 'High Accuracy', color: '#ec4899' },
];

const EXTENDED_FORMULAS = [
  // ═══════════════════════════════════════════════════════════════
  // 1. NUMBER SYSTEM (Days 1–7)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Number System',
    title: 'Divisibility Rules (2–13)',
    formula: '2→Even | 3→DigitSum÷3 | 4→Last2Digits÷4 | 5→Ends0/5 | 6→Div by 2&3 | 7→Double last, subtract | 8→Last3÷8 | 9→DigitSum÷9 | 11→(OddPos−EvenPos)÷11',
    note: 'For 7: Remove last digit, double it, subtract from remaining. Repeat. For 13: similar with ×4 and add.'
  },
  {
    category: 'Number System',
    title: 'HCF & LCM Fundamentals',
    formula: 'HCF × LCM = Product of two numbers | LCM(fractions) = LCM(numerators) / HCF(denominators) | HCF(fractions) = HCF(numerators) / LCM(denominators)',
    note: 'For 3+ numbers: find HCF/LCM pairwise. HCF uses lowest powers; LCM uses highest powers of prime factors.'
  },
  {
    category: 'Number System',
    title: 'Remainder & Cyclicity',
    formula: 'Cyclicity of units digits: 2→{2,4,8,6} | 3→{3,9,7,1} | 7→{7,9,3,1} | 8→{8,4,2,6} | Cycle length = 4',
    note: 'Divide exponent by 4; remainder gives position in cycle. Powers of 0,1,5,6 always end in themselves.'
  },
  {
    category: 'Number System',
    title: 'Fermat\'s Little Theorem & Euler Totient',
    formula: 'a^(p-1) ≡ 1 (mod p) [p prime, gcd(a,p)=1] | φ(n) = n × ∏(1 − 1/p) for each prime factor p',
    note: 'Used for high-exponent remainders. Example: 2^100 mod 101 = 1. Euler: a^φ(n) ≡ 1 (mod n).'
  },
  {
    category: 'Number System',
    title: 'Trailing Zeros & Highest Power in n!',
    formula: 'Trailing zeros in n! = ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + ... | Highest power of prime p in n! = ⌊n/p⌋ + ⌊n/p²⌋ + ...',
    note: '100! has ⌊100/5⌋+⌊100/25⌋ = 24 zeros. For highest power of 2 in 10!: ⌊10/2⌋+⌊10/4⌋+⌊10/8⌋ = 5+2+1 = 8.'
  },
  {
    category: 'Number System',
    title: 'Factors & Divisors Count',
    formula: 'If N = p₁^a × p₂^b × p₃^c then: Total factors = (a+1)(b+1)(c+1) | Sum of factors = [(p₁^(a+1)−1)/(p₁−1)] × ...',
    note: 'Even factors: reduce power of 2 by 1 in count. Odd factors: set power of 2 to 0.'
  },
  {
    category: 'Number System',
    title: 'Squares, Cubes & Roots',
    formula: 'Perfect squares have odd number of factors | (a+b)² = a²+2ab+b² | (a−b)² = a²−2ab+b² | a²−b² = (a+b)(a−b)',
    note: 'Sum of first n odd numbers = n². √(a×b) = √a × √b. Cube root of perfect cube: group digits in threes from right.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. PERCENTAGES (Days 9–11)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Percentages',
    title: 'Fraction-to-Percentage Quick Table',
    formula: '1/2=50% | 1/3=33.3% | 1/4=25% | 1/5=20% | 1/6=16.67% | 1/7=14.28% | 1/8=12.5% | 1/9=11.11% | 1/11=9.09% | 1/12=8.33%',
    note: 'Memorise these for instant mental calculations in CSAT. 2/3=66.67%, 3/8=37.5%, 5/6=83.33%.'
  },
  {
    category: 'Percentages',
    title: 'Successive Percentage Change',
    formula: 'Net effect of a% then b% = a + b + (ab/100) | Two successive discounts: a% & b% ≠ (a+b)%',
    note: '+20% then −20% net = 20−20+(20×−20)/100 = −4% loss. Three changes: apply formula twice.'
  },
  {
    category: 'Percentages',
    title: 'Population & Depreciation',
    formula: 'Growth: P × (1 + r/100)^n | Depreciation: P × (1 − r/100)^n | % change = [(New−Old)/Old] × 100',
    note: 'If price ↑ by x%, to restore original, reduce by [x/(100+x)]×100%. If ↓ by x%, increase by [x/(100−x)]×100%.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 3. RATIO & PROPORTION (Days 12–13)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Ratio & Proportion',
    title: 'Ratio & Proportion Rules',
    formula: 'a:b = c:d ⟹ ad = bc (cross multiply) | Componendo: (a+b)/b = (c+d)/d | Dividendo: (a−b)/b = (c−d)/d',
    note: 'Componendo-Dividendo combined: (a+b)/(a−b) = (c+d)/(c−d). Chain ratios: make common term equal.'
  },
  {
    category: 'Ratio & Proportion',
    title: 'Partnership & Profit Sharing',
    formula: 'Profit share ∝ Capital × Time | A:B = (C₁×T₁) : (C₂×T₂)',
    note: 'For working vs sleeping partner: working partner gets salary first, remaining profit shared by capital ratio.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 4. AVERAGES (Days 15–16)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Averages',
    title: 'Weighted & Combined Averages',
    formula: 'Avg = Sum/Count | Weighted Avg = (n₁A₁ + n₂A₂) / (n₁ + n₂) | New avg when item added = (Old sum + New) / (n+1)',
    note: 'If avg of n numbers is A, and one number x is removed: new avg = (nA − x)/(n−1). Age of group increases by 1 each year.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 5. PROFIT, LOSS & DISCOUNT (Days 17–18)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Profit & Loss',
    title: 'CP, SP, MP & Discount Relations',
    formula: 'Profit% = [(SP−CP)/CP]×100 | Loss% = [(CP−SP)/CP]×100 | SP = CP×(100±P%)/100 | Discount% = [(MP−SP)/MP]×100',
    note: 'SP = MP × (100−d)/100. If discount d% on MP and profit p%: MP = CP×(100+p)/(100−d).'
  },
  {
    category: 'Profit & Loss',
    title: 'Dishonest Dealer & Successive Discounts',
    formula: 'Dishonest gain% = [True weight − False weight]/False weight × 100 | Successive discounts d₁,d₂: Net = 1−(1−d₁/100)(1−d₂/100)',
    note: 'Equivalent single discount for 20% & 10% = 1−(0.8×0.9) = 1−0.72 = 28%.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 6. SIMPLE & COMPOUND INTEREST (Days 19–20)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Interest',
    title: 'Simple Interest (SI)',
    formula: 'SI = P × R × T / 100 | Amount = P + SI | P = 100×SI/(R×T) | Rate to double = 100/T years',
    note: 'SI is same every year. If SI = P, then RT = 100. Money doubles in 100/R years at SI.'
  },
  {
    category: 'Interest',
    title: 'Compound Interest (CI)',
    formula: 'A = P(1 + R/100)^T | CI = A − P | CI − SI (2 yrs) = P(R/100)² | CI − SI (3 yrs) = P×R²(300+R)/100³',
    note: 'Half-yearly: rate=R/2, time=2T. Quarterly: rate=R/4, time=4T. Rule of 72: doubling time ≈ 72/R years.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 7. MIXTURES & ALLIGATION (Days 22–23)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Mixtures & Alligation',
    title: 'Alligation Cross Rule',
    formula: 'Cheaper/Dearer = (Dearer price − Mean) / (Mean − Cheaper price) | Replacement: After n ops, pure qty = Q × (1 − R/Q)^n',
    note: 'Works for price, concentration, marks, speed blending. Replacement formula: R = quantity replaced each time, Q = total.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 8. TIME & WORK (Days 24–26)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Time & Work',
    title: 'Work Rate Formulas',
    formula: 'If A does in x days → rate = 1/x per day | A+B together: 1/x + 1/y = 1/T → T = xy/(x+y) | Efficiency ∝ 1/Time',
    note: 'Use LCM of days as total work units for cleaner calculations. If A is twice as efficient as B, A takes half the time.'
  },
  {
    category: 'Time & Work',
    title: 'Pipes & Cisterns',
    formula: 'Inlet fills in x hrs → rate = 1/x | Outlet empties in y hrs → rate = −1/y | Net rate = 1/x − 1/y | Fill time = xy/(y−x)',
    note: 'When both work: net rate is sum of individual rates. Leak reduces effective rate. Use +ve for fill, −ve for empty.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 9. SPEED, DISTANCE & TIME (Days 29–32)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Speed, Distance & Time',
    title: 'Core SDT Formulas & Conversions',
    formula: 'D = S × T | S = D/T | T = D/S | km/h to m/s: × 5/18 | m/s to km/h: × 18/5',
    note: '72 km/h = 20 m/s. 36 km/h = 10 m/s. Always convert to same units before calculating.'
  },
  {
    category: 'Speed, Distance & Time',
    title: 'Average Speed & Relative Speed',
    formula: 'Avg speed (same distance) = 2S₁S₂/(S₁+S₂) | Same direction: S_rel = S₁−S₂ | Opposite: S_rel = S₁+S₂',
    note: 'Average speed ≠ average of speeds. For 3 equal distances at speeds a,b,c: avg = 3abc/(ab+bc+ca).'
  },
  {
    category: 'Speed, Distance & Time',
    title: 'Trains Crossing',
    formula: 'Pole/Person: T = L_train / S | Platform: T = (L_train + L_platform) / S | Two trains same dir: T = (L₁+L₂)/(S₁−S₂) | Opposite: T = (L₁+L₂)/(S₁+S₂)',
    note: 'A person/pole has zero length. Two trains crossing = sum of lengths ÷ relative speed.'
  },
  {
    category: 'Speed, Distance & Time',
    title: 'Boats & Streams',
    formula: 'Downstream speed = B + S | Upstream speed = B − S | Speed in still water B = (D+U)/2 | Stream speed S = (D−U)/2',
    note: 'B = boat speed, S = stream speed, D = downstream speed, U = upstream speed. Time upstream > time downstream.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 10. AGES (Days 33–34)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Ages',
    title: 'Age Problem Setup Rules',
    formula: 'Present age = x | n years ago = x−n | n years hence = x+n | Age difference never changes | Ratio of ages changes over time',
    note: 'Set up linear equations. If ratio of ages is a:b now, and c:d after n years, then (ax+n)/(bx+n) = c/d. Solve for x.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 11. ALGEBRA (Days 36–39)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Algebra',
    title: 'Key Algebraic Identities',
    formula: '(a+b)² = a²+2ab+b² | (a−b)² = a²−2ab+b² | a²−b² = (a+b)(a−b) | (a+b)³ = a³+3a²b+3ab²+b³ | a³+b³ = (a+b)(a²−ab+b²)',
    note: 'If a+b and ab are known: a²+b² = (a+b)²−2ab. If a−b and ab are known: a²+b² = (a−b)²+2ab.'
  },
  {
    category: 'Algebra',
    title: 'Linear & Simultaneous Equations',
    formula: 'ax+b=0 → x=−b/a | System a₁x+b₁y=c₁, a₂x+b₂y=c₂: Unique if a₁/a₂ ≠ b₁/b₂ | Infinite if a₁/a₂=b₁/b₂=c₁/c₂ | No solution if a₁/a₂=b₁/b₂≠c₁/c₂',
    note: 'Substitution or elimination method. Cross-multiplication: x/(b₁c₂−b₂c₁) = y/(c₁a₂−c₂a₁) = 1/(a₁b₂−a₂b₁).'
  },
  {
    category: 'Algebra',
    title: 'Quadratic & Inequalities',
    formula: 'ax²+bx+c=0 → x = [−b ± √(b²−4ac)] / 2a | Sum of roots = −b/a | Product of roots = c/a | D>0: 2 real, D=0: equal, D<0: imaginary',
    note: 'For inequalities: flip sign when multiplying/dividing by negative. |x| < a ⟹ −a < x < a.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 12. SEQUENCES & PROGRESSIONS (Day 40)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Sequences & Progressions',
    title: 'Arithmetic Progression (AP)',
    formula: 'nth term = a + (n−1)d | Sum of n terms = n/2 × [2a + (n−1)d] = n/2 × (first + last) | AM of a,b = (a+b)/2',
    note: 'Sum of first n naturals = n(n+1)/2. Sum of first n odd = n². Sum of first n even = n(n+1). Sum of squares = n(n+1)(2n+1)/6.'
  },
  {
    category: 'Sequences & Progressions',
    title: 'Geometric Progression (GP)',
    formula: 'nth term = ar^(n−1) | Sum of n terms = a(r^n − 1)/(r−1) [r≠1] | Sum to infinity (|r|<1) = a/(1−r) | GM of a,b = √(ab)',
    note: 'AM ≥ GM ≥ HM always. HM of a,b = 2ab/(a+b). Three in GP: a, ar, ar². Product of 3 terms in GP = (middle)³.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 13. GEOMETRY (Days 43–48)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Geometry',
    title: 'Lines, Angles & Triangles',
    formula: 'Sum of angles in △ = 180° | Exterior angle = sum of remote interior angles | Angle sum of polygon = (n−2)×180° | Each angle of regular polygon = (n−2)×180°/n',
    note: 'Vertically opposite angles are equal. Co-interior (same-side) angles on parallel lines sum to 180°. Alternate angles are equal.'
  },
  {
    category: 'Geometry',
    title: 'Pythagoras & Triangle Properties',
    formula: 'a² + b² = c² (right △) | Common triplets: (3,4,5), (5,12,13), (7,24,25), (8,15,17) | Triangle inequality: sum of any 2 sides > 3rd side',
    note: 'Median to hypotenuse = half of hypotenuse. Centroid divides median in 2:1 from vertex. In-radius r = Area/semi-perimeter.'
  },
  {
    category: 'Geometry',
    title: 'Similar & Congruent Triangles',
    formula: 'Similar △: sides proportional, angles equal | Area ratio = (side ratio)² | Perimeter ratio = side ratio | BPT: line ∥ to base divides sides proportionally',
    note: 'Congruence tests: SSS, SAS, ASA, AAS, RHS. Midpoint theorem: line joining midpoints is ∥ to base and half its length.'
  },
  {
    category: 'Geometry',
    title: 'Circle Theorems',
    formula: 'Angle in semicircle = 90° | Angle at centre = 2 × angle at circumference | Tangent ⊥ radius | Two tangents from external point are equal',
    note: 'Chord distance from centre: d² + (chord/2)² = r². Intersecting chords: PA×PB = PC×PD. Power of a point theorem.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 14. MENSURATION 2D (Day 48)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Mensuration 2D',
    title: 'Area & Perimeter of Plane Figures',
    formula: 'Rectangle: A=lb, P=2(l+b) | Square: A=s², P=4s | △: A=½bh | Heron: A=√[s(s−a)(s−b)(s−c)] s=(a+b+c)/2 | Equilateral △: A=(√3/4)s²',
    note: 'Parallelogram: A=base×height. Rhombus: A=½×d₁×d₂. Trapezium: A=½(a+b)×h.'
  },
  {
    category: 'Mensuration 2D',
    title: 'Circle Measurements',
    formula: 'Area = πr² | Circumference = 2πr | Sector area = (θ/360)πr² | Arc length = (θ/360)×2πr | Ring area = π(R²−r²)',
    note: 'Semicircle area = πr²/2. Quadrant area = πr²/4. Use π = 22/7 or 3.14 as needed.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 15. MENSURATION 3D (Days 50–52)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Mensuration 3D',
    title: 'Cube, Cuboid & Prism',
    formula: 'Cube: V=a³, SA=6a², Diagonal=a√3 | Cuboid: V=lbh, SA=2(lb+bh+lh), Diagonal=√(l²+b²+h²)',
    note: 'Longest rod in room = space diagonal. Prism: V = Base area × height. LA = perimeter of base × height.'
  },
  {
    category: 'Mensuration 3D',
    title: 'Cylinder, Cone & Sphere',
    formula: 'Cylinder: V=πr²h, CSA=2πrh, TSA=2πr(r+h) | Cone: V=⅓πr²h, CSA=πrl, l=√(r²+h²) | Sphere: V=4/3πr³, SA=4πr²',
    note: 'Hemisphere: V=2/3πr³, CSA=2πr², TSA=3πr². Frustum: V=πh/3(R²+r²+Rr). When shape recast, volume remains same.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 16. DATA INTERPRETATION (Days 53–55)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Data Interpretation',
    title: 'DI Calculation Shortcuts',
    formula: '% Change = [(New−Old)/Old]×100 | CAGR = [(Final/Initial)^(1/n) − 1]×100 | Pie chart: Value = (Angle/360)×Total = (%/100)×Total',
    note: 'Bar/line graphs: always check scale. For ratios from pie chart: compare angle/percentage values directly without computing actual numbers.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 17. PERMUTATIONS, COMBINATIONS & PROBABILITY (Micro-Syllabus)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Combinatorics',
    title: 'Permutations & Combinations',
    formula: 'nPr = n!/(n−r)! | nCr = n!/[r!(n−r)!] | nCr = nC(n−r) | nC0 = nCn = 1 | With repetition: (n+r−1)Cr',
    note: 'Arrangement (order matters) = P. Selection (order doesn\'t matter) = C. Circular perm = (n−1)!. Necklace = (n−1)!/2.'
  },
  {
    category: 'Probability',
    title: 'Probability Rules',
    formula: 'P(E) = Favorable/Total | 0 ≤ P ≤ 1 | P(A∪B) = P(A)+P(B)−P(A∩B) | P(A\') = 1−P(A) | Independent: P(A∩B) = P(A)×P(B)',
    note: 'Mutually exclusive: P(A∩B)=0, so P(A∪B)=P(A)+P(B). Conditional: P(A|B) = P(A∩B)/P(B). Coins: 2^n outcomes for n tosses.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 18. LOGICAL REASONING — SERIES & PATTERNS (Day 57)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Series & Patterns',
    title: 'Number & Letter Series Detection',
    formula: 'Check: ±constant | ×÷constant | ±increasing/decreasing | Squares/cubes ± offset | Alternating patterns | Prime-based | Fibonacci-type (sum of prev 2)',
    note: 'CSAT series usually have max 6–8 terms. Always check differences first, then second-order differences, then ratios. Letter series: A=1...Z=26.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 19. CODING-DECODING (Day 59)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Coding & Decoding',
    title: 'Alphabet Position & Coding Rules',
    formula: 'A=1, B=2...Z=26 | Reverse: A=26, B=25...Z=1 | Opposite letters: A↔Z, B↔Y, C↔X (sum=27) | Position from right = 27−position from left',
    note: 'Common coding: shift by +1, +2, −1. Mirror coding: each letter replaced by its opposite. Matrix coding: row+column = code.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 20. DIRECTIONS (Day 60)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Directions',
    title: 'Compass & Distance Rules',
    formula: 'N-E-S-W clockwise | 90° right from N = E | 90° left from N = W | Shortest distance = √(x² + y²) [Pythagoras]',
    note: 'Convert all turns to compass bearings. Track x (East +, West −) and y (North +, South −) separately, then find resultant.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 21. BLOOD RELATIONS (Day 61)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Blood Relations',
    title: 'Relationship Mapping Rules',
    formula: 'Father\'s/Mother\'s son = Brother | Father\'s/Mother\'s daughter = Sister | Father\'s father = Grandfather | Mother\'s brother = Maternal uncle',
    note: 'Draw family tree top-down. Use + for male, − for female. Same generation = siblings/cousins. Track through coded symbols like +, −, ×, ÷.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 22. CLOCKS & CALENDARS (Day 75)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Clocks',
    title: 'Clock Hand Angle & Coincidence',
    formula: 'θ = |30H − 11M/2| | Min hand gains 5.5° per minute over hour hand | Hands coincide every 65 5/11 minutes | 22 times in 24 hours (not 24)',
    note: 'Hands at right angle (90°): 44 times/day. Hands opposite (180°): 22 times/day. Hands overlap: 22 times/day.'
  },
  {
    category: 'Calendars',
    title: 'Odd Days & Day-of-Week Method',
    formula: 'Odd days: Mon-Sun = 1-0 | 1 ordinary year = 1 odd day | 1 leap year = 2 odd days | 100 yrs = 5 odd days | 400 yrs = 0 odd days',
    note: 'Leap year: divisible by 4 (not by 100, unless also by 400). Count total odd days mod 7: 0=Sun,1=Mon...6=Sat. Jan=3, Feb=0/1 odd days.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 23. CUBES & DICE (Micro-Syllabus)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Cubes & Dice',
    title: 'Painted Sub-Cubes Metric (n × n × n)',
    formula: '3 faces painted = 8 (corners always) | 2 faces = 12(n−2) edges | 1 face = 6(n−2)² face centres | 0 faces = (n−2)³ interior',
    note: 'Total small cubes = n³. Standard dice: opposite faces sum = 7 (1-6, 2-5, 3-4). If 2 dice shown, check adjacent faces to determine opposite.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 24. VENN DIAGRAMS & SETS (Day 68)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Venn Diagrams',
    title: 'Set Theory Formulas',
    formula: 'n(A∪B) = n(A)+n(B)−n(A∩B) | n(A∪B∪C) = n(A)+n(B)+n(C)−n(A∩B)−n(B∩C)−n(A∩C)+n(A∩B∩C) | Only A = n(A)−n(A∩B)−n(A∩C)+n(A∩B∩C)',
    note: 'For "at least one" = total in union. "Exactly two" = sum of pairwise intersections − 3×(all three). Start filling from innermost region.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 25. SYLLOGISMS (Day 67)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Syllogisms',
    title: 'Syllogism Rules & Complementary Pairs',
    formula: 'All A are B + All B are C → All A are C | Some A are B → Some B are A (converse) | No A are B → No B are A | All A are B → Some A are B',
    note: '"Some A are not B" and "All A are B" are complementary (exactly one true). Use Venn diagrams for complex 3-statement syllogisms. "Some" means "at least one".'
  },

  // ═══════════════════════════════════════════════════════════════
  // 26. CRITICAL REASONING (Days 69–74)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Critical Reasoning',
    title: 'Statements & Assumptions / Conclusions',
    formula: 'Assumption = unstated necessary premise (negation test: if negated, conclusion fails) | Conclusion = directly provable from statement | Inference = what logically follows',
    note: 'Strong argument: both relevant and significant. Weak: vague, extreme, or irrelevant. Course of action: practical and addresses the problem directly.'
  },
  {
    category: 'Critical Reasoning',
    title: 'Cause & Effect / Strengthen-Weaken',
    formula: 'Cause → Effect (temporal + causal link) | Strengthen: add supporting evidence | Weaken: provide alternative cause or break the causal chain',
    note: 'Independent causes = no causal connection. Common cause = both effects of a third factor. UPSC often tests whether two events are truly linked.'
  },

  // ═══════════════════════════════════════════════════════════════
  // 27. READING COMPREHENSION (Days 78–84)
  // ═══════════════════════════════════════════════════════════════
  {
    category: 'Reading Comprehension',
    title: 'Assumption vs Inference Rule',
    formula: 'Assumption = unstated necessary premise | Inference = logical deduction from stated facts | Corollary = direct spin-off impact',
    note: 'Negation test for assumptions: if negating an option destroys the author\'s argument, it IS a necessary assumption.'
  },
  {
    category: 'Reading Comprehension',
    title: 'Tone, Purpose & Main Idea Strategy',
    formula: 'Tone types: Analytical | Critical | Objective | Persuasive | Satirical | Laudatory | Cautionary | Purpose: Inform | Argue | Describe | Compare | Evaluate',
    note: 'Main idea = what the ENTIRE passage is about (not just one paragraph). Eliminate options too narrow (detail) or too broad (beyond scope). Look at first & last paragraphs.'
  },
  {
    category: 'Reading Comprehension',
    title: 'Fact vs Opinion & Evidence',
    formula: 'Fact = verifiable/provable statement | Opinion = subjective judgement/belief | Claim = assertion requiring evidence | Supporting evidence = data/example backing a claim',
    note: 'Signal words: "studies show" (fact), "I believe" (opinion), "it is argued" (claim). UPSC RC tests distinction between stated facts vs author\'s opinions.'
  },
];

const DRILL_QUESTIONS = [
  {
    id: 1,
    type: 'Advanced Quant',
    question: 'Find the total number of trailing zeros in the expansion of 100! (100 factorial).',
    options: ['A) 20', 'B) 24', 'C) 25', 'D) 22'],
    correctIndex: 1,
    explanation: 'Count of zeros = ⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24 trailing zeros.'
  },
  {
    id: 2,
    type: 'Logical Reasoning',
    question: 'A large cube painted red on all outer faces is cut into 64 identical smaller cubes (4x4x4). How many smaller cubes have EXACTLY 2 faces painted red?',
    options: ['A) 16', 'B) 24', 'C) 36', 'D) 8'],
    correctIndex: 1,
    explanation: 'Here n = 4. 2-face painted cubes are along edges = 12 * (n - 2) = 12 * (4 - 2) = 24 cubes.'
  },
  {
    id: 3,
    type: 'Reading Comprehension',
    question: 'Passage: "Decentralized governance without financial autonomy remains an empty administrative gesture." Which assumption is necessary?',
    options: [
      'A) Financial autonomy requires central taxation.',
      'B) Meaningful local governance depends on having independent financial resources.',
      'C) All administrative gestures are ineffective.',
      'D) Local bodies should not collect taxes.'
    ],
    correctIndex: 1,
    explanation: 'Negating Option B ("Governance does NOT depend on financial resources") breaks the author\'s premise that it is an empty gesture without it.'
  }
];

// ─── Roadmap Types ───
interface RoadmapStatus {
  currentDay: number;
  completedCount: number;
  totalDays: number;
  lagDays: number;
  isOnTrack: boolean;
  isCompleted: boolean;
  projectedFinish: string;
  originalDeadline: string;
  planStartDate: string;
  currentWeek: number;
  currentMonth: number;
  weeksClear: number;
  hoursInvested: number;
  totalHours: number;
  progressPct: number;
  completedDays: { dayNumber: number; completedAt: string; notes: string }[];
  skippedDates: string[];
}

export default function CSATHub() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('Quantitative Aptitude');
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showDrillModal, setShowDrillModal] = useState(false);

  // Drill State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [drillFinished, setDrillFinished] = useState(false);

  // ─── Top-level view toggle ───
  const [mainView, setMainView] = useState<'syllabus' | 'roadmap'>('roadmap');

  // ─── Roadmap State ───
  const [roadmap, setRoadmap] = useState<RoadmapStatus | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});
  const [completingDay, setCompletingDay] = useState<number | null>(null);

  useEffect(() => {
    fetchCSATTopics();
    fetchRoadmap();
  }, []);

  const fetchCSATTopics = async () => {
    try {
      const res = await api.get('/topics/subject/CSAT');
      setTopics(res.data || []);
    } catch (err) {
      console.error('Error fetching CSAT topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmap = async () => {
    try {
      const res = await api.get('/csat-roadmap/progress');
      setRoadmap(res.data);
      // Auto-expand the current week
      if (res.data?.currentWeek) {
        setExpandedWeeks(prev => ({ ...prev, [res.data.currentWeek]: true }));
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err);
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleCompleteDay = async (dayNumber: number) => {
    setCompletingDay(dayNumber);
    try {
      const res = await api.patch(`/csat-roadmap/complete/${dayNumber}`);
      setRoadmap(res.data);
    } catch (err: any) {
      console.error('Error completing day:', err);
    } finally {
      setCompletingDay(null);
    }
  };

  const handleUncompleteDay = async (dayNumber: number) => {
    setCompletingDay(dayNumber);
    try {
      const res = await api.delete(`/csat-roadmap/uncomplete/${dayNumber}`);
      setRoadmap(res.data);
    } catch (err: any) {
      console.error('Error uncompleting day:', err);
    } finally {
      setCompletingDay(null);
    }
  };

  const handleSkipDay = async () => {
    try {
      const res = await api.post('/csat-roadmap/skip');
      setRoadmap(res.data);
    } catch (err) {
      console.error('Error skipping day:', err);
    }
  };

  const handleToggleCheckbox = async (topicId: string, e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();

    const topic = topics.find(t => t._id === topicId);
    if (!topic) return;

    const nextCompleted = !topic.completed;
    setTopics(prev => prev.map(t => t._id === topicId ? { ...t, completed: nextCompleted } : t));

    try {
      await api.patch(`/daily-plan/toggle-topic/${topicId}`);
    } catch (err) {
      console.error('Error toggling topic:', err);
      // Revert
      setTopics(prev => prev.map(t => t._id === topicId ? { ...t, completed: !nextCompleted } : t));
    }
  };

  const filteredTopics = topics.filter(t => t.chapter === activeTab);

  const completedCount = topics.filter(t => t.completed).length;
  const totalCount = topics.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const resetDrill = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setDrillFinished(false);
  };

  const handleNextDrill = () => {
    if (selectedAnswer === DRILL_QUESTIONS[currentQuestion].correctIndex) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion + 1 < DRILL_QUESTIONS.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setDrillFinished(true);
    }
  };

  // ─── Roadmap helpers ───
  const completedDaySet = new Set(roadmap?.completedDays?.map(d => d.dayNumber) || []);

  const getDayStatus = (dayNum: number): 'completed' | 'active' | 'upcoming' | 'overdue' => {
    if (completedDaySet.has(dayNum)) return 'completed';
    if (!roadmap) return 'upcoming';
    if (dayNum === roadmap.currentDay) return 'active';
    if (dayNum < roadmap.currentDay) return 'overdue';
    return 'upcoming';
  };

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  const getWeekProgress = (weekNum: number) => {
    const weekDays = CSAT_112_PLAN.filter(d => d.week === weekNum);
    const done = weekDays.filter(d => completedDaySet.has(d.day)).length;
    return { done, total: weekDays.length };
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // ─── Today's active day info ───
  const todayDayInfo = CSAT_112_PLAN.find(d => d.day === roadmap?.currentDay);

  // ─── RENDER ───
  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      {/* Top Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 6, borderRadius: 8, backgroundColor: isDark ? '#1f2937' : '#e5e7eb' }}>
            <Ionicons name="arrow-back" size={20} color={isDark ? 'white' : '#111827'} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 22, fontWeight: 'bold' }}>🧮 CSAT Master Hub</Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>UPSC Prelims Paper II • 80 Qs (200 Marks) • 33% Qualifying</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setShowBlueprintModal(true)}
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Ionicons name="stats-chart" size={16} color="#8b5cf6" />
            <Text style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: 12 }}>Trends 📊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowFormulaModal(true)}
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Ionicons name="sparkles" size={16} color="#3b82f6" />
            <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 12 }}>Formulas ⚡</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══ VIEW TOGGLE TABS ═══ */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setMainView('roadmap')}
          style={{
            flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
            backgroundColor: mainView === 'roadmap' ? '#3b82f6' : (isDark ? '#1f2937' : '#ffffff'),
            borderWidth: 1, borderColor: mainView === 'roadmap' ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb')
          }}
        >
          <Text style={{ color: mainView === 'roadmap' ? 'white' : (isDark ? '#9ca3af' : '#4b5563'), fontWeight: 'bold', fontSize: 13 }}>
            📅 112-Day Roadmap
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMainView('syllabus')}
          style={{
            flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
            backgroundColor: mainView === 'syllabus' ? '#3b82f6' : (isDark ? '#1f2937' : '#ffffff'),
            borderWidth: 1, borderColor: mainView === 'syllabus' ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb')
          }}
        >
          <Text style={{ color: mainView === 'syllabus' ? 'white' : (isDark ? '#9ca3af' : '#4b5563'), fontWeight: 'bold', fontSize: 13 }}>
            📚 Micro-Syllabus
          </Text>
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════ */}
      {/* ROADMAP VIEW                                */}
      {/* ═══════════════════════════════════════════ */}
      {mainView === 'roadmap' && (
        <>
          {roadmapLoading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 40 }} />
          ) : roadmap ? (
            <>
              {/* ─── Elastic Deadline Monitor ─── */}
              <View style={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 16, borderRadius: 16,
                borderWidth: 1, borderColor: roadmap.isOnTrack ? '#10b981' : '#f59e0b', marginBottom: 16
              }}>
                {/* Status Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    backgroundColor: roadmap.isOnTrack ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8
                  }}>
                    <Text style={{ fontSize: 14 }}>{roadmap.isOnTrack ? '🎯' : '⏳'}</Text>
                    <Text style={{
                      color: roadmap.isOnTrack ? '#10b981' : '#f59e0b',
                      fontWeight: 'bold', fontSize: 12
                    }}>
                      {roadmap.isOnTrack ? 'On Track' : `${roadmap.lagDays} Day${roadmap.lagDays > 1 ? 's' : ''} Behind`}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>PROJECTED FINISH</Text>
                    <Text style={{ color: roadmap.isOnTrack ? '#10b981' : '#f59e0b', fontWeight: 'bold', fontSize: 13 }}>
                      {formatDate(roadmap.projectedFinish)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: '600' }}>
                      112-Day Progress
                    </Text>
                    <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: 'bold' }}>
                      {roadmap.completedCount}/{roadmap.totalDays} Days ({roadmap.progressPct}%)
                    </Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${roadmap.progressPct}%`, backgroundColor: '#3b82f6', borderRadius: 4 }} />
                  </View>
                </View>

                {/* Stats Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 16 }}>{roadmap.weeksClear}/16</Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>Weeks Clear</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 16 }}>{roadmap.hoursInvested}h</Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>of {roadmap.totalHours}h</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 16 }}>Month {roadmap.currentMonth}</Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>of 4</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 16 }}>90 min</Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>Daily Goal</Text>
                  </View>
                </View>
              </View>

              {/* ─── Today's Active Mission ─── */}
              {todayDayInfo && !roadmap.isCompleted && (
                <View style={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 16, borderRadius: 16,
                  borderWidth: 1.5, borderColor: '#3b82f6', marginBottom: 16
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ backgroundColor: '#3b82f6', width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{todayDayInfo.day}</Text>
                      </View>
                      <View>
                        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 14, fontWeight: 'bold' }}>Today's Mission</Text>
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>
                          Month {todayDayInfo.month} • Week {todayDayInfo.week} • {todayDayInfo.weekLabel}
                        </Text>
                      </View>
                    </View>
                    <View style={{
                      backgroundColor: `${CATEGORY_CONFIG[todayDayInfo.category]?.color}20`,
                      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6
                    }}>
                      <Text style={{ color: CATEGORY_CONFIG[todayDayInfo.category]?.color, fontSize: 10, fontWeight: 'bold' }}>
                        {CATEGORY_CONFIG[todayDayInfo.category]?.emoji} {CATEGORY_CONFIG[todayDayInfo.category]?.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 13, fontWeight: '600', marginBottom: 12 }}>
                    {todayDayInfo.topic}
                  </Text>

                  {/* 90-min Time Splitter */}
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase' }}>
                    Daily 90-Minute Routine
                  </Text>
                  <View style={{ flexDirection: 'row', borderRadius: 6, overflow: 'hidden', height: 22, marginBottom: 12 }}>
                    {DAILY_ROUTINE.map((seg, i) => (
                      <View key={i} style={{
                        flex: seg.minutes, backgroundColor: seg.color, alignItems: 'center', justifyContent: 'center',
                        borderRightWidth: i < DAILY_ROUTINE.length - 1 ? 1 : 0, borderRightColor: isDark ? '#111827' : '#ffffff'
                      }}>
                        <Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>{seg.minutes}m</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ gap: 3, marginBottom: 14 }}>
                    {DAILY_ROUTINE.map((seg, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: seg.color }} />
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>{seg.minutes}m — {seg.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => handleCompleteDay(todayDayInfo.day)}
                      disabled={completingDay === todayDayInfo.day}
                      style={{
                        flex: 2, backgroundColor: '#10b981', paddingVertical: 11, borderRadius: 10,
                        alignItems: 'center', opacity: completingDay === todayDayInfo.day ? 0.6 : 1
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>
                        {completingDay === todayDayInfo.day ? '...' : '✅ Mark Day Complete'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSkipDay}
                      style={{
                        flex: 1, backgroundColor: isDark ? '#374151' : '#e5e7eb', paddingVertical: 11, borderRadius: 10, alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: 'bold', fontSize: 13 }}>⏸️ Rest</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Completed Banner */}
              {roadmap.isCompleted && (
                <View style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: 20, borderRadius: 16,
                  alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#10b981'
                }}>
                  <Text style={{ fontSize: 40, marginBottom: 8 }}>🏆</Text>
                  <Text style={{ color: '#10b981', fontSize: 18, fontWeight: 'bold' }}>112-Day Plan Completed!</Text>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, textAlign: 'center', marginTop: 6 }}>
                    All syllabus areas covered. Move to revision, timed papers & weak-area improvement.
                  </Text>
                </View>
              )}

              {/* ─── 16-Week Checklist Accordion ─── */}
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                📋 16-Week Checklist
              </Text>

              {[1, 2, 3, 4].map(monthNum => {
                const monthLabel = monthNum === 1 ? '🔢 Month 1 — Arithmetic Foundations' :
                  monthNum === 2 ? '📐 Month 2 — Quant Aptitude & DI' :
                    monthNum === 3 ? '🧠 Month 3 — Reasoning & Comprehension' :
                      '🎯 Month 4 — PYQs, Revision & Mocks';
                const weeksInMonth = monthNum === 1 ? [1, 2, 3, 4] : monthNum === 2 ? [5, 6, 7, 8] : monthNum === 3 ? [9, 10, 11, 12] : [13, 14, 15, 16];

                return (
                  <View key={monthNum} style={{ marginBottom: 12 }}>
                    {/* Month Header */}
                    <View style={{
                      backgroundColor: isDark ? '#1e293b' : '#f0f4ff', paddingHorizontal: 12, paddingVertical: 8,
                      borderRadius: 10, marginBottom: 6
                    }}>
                      <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 13 }}>{monthLabel}</Text>
                    </View>

                    {weeksInMonth.map(weekNum => {
                      const wp = getWeekProgress(weekNum);
                      const isExpanded = expandedWeeks[weekNum];
                      const weekDays = CSAT_112_PLAN.filter(d => d.week === weekNum);
                      const weekAllDone = wp.done === wp.total;

                      return (
                        <View key={weekNum} style={{ marginBottom: 4 }}>
                          {/* Week Header */}
                          <TouchableOpacity
                            onPress={() => toggleWeek(weekNum)}
                            style={{
                              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                              backgroundColor: isDark ? '#1f2937' : '#ffffff', paddingHorizontal: 12, paddingVertical: 10,
                              borderRadius: 10, borderWidth: 1,
                              borderColor: weekAllDone ? '#10b981' : (isDark ? '#374151' : '#e5e7eb')
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                              <View style={{
                                width: 22, height: 22, borderRadius: 6, borderWidth: 2,
                                borderColor: weekAllDone ? '#10b981' : (isDark ? '#4b5563' : '#d1d5db'),
                                backgroundColor: weekAllDone ? '#10b981' : 'transparent',
                                alignItems: 'center', justifyContent: 'center'
                              }}>
                                {weekAllDone && <Ionicons name="checkmark" size={13} color="white" />}
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{
                                  color: isDark ? 'white' : '#111827', fontSize: 12, fontWeight: 'bold',
                                  textDecorationLine: weekAllDone ? 'line-through' : 'none'
                                }}>
                                  Week {weekNum}: {CSAT_WEEK_LABELS[weekNum]}
                                </Text>
                                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}>
                                  {wp.done}/{wp.total} days • {formatDate(weekDays[0].date)} – {formatDate(weekDays[weekDays.length - 1].date)}
                                </Text>
                              </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <View style={{
                                width: 40, height: 4, borderRadius: 2,
                                backgroundColor: isDark ? '#374151' : '#e5e7eb', overflow: 'hidden'
                              }}>
                                <View style={{
                                  height: '100%', borderRadius: 2,
                                  width: `${(wp.done / wp.total) * 100}%`,
                                  backgroundColor: weekAllDone ? '#10b981' : '#3b82f6'
                                }} />
                              </View>
                              <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                            </View>
                          </TouchableOpacity>

                          {/* Expanded Day Rows */}
                          {isExpanded && (
                            <View style={{ paddingLeft: 12, paddingTop: 4, gap: 3 }}>
                              {weekDays.map(dayInfo => {
                                const status = getDayStatus(dayInfo.day);
                                const isCompleted = status === 'completed';
                                const isActive = status === 'active';
                                const isOverdue = status === 'overdue';
                                const catCfg = CATEGORY_CONFIG[dayInfo.category];

                                return (
                                  <View
                                    key={dayInfo.day}
                                    style={{
                                      flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10,
                                      borderRadius: 8,
                                      backgroundColor: isActive ? (isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff') :
                                        isCompleted ? (isDark ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4') :
                                          isOverdue ? (isDark ? 'rgba(239, 68, 68, 0.05)' : '#fef2f2') :
                                            'transparent',
                                      borderWidth: isActive ? 1 : 0,
                                      borderColor: isActive ? '#3b82f6' : 'transparent'
                                    }}
                                  >
                                    {/* Checkbox */}
                                    <TouchableOpacity
                                      onPress={() => isCompleted ? handleUncompleteDay(dayInfo.day) : handleCompleteDay(dayInfo.day)}
                                      disabled={completingDay === dayInfo.day}
                                      style={{
                                        width: 20, height: 20, borderRadius: 5, borderWidth: 2, marginRight: 10,
                                        borderColor: isCompleted ? '#10b981' : isActive ? '#3b82f6' : isOverdue ? '#ef4444' : (isDark ? '#4b5563' : '#d1d5db'),
                                        backgroundColor: isCompleted ? '#10b981' : 'transparent',
                                        alignItems: 'center', justifyContent: 'center',
                                        opacity: completingDay === dayInfo.day ? 0.5 : 1
                                      }}
                                    >
                                      {isCompleted && <Ionicons name="checkmark" size={12} color="white" />}
                                    </TouchableOpacity>

                                    {/* Status Dot */}
                                    <View style={{
                                      width: 7, height: 7, borderRadius: 4, marginRight: 8,
                                      backgroundColor: isCompleted ? '#10b981' : isActive ? '#3b82f6' : isOverdue ? '#ef4444' : (isDark ? '#4b5563' : '#d1d5db')
                                    }} />

                                    {/* Day Info */}
                                    <View style={{ flex: 1 }}>
                                      <Text style={{
                                        color: isDark ? 'white' : '#111827', fontSize: 12, fontWeight: isActive ? 'bold' : '500',
                                        textDecorationLine: isCompleted ? 'line-through' : 'none',
                                        opacity: isCompleted ? 0.65 : 1
                                      }}>
                                        Day {dayInfo.day}: {dayInfo.topic}
                                      </Text>
                                    </View>

                                    {/* Category Badge */}
                                    <View style={{
                                      backgroundColor: `${catCfg.color}18`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 6
                                    }}>
                                      <Text style={{ color: catCfg.color, fontSize: 9, fontWeight: 'bold' }}>{catCfg.emoji}</Text>
                                    </View>
                                  </View>
                                );
                              })}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })}

              {/* Quick Action: Speed Drill */}
              <TouchableOpacity
                onPress={() => { resetDrill(); setShowDrillModal(true); }}
                style={{ backgroundColor: '#8b5cf6', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 30 }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>⚡ Take 15-Min CSAT Speed Test Drill</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center', marginVertical: 30 }}>
              Could not load roadmap. Please try again.
            </Text>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* SYLLABUS VIEW (original micro-syllabus)     */}
      {/* ═══════════════════════════════════════════ */}
      {mainView === 'syllabus' && (
        <>
          {/* Target Benchmark Hero Card */}
          <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 16, fontWeight: 'bold' }}>Qualifying Target: 33% (66.00 / 200 Net Marks)</Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, marginTop: 2 }}>+2.5 Marks Correct • -0.833 Penalty per Incorrect Answer</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 12 }}>33% Benchmark</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: '600' }}>Exhaustive Micro-Syllabus Coverage</Text>
                <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: 'bold' }}>{completedCount}/{totalCount} Micro-Topics ({progressPct}%)</Text>
              </View>
              <View style={{ height: 8, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${progressPct}%`, backgroundColor: '#3b82f6', borderRadius: 4 }} />
              </View>
            </View>

            {/* Quick Action Button: Speed Test */}
            <TouchableOpacity
              onPress={() => { resetDrill(); setShowDrillModal(true); }}
              style={{ backgroundColor: '#8b5cf6', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>⚡ Take 15-Min CSAT Speed Test Drill</Text>
            </TouchableOpacity>
          </View>

          {/* Module Tabs */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { key: 'Quantitative Aptitude', label: '🧮 Quant & Math (35-40 Qs)' },
              { key: 'Logical Reasoning', label: '🧠 Reasoning & Puzzles (20-25 Qs)' },
              { key: 'Reading Comprehension', label: '📖 RC & Data (25-30 Qs)' }
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                  backgroundColor: activeTab === tab.key ? '#3b82f6' : (isDark ? '#1f2937' : '#ffffff'),
                  borderWidth: 1, borderColor: activeTab === tab.key ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb')
                }}
              >
                <Text style={{ color: activeTab === tab.key ? 'white' : (isDark ? '#9ca3af' : '#4b5563'), fontWeight: 'bold', fontSize: 12 }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Topics List */}
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 40 }} />
          ) : filteredTopics.length === 0 ? (
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center', marginVertical: 30 }}>No micro-topics found under this module.</Text>
          ) : (
            <View style={{ gap: 10, marginBottom: 30 }}>
              {filteredTopics.map(topic => (
                <TouchableOpacity
                  key={topic._id}
                  onPress={() => router.push(`/topic/${topic._id}` as any)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12,
                    backgroundColor: topic.completed ? (isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4') : (isDark ? '#1f2937' : '#ffffff'),
                    borderWidth: 1, borderColor: topic.completed ? '#10b981' : (isDark ? '#374151' : '#e5e7eb'),
                    opacity: topic.completed ? 0.75 : 1
                  }}
                >
                  <TouchableOpacity
                    onPress={(e) => handleToggleCheckbox(topic._id, e)}
                    style={{
                      width: 22, height: 22, borderRadius: 6, borderWidth: 2, marginRight: 12,
                      borderColor: topic.completed ? '#10b981' : (isDark ? '#4b5563' : '#d1d5db'),
                      backgroundColor: topic.completed ? '#10b981' : 'transparent',
                      alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {topic.completed && <Ionicons name="checkmark" size={14} color="white" />}
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 13, fontWeight: '600', textDecorationLine: topic.completed ? 'line-through' : 'none' }}>
                      {topic.title}
                    </Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11, marginTop: 2 }}>{topic.heading}</Text>
                  </View>
                  <View style={{ backgroundColor: topic.difficulty === 'Hard' ? 'rgba(239, 68, 68, 0.15)' : topic.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ color: topic.difficulty === 'Hard' ? '#ef4444' : topic.difficulty === 'Medium' ? '#f59e0b' : '#10b981', fontSize: 10, fontWeight: 'bold' }}>{topic.difficulty}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      {/* Blueprint Trend Modal */}
      <Modal visible={showBlueprintModal} animationType="slide" transparent={true} onRequestClose={() => setShowBlueprintModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: isDark ? '#1f2937' : 'white', borderRadius: 16, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>📊 Historical Weightage & Blueprint</Text>
              <TouchableOpacity onPress={() => setShowBlueprintModal(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={isDark ? 'white' : '#111827'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ gap: 10 }}>
              {BLUEPRINT.map((row, idx) => (
                <View key={idx} style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isDark ? 'white' : '#111827', fontWeight: 'bold', fontSize: 13 }}>{row.segment}</Text>
                    <Text style={{ color: row.color, fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>{row.priority}</Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                    <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 13 }}>{row.count}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Formula Reference Modal */}
      <Modal visible={showFormulaModal} animationType="slide" transparent={true} onRequestClose={() => setShowFormulaModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: isDark ? '#1f2937' : 'white', borderRadius: 16, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>⚡ High-Yield CSAT Formulas</Text>
              <TouchableOpacity onPress={() => setShowFormulaModal(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={isDark ? 'white' : '#111827'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ gap: 12 }}>
              {EXTENDED_FORMULAS.map((item, idx) => (
                <View key={idx} style={{ backgroundColor: isDark ? '#111827' : '#f9fafb', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', marginBottom: 10 }}>
                  <Text style={{ color: '#3b82f6', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>{item.category}</Text>
                  <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>{item.title}</Text>
                  <View style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff', padding: 8, borderRadius: 6, marginVertical: 6 }}>
                    <Text style={{ color: '#2563eb', fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12 }}>{item.formula}</Text>
                  </View>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }}>💡 {item.note}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Speed Drill Modal */}
      <Modal visible={showDrillModal} animationType="slide" transparent={true} onRequestClose={() => setShowDrillModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: isDark ? '#1f2937' : 'white', borderRadius: 16, padding: 20, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 18, fontWeight: 'bold' }}>⚡ CSAT Speed Test Drill</Text>
              <TouchableOpacity onPress={() => setShowDrillModal(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={isDark ? 'white' : '#111827'} />
              </TouchableOpacity>
            </View>

            {drillFinished ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>🎯</Text>
                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Drill Completed!</Text>
                <Text style={{ color: '#10b981', fontSize: 24, fontWeight: 'bold', marginVertical: 10 }}>
                  Score: {score} / {DRILL_QUESTIONS.length}
                </Text>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center', marginBottom: 20 }}>
                  {score === DRILL_QUESTIONS.length ? '🌟 Perfect Accuracy! Keep up this high speed.' : 'Practice consistently to boost your speed and accuracy.'}
                </Text>
                <TouchableOpacity onPress={resetDrill} style={{ backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Try Again 🔄</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: 13 }}>Question {currentQuestion + 1} of {DRILL_QUESTIONS.length}</Text>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}>{DRILL_QUESTIONS[currentQuestion].type}</Text>
                </View>

                <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 14, fontWeight: '600', marginBottom: 16 }}>
                  {DRILL_QUESTIONS[currentQuestion].question}
                </Text>

                <View style={{ gap: 10, marginBottom: 20 }}>
                  {DRILL_QUESTIONS[currentQuestion].options.map((opt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedAnswer(idx)}
                      style={{
                        padding: 12, borderRadius: 10, borderWidth: 1,
                        backgroundColor: selectedAnswer === idx ? 'rgba(59, 130, 246, 0.15)' : (isDark ? '#111827' : '#f9fafb'),
                        borderColor: selectedAnswer === idx ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb')
                      }}
                    >
                      <Text style={{ color: selectedAnswer === idx ? '#3b82f6' : (isDark ? 'white' : '#111827'), fontWeight: selectedAnswer === idx ? 'bold' : 'normal', fontSize: 13 }}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleNextDrill}
                  disabled={selectedAnswer === null}
                  style={{ backgroundColor: selectedAnswer !== null ? '#3b82f6' : '#9ca3af', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                    {currentQuestion + 1 === DRILL_QUESTIONS.length ? 'Submit Drill ✅' : 'Next Question →'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
