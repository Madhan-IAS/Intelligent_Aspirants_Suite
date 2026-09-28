const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// All admin routes require both auth + admin check
router.get('/pending', auth, adminAuth, adminController.getPendingUsers);
router.get('/all-users', auth, adminAuth, adminController.getAllUsers);
router.post('/approve/:id', auth, adminAuth, adminController.approveUser);
router.post('/reject/:id', auth, adminAuth, adminController.rejectUser);
router.post('/revoke/:id', auth, adminAuth, adminController.revokeUser);

module.exports = router;
