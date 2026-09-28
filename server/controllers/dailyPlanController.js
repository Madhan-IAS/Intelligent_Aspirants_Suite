const DailyPlan = require('../models/DailyPlan');
const Topic = require('../models/Topic');
const Revision = require('../models/Revision');
const UserTopicProgress = require('../models/UserTopicProgress');

// Simple In-Memory Cache for expensive stats queries
const statsCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// 8-Day Rotation Schedule (mirrors planner.tsx ROTATION_SCHEDULE)
const ROTATION_SCHEDULE = [
  { gsPaper: 'GS I', optPaper: 'Sociology Paper I' },
  { gsPaper: 'GS II', optPaper: 'Sociology Paper II' },
  { gsPaper: 'GS III', optPaper: 'Sociology Paper I' },
  { gsPaper: 'GS IV', optPaper: 'Sociology Paper II' },
  { gsPaper: 'GS I', optPaper: 'Sociology Paper I' },
  { gsPaper: 'GS II', optPaper: 'Sociology Paper II' },
  { gsPaper: 'GS III', optPaper: 'Sociology Paper I' },
  { gsPaper: 'GS IV', optPaper: 'Sociology Paper II' },
];

// Helper: Get IST date string
const getTodayIST = () => {
  const now = new Date();
  const utcOffset = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utcOffset + (3600000 * 5.5));
  const yyyy = istTime.getFullYear();
  const mm = String(istTime.getMonth() + 1).padStart(2, '0');
  const dd = String(istTime.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Helper: Get rotation day index (0-7)
const getRotationDay = () => {
  const now = new Date();
  const utcOffset = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utcOffset + (3600000 * 5.5));
  const start = new Date(2026, 6, 28); // July 28, 2026 reference date
  const todayLocal = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
  const diffTime = todayLocal.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.abs(diffDays) % 8;
};

