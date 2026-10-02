const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
router.get('/', subjectController.getSubjects);
router.get('/:id', subjectController.getSubjectById);
router.post('/', auth, adminAuth, subjectController.createSubject);

module.exports = router;
