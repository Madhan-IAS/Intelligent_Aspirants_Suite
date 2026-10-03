// ─── Coverage Matrix: Full 46-subject UPSC breakdown ───

export interface CoverageEntry {
    subject: string;
    ncerts: string;
    standardBooks: string;
    additionalSources: string;
    coverage: '🟢 Complete' | '🟢 Dynamic' | '🔴 Essential';
}

export const COVERAGE_MATRIX: CoverageEntry[] = [
    { subject: 'Ancient Indian History', ncerts: 'Class 6 History; Class 11 Themes in Indian History-I', standardBooks: 'R.S. Sharma – India\'s Ancient Past', additionalSources: 'Tamil Nadu State Board Ancient History — selective', coverage: '🟢 Complete' },
    { subject: 'Medieval Indian History', ncerts: 'Class 7 History; Class 11 Themes in Indian History-II', standardBooks: 'Satish Chandra – Medieval India', additionalSources: 'Tamil Nadu State Board Medieval History — selective', coverage: '🟢 Complete' },
    { subject: 'Modern Indian History', ncerts: 'Class 8 History; Class 12 Themes in Indian History-III', standardBooks: 'Spectrum – A Brief History of Modern India', additionalSources: 'Bipan Chandra – India\'s Struggle for Independence — selective', coverage: '🟢 Complete' },
    { subject: 'Art & Culture', ncerts: 'Class 11 – An Introduction to Indian Art-I & II', standardBooks: 'Nitin Singhania – Indian Art & Culture', additionalSources: 'CCRT material + UNESCO + Ministry of Culture current affairs', coverage: '🟢 Complete' },
    { subject: 'World History', ncerts: 'Class 9–10 History; Class 11–12 relevant chapters', standardBooks: 'Arjun Dev / NCERT World History', additionalSources: 'Norman Lowe – Mastering Modern World History — selective', coverage: '🟢 Complete' },
    { subject: 'Indian Society', ncerts: 'Class 11 Sociology – Introducing Sociology; Class 12 Sociology – Indian Society; Class 12 Social Change and Development in India', standardBooks: 'Ram Ahuja – Indian Society', additionalSources: 'IGNOU Sociology selective material', coverage: '🟢 Complete' },
    { subject: 'Physical Geography', ncerts: 'Class 6–12 Geography', standardBooks: 'G.C. Leong – Certificate Physical & Human Geography', additionalSources: 'NCERT Class 11 Fundamentals of Physical Geography + Atlas', coverage: '🟢 Complete' },
    { subject: 'Indian Geography', ncerts: 'Class 6–12 Geography', standardBooks: 'NCERT Class 11 India Physical Environment + Class 12 India: People and Economy', additionalSources: 'Oxford / Orient BlackSwan School Atlas', coverage: '🟢 Complete' },
    { subject: 'World Geography', ncerts: 'Class 6–12 Geography', standardBooks: 'G.C. Leong', additionalSources: 'Oxford/Orient BlackSwan Atlas + NCERT', coverage: '🟢 Complete' },
    { subject: 'Economic Geography', ncerts: 'Class 11–12 Geography', standardBooks: 'NCERT + G.C. Leong', additionalSources: 'Current agriculture/resource maps + Economic Survey', coverage: '🟢 Complete' },
    { subject: 'Indian Polity & Constitution', ncerts: 'Class 9–12 Political Science', standardBooks: 'M. Laxmikanth – Indian Polity', additionalSources: 'D.D. Basu – Introduction to the Constitution of India — selective', coverage: '🟢 Complete' },
    { subject: 'Governance', ncerts: 'Class 11–12 Political Science', standardBooks: 'Laxmikanth relevant chapters', additionalSources: '2nd ARC Reports + PIB + government reports', coverage: '🟢 Complete' },
    { subject: 'Social Justice', ncerts: 'Class 11–12 Political Science/Sociology', standardBooks: 'Laxmikanth relevant sections', additionalSources: '2nd ARC + government schemes + Economic Survey', coverage: '🟢 Complete' },
    { subject: 'Indian Economy', ncerts: 'Class 9–12 Economics', standardBooks: 'Sanjiv Verma – Indian Economy OR Ramesh Singh – Indian Economy', additionalSources: 'Economic Survey + Union Budget + RBI Annual Report', coverage: '🟢 Complete' },
    { subject: 'Agriculture & Economy', ncerts: 'Class 9–12 Economics + Class 10/12 Geography', standardBooks: 'Economy standard book + NCERT Geography', additionalSources: 'Economic Survey + Agriculture Ministry + current affairs', coverage: '🟢 Complete' },
    { subject: 'Environment & Ecology', ncerts: 'Class 6–10 Science; Class 11 Biology; Class 12 Biology selective', standardBooks: 'Shankar IAS – Environment', additionalSources: 'NCERT Biology + MoEFCC + IPCC + Convention reports + current affairs', coverage: '🟢 Complete' },
    { subject: 'Biodiversity', ncerts: 'Class 11–12 Biology', standardBooks: 'Shankar IAS Environment', additionalSources: 'IUCN + WWF/UNEP/Convention material + current affairs', coverage: '🟢 Complete' },
    { subject: 'Climate Change', ncerts: 'Class 11 Geography + Biology', standardBooks: 'Shankar IAS', additionalSources: 'IPCC + UNFCCC + India\'s NDC + government reports', coverage: '🟢 Complete' },
    { subject: 'General Science – Biology', ncerts: 'Class 6–10 Science + Class 11–12 Biology', standardBooks: 'NCERTs themselves are primary', additionalSources: 'Current science developments', coverage: '🟢 Complete' },
    { subject: 'General Science – Physics', ncerts: 'Class 6–10 Science + Class 11–12 Physics selective', standardBooks: 'NCERT Physics', additionalSources: 'Current applications of physics', coverage: '🟢 Complete' },
    { subject: 'General Science – Chemistry', ncerts: 'Class 6–10 Science + Class 11–12 Chemistry selective', standardBooks: 'NCERT Chemistry', additionalSources: 'Current applications', coverage: '🟢 Complete' },
    { subject: 'Biotechnology', ncerts: 'Class 12 Biology', standardBooks: 'NCERT Biology', additionalSources: 'Biotechnology current affairs + DBT', coverage: '🟢 Complete' },
    { subject: 'Space Technology', ncerts: 'Class 11 Physics selective', standardBooks: 'NCERT Physics', additionalSources: 'ISRO + Department of Space + current affairs', coverage: '🟢 Complete' },
    { subject: 'Nuclear Technology', ncerts: 'Class 12 Physics', standardBooks: 'NCERT Physics', additionalSources: 'DAE + BARC + current affairs', coverage: '🟢 Complete' },
    { subject: 'ICT / Computers', ncerts: 'Class 11–12 Computer Science selective', standardBooks: 'Basic computer/ICT concepts', additionalSources: 'Current affairs', coverage: '🟢 Complete' },
    { subject: 'AI / Robotics / Emerging Tech', ncerts: 'NCERT foundation only', standardBooks: 'No single static book required', additionalSources: 'Current affairs + government technology documents', coverage: '🟢 Dynamic' },
    { subject: 'Nanotechnology', ncerts: 'Class 12 Chemistry/Physics/Biology selective', standardBooks: 'No separate book required', additionalSources: 'Current affairs + government/scientific institutions', coverage: '🟢 Dynamic' },
    { subject: 'Defence Technology', ncerts: 'NCERT Physics/Science foundation', standardBooks: 'No conventional textbook necessary', additionalSources: 'DRDO + PIB + current affairs', coverage: '🟢 Dynamic' },
    { subject: 'Cyber Security', ncerts: 'Basic ICT foundation', standardBooks: 'No heavy textbook necessary', additionalSources: 'CERT-In + MeitY + current affairs', coverage: '🟢 Dynamic' },
    { subject: 'Internal Security', ncerts: 'Class 11–12 Political Science foundation', standardBooks: 'Ashok Kumar – Internal Security', additionalSources: 'MHA + ARC + current affairs', coverage: '🟢 Complete' },
    { subject: 'Disaster Management', ncerts: 'Geography + Environment NCERTs', standardBooks: 'NDMA Guidelines', additionalSources: '2nd ARC + Sendai Framework + current affairs', coverage: '🟢 Complete' },
    { subject: 'International Relations', ncerts: 'Class 12 Political Science – Contemporary World Politics', standardBooks: 'Pavneet Singh – International Relations', additionalSources: 'MEA + current affairs', coverage: '🟢 Complete' },
    { subject: 'International Organisations', ncerts: 'Class 12 Political Science', standardBooks: 'Pavneet Singh relevant chapters', additionalSources: 'UN, IMF, World Bank, WTO, WHO, etc. official material', coverage: '🟢 Complete' },
    { subject: 'India & Neighbourhood', ncerts: 'Class 12 Political Science', standardBooks: 'Pavneet Singh', additionalSources: 'MEA + current affairs', coverage: '🟢 Complete' },
    { subject: 'India & Major Powers', ncerts: 'Class 12 Political Science', standardBooks: 'Pavneet Singh', additionalSources: 'MEA + current affairs', coverage: '🟢 Complete' },
    { subject: 'Global Groupings', ncerts: 'Class 12 Political Science', standardBooks: 'Pavneet Singh', additionalSources: 'G20, BRICS, SCO, QUAD, ASEAN, BIMSTEC, IORA etc. current affairs', coverage: '🟢 Complete' },
    { subject: 'Ethics – GS4', ncerts: 'Class 11–12 Psychology/Sociology selective', standardBooks: 'Lexicon for Ethics', additionalSources: '2nd ARC – Ethics in Governance', coverage: '🟢 Complete' },
    { subject: 'Ethics Thinkers', ncerts: 'Philosophy-related NCERT/introductory material', standardBooks: 'Lexicon + selected philosophical sources', additionalSources: 'UPSC PYQs', coverage: '🟢 Complete' },
    { subject: 'Case Studies – GS4', ncerts: '—', standardBooks: 'Lexicon case studies', additionalSources: 'UPSC PYQs + practice cases', coverage: '🟢 Complete' },
    { subject: 'Essay', ncerts: 'All NCERTs', standardBooks: 'No single mandatory book', additionalSources: 'UPSC PYQs + Essay practice + current affairs', coverage: '🟢 Complete' },
    { subject: 'CSAT – Comprehension', ncerts: 'Class 6–10 English', standardBooks: 'CSAT practice book', additionalSources: 'UPSC PYQs', coverage: '🟢 Complete' },
    { subject: 'CSAT – Mathematics', ncerts: 'Class 6–10 Mathematics', standardBooks: 'R.S. Aggarwal Quantitative Aptitude — selective', additionalSources: 'UPSC PYQs', coverage: '🟢 Complete' },
    { subject: 'CSAT – Reasoning', ncerts: 'Class 6–10 basic mathematics/logic', standardBooks: 'R.S. Aggarwal Reasoning — selective', additionalSources: 'UPSC PYQs', coverage: '🟢 Complete' },
    { subject: 'CSAT – Data Interpretation', ncerts: 'Class 6–10 Mathematics', standardBooks: 'CSAT practice material', additionalSources: 'UPSC PYQs', coverage: '🟢 Complete' },
    { subject: 'CSAT – Decision Making', ncerts: '—', standardBooks: 'Previous UPSC papers', additionalSources: 'Practice questions', coverage: '🟢 Complete' },
    { subject: 'Current Affairs', ncerts: '—', standardBooks: '—', additionalSources: 'The Hindu / Indian Express + PIB + PRS + Yojana + Kurukshetra + Economic Survey + Budget + relevant reports', coverage: '🔴 Essential' },
    { subject: 'UPSC PYQs', ncerts: '—', standardBooks: '—', additionalSources: 'Official UPSC PYQs — Prelims + Mains, preferably 10–15 years', coverage: '🔴 Essential' },
];