// GET /api/daily-plan/today — Core auto-assignment engine
exports.getTodayPlan = async (req, res) => {
  try {
    const today = getTodayIST();
    const userId = req.user.id;

    // Check if plan already exists for today
    let plan = await DailyPlan.findOne({ userId, date: today })
      .populate('gsTopicIds', 'title chapter subjectName paper completed status completedAt _id')
      .populate('optTopicIds', 'title chapter subjectName paper completed status completedAt _id')
      .populate('revisionTopicId', 'title chapter subjectName paper completed status completedAt _id');

    // If plan exists with >= 15 GS topics, skip re-generation — just apply progress overlay and return
    if (plan && (plan.gsTopicIds || []).length >= 15) {
      plan = plan.toObject();
      // Apply user-specific progress
      const allPlanTopics = [...(plan.gsTopicIds || []), ...(plan.optTopicIds || []), ...(plan.revisionTopicId ? [plan.revisionTopicId] : [])];
      if (allPlanTopics.length > 0) {
        const ptIds = allPlanTopics.map(t => t._id);
        const uProg = await UserTopicProgress.find({ userId, topicId: { $in: ptIds } });
        const pMap = new Map(uProg.map(p => [p.topicId.toString(), p]));
        const apply = (t) => { if (!t) return t; const p = pMap.get(t._id.toString()); return { ...t, status: p ? p.status : 'Pending', completed: p ? p.completed : false, completedAt: p ? p.completedAt : null }; };
        plan.gsTopicIds = (plan.gsTopicIds || []).map(apply);
        plan.optTopicIds = (plan.optTopicIds || []).map(apply);
        if (plan.revisionTopicId) plan.revisionTopicId = apply(plan.revisionTopicId);
      }
      return res.json(plan);
    }

    const rotationIndex = getRotationDay();
    const rotation = ROTATION_SCHEDULE[rotationIndex];

    // Get all topic IDs user has already completed
    const completedProgress = await UserTopicProgress.find({ userId, completed: true }).select('topicId');
    const completedTopicIds = completedProgress.map(p => p.topicId);

    // 1. Pick next 15 uncompleted GS topics (per THIS user)
    let gsTopics = await Topic.find({
      paper: rotation.gsPaper,
      _id: { $nin: completedTopicIds }
    }).sort({ _id: 1 }).limit(15).select('_id');

    if (gsTopics.length < 15) {
      const extraGs = await Topic.find({
        paper: { $in: ['GS I', 'GS II', 'GS III', 'GS IV'] },
        _id: { $nin: [...gsTopics.map(t => t._id), ...completedTopicIds] }
      }).sort({ _id: 1 }).limit(15 - gsTopics.length).select('_id');
      gsTopics = [...gsTopics, ...extraGs];
    }

    // 2. Pick next 8 uncompleted Sociology topics (per THIS user)
    let optTopics = await Topic.find({
      tags: rotation.optPaper,
      _id: { $nin: completedTopicIds }
    }).sort({ _id: 1 }).limit(8).select('_id');

    if (optTopics.length < 8) {
      const extraForOpt = await Topic.find({
        paper: { $in: ['GS I', 'GS II', 'GS III', 'GS IV'] },
        _id: { $nin: [...gsTopics.map(t => t._id), ...completedTopicIds] }
      }).sort({ _id: 1 }).limit(8 - optTopics.length).select('_id');
      optTopics = [...optTopics, ...extraForOpt];
    }

    // 3. Pick 1 oldest completed topic needing revision (user-specific)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const revisionProgress = await UserTopicProgress.findOne({
      userId,
      completed: true,
      updatedAt: { $lt: fourteenDaysAgo }
    }).sort({ updatedAt: 1 }).select('topicId');
    const revisionTopic = revisionProgress ? { _id: revisionProgress.topicId } : null;

    if (plan) {
      // Upgrade existing plan
      plan.gsTopicIds = gsTopics.map(t => t._id);
      plan.optTopicIds = optTopics.map(t => t._id);
      if (revisionTopic) plan.revisionTopicId = revisionTopic._id;
      await plan.save();
    } else {
      // Create new plan
      plan = await DailyPlan.create({
        userId,
        date: today,
        gsPaper: rotation.gsPaper,
        optionalPaper: rotation.optPaper,
        gsTopicIds: gsTopics.map(t => t._id),
        optTopicIds: optTopics.map(t => t._id),
        revisionTopicId: revisionTopic ? revisionTopic._id : undefined,
        rotationDay: rotationIndex,
        completed: false
      });
    }

    // Re-fetch with populated fields
    plan = await DailyPlan.findById(plan._id)
      .populate('gsTopicIds', 'title chapter subjectName paper completed status completedAt _id')
      .populate('optTopicIds', 'title chapter subjectName paper completed status completedAt _id')
      .populate('revisionTopicId', 'title chapter subjectName paper completed status completedAt _id')
      .lean();

    // Map user progress to populated topics
    const allPopulatedTopics = [
      ...(plan.gsTopicIds || []),
      ...(plan.optTopicIds || []),
      ...(plan.revisionTopicId ? [plan.revisionTopicId] : [])
    ];

    if (allPopulatedTopics.length > 0) {
      const topicIds = allPopulatedTopics.map(t => t._id);
      const userProgress = await UserTopicProgress.find({ userId, topicId: { $in: topicIds } });
      const progressMap = new Map(userProgress.map(p => [p.topicId.toString(), p]));

      const applyProgress = (t) => {
        if (!t) return t;
        const p = progressMap.get(t._id.toString());
        return {
          ...t,
          status: p ? p.status : 'Pending',
          completed: p ? p.completed : false,
          completedAt: p ? p.completedAt : null
        };
      };

      plan.gsTopicIds = (plan.gsTopicIds || []).map(applyProgress);
      plan.optTopicIds = (plan.optTopicIds || []).map(applyProgress);
      if (plan.revisionTopicId) {
        plan.revisionTopicId = applyProgress(plan.revisionTopicId);
      }
    }

    res.json(plan);
  } catch (error) {
    console.error('Error getting daily plan:', error);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/daily-plan/toggle-topic/:topicId — Toggle topic completion (user-specific)
exports.toggleTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const today = getTodayIST();
    const userId = req.user.id;

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    // Toggle user-specific progress
    let progress = await UserTopicProgress.findOne({ userId, topicId: topic._id });
    const isNowCompleted = progress ? !progress.completed : true;

    progress = await UserTopicProgress.findOneAndUpdate(
      { userId, topicId: topic._id },
      {
        $set: {
          completed: isNowCompleted,
          status: isNowCompleted ? 'Completed' : 'Pending',
          completedAt: isNowCompleted ? new Date() : null
        }
      },
      { upsert: true, new: true }
    );

    if (isNowCompleted) {
      const existingRev = await Revision.findOne({ userId, topicId: topic._id, status: 'Pending' });
      if (!existingRev) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1);
        await Revision.create({ userId, topicId: topic._id, interval: 1, scheduledDate: nextDate, status: 'Pending' });
      }
    } else {
      await Revision.deleteMany({ userId, topicId: topic._id, status: 'Pending' });
    }

    // Check plan completion for this user
    const plan = await DailyPlan.findOne({ userId, date: today });
    if (plan) {
      const allTopicIds = [...plan.gsTopicIds, ...plan.optTopicIds];
      if (plan.revisionTopicId) allTopicIds.push(plan.revisionTopicId);
      const userProgressAll = await UserTopicProgress.find({ userId, topicId: { $in: allTopicIds } });
      const allDone = allTopicIds.length > 0 && allTopicIds.every(tid => userProgressAll.some(p => p.topicId.toString() === tid.toString() && p.completed));
      if (plan.completed !== allDone) {
        plan.completed = allDone;
        await plan.save();
      }
    }

    // Clear user stats cache across the platform
    statsCache.delete(userId);

    const mergedTopic = { ...topic.toObject(), status: progress.status, completed: progress.completed, completedAt: progress.completedAt };
    res.json(mergedTopic);
  } catch (error) {
    console.error('Error toggling topic:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/daily-plan/stats — Study pace & streak calculator (user-specific)
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check Memory Cache First
    if (statsCache.has(userId)) {
      const cached = statsCache.get(userId);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.json(cached.data);
      }
    }

    const totalTopics = await Topic.countDocuments();
    const completedTopics = await UserTopicProgress.countDocuments({ userId, completed: true });
    const remainingTopics = totalTopics - completedTopics;
    const topicsPerDay = 23;
    const estimatedDays = Math.ceil(remainingTopics / topicsPerDay);

    // Study streak
    const today = getTodayIST();
    let streak = 0;
    let checkDate = new Date();
    const utcOffset = checkDate.getTime() + (checkDate.getTimezoneOffset() * 60000);
    let istCheck = new Date(utcOffset + (3600000 * 5.5));

    for (let i = 0; i < 365; i++) {
      const dateStr = `${istCheck.getFullYear()}-${String(istCheck.getMonth() + 1).padStart(2, '0')}-${String(istCheck.getDate()).padStart(2, '0')}`;
      const plan = await DailyPlan.findOne({ userId, date: dateStr });

      if (i === 0) {
        if (plan) {
          const topicIds = [...plan.gsTopicIds, ...plan.optTopicIds];
          const anyDone = await UserTopicProgress.findOne({ userId, topicId: { $in: topicIds }, completed: true });
          if (anyDone) streak++;
        }
      } else {
        if (plan && plan.completed) {
          streak++;
        } else {
          break;
        }
      }
      istCheck.setDate(istCheck.getDate() - 1);
    }

    const result = {
      totalTopics,
      completedTopics,
      remainingTopics,
      topicsPerDay,
      estimatedDays,
      streak,
      completionPercent: totalTopics > 0 ? ((completedTopics / totalTopics) * 100).toFixed(1) : '0.0'
    };

    // Save to Cache
    statsCache.set(userId, { timestamp: Date.now(), data: result });

    res.json(result);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/daily-plan/spectrum-stats — SPECTRUM dimension progress (user-specific)
exports.getSpectrumStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const SUBJECT_TO_DIMENSION = {
      'Society': 'Society', 'Social Issues': 'Society', 'Social Justice': 'Society',
      'Polity': 'Polity & Governance', 'Governance': 'Polity & Governance', 'Constitution': 'Polity & Governance', 'Internal Security': 'Polity & Governance',
      'Economy': 'Economy', 'Economic Development': 'Economy', 'Infrastructure': 'Economy',
      'Art & Culture': 'Culture & History', 'Ancient History': 'Culture & History', 'Medieval History': 'Culture & History', 'Modern History': 'Culture & History', 'Post Independence': 'Culture & History', 'World History': 'Culture & History', 'Indian Culture': 'Culture & History',
      'Science & Technology': 'Technology & Science',
      'International Relations': 'International Relations',
      'Geography': 'Environment & Geography', 'Physical Geography': 'Environment & Geography', 'Human Geography': 'Environment & Geography', 'Indian Geography': 'Environment & Geography', 'Environment': 'Environment & Geography', 'Disaster Management': 'Environment & Geography', 'Ecology': 'Environment & Geography', 'Biodiversity': 'Environment & Geography',
      'Ethics': 'Ethics & Integrity', 'Aptitude': 'Ethics & Integrity', 'Integrity': 'Ethics & Integrity',
    };

    const DIMENSION_SHORT = {
      'Society': 'S', 'Polity & Governance': 'P', 'Economy': 'E',
      'Culture & History': 'C', 'Technology & Science': 'T',
      'International Relations': 'R', 'Environment & Geography': 'U',
      'Ethics & Integrity': 'M'
    };

    // Get total topics per subjectName (global)
    const totalAgg = await Topic.aggregate([
      { $group: { _id: '$subjectName', total: { $sum: 1 } } }
    ]);

    // Get user's completed topics, joined with Topic to get subjectName
    const completedByUser = await UserTopicProgress.find({ userId, completed: true }).select('topicId');
    const completedTopicIds = completedByUser.map(p => p.topicId);
    const completedTopics = await Topic.find({ _id: { $in: completedTopicIds } }).select('subjectName');

    // Count completions per subjectName
    const completedCounts = {};
    completedTopics.forEach(t => {
      completedCounts[t.subjectName] = (completedCounts[t.subjectName] || 0) + 1;
    });

    // Merge into dimensions
    const dims = {};
    Object.values(DIMENSION_SHORT).forEach(letter => {
      const fullName = Object.keys(DIMENSION_SHORT).find(k => DIMENSION_SHORT[k] === letter);
      dims[fullName] = { total: 0, completed: 0, letter };
    });

    totalAgg.forEach(item => {
      const dimension = SUBJECT_TO_DIMENSION[item._id];
      if (dimension && dims[dimension]) {
        dims[dimension].total += item.total;
      }
    });

    Object.entries(completedCounts).forEach(([subjectName, count]) => {
      const dimension = SUBJECT_TO_DIMENSION[subjectName];
      if (dimension && dims[dimension]) {
        dims[dimension].completed += count;
      }
    });

    const spectrum = Object.entries(dims).map(([name, data]) => ({
      dimension: name,
      letter: data.letter,
      total: data.total,
      completed: data.completed,
      percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));

    const ORDER = ['S', 'P', 'E', 'C', 'T', 'R', 'U', 'M'];
    spectrum.sort((a, b) => ORDER.indexOf(a.letter) - ORDER.indexOf(b.letter));

    res.json({ spectrum });
  } catch (error) {
    console.error('Error getting SPECTRUM stats:', error);
    res.status(500).json({ message: error.message });
  }
};
