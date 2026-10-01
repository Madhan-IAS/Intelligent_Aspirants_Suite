const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const { validate } = require('../middleware/validator');
const { body, param } = require('express-validator');

const idValidation = [param('id').isMongoId().withMessage('Invalid ID format')];

// All admin routes require both auth + admin check
router.get('/pending', auth, adminAuth, adminController.getPendingUsers);
router.get('/all-users', auth, adminAuth, adminController.getAllUsers);

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

router.put('/update-name/:id', auth, adminAuth, validate([
    ...idValidation,
    body('name').trim().notEmpty().withMessage('Name cannot be empty')
]), adminController.updateUserName);
router.get('/revenue', auth, adminAuth, adminController.getRevenueAnalytics);
router.get('/payment-history', auth, adminAuth, adminController.getPaymentHistory);
router.get('/audit-logs', auth, adminAuth, adminController.getAuditLogs);

module.exports = router;