// ─── Core Bookshelf: 30-book physical book stack ───

export interface Book {
    id: number;
    title: string;
    purpose: string;
}

export interface BookCategory {
    category: string;
    icon: string;
    color: string;
    books: Book[];
}

export const BOOK_LIST: BookCategory[] = [
    {
        category: 'History',
        icon: 'time-outline',
        color: '#f59e0b',
        books: [
            { id: 1, title: 'NCERT Class 6–10 History', purpose: 'Ancient → Medieval → Modern foundation' },
            { id: 2, title: 'NCERT Class 11 Themes in Indian History I', purpose: 'Ancient' },
            { id: 3, title: 'NCERT Class 11 Themes in Indian History II', purpose: 'Medieval' },
            { id: 4, title: 'NCERT Class 12 Themes in Indian History III', purpose: 'Modern' },
            { id: 5, title: 'R.S. Sharma – India\'s Ancient Past', purpose: 'Ancient depth' },
            { id: 6, title: 'Satish Chandra – Medieval India', purpose: 'Medieval depth' },
            { id: 7, title: 'Spectrum – A Brief History of Modern India', purpose: 'Modern History core' },
            { id: 8, title: 'Nitin Singhania – Indian Art & Culture', purpose: 'Art & Culture' },
        ],
    },
    {
        category: 'Geography',
        icon: 'globe-outline',
        color: '#10b981',
        books: [
            { id: 9, title: 'NCERT Class 6–12 Geography', purpose: 'Complete geography foundation' },
            { id: 10, title: 'G.C. Leong – Certificate Physical & Human Geography', purpose: 'Physical / World Geography' },
            { id: 11, title: 'Oxford / Orient BlackSwan Atlas', purpose: 'Map work' },
        ],
    },
    {
        category: 'Polity',
        icon: 'flag-outline',
        color: '#3b82f6',
        books: [
            { id: 12, title: 'M. Laxmikanth – Indian Polity', purpose: 'Polity core' },
            { id: 13, title: 'D.D. Basu – Introduction to Constitution', purpose: 'Constitutional depth — selective' },
        ],
    },
    {
        category: 'Economy',
        icon: 'cash-outline',
        color: '#8b5cf6',
        books: [
            { id: 14, title: 'NCERT Class 9–12 Economics', purpose: 'Economy foundation' },
            { id: 15, title: 'Sanjiv Verma – Indian Economy', purpose: 'Economy core' },
        ],
    },
    {
        category: 'Science',
        icon: 'flask-outline',
        color: '#06b6d4',
        books: [
            { id: 16, title: 'NCERT Class 6–10 Science', purpose: 'General Science foundation' },
            { id: 17, title: 'NCERT Class 11 Biology', purpose: 'Biology / ecology foundation' },
            { id: 18, title: 'NCERT Class 12 Biology', purpose: 'Biotechnology + advanced biology' },
            { id: 19, title: 'NCERT Class 11–12 Physics', purpose: 'Science / technology foundation — selective' },
            { id: 20, title: 'NCERT Class 11–12 Chemistry', purpose: 'Science foundation — selective' },
        ],
    },
    {
        category: 'Environment',
        icon: 'leaf-outline',
        color: '#22c55e',
        books: [
            { id: 21, title: 'Shankar IAS – Environment', purpose: 'Environment & Ecology' },
        ],
    },
    {
        category: 'Society',
        icon: 'people-outline',
        color: '#ec4899',
        books: [
            { id: 22, title: 'NCERT Class 11–12 Sociology', purpose: 'Society' },
            { id: 23, title: 'Ram Ahuja – Indian Society', purpose: 'Society depth' },
        ],
    },
    {
        category: 'IR & Security',
        icon: 'earth-outline',
        color: '#ef4444',
        books: [
            { id: 24, title: 'Pavneet Singh – International Relations', purpose: 'IR core' },
            { id: 25, title: 'Ashok Kumar – Internal Security', purpose: 'GS3 Security' },
        ],
    },
    {
        category: 'Ethics & Governance',
        icon: 'sparkles-outline',
        color: '#a855f7',
        books: [
            { id: 26, title: 'Lexicon – Ethics', purpose: 'GS4' },
            { id: 27, title: '2nd ARC Reports', purpose: 'Governance + Ethics + Security + Administration' },
            { id: 28, title: 'NDMA Guidelines', purpose: 'Disaster Management' },
        ],
    },
    {
        category: 'Other Essentials',
        icon: 'bookmark-outline',
        color: '#64748b',
        books: [
            { id: 29, title: 'Class 12 Political Science – Contemporary World Politics', purpose: 'IR foundation' },
            { id: 30, title: 'UPSC CSE PYQs (10–15 years)', purpose: 'Final syllabus validation' },
        ],
    },
];
