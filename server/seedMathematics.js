/**
 * seedMathematics.js
 * 
 * Clears and seeds the complete Mathematics optional syllabus
 * (Paper I and Paper II) into MongoDB.
 * 
 * Run: node seedMathematics.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

// ═══════════════════════════════════════════════════════════════
// PAPER I — MATHEMATICS
// ═══════════════════════════════════════════════════════════════

const paper1Topics = [

    // ── UNIT 1: LINEAR ALGEBRA ─────────────────────────────────

    "Vector Spaces — vector spaces over a field, subspaces, linear combinations, span, linear dependence/independence, basis, dimension, coordinates relative to a basis.",
    "Vector Spaces (Theorems) — basis extension theorem, dimension theorem, dimension of sum of subspaces, dimension of intersection, quotient spaces.",
    "Linear Transformations — linear transformation, kernel/null space, range/image, rank, nullity.",
    "Linear Transformations (Theorems) — rank-nullity theorem, one-one & onto transformations, isomorphisms.",
    "Linear Transformations (Matrix) — matrix associated with transformation, change of basis, similarity transformation, coordinate representation.",
    "Matrices — operations (addition, multiplication, transpose, inverse, elementary operations).",
    "Matrices (Rank) — row rank, column rank, rank by reduction, rank using minors.",
    "Matrices (Systems of Equations) — homogeneous/non-homogeneous equations, consistency, Gaussian elimination, Gauss-Jordan method, rank criterion.",
    "Matrices (Determinants) — properties, expansion, cofactors, minors, applications.",
    "Eigenvalues & Eigenvectors — characteristic equation, characteristic polynomial, eigenvalues, eigenvectors, eigenspaces.",
    "Diagonalisation — diagonalizable matrices, conditions for diagonalisation, similar matrices, spectral properties.",
    "Cayley-Hamilton Theorem — statement, verification, applications (powers of matrices, finding inverse).",
    "Canonical Forms — characteristic polynomial, minimal polynomial, Jordan canonical form, rational canonical form, similarity.",

    // ── UNIT 2: CALCULUS ───────────────────────────────────────

    "Real Numbers & Functions — supremum, infimum, completeness, Archimedean property.",
    "Sequences — convergence, divergence, monotonic sequences, bounded sequences, Cauchy sequences, subsequences, Bolzano-Weierstrass theorem.",
    "Limits & Continuity — limits of functions, one-sided limits, infinite limits, limits at infinity.",
    "Continuity — continuous functions, uniform continuity, discontinuities, Intermediate Value Theorem.",
    "Differentiability — derivatives, higher derivatives, derivative of composite functions, Leibniz theorem.",
    "Mean Value Theorems — Rolle's theorem, Lagrange Mean Value Theorem, Cauchy Mean Value Theorem.",
    "Applications of Differentiation — increasing/decreasing functions, maxima, minima, concavity, convexity, points of inflection.",
    "Taylor & Maclaurin Series — Taylor/Maclaurin theorems, expansions, remainder terms (Lagrange, Cauchy), applications to approximation/limits.",
    "Functions of Several Variables — partial derivatives, higher-order partial derivatives, total derivative, chain rule.",
    "Homogeneous Functions — Euler's theorem and its applications.",
    "Maxima and Minima (Several Variables) — critical points, local maxima/minima, saddle points, Hessian matrix, second derivative test.",
    "Lagrange Multipliers — constrained extrema, multiple constraints.",
    "Multiple Integrals (Double) — iterated integrals, change of order, change of variables.",
    "Multiple Integrals (Triple) — Cartesian, cylindrical, and spherical coordinates.",
    "Applications of Multiple Integrals — area, volume, centre of mass, moments.",
    "Vector Calculus — scalar/vector fields, gradient, divergence, curl.",
    "Directional Derivatives — directional derivative, normal derivative, tangent plane.",
    "Integral Theorems — Green's theorem, Gauss divergence theorem, Stokes' theorem.",
    "Applications of Vector Calculus — flux, circulation, surface integrals, line integrals, volume integrals.",

    // ── UNIT 3: ANALYTICAL GEOMETRY ────────────────────────────

    "Two-Dimensional Geometry — straight lines (Cartesian, parametric, normal form), pair of straight lines, angle between lines, distance to line.",
    "Two-Dimensional Geometry — circle (general/standard equations, tangent, normal, chord, pair of tangents).",
    "Conic Sections (Parabola) — standard forms, tangent, normal, chord, parametric coordinates, subtangent, subnormal.",
    "Conic Sections (Ellipse) — standard equation, eccentricity, foci, directrices, tangents, normals, chords, parametric equations.",
    "Conic Sections (Hyperbola) — standard equation, conjugate hyperbola, asymptotes, tangents, normals, chords, parametric form.",
    "Three-Dimensional Geometry (Plane) — equation of plane, normal/intercept forms, angle between planes, distance from point to plane.",
    "Three-Dimensional Geometry (Straight Line) — Cartesian, vector, parametric, symmetric forms, angle between lines, shortest distance.",
    "Three-Dimensional Geometry (Line & Plane) — angle between line and plane, intersection, coplanarity.",
    "Sphere — standard/general equations, tangent plane, normal, plane section, great circle, intersection of spheres, orthogonal spheres.",
    "Quadrics — general second-degree equation, classification, ellipsoid, paraboloid, hyperboloid, cone, cylinder.",

    // ── UNIT 4: ORDINARY DIFFERENTIAL EQUATIONS ────────────────

    "First-Order ODE — basic concepts (order, degree, general/particular solutions).",
    "First-Order Equations — variable separable, homogeneous, reducible to homogeneous, exact equations, integrating factor, linear, Bernoulli equations.",
    "Orthogonal Trajectories — definition, Cartesian trajectories, polar trajectories, finding orthogonal trajectories.",
    "Higher-Order Linear ODE — constant coefficients, complementary function, particular integral.",
    "Auxiliary Equation — distinct roots, repeated roots, complex roots.",
    "Particular Integrals — polynomial, exponential, trigonometric, and mixed RHS functions.",
    "Cauchy-Euler Equations — homogeneous Cauchy-Euler, non-homogeneous equations, transformation methods.",
    "Variation of Parameters — fundamental solutions, particular solution, variation of parameters formula.",
    "Simultaneous Differential Equations — first-order simultaneous equations, linear systems, elimination method, matrix approach.",
    "Partial Differential Equations (PDE) — formation of PDE, general solution, complete/singular integral for first-order PDE.",
    "Lagrange's Linear PDE — auxiliary equations, complete solution.",
    "Higher-Order PDE — linear PDE, homogeneous PDE, constant coefficient PDE.",

    // ── UNIT 5: DYNAMICS & STATICS ─────────────────────────────

    "Dynamics (Kinematics) — motion in a straight line, motion in a plane, position, velocity, acceleration.",
    "Projectile Motion — equation of trajectory, max height, range, time of flight, horizontal/inclined projection.",
    "Newton's Laws — momentum, impulse, variable forces, equations of motion.",
    "Work, Energy & Power — work, kinetic/potential energy, conservation of energy, work-energy theorem, power.",
    "Motion Under Central Forces — central force, angular momentum, conservation laws, planetary motion, Kepler's laws, inverse-square law.",
    "Statics (Forces) — resultant, equilibrium, resolution of forces.",
    "Statics (Moments) — moment of force, couple, Varignon's theorem.",
    "Friction — laws of friction, limiting friction, angle of friction, equilibrium with friction.",
    "Centre of Gravity — centre of gravity, centroid, lamina.",
    "Virtual Work — principle of virtual work, applications."
];

// ═══════════════════════════════════════════════════════════════
// PAPER II — MATHEMATICS
// ═══════════════════════════════════════════════════════════════

const paper2Topics = [

    // ── UNIT 1: REAL ANALYSIS ──────────────────────────────────

    "Real Number System — completeness, least upper bound property, greatest lower bound, Archimedean property, density of rationals, intervals.",
    "Sequences (Convergence) — limit, bounded, monotone, Cauchy sequences.",
    "Sequences (Subsequences) — limit points, Bolzano-Weierstrass theorem.",
    "Infinite Series (Positive-Term) — comparison test, limit comparison, ratio test, root test, integral test.",
    "Infinite Series (Other) — alternating series, absolute/conditional convergence.",
    "Power Series — radius of convergence, interval of convergence.",
    "Continuity — continuity at point/interval, uniform continuity, sequential criterion, intermediate value property.",
    "Continuity Theorems — Extreme Value, Intermediate Value, Uniform continuity theorem.",
    "Differentiability — definition, derivative, Taylor theorem, maxima/minima, convexity.",
    "Mean Value Theorems — Rolle, Lagrange, Cauchy.",
    "Riemann Integration — partitions, upper/lower sums, integrability, properties of integral.",
    "Riemann Integration Theorems — fundamental theorem of calculus, mean value theorem for integrals.",
    "Improper Integrals — infinite intervals, infinite discontinuities, convergence tests.",

    // ── UNIT 2: COMPLEX ANALYSIS ───────────────────────────────

    "Complex Numbers — complex plane, modulus, argument, polar form, De Moivre's theorem, roots.",
    "Complex Functions — functions of complex variable, limits, continuity, differentiability.",
    "Analytic Functions — analyticity, Cauchy-Riemann equations, harmonic functions, harmonic conjugates.",
    "Complex Integration — contour, contour integration, Cauchy's theorem, Cauchy's integral formula.",
    "Power Series (Complex) — Taylor series, Laurent series, annulus of convergence.",
    "Singularities — removable, pole, essential, isolated singularities, classification.",
    "Residues — calculation, residue theorem, contour integration using residues.",
    "Applications of Residues — real definite integrals, improper integrals, trigonometric integrals.",

    // ── UNIT 3: LINEAR ALGEBRA (ADVANCED TOPICS) ───────────────

    "Vector Spaces (Review) — spaces, subspaces, basis, dimension, quotient spaces.",
    "Linear Transformations (Review) — kernel, range, rank, nullity, rank-nullity theorem, matrix representation.",
    "Matrices (Review) — rank, determinants, inverse, transformations, systems of equations.",
    "Eigenvalues & Eigenvectors (Review) — characteristic eq, eigenspaces, diagonalisation.",
    "Inner Product Spaces — inner product, norm, orthogonality, orthogonal sets, orthonormal basis.",
    "Inner Product Inequalities — Cauchy-Schwarz, triangle inequality, Bessel's inequality.",
    "Orthogonal Transformations — orthogonal matrices/transformations, projections, Gram-Schmidt orthogonalisation.",
    "Quadratic Forms — matrix representation, rank, index, signature, positive/negative definite forms, reduction to canonical form.",
    "Quadratic Forms Theorems — Sylvester's law of inertia, eigenvalue criterion.",

    // ── UNIT 4: LINEAR PROGRAMMING ─────────────────────────────

    "Linear Programming Problems (LPP) — objective function, constraints, feasible region, basic feasible/optimal solution.",
    "Graphical Method — two-variable LPP, feasible region, corner-point method, unbounded/infeasible solutions.",
    "Simplex Method — standard form, slack/surplus/artificial variables, simplex tableau, pivoting, optimality condition.",
    "Duality — primal/dual problem, construction, weak/strong duality, complementary slackness.",
    "Transportation Problems — initial basic feasible solution, North-West Corner, Least-cost, Vogel's approximation, optimality test.",
    "Assignment Problems — Hungarian method, balanced/unbalanced assignment, maximisation problems.",

    // ── UNIT 5: NUMERICAL ANALYSIS ─────────────────────────────

    "Roots of Equations — Bisection, Regula Falsi, Newton-Raphson, Secant method.",
    "Roots of Equations (Study) — convergence, error, rate of convergence, iteration.",
    "Interpolation (Finite Differences) — forward, backward, central differences.",
    "Interpolation (Formulae) — Newton forward/backward interpolation, Lagrange interpolation.",
    "Numerical Differentiation — first/second derivative, difference formulae, error estimation.",
    "Numerical Integration — Trapezoidal rule, Simpson's 1/3 rule, Simpson's 3/8 rule, error terms, composite rules.",
    "Numerical Solution of ODE — Euler method, Modified Euler, Runge-Kutta methods, Predictor-corrector methods.",

    // ── UNIT 6: MECHANICS & FLUID DYNAMICS ─────────────────────

    "Mechanics (Particle Dynamics) — motion, velocity, acceleration, Newton's laws, momentum.",
    "Mechanics (Work-Energy) — work, energy, conservation laws, potential energy.",
    "Mechanics (Central Forces) — central force, angular momentum, orbits, Kepler's laws.",
    "Rigid Body Dynamics — centre of mass, moment of inertia, angular momentum, rotational motion, torque, principal axes.",
    "Fluid Dynamics (Basic Concepts) — fluid, pressure, density, velocity field, streamlines.",
    "Fluid Dynamics (Equations) — continuity equation, Euler's equation, Bernoulli's equation.",
    "Fluid Dynamics (Flow) — irrotational, rotational, potential flow, vorticity.",
    "Fluid Dynamics (Applications) — flow through pipes, sources and sinks, vortex motion."
];

// ═══════════════════════════════════════════════════════════════
// SEEDER
// ═══════════════════════════════════════════════════════════════

// Incorporating the 15-layer formula/concept checklist requirements for Mathematics
const emptyMathNotes = {
    definitions: '',
    fundamentalConcepts: '',
    importantFormulae: '',
    standardResults: '',
    theorems: '',
    proofs: '',
    standardProblems: '',
    advancedProblems: '',
    tricksAndShortcuts: '',
    pyqs: '',
    mixedConceptQuestions: '',
    commonMistakes: '',
    timeSavingApproaches: '',
    revisionFormulaSheet: ''
};

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        let mathsSubject = await Subject.findOne({ name: 'Mathematics' });
        if (!mathsSubject) {
            console.log('Mathematics subject not found, creating it...');
            mathsSubject = await Subject.create({ name: 'Mathematics', description: 'Mathematics Optional Subject' });
        }

        const subjectId = mathsSubject._id;

        // Clear existing Mathematics topics
        const deleteRes = await Topic.deleteMany({ subjectId });
        console.log(`Deleted ${deleteRes.deletedCount} existing Mathematics topics.`);

        const topicsToInsert = [];

        paper1Topics.forEach(title => {
            topicsToInsert.push({
                title,
                tags: ['Mathematics Paper I', 'Mathematics'],
                difficulty: 'Medium',
                subjectId,
                status: 'Pending',
                notes: { ...emptyMathNotes } // Using specific Mathematics schema structure
            });
        });

        paper2Topics.forEach(title => {
            topicsToInsert.push({
                title,
                tags: ['Mathematics Paper II', 'Mathematics'],
                difficulty: 'Medium',
                subjectId,
                status: 'Pending',
                notes: { ...emptyMathNotes } // Using specific Mathematics schema structure
            });
        });

        // NOTE: If Topic schema rigidly enforces the generic 'notes' fields (theory, caseStudies, etc.) 
        // and ignores others, we will use the standard schema to prevent validation errors.
        const standardNotes = {
            theory: '',
            definitions: '',
            examples: '',
            caseStudies: '', // For math: could hold derivations
            statistics: '',
            committeeReports: '', // Probably unused for math
            supremeCourtCases: '', // Probably unused
            governmentSchemes: '', // Probably unused
            wayForward: '',
            diagrams: '',
            mindMaps: '',
            currentAffairs: '',
            pyqs: '',
            valueAddition: ''
        };

        // To be safe regarding Mongoose schema validation, applying standardNotes
        topicsToInsert.forEach(t => t.notes = standardNotes);

        const inserted = await Topic.insertMany(topicsToInsert);
        console.log(`\n✅ Successfully seeded ${inserted.length} Mathematics topics into MongoDB!`);
        console.log(`  - Mathematics Paper I: ${paper1Topics.length} topics`);
        console.log(`  - Mathematics Paper II: ${paper2Topics.length} topics`);
        console.log(`  - Total: ${paper1Topics.length + paper2Topics.length} topics`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
