const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

router.get('/', subjectController.getSubjects);
router.get('/:id', subjectController.getSubjectById);
router.post('/', subjectController.createSubject);

module.exports = router;
