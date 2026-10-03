const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public-ish (auth required) routes
router.get('/', auth, noteController.getAllNotes);
router.get('/all', auth, adminAuth, noteController.getAllNotesAdmin);
router.get('/:id', auth, noteController.getNoteById);

// Admin-only routes
router.post('/', auth, adminAuth, noteController.createNote);
router.put('/:id', auth, adminAuth, noteController.updateNote);
router.delete('/:id', auth, adminAuth, noteController.deleteNote);

module.exports = router;
