const UserTopicProgress = require('../models/UserTopicProgress');
const User = require('../models/User');

exports.getGlobalLeaderboard = async (req, res) => {
    try {
        // Aggregate users by completed topics to calculate Gamified XP (1 Topic = 10 XP)
        const pipeline = [
            { $match: { completed: true } },
            {
                $group: {
                    _id: '$userId',
                    completedTopics: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users', // Mongoose collections are pluralized by default
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            { $match: { 'user.role': { $ne: 'admin' } } },
            {
                $project: {
                    _id: 1,
                    name: '$user.name',
                    targetYear: '$user.targetYear',
                    optionalSubject: '$user.optionalSubject',
                    score: { $multiply: ['$completedTopics', 10] }, // Mathematical XP derivation
                }
            },
            { $sort: { score: -1 } },
            { $limit: 50 } // Top 50 Aspirants
        ];

        const leaderboard = await UserTopicProgress.aggregate(pipeline);

        res.json({ leaderboard });
    } catch (e) {
        console.error('Leaderboard Engine error:', e);
        res.status(500).json({ message: 'Server error compiling the leaderboard rankings' });
    }
}
