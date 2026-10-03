// Tier hierarchy: foundation < aspirant < topper
export const TIER_LEVELS: Record<string, number> = {
    foundation: 1,
    aspirant: 2,
    topper: 3,
};

export const TIER_INFO: Record<string, { name: string; price: string; priceNum: number; annualPrice: string; annualPriceNum: number; annualSavings: string; tagline: string; color: string; icon: string }> = {
    foundation: {
        name: 'Foundation',
        price: '₹99',
        priceNum: 99,
        annualPrice: '₹999',
        annualPriceNum: 999,
        annualSavings: 'Save ₹189',
        tagline: 'Start your UPSC journey',
        color: '#f59e0b',
        icon: '🥉',
    },
    aspirant: {
        name: 'Aspirant',
        price: '₹199',
        priceNum: 199,
        annualPrice: '₹1999',
        annualPriceNum: 1999,
        annualSavings: 'Save ₹389',
        tagline: 'Deepen your preparation',
        color: '#3b82f6',
        icon: '🥈',
    },
    topper: {
        name: 'Topper',
        price: '₹299',
        priceNum: 299,
        annualPrice: '₹2999',
        annualPriceNum: 2999,
        annualSavings: 'Save ₹589',
        tagline: 'Complete exam mastery',
        color: '#8b5cf6',
        icon: '🥇',
    },
    'notes-addon': {
        name: 'IASuite Notes Plan',
        price: '₹49',
        priceNum: 49,
        annualPrice: '₹499',
        annualPriceNum: 499,
        annualSavings: 'Save ₹89',
        tagline: 'Unlock all premium study notes',
        color: '#0ea5e9',
        icon: '📝',
    }
};

// Maps each route to the minimum tier required to access it
export const ROUTE_TIER_MAP: Record<string, string> = {
    // Foundation tier (₹99)
    '/': 'foundation',
    '/profile': 'foundation',
    '/planner': 'foundation',
    '/notifications': 'foundation',
    '/leaderboard': 'foundation',
    '/book-list': 'foundation',
    '/gs/GS I': 'foundation',
    '/gs/GS II': 'foundation',
    '/gs/GS III': 'foundation',
    '/gs/GS IV': 'foundation',

    // Aspirant tier (₹199)
    '/gs/Sociology': 'aspirant',
    '/csat': 'aspirant',
    '/revision': 'aspirant',
    '/mind-maps': 'aspirant',
    '/current-affairs': 'aspirant',
    '/answer-gallery': 'aspirant',
    '/flashcards': 'aspirant',

    // Topper tier (₹299)
    '/quiz': 'topper',
    '/quiz-history': 'topper',
    '/topic-quiz': 'topper',
    '/answers': 'topper',
    '/pyqs': 'topper',
    '/essays': 'topper',
    '/directives-quotes': 'topper',
};

// Helper: check if a user tier has access to a given route
export function hasAccess(user: any, route: string): boolean {
    if (route === '/ai-notes') return !!user?.hasNotesAccess || user?.role === 'admin';
    const tier = user?.subscriptionTier || 'foundation';
    const requiredTier = ROUTE_TIER_MAP[route];
    // If route not in map, allow access (e.g. /admin, /subscription, etc.)
    if (!requiredTier) return true;
    return (TIER_LEVELS[tier] || 0) >= (TIER_LEVELS[requiredTier] || 0);
}

// Helper: get the required tier name for a route
export function getRequiredTier(route: string): string {
    return ROUTE_TIER_MAP[route] || 'foundation';
}

// Features list per tier (for display purposes)
export const TIER_FEATURES: Record<string, string[]> = {
    foundation: [
        'Dashboard & Profile',
        'GS I, II, III, IV Syllabus Checklist',
        'Daily Planner',
        'Leaderboard',
        'Book List',
        'Notifications',
    ],
    aspirant: [
        'Everything in Foundation +',
        'Sociology Optional',
        'CSAT (Paper II)',
        '3-5-7 Spaced Revision',
        'Mind Maps',
        'Answer Gallery',
        'Current Affairs',
        'Flashcards',
    ],
    topper: [
        'Everything in Aspirant +',
        'Daily Quiz (AI-generated)',
        'Topic Quiz',
        'Answer Writing',
        'PYQ Bank',
        'Essay Lab',
        'Directives & Quotes',
        'AI Analysis & Insights',
    ],
};
