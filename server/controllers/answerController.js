const Answer = require('../models/Answer');

exports.getAnswers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const answers = await Answer.find({ userId: req.user.id })
      .populate('pyqId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveAnswer = async (req, res) => {
  try {
    const answer = new Answer({
      ...req.body,
      userId: req.user.id
    });
    const savedAnswer = await answer.save();
    res.status(201).json(savedAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAnswersForPYQ = async (req, res) => {
  try {
    const answers = await Answer.find({ userId: req.user.id, pyqId: req.params.pyqId }).sort({ createdAt: -1 });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.upvoteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    if (!answer.upvotedBy) answer.upvotedBy = [];

    if (answer.upvotedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already upvoted this answer.' });
    }

    answer.upvotedBy.push(req.user.id);
    answer.upvotes = (answer.upvotes || 0) + 1;
    await answer.save();

    const User = require('../models/User');
    await User.findByIdAndUpdate(answer.userId, { $inc: { reputation: 10 } });

    res.json({ message: 'Upvoted successfully', upvotes: answer.upvotes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findOne({ _id: req.params.id, userId: req.user.id });
    if (!answer) return res.status(404).json({ message: 'Answer not found or not yours' });
    await Answer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAnswer = async (req, res) => {
  try {
    const answer = await Answer.findOne({ _id: req.params.id, userId: req.user.id });
    if (!answer) return res.status(404).json({ message: 'Answer not found or not yours' });

    const { content, wordCount, timeTaken, status } = req.body;
    if (content !== undefined) answer.content = content;
    if (wordCount !== undefined) answer.wordCount = wordCount;
    if (timeTaken !== undefined) answer.timeTaken = timeTaken;
    if (status !== undefined) answer.status = status;

    const updated = await answer.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
