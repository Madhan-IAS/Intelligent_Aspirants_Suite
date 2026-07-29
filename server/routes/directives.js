const express = require('express');
const router = express.Router();
const Directive = require('../models/Directive');

// Get all directives
router.get('/', async (req, res) => {
  try {
    const directives = await Directive.find({});
    res.json(directives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get directive by name (case-insensitive)
router.get('/:name', async (req, res) => {
  try {
    const directive = await Directive.findOne({ name: new RegExp('^' + req.params.name + '$', 'i') });
    if (!directive) return res.status(404).json({ message: 'Directive not found' });
    res.json(directive);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
