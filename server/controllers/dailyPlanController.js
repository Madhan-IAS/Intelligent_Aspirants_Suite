const DailyPlan = require('../models/DailyPlan');
const Topic = require('../models/Topic');
const Revision = require('../models/Revision');

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

    // If plan exists with old limit (< 15 GS topics), upgrade it to 15 GS + 8 Optional (23 total)
    if (plan && (plan.gsTopicIds || []).length >= 15) {
      return res.json(plan);
    }

    const rotationIndex = getRotationDay();
    const rotation = ROTATION_SCHEDULE[rotationIndex];

    // 1. Pick next 15 uncompleted GS topics in syllabus order (15 GS + 8 Sociology = 23/day)
    let gsTopics = await Topic.find({
      paper: rotation.gsPaper,
      completed: { $ne: true }
    }).sort({ _id: 1 }).limit(15).select('_id');

    // Fallback: If current GS paper has fewer than 15 uncompleted topics left (e.g. GS IV), pull remaining from any GS paper
    if (gsTopics.length < 15) {
      const extraGs = await Topic.find({
        paper: { $in: ['GS I', 'GS II', 'GS III', 'GS IV'] },
        _id: { $nin: gsTopics.map(t => t._id) },
        completed: { $ne: true }
      }).sort({ _id: 1 }).limit(15 - gsTopics.length).select('_id');
      gsTopics = [...gsTopics, ...extraGs];
    }

    // 2. Pick next 8 uncompleted Sociology topics in syllabus order (if Sociology complete, pull GS topics)
    let optTopics = await Topic.find({
      tags: rotation.optPaper,
      completed: { $ne: true }
    }).sort({ _id: 1 }).limit(8).select('_id');

    // Fallback: If Sociology is 100% completed, allocate these 8 slots to remaining GS topics
    if (optTopics.length < 8) {
      const extraForOpt = await Topic.find({
        paper: { $in: ['GS I', 'GS II', 'GS III', 'GS IV'] },
        _id: { $nin: gsTopics.map(t => t._id) },
        completed: { $ne: true }
      }).sort({ _id: 1 }).limit(8 - optTopics.length).select('_id');
      optTopics = [...optTopics, ...extraForOpt];
    }

    // 3. Pick 1 oldest completed topic needing revision (>14 days since last update)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const revisionTopic = await Topic.findOne({
      completed: true,
      updatedAt: { $lt: fourteenDaysAgo }
    }).sort({ updatedAt: 1 }).select('_id');

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
      .populate('revisionTopicId', 'title chapter subjectName paper completed status completedAt _id');

    res.json(plan);
  } catch (error) {
    console.error('Error getting daily plan:', error);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/daily-plan/toggle-topic/:topicId — Toggle topic completion (syncs with GS pages)
exports.toggleTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const today = getTodayIST();
    const userId = req.user.id;

    // Toggle the actual Topic model (same field GS pages read)
    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    topic.completed = !topic.completed;
    topic.status = topic.completed ? 'Completed' : 'Pending';
    topic.completedAt = topic.completed ? new Date() : null;
    if (topic.completed) {
      topic.revisionDates = [...(topic.revisionDates || []), new Date()];
      // Auto schedule 1st revision for tomorrow
      const existingRev = await Revision.findOne({ userId, topicId: topic._id, status: 'Pending' });
      if (!existingRev) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1);
        await Revision.create({
          userId,
          topicId: topic._id,
          interval: 1,
          scheduledDate: nextDate,
          status: 'Pending'
        });
      }
    } else {
      await Revision.deleteMany({ userId, topicId: topic._id, status: 'Pending' });
    }
    await topic.save();

    // Check if all topics in today's plan are now completed
    const plan = await DailyPlan.findOne({ userId, date: today });
    if (plan) {
      const allTopicIds = [...plan.gsTopicIds, ...plan.optTopicIds];
      if (plan.revisionTopicId) allTopicIds.push(plan.revisionTopicId);

      const allTopics = await Topic.find({ _id: { $in: allTopicIds } }).select('completed');
      const allDone = allTopics.every(t => t.completed);

      if (plan.completed !== allDone) {
        plan.completed = allDone;
        await plan.save();
      }
    }

    res.json(topic);
  } catch (error) {
    console.error('Error toggling topic:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/daily-plan/stats — Study pace & streak calculator
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Topic stats
    const totalTopics = await Topic.countDocuments();
    const completedTopics = await Topic.countDocuments({ completed: true });
    const remainingTopics = totalTopics - completedTopics;
    const topicsPerDay = 23; // 15 GS + 8 Sociology
    const estimatedDays = Math.ceil(remainingTopics / topicsPerDay);

    // Study streak: count consecutive days with completed plans (going backwards from today)
    const today = getTodayIST();
    let streak = 0;
    let checkDate = new Date();
    const utcOffset = checkDate.getTime() + (checkDate.getTimezoneOffset() * 60000);
    let istCheck = new Date(utcOffset + (3600000 * 5.5));

    for (let i = 0; i < 365; i++) {
      const dateStr = `${istCheck.getFullYear()}-${String(istCheck.getMonth() + 1).padStart(2, '0')}-${String(istCheck.getDate()).padStart(2, '0')}`;

      const plan = await DailyPlan.findOne({ userId, date: dateStr });

      if (i === 0) {
        // Today: count if at least 1 topic was completed
        if (plan) {
          const topicIds = [...plan.gsTopicIds, ...plan.optTopicIds];
          const anyDone = await Topic.findOne({ _id: { $in: topicIds }, completed: true });
          if (anyDone) streak++;
          else break;
        } else {
          break;
        }
      } else {
        // Previous days: count if plan existed and was completed
        if (plan && plan.completed) {
          streak++;
        } else {
          break;
        }
      }

      istCheck.setDate(istCheck.getDate() - 1);
    }

    res.json({
      totalTopics,
      completedTopics,
      remainingTopics,
      topicsPerDay,
      estimatedDays,
      streak,
      completionPercent: totalTopics > 0 ? ((completedTopics / totalTopics) * 100).toFixed(1) : '0.0'
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/daily-plan/spectrum-stats — SPECTRUM dimension progress
exports.getSpectrumStats = async (req, res) => {
  try {
    // Map subjectName values to SPECTRUM dimensions
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

    // Aggregate totals per subjectName
    const agg = await Topic.aggregate([
      { $group: { _id: '$subjectName', total: { $sum: 1 }, completed: { $sum: { $cond: ['$completed', 1, 0] } } } }
    ]);

    // Merge into dimensions
    const dims = {};
    Object.values(DIMENSION_SHORT).forEach(letter => {
      const fullName = Object.keys(DIMENSION_SHORT).find(k => DIMENSION_SHORT[k] === letter);
      dims[fullName] = { total: 0, completed: 0, letter };
    });

    agg.forEach(item => {
      const dimension = SUBJECT_TO_DIMENSION[item._id];
      if (dimension && dims[dimension]) {
        dims[dimension].total += item.total;
        dims[dimension].completed += item.completed;
      }
    });

    const spectrum = Object.entries(dims).map(([name, data]) => ({
      dimension: name,
      letter: data.letter,
      total: data.total,
      completed: data.completed,
      percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));

    // Sort by S-P-E-C-T-R-U-M order
    const ORDER = ['S', 'P', 'E', 'C', 'T', 'R', 'U', 'M'];
    spectrum.sort((a, b) => ORDER.indexOf(a.letter) - ORDER.indexOf(b.letter));

    res.json({ spectrum });
  } catch (error) {
    console.error('Error getting SPECTRUM stats:', error);
    res.status(500).json({ message: error.message });
  }
};
