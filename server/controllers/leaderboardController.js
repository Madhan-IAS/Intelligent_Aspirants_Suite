const UserTopicProgress = require('../models/UserTopicProgress');
const User = require('../models/User');

exports.getGlobalLeaderboard = async (req, res) => {
    try {
        // Aggregate directly from Users so even 0 XP users appear
        const pipeline = [
            { $match: { role: { $ne: 'admin' } } },
            {
                $lookup: {
                    from: 'usertopicprogresses',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'progress'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    targetYear: 1,
                    optionalSubject: 1,
                    // Count only elements where `completed: true`
                    completedTopics: {
                        $size: {
                            $filter: {
                                input: '$progress',
                                as: 'p',
                                cond: { $eq: ['$$p.completed', true] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    targetYear: 1,
                    optionalSubject: 1,
                    score: { $multiply: ['$completedTopics', 10] }, // 10 XP per completion
                }
            },
            { $sort: { score: -1, name: 1 } },
            { $limit: 100 } // Top 100
        ];

        const leaderboard = await User.aggregate(pipeline);

        res.json({ leaderboard });
    } catch (e) {
        console.error('Leaderboard Engine error:', e);
        res.status(500).json({ message: 'Server error compiling the leaderboard rankings' });
    }
}
