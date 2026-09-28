const Topic = require('../models/Topic');
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const PYQ = require('../models/PYQ');
const CurrentAffair = require('../models/CurrentAffair');
const UserTopicProgress = require('../models/UserTopicProgress');

exports.getTopicsBySubject = async (req, res) => {
  try {
    let subjectId = req.params.subjectId;

    // If not a valid ObjectId, treat it as a subject name
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      let subject = await Subject.findOne({ name: subjectId });
      if (!subject) {
        subject = await Subject.create({ name: subjectId, description: 'Auto-generated' });
      }
      subjectId = subject._id;
    }

    const topics = await Topic.find({ subjectId }).lean();

    if (req.user) {
      const topicIds = topics.map(t => t._id);
      const userProgress = await UserTopicProgress.find({ userId: req.user.id, topicId: { $in: topicIds } });
      const progressMap = new Map(userProgress.map(p => [p.topicId.toString(), p]));

      topics.forEach(t => {
        const p = progressMap.get(t._id.toString());
        t.status = p ? p.status : 'Pending';
        t.completed = p ? p.completed : false;
        t.completedAt = p ? p.completedAt : null;
      });
    }

    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTopicById = async (req, res) => {
  try {
    const topicDoc = await Topic.findById(req.params.id).populate('relatedTopics').lean();
    if (!topicDoc) return res.status(404).json({ message: 'Topic not found' });

    const topic = { ...topicDoc };
    if (req.user) {
      const progress = await UserTopicProgress.findOne({ userId: req.user.id, topicId: topic._id });
      topic.status = progress ? progress.status : 'Pending';
      topic.completed = progress ? progress.completed : false;
      topic.completedAt = progress ? progress.completedAt : null;
    }

    // Fetch related entities for the 360° Knowledge Hub
    // 1. PYQs linked by topicId OR matching topic title text
    const relatedPYQs = await PYQ.find({
      $or: [
        { topicId: topic._id },
        { question: { $regex: topic.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
      ]
    }).sort({ year: -1 });

    // 2. Current Affairs linked by relatedTopicIds OR matching tags/title
    const titleKeywords = topic.title.split(' ').filter(w => w.length > 3).join('|');
    const relatedCurrentAffairs = await CurrentAffair.find({
      $or: [
        { relatedTopicIds: topic._id },
        { tags: { $in: [topic.paper, topic.subjectName, topic.title].filter(Boolean) } },
        ...(titleKeywords ? [{ title: { $regex: titleKeywords, $options: 'i' } }] : [])
      ]
    }).sort({ date: -1 });

    res.json({
      topic,
      relatedPYQs,
      relatedCurrentAffairs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTopic = async (req, res) => {
  try {
    let subjectId = req.body.subjectId;
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      let subject = await Subject.findOne({ name: subjectId });
      if (!subject) {
        subject = await Subject.create({ name: subjectId, description: 'Auto-generated' });
      }
      req.body.subjectId = subject._id;
    }

    const topic = new Topic(req.body);
    const savedTopic = await topic.save();
    res.status(201).json(savedTopic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const Revision = require('../models/Revision');

const autoScheduleRevision = async (userId, topicId) => {
  if (!userId) return;
  try {
    const existing = await Revision.findOne({ userId, topicId, status: 'Pending' });
    if (!existing) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      await Revision.create({
        userId,
        topicId,
        interval: 1,
        scheduledDate: nextDate,
        status: 'Pending'
      });
    }
  } catch (err) {
    console.error('Error auto-scheduling revision:', err);
  }
};

const autoCancelRevision = async (userId, topicId) => {
  if (!userId) return;
  try {
    await Revision.deleteMany({ userId, topicId, status: 'Pending' });
  } catch (err) {
    console.error('Error auto-canceling revision:', err);
  }
};

exports.getRecentTopics = async (req, res) => {
  try {
    if (!req.user) return res.json([]);

    const recentProgress = await UserTopicProgress.find({
      userId: req.user.id,
      $or: [{ completed: true }, { status: 'In Progress' }, { completedAt: { $ne: null } }]
    })
      .sort({ completedAt: -1, updatedAt: -1 })
      .populate('topicId')
      .limit(5);

    let recent = recentProgress.map(p => ({
      ...p.topicId.toObject(),
      status: p.status,
      completed: p.completed,
      completedAt: p.completedAt
    }));

    if (recent.length < 5) {
      const fallback = await Topic.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();

      const fallbackIds = fallback.map(t => t._id);
      const fbProgress = await UserTopicProgress.find({ userId: req.user.id, topicId: { $in: fallbackIds } });
      const pMap = new Map(fbProgress.map(p => [p.topicId.toString(), p]));

      const mergedFallback = fallback.map(t => {
        const p = pMap.get(t._id.toString());
        return {
          ...t,
          status: p ? p.status : 'Pending',
          completed: p ? p.completed : false,
          completedAt: p ? p.completedAt : null
        };
      });
      return res.json(mergedFallback);
    }

    res.json(recent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleTopicCheckbox = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    let progress = await UserTopicProgress.findOne({ userId: req.user.id, topicId: topic._id });
    const isNowCompleted = progress ? !progress.completed : true;

    progress = await UserTopicProgress.findOneAndUpdate(
      { userId: req.user.id, topicId: topic._id },
      {
        $set: {
          completed: isNowCompleted,
          status: isNowCompleted ? 'Completed' : 'Pending',
          completedAt: isNowCompleted ? new Date() : null
        }
      },
      { upsert: true, new: true }
    );

    if (progress.completed) {
      await autoScheduleRevision(req.user.id, topic._id);
    } else {
      await autoCancelRevision(req.user.id, topic._id);
    }

    const mergedTopic = { ...topic.toObject(), status: progress.status, completed: progress.completed, completedAt: progress.completedAt };
    res.json(mergedTopic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTopicStatus = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const isCompleted = req.body.status === 'Completed';
    const progress = await UserTopicProgress.findOneAndUpdate(
      { userId: req.user.id, topicId: req.params.id },
      {
        $set: {
          status: req.body.status,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null
        }
      },
      { upsert: true, new: true }
    );

    const topic = await Topic.findById(req.params.id).lean();

    if (isCompleted) {
      await autoScheduleRevision(req.user.id, req.params.id);
    } else {
      await autoCancelRevision(req.user.id, req.params.id);
    }

    const mergedTopic = { ...topic, status: progress.status, completed: progress.completed, completedAt: progress.completedAt };
    res.json(mergedTopic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Auto-set completedAt when completed status changes
    if (updateData.completed === true || updateData.status === 'Completed') {
      updateData.completedAt = new Date();
    } else if (updateData.completed === false || updateData.status === 'Pending') {
      updateData.completedAt = null;
    }

    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(topic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
