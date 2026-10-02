const UserTopicProgress = require('../models/UserTopicProgress');
const User = require('../models/User');

exports.getGlobalLeaderboard = async (req, res) => {
    try {
        const User = require('../models/User');

        const pipeline = [
            // 1. Core Exclusion Rules (Phase 11 Shadow-Ban Logic)
            { $match: { role: { $ne: 'admin' }, isShadowBanned: { $ne: true } } },

            // 2. Fetch Topic Progresses (10 XP each)
            {
                $lookup: {
                    from: 'usertopicprogresses',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'progress_records'
                }
            },

            // 3. Fetch Focus Sessions (1 XP per minute)
            {
                $lookup: {
                    from: 'focussessions',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'focus_records'
                }
            },

            // 4. Fetch Evaluated Answers (25 XP evaluated, +100 XP featured)
            {
                $lookup: {
                    from: 'answers',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'answer_records'
                }
            },

            // 5. Calculate Base Raw Stats
            {
                $addFields: {
                    completedTopicsList: {
                        $filter: {
                            input: '$progress_records',
                            as: 'p',
                            cond: { $eq: ['$$p.completed', true] }
                        }
                    },
                    totalFocusTime: { $sum: '$focus_records.durationMinutes' },
                    rawAnswers: {
                        $filter: {
                            input: '$answer_records',
                            as: 'a',
                            cond: { $eq: ['$$a.status', 'Evaluated'] }
                        }
                    },
                    featuredAnswers: {
                        $filter: {
                            input: '$answer_records',
                            as: 'a',
                            cond: { $eq: ['$$a.isFeatured', true] }
                        }
                    }
                }
            },

            // 6. Aggregate Raw XP Values
            {
                $addFields: {
                    topicsXP: { $multiply: [{ $size: '$completedTopicsList' }, 10] },
                    focusXP: '$totalFocusTime',
                    answersXP: { $multiply: [{ $size: '$rawAnswers' }, 25] },
                    featuredXP: { $multiply: [{ $size: '$featuredAnswers' }, 100] }
                }
            },

            // 7. Dynamic Base XP & Multipliers
            {
                $addFields: {
                    baseXP: {
                        $add: ['$topicsXP', '$focusXP', '$answersXP', '$featuredXP']
                    },
                    // Continuous Psychological Driver: Streak Factor
                    streakMultiplier: {
                        $switch: {
                            branches: [
                                { case: { $gte: [{ $ifNull: ['$currentStreak', 0] }, 30] }, then: 2.0 },
                                { case: { $gte: [{ $ifNull: ['$currentStreak', 0] }, 10] }, then: 1.5 },
                                { case: { $gte: [{ $ifNull: ['$currentStreak', 0] }, 4] }, then: 1.2 }
                            ],
                            default: 1.0
                        }
                    }
                }
            },

            // 8. Final Power Score Calculation
            {
                $project: {
                    _id: 1,
                    name: 1,
                    targetYear: 1,
                    optionalSubject: 1,
                    currentStreak: { $ifNull: ['$currentStreak', 0] },
                    streakMultiplier: 1,
                    score: { $floor: { $multiply: ['$baseXP', '$streakMultiplier'] } }
                }
            },

            // 9. Standard Sort & Render Max Top 100
            { $sort: { score: -1, currentStreak: -1, name: 1 } },
            { $limit: 100 }
        ];

        const leaderboard = await User.aggregate(pipeline);
        res.json({ leaderboard });
    } catch (e) {
        console.error('Leaderboard Engine error:', e);
        res.status(500).json({ message: 'Server error compiling the leaderboard rankings' });
    }
}
