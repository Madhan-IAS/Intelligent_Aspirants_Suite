const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const timetableController = require('../controllers/timetableController');

router.use(auth);

// Timetable slots
router.get('/', timetableController.getTimetable);
router.post('/', timetableController.createSlot);
router.post('/bulk', timetableController.bulkCreateSlots);
router.delete('/:id', timetableController.deleteSlot);

// Daily progress (timetable slots)
router.get('/progress', timetableController.getDailyProgress);
router.post('/progress/:slotId', timetableController.toggleProgress);

// Checklist items (daily targets + end-of-day)
router.get('/checklist', timetableController.getChecklistItems);
router.post('/checklist/progress/:itemId', timetableController.toggleChecklistProgress);

// Weekly schedule
router.get('/weekly', timetableController.getWeeklySchedule);

module.exports = router;
