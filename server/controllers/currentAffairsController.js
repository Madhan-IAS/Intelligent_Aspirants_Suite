const CurrentAffair = require('../models/CurrentAffair');

exports.getAllCurrentAffairs = async (req, res) => {
  try {
    const articles = await CurrentAffair.find().populate('relatedTopicIds').sort({ date: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getArticlesByTopic = async (req, res) => {
  try {
    const articles = await CurrentAffair.find({ relatedTopicIds: req.params.topicId });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const article = new CurrentAffair(req.body);
    const savedArticle = await article.save();
    res.status(201).json(savedArticle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await CurrentAffair.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleSaveArticle = async (req, res) => {
  try {
    const article = await CurrentAffair.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    article.isSaved = !article.isSaved;
    await article.save();
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

