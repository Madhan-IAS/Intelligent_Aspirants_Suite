const Answer = require('../models/Answer');

exports.getAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ userId: req.user.id }).populate('pyqId').sort({ createdAt: -1 });
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
