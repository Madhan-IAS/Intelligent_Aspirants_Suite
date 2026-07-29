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
