const express = require('express');
const router = express.Router();
const Directive = require('../models/Directive');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
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

// Admin: Create a single directive
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const directive = new Directive(req.body);
    await directive.save();
    res.status(201).json(directive);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Directive already exists.' });
    res.status(400).json({ message: error.message });
  }
});

// Admin: Update a directive
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const directive = await Directive.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!directive) return res.status(404).json({ message: 'Directive not found' });
    res.json(directive);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Delete a directive
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const directive = await Directive.findByIdAndDelete(req.params.id);
    if (!directive) return res.status(404).json({ message: 'Directive not found' });
    res.json({ message: 'Directive deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
