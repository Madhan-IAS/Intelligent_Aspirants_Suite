const PYQ = require('../models/PYQ');

exports.getAllPYQs = async (req, res) => {
  try {
    const pyqs = await PYQ.find()
      .populate('subjectId')
      .populate('topicId')
      .sort({ year: -1 });
    res.json(pyqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPYQ = async (req, res) => {
  try {
    const pyq = new PYQ(req.body);
    const savedPYQ = await pyq.save();
    res.status(201).json(savedPYQ);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePYQ = async (req, res) => {
  try {
    const pyq = await PYQ.findByIdAndDelete(req.params.id);
    if (!pyq) {
      return res.status(404).json({ message: 'PYQ not found' });
    }
    res.json({ message: 'PYQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPYQById = async (req, res) => {
  try {
    const pyq = await PYQ.findById(req.params.id)
      .populate('subjectId')
      .populate('topicId');
    if (!pyq) {
      return res.status(404).json({ message: 'PYQ not found' });
    }
    res.json(pyq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

