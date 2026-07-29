const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Flashcard = require('../models/Flashcard');

router.use(auth);

// Get due flashcards for today
router.get('/due', async (req, res) => {
  try {
    const dueCards = await Flashcard.find({
      userId: req.user.id,
      nextReviewDate: { $lte: new Date() }
    }).limit(20); // Batch of 20
    res.json(dueCards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a flashcard
router.post('/', async (req, res) => {
  try {
    const card = new Flashcard({ ...req.body, userId: req.user.id });
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Review a flashcard (Spaced Repetition Logic - SuperMemo-2 simplified)
router.post('/:id/review', async (req, res) => {
  try {
    const { quality } = req.body; // 0 to 5 (0 = blank, 5 = perfect)
    const card = await Flashcard.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!card) return res.status(404).json({ error: 'Card not found' });

    if (quality < 3) {
      card.repetitions = 0;
      card.interval = 1;
    } else {
      if (card.repetitions === 0) card.interval = 1;
      else if (card.repetitions === 1) card.interval = 6;
      else card.interval = Math.round(card.interval * card.easeFactor);
      card.repetitions += 1;
    }

    card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (card.easeFactor < 1.3) card.easeFactor = 1.3;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + card.interval);
    card.nextReviewDate = nextDate;

    await card.save();
    res.json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get flashcards for a specific topic
router.get('/topic/:topicId', async (req, res) => {
  try {
    const cards = await Flashcard.find({
      userId: req.user.id,
      topicId: req.params.topicId
    });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a flashcard
router.delete('/:id', async (req, res) => {
  try {
    const card = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json({ message: 'Flashcard deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
