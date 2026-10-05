/**
 * seedMathematics.js
 * 
 * Master Mathematics Framework (63 Major Units)
 * Paper I: 29 Units
 * Paper II: 34 Units
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

// ═══════════════════════════════════════════════════════════════
// PAPER I — MATHEMATICS (29 Units)
// ═══════════════════════════════════════════════════════════════

const PAPER_1_DATA = [
    {
        chapter: "1. Vector Spaces",
        topics: [
            "Vector spaces over a field", "Subspaces", "Linear combinations", "Span", "Linear dependence", "Linear independence", "Basis", "Dimension", "Coordinates relative to a basis",
            "Basis extension theorem", "Dimension theorem", "Dimension of sum of subspaces", "Dimension of intersection", "Quotient spaces",
            "Testing whether a set is a vector space", "Finding span", "Testing independence", "Finding basis", "Finding dimension", "Coordinate transformations"
        ]
    },
    {
        chapter: "2. Linear Transformations",
        topics: [
            "Linear transformation", "Kernel/null space", "Range/image", "Rank (Linear Transformation)", "Nullity",
            "Rank-nullity theorem", "Applications of Rank-nullity", "One-one transformations", "Onto transformations", "Isomorphisms",
            "Matrix associated with a linear transformation", "Change of basis", "Similarity transformation", "Coordinate representation"
        ]
    },
    {
        chapter: "3. Matrices",
        topics: [
            "Matrix Addition", "Matrix Multiplication", "Matrix Transpose", "Matrix Inverse", "Elementary operations",
            "Row rank", "Column rank", "Rank by reduction", "Rank using minors",
            "Homogeneous equations", "Non-homogeneous equations", "Consistency", "Gaussian elimination", "Gauss-Jordan method", "Rank criterion",
            "Determinants Properties", "Determinant Expansion", "Cofactors", "Minors", "Applications of Determinants"
        ]
    },
    {
        chapter: "4. Eigenvalues & Eigenvectors",
        topics: [
            "Characteristic equation", "Characteristic polynomial", "Eigenvalues", "Eigenvectors", "Eigenspaces",
            "Diagonalizable matrices", "Conditions for diagonalisation", "Similar matrices", "Spectral properties",
            "Cayley-Hamilton Theorem Statement", "Cayley-Hamilton Verification", "Applications of Cayley-Hamilton", "Finding powers of matrices", "Finding inverse matrices"
        ]
    },
    {
        chapter: "5. Canonical Forms",
        topics: [
            "Characteristic polynomial (Canonical)", "Minimal polynomial", "Jordan canonical form", "Rational canonical form", "Similarity (Canonical)",
            "Finding canonical form", "Determining diagonalizability", "Finding minimal polynomial", "Matrix powers (Canonical)"
        ]
    },
    {
        chapter: "6. Real Numbers & Functions",
        topics: [
            "Supremum", "Infimum", "Completeness", "Archimedean property",
            "Convergence (Sequences)", "Divergence (Sequences)", "Monotonic sequences", "Bounded sequences", "Cauchy sequences", "Subsequences", "Bolzano-Weierstrass theorem"
        ]
    },
    {
        chapter: "7. Limits & Continuity",
        topics: [
            "Limit of functions", "One-sided limits", "Infinite limits", "Limits at infinity",
            "Continuous functions", "Uniform continuity", "Discontinuities", "Intermediate Value Theorem",
            "Extreme Value Theorem", "Intermediate Value Theorem (Proof)", "Uniform continuity theorem"
        ]
    },
    {
        chapter: "8. Differentiability",
        topics: [
            "Differentiability (Calculus)", "Higher derivatives", "Derivative of composite functions", "Leibniz theorem",
            "Rolle's theorem", "Lagrange Mean Value Theorem", "Cauchy Mean Value Theorem",
            "Increasing/decreasing functions", "Maxima", "Minima", "Concavity", "Convexity", "Points of inflection"
        ]
    },
    {
        chapter: "9. Taylor & Maclaurin Series",
        topics: [
            "Taylor theorem", "Maclaurin theorem", "Taylor expansion", "Remainder terms", "Lagrange remainder", "Cauchy remainder",
            "Approximation", "Limits (Series)", "Maxima/minima (Series)", "Series expansions"
        ]
    },
    {
        chapter: "10. Functions of Several Variables",
        topics: [
            "Partial derivatives", "Higher-order partial derivatives", "Total derivative", "Chain rule",
            "Euler's theorem", "Applications of Euler's theorem",
            "Critical points", "Local maxima/minima", "Saddle points", "Hessian matrix", "Second derivative test",
            "Constrained extrema", "Multiple constraints", "Lagrange Multipliers"
        ]
    },
    {
        chapter: "11. Multiple Integrals",
        topics: [
            "Iterated integrals", "Change of order", "Change of variables",
            "Cartesian coordinates (Triple)", "Cylindrical coordinates", "Spherical coordinates",
            "Area", "Volume", "Centre of mass", "Moments"
        ]
    },
    {
        chapter: "12. Vector Calculus",
        topics: [
            "Scalar fields", "Vector fields", "Gradient", "Divergence", "Curl",
            "Directional derivative", "Normal derivative", "Tangent plane",
            "Green's theorem", "Gauss divergence theorem", "Stokes' theorem",
            "Flux", "Circulation", "Surface integrals", "Line integrals", "Volume integrals"
        ]
    },
    {
        chapter: "13. Two-Dimensional Analytical Geometry",
        topics: [
            "Cartesian form (Straight Lines)", "Parametric form (Straight Lines)", "Normal form", "Pair of straight lines", "Angle between lines", "Distance from point to line",
            "General equation of Circle", "Standard equation of Circle", "Tangent (Circle)", "Normal (Circle)", "Chord (Circle)", "Pair of tangents"
        ]
    },
    {
        chapter: "14. Conic Sections",
        topics: [
            "Standard forms (Parabola)", "Tangent (Parabola)", "Normal (Parabola)", "Chord (Parabola)", "Parametric coordinates", "Subtangent", "Subnormal",
            "Standard equation (Ellipse)", "Eccentricity", "Foci", "Directrices", "Tangents (Ellipse)", "Normals (Ellipse)", "Chords (Ellipse)", "Parametric equations (Ellipse)",
            "Standard equation (Hyperbola)", "Conjugate hyperbola", "Asymptotes", "Tangents (Hyperbola)", "Normals (Hyperbola)", "Chords (Hyperbola)", "Parametric form (Hyperbola)"
        ]
    },
    {
        chapter: "15. Three-Dimensional Geometry",
        topics: [
            "Equation of plane", "Normal form (Plane)", "Intercept form", "Angle between planes", "Distance from point to plane",
            "Cartesian form (3D Line)", "Vector form (3D Line)", "Parametric form (3D Line)", "Symmetric form", "Angle between lines (3D)", "Shortest distance",
            "Angle between line and plane", "Intersection (Line/Plane)", "Coplanarity"
        ]
    },
    {
        chapter: "16. Sphere",
        topics: [
            "Standard equation (Sphere)", "General equation (Sphere)", "Tangent plane (Sphere)", "Normal (Sphere)", "Plane section", "Great circle", "Intersection of spheres", "Orthogonal spheres"
        ]
    },
    {
        chapter: "17. Quadrics",
        topics: [
            "General second-degree equation", "Classification of Quadrics", "Ellipsoid", "Paraboloid", "Hyperboloid", "Cone", "Cylinder"
        ]
    },
    {
        chapter: "18. First-Order Differential Equations",
        topics: [
            "Order of DE", "Degree of DE", "General solution", "Particular solution",
            "Variable separable", "Homogeneous DE", "Reducible to homogeneous", "Exact equations", "Integrating factor", "Linear differential equations", "Bernoulli equations"
        ]
    },
    {
        chapter: "19. Orthogonal Trajectories",
        topics: [
            "Definition of Orthogonal Trajectories", "Cartesian trajectories", "Polar trajectories", "Finding orthogonal trajectories"
        ]
    },
    {
        chapter: "20. Higher-Order Differential Equations",
        topics: [
            "Constant coefficients", "Complementary function", "Particular integral",
            "Distinct roots", "Repeated roots", "Complex roots",
            "Polynomial RHS", "Exponential RHS", "Trigonometric RHS", "Mixed functions"
        ]
    },
    {
        chapter: "21. Cauchy-Euler Equations",
        topics: [
            "Homogeneous Cauchy-Euler", "Non-homogeneous Cauchy-Euler equations", "Transformation methods"
        ]
    },
    {
        chapter: "22. Variation of Parameters",
        topics: [
            "Fundamental solutions", "Particular solution (Variation)", "Variation of parameters formula"
        ]
    },
    {
        chapter: "23. Simultaneous Differential Equations",
        topics: [
            "First-order simultaneous equations", "Linear systems of DE", "Elimination method", "Matrix approach to DE"
        ]
    },
    {
        chapter: "24. Partial Differential Equations",
        topics: [
            "Formation of PDE", "General solution (PDE)", "Complete integral", "Singular integral",
            "Lagrange's auxiliary equations", "Complete solution (Lagrange)",
            "Linear PDE", "Homogeneous PDE", "Constant coefficient PDE"
        ]
    },
    {
        chapter: "25. Dynamics",
        topics: [
            "Motion in a straight line", "Motion in a plane", "Position", "Velocity", "Acceleration",
            "Equation of trajectory", "Maximum height", "Range", "Time of flight", "Horizontal projection", "Projection from inclined plane"
        ]
    },
    {
        chapter: "26. Newton's Laws",
        topics: [
            "Newton's laws of motion", "Momentum", "Impulse", "Variable forces", "Equations of motion"
        ]
    },
    {
        chapter: "27. Work, Energy & Power",
        topics: [
            "Work", "Kinetic energy", "Potential energy", "Conservation of energy", "Work-energy theorem", "Power"
        ]
    },
    {
        chapter: "28. Motion Under Central Forces",
        topics: [
            "Central force", "Angular momentum", "Conservation laws (Central forces)", "Planetary motion", "Kepler's laws", "Inverse-square law"
        ]
    },
    {
        chapter: "29. Statics",
        topics: [
            "Resultant", "Equilibrium", "Resolution of forces",
            "Moment of force", "Couple", "Varignon's theorem",
            "Laws of friction", "Limiting friction", "Angle of friction", "Equilibrium with friction",
            "Centre of gravity", "Centroid", "Lamina",
            "Principle of virtual work", "Applications of virtual work"
        ]
    }
];

// ═══════════════════════════════════════════════════════════════
// PAPER II — MATHEMATICS (34 Units)
// ═══════════════════════════════════════════════════════════════

const PAPER_2_DATA = [
    {
        chapter: "1. Real Number System",
        topics: [
            "Completeness (Real Analysis)", "Least upper bound property", "Greatest lower bound", "Archimedean property (Real Analysis)", "Density of rationals", "Intervals"
        ]
    },
    {
        chapter: "2. Sequences",
        topics: [
            "Limit (Sequences)", "Bounded sequences (Real Analysis)", "Monotone sequences", "Cauchy sequences (Real Analysis)",
            "Limit points", "Bolzano-Weierstrass theorem (Sequences)",
            "lim sup", "lim inf"
        ]
    },
    {
        chapter: "3. Infinite Series",
        topics: [
            "Comparison test", "Limit comparison", "Ratio test", "Root test", "Integral test",
            "Alternating series", "Absolute convergence", "Conditional convergence",
            "Power series", "Radius of convergence", "Interval of convergence"
        ]
    },
    {
        chapter: "4. Continuity",
        topics: [
            "Continuity at a point", "Continuity on an interval", "Uniform continuity (Real Analysis)", "Sequential criterion", "Intermediate value property",
            "Extreme Value theorem (Real Analysis)", "Intermediate Value theorem (Real Analysis)", "Uniform continuity theorem (Real Analysis)"
        ]
    },
    {
        chapter: "5. Differentiability",
        topics: [
            "Differentiability (Real Analysis)", "Derivative (Real Analysis)", "Mean value theorems (Real Analysis)", "Rolle's Theorem (Real Analysis)", "Lagrange Theorem (Real Analysis)", "Cauchy Theorem (Real Analysis)",
            "Taylor theorem (Real Analysis)", "Maxima/minima (Real Analysis)", "Convexity", "Mean value applications"
        ]
    },
    {
        chapter: "6. Riemann Integration",
        topics: [
            "Partitions", "Upper sums", "Lower sums", "Riemann integrability", "Properties of Riemann integral",
            "Fundamental theorem of calculus", "Mean value theorem for integrals",
            "Improper Integrals (Infinite intervals)", "Infinite discontinuities", "Convergence tests (Integrals)"
        ]
    },
    {
        chapter: "7. Complex Numbers",
        topics: [
            "Complex plane", "Modulus", "Argument", "Polar form", "De Moivre's theorem", "Roots of complex numbers"
        ]
    },
    {
        chapter: "8. Complex Functions",
        topics: [
            "Functions of complex variable", "Limits (Complex)", "Continuity (Complex)", "Differentiability (Complex)"
        ]
    },
    {
        chapter: "9. Analytic Functions",
        topics: [
            "Analyticity", "Cauchy-Riemann equations", "Harmonic functions", "Harmonic conjugates", "Analytic function construction"
        ]
    },
    {
        chapter: "10. Complex Integration",
        topics: [
            "Contour", "Contour integration", "Cauchy's theorem", "Cauchy's integral formula"
        ]
    },
    {
        chapter: "11. Power Series",
        topics: [
            "Taylor series (Complex)", "Laurent series", "Annulus of convergence", "Singularities (Power Series)"
        ]
    },
    {
        chapter: "12. Singularities",
        topics: [
            "Removable singularity", "Pole singularity", "Essential singularity",
            "Isolated singularities", "Classification of singularities", "Behaviour near singularities"
        ]
    },
    {
        chapter: "13. Residues",
        topics: [
            "Residue definition", "Residue calculation", "Residue theorem", "Contour integration using residues",
            "Real definite integrals", "Improper integrals (Residues)", "Trigonometric integrals"
        ]
    },
    {
        chapter: "14. Vector Spaces",
        topics: [
            "Vector spaces (Paper II)", "Subspaces (Paper II)", "Basis (Paper II)", "Dimension (Paper II)", "Quotient spaces (Paper II)"
        ]
    },
    {
        chapter: "15. Linear Transformations",
        topics: [
            "Kernel (Paper II)", "Range (Paper II)", "Rank (Paper II)", "Nullity (Paper II)", "Rank-nullity theorem (Paper II)", "Matrix representation (Paper II)"
        ]
    },
    {
        chapter: "16. Matrices",
        topics: [
            "Rank (Matrices Paper II)", "Determinants (Paper II)", "Inverse (Paper II)", "Elementary transformations (Paper II)", "Systems of equations (Paper II)"
        ]
    },
    {
        chapter: "17. Eigenvalues & Eigenvectors",
        topics: [
            "Characteristic equation (Paper II)", "Eigenvalues (Paper II)", "Eigenvectors (Paper II)", "Eigenspaces (Paper II)", "Diagonalisation (Paper II)"
        ]
    },
    {
        chapter: "18. Inner Product Spaces",
        topics: [
            "Inner product", "Norm", "Orthogonality", "Orthogonal sets", "Orthonormal basis",
            "Cauchy-Schwarz inequality", "Triangle inequality", "Bessel's inequality"
        ]
    },
    {
        chapter: "19. Orthogonal Transformations",
        topics: [
            "Orthogonal matrices", "Orthogonal transformations", "Projections", "Gram-Schmidt orthogonalisation"
        ]
    },
    {
        chapter: "20. Quadratic Forms",
        topics: [
            "Quadratic forms", "Matrix representation (Quadratic)", "Rank (Quadratic)", "Index", "Signature", "Positive definite forms", "Negative definite forms", "Reduction to canonical form",
            "Sylvester's law of inertia", "Eigenvalue criterion"
        ]
    },
    {
        chapter: "21. Linear Programming Problems",
        topics: [
            "Linear objective function", "Constraints (LPP)", "Feasible region (LPP)", "Basic feasible solution", "Optimal solution"
        ]
    },
    {
        chapter: "22. Graphical Method",
        topics: [
            "Two-variable LPP", "Feasible region (Graphical)", "Corner-point method", "Unbounded solutions", "Infeasible problems"
        ]
    },
    {
        chapter: "23. Simplex Method",
        topics: [
            "Standard form (Simplex)", "Slack variables", "Surplus variables", "Artificial variables", "Simplex tableau", "Pivoting", "Optimality condition"
        ]
    },
    {
        chapter: "24. Duality",
        topics: [
            "Primal problem", "Dual problem", "Construction of dual", "Weak duality", "Strong duality", "Complementary slackness"
        ]
    },
    {
        chapter: "25. Transportation Problems",
        topics: [
            "Transportation table", "Initial basic feasible solution", "North-West Corner method", "Least-cost method", "Vogel's approximation method", "Optimality test"
        ]
    },
    {
        chapter: "26. Assignment Problems",
        topics: [
            "Hungarian method", "Balanced assignment", "Unbalanced assignment", "Maximisation problems"
        ]
    },
    {
        chapter: "27. Numerical Solution of Algebraic & Transcendental Equations",
        topics: [
            "Bisection method", "Regula Falsi", "Newton-Raphson", "Secant method",
            "Convergence (Numerical)", "Error (Numerical)", "Rate of convergence", "Iteration"
        ]
    },
    {
        chapter: "28. Interpolation",
        topics: [
            "Forward differences", "Backward differences", "Central differences",
            "Newton forward interpolation", "Newton backward interpolation", "Lagrange interpolation"
        ]
    },
    {
        chapter: "29. Numerical Differentiation",
        topics: [
            "First derivative (Numerical)", "Second derivative (Numerical)", "Difference formulae", "Error estimation"
        ]
    },
    {
        chapter: "30. Numerical Integration",
        topics: [
            "Trapezoidal rule", "Simpson's 1/3 rule", "Simpson's 3/8 rule",
            "Error terms (Integration)", "Composite rules"
        ]
    },
    {
        chapter: "31. Numerical Solution of ODE",
        topics: [
            "Euler method", "Modified Euler", "Runge-Kutta methods", "Predictor-corrector methods"
        ]
    },
    {
        chapter: "32. Mechanics",
        topics: [
            "Motion (Mechanics)", "Velocity (Mechanics)", "Acceleration (Mechanics)", "Newton's laws (Mechanics)", "Momentum (Mechanics)",
            "Work (Mechanics)", "Energy (Mechanics)", "Conservation laws (Mechanics)", "Potential energy (Mechanics)",
            "Central force (Mechanics)", "Angular momentum (Mechanics)", "Orbits", "Kepler's laws (Mechanics)"
        ]
    },
    {
        chapter: "33. Rigid Body Dynamics",
        topics: [
            "Centre of mass (Rigid Body)", "Moment of inertia", "Angular momentum (Rigid Body)", "Rotational motion", "Torque", "Principal axes"
        ]
    },
    {
        chapter: "34. Fluid Dynamics",
        topics: [
            "Fluid basics", "Pressure", "Density", "Velocity field", "Streamlines",
            "Continuity equation", "Euler's equation", "Bernoulli's equation",
            "Irrotational flow", "Rotational flow", "Potential flow", "Vorticity",
            "Flow through pipes", "Sources and sinks", "Vortex motion"
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

        let mathSubject = await Subject.findOne({ name: 'Mathematics' });
        if (!mathSubject) {
            console.log('Mathematics subject not found, creating it...');
            mathSubject = await Subject.create({ name: 'Mathematics', description: 'Mathematics Optional Subject' });
        }
        const subjectId = mathSubject._id;

        const deleteRes = await Topic.deleteMany({ subjectId });
        console.log(`Deleted ${deleteRes.deletedCount} existing Mathematics topics.`);

        const topicsToInsert = [];
        let p1Count = 0;
        let p2Count = 0;

        PAPER_1_DATA.forEach((chapterObj, cIndex) => {
            const chapterCleanName = chapterObj.chapter;

            chapterObj.topics.forEach((title, tIndex) => {
                p1Count++;
                topicsToInsert.push({
                    subjectId,
                    paper: 'Mathematics',
                    subjectName: 'Mathematics Paper I',
                    chapter: chapterCleanName,
                    heading: chapterCleanName,
                    topicCode: `MATH1-${String(cIndex + 1).padStart(2, '0')}-${String(tIndex + 1).padStart(2, '0')}`,
                    title,
                    tags: ['Mathematics', 'Mathematics Paper I', chapterCleanName],
                    difficulty: 'Medium',
                    status: 'Pending',
                    completed: false,
                    notes: { theory: '' }
                });
            });
        });

        // Make sure we number the codes incrementally continuing from Paper I if wanted, or starting at 1. Let's do 1 for Paper 2.
        PAPER_2_DATA.forEach((chapterObj, cIndex) => {
            const chapterCleanName = chapterObj.chapter;
            const displayNumber = cIndex + 1; // 1 to 34

            chapterObj.topics.forEach((title, tIndex) => {
                p2Count++;
                topicsToInsert.push({
                    subjectId,
                    paper: 'Mathematics',
                    subjectName: 'Mathematics Paper II',
                    chapter: `${displayNumber}. ${chapterCleanName.split('. ')[1] || chapterCleanName}`, // Already has number? chapterObj.chapter has "1. Real.." so this is fine.
                    heading: chapterObj.chapter,
                    topicCode: `MATH2-${String(displayNumber).padStart(2, '0')}-${String(tIndex + 1).padStart(2, '0')}`,
                    title,
                    tags: ['Mathematics', 'Mathematics Paper II', chapterObj.chapter],
                    difficulty: 'Medium',
                    status: 'Pending',
                    completed: false,
                    notes: { theory: '' }
                });
            });
        });

        const inserted = await Topic.insertMany(topicsToInsert);
        console.log(`\n✅ Successfully seeded ${inserted.length} Mathematics topics across 63 Major Units!`);
        console.log(`  - Mathematics Paper I (29 Units): ${p1Count} micro-topics`);
        console.log(`  - Mathematics Paper II (34 Units): ${p2Count} micro-topics`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
