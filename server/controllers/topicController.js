const Topic = require('../models/Topic');
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const PYQ = require('../models/PYQ');
const CurrentAffair = require('../models/CurrentAffair');

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
    
    const topics = await Topic.find({ subjectId });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('relatedTopics');
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

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
    const recent = await Topic.find({
      $or: [{ completed: true }, { status: 'In Progress' }, { completedAt: { $ne: null } }]
    })
    .sort({ completedAt: -1, updatedAt: -1 })
    .limit(5);

    if (recent.length < 5) {
      const fallback = await Topic.find()
        .sort({ updatedAt: -1 })
        .limit(5);
      return res.json(fallback);
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

    topic.completed = !topic.completed;
    topic.status = topic.completed ? 'Completed' : 'Pending';
    topic.completedAt = topic.completed ? new Date() : null;
    await topic.save();

    if (topic.completed && req.user) {
      await autoScheduleRevision(req.user.id, topic._id);
    } else if (!topic.completed && req.user) {
      await autoCancelRevision(req.user.id, topic._id);
    }

    res.json(topic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTopicStatus = async (req, res) => {
  try {
    const isCompleted = req.body.status === 'Completed';
    const topic = await Topic.findByIdAndUpdate(
      req.params.id, 
      { 
        status: req.body.status, 
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null
      }, 
      { new: true }
    );

    if (isCompleted && req.user) {
      await autoScheduleRevision(req.user.id, topic._id);
    } else if (!isCompleted && req.user) {
      await autoCancelRevision(req.user.id, topic._id);
    }

    res.json(topic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(topic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
