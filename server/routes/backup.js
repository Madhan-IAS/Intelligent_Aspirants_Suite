const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

router.get('/export', backupController.exportAllData);

module.exports = router;
