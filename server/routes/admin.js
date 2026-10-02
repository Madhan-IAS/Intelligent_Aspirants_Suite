const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const { validate } = require('../middleware/validator');
const { body, param } = require('express-validator');

const idValidation = [param('id').isMongoId().withMessage('Invalid ID format')];

// Public route (Anonymous Traffic Tracking)
router.post('/track-visit', adminController.trackVisit);

// All admin routes require both auth + admin check
router.get('/pending', auth, adminAuth, adminController.getPendingUsers);
router.get('/all-users', auth, adminAuth, adminController.getAllUsers);
router.get('/traffic', auth, adminAuth, adminController.getTrafficStats);
router.get('/export-users', auth, adminAuth, adminController.exportUsersCSV);
router.post('/broadcast', auth, adminAuth, adminController.broadcastNotification);
router.get('/demographics', auth, adminAuth, adminController.getDemographics);

router.post('/approve/:id', auth, adminAuth, validate([
    ...idValidation,
    body('durationMonths').optional().isInt({ min: 1 }),
    body('tier').optional().isString()
]), adminController.approveUser);

router.post('/reject/:id', auth, adminAuth, validate([
    ...idValidation,
    body('reason').optional().isString()
]), adminController.rejectUser);

router.post('/revoke/:id', auth, adminAuth, validate(idValidation), adminController.revokeUser);
router.delete('/user/:id', auth, adminAuth, validate(idValidation), adminController.deleteUser);

router.put('/update-user/:id', auth, adminAuth, validate([
    ...idValidation,
    body('name').trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('mobile').optional().matches(/^[0-9]{10}$/).withMessage('Invalid mobile number'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]), adminController.updateUserDetails);
router.get('/revenue', auth, adminAuth, adminController.getRevenueAnalytics);
router.get('/payment-history', auth, adminAuth, adminController.getPaymentHistory);
router.get('/audit-logs', auth, adminAuth, adminController.getAuditLogs);

module.exports = router;
