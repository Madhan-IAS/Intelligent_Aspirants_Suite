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

    // Fetch related entities for the Knowledge Hub
    const relatedPYQs = await PYQ.find({ topicId: topic._id });
    const relatedCurrentAffairs = await CurrentAffair.find({ relatedTopicIds: topic._id });

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

exports.toggleTopicCheckbox = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    topic.completed = !topic.completed;
    topic.status = topic.completed ? 'Completed' : 'Pending';
    await topic.save();

    res.json(topic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTopicStatus = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status, completed: req.body.status === 'Completed' }, 
      { new: true }
    );
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
