const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');

// Recommend quotes based on question text tokens & subject category
router.get('/recommend', async (req, res) => {
  try {
    const { subject, question } = req.query;
    
    // 1. Get subject category mapping
    let category = 'Polity';
    if (subject) {
      const sub = subject.toUpperCase();
      if (sub.includes('GS I')) category = 'Social Issues';
      else if (sub.includes('GS II')) category = 'Polity';
      else if (sub.includes('GS III')) category = 'Economy';
      else if (sub.includes('GS IV')) category = 'Ethics';
      else if (sub.includes('SOCIOLOGY')) category = 'Social Issues';
    }

    // 2. Tokenize question text
    const stopWords = new Set([
      'discuss', 'analyze', 'examine', 'critically', 'comment', 'evaluate', 'explain', 'elucidate', 'substantiate',
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about', 'into', 'over', 'after',
      'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
      'role', 'impact', 'influence', 'question', 'mains', 'upsc', 'explain', 'how', 'why', 'where', 'when',
      'write', 'answer', 'with', 'respect', 'to'
    ]);

    const tokens = (question || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && !stopWords.has(token));

    let quotes = [];
    if (tokens.length > 0) {
      const searchString = tokens.join(' ');
      try {
        quotes = await Quote.find(
          { $text: { $search: searchString } },
          { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .limit(5);
      } catch (err) {
        // Fallback to regex match
        const orConditions = tokens.map(t => ({ text: new RegExp(t, 'i') }));
        quotes = await Quote.find({ $or: orConditions }).limit(5);
      }
    }

    // 3. Fill up to 5 quotes from category if less than 5 matched tokens
    if (quotes.length < 5) {
      const needed = 5 - quotes.length;
      const excludeIds = quotes.map(q => q._id);
      
      const additional = await Quote.aggregate([
        { $match: { category, _id: { $nin: excludeIds } } },
        { $sample: { size: needed } }
      ]);
      
      quotes = [...quotes, ...additional];
    }

    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quotes, optionally filtered by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) {
      filter.category = category;
    }
    const quotes = await Quote.find(filter).sort({ index: 1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
