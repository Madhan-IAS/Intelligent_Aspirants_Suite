const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.get('/export', auth, adminAuth, backupController.exportAllData);
router.post('/import', auth, adminAuth, backupController.restoreAllData);
module.exports = router;
