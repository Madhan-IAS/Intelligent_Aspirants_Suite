const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const { validate } = require('../middleware/validator');
const { body } = require('express-validator');


router.post('/register', validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]), authController.register);

router.post('/login', validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password cannot be empty')
]), authController.login);

router.post('/refresh', validate([
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
]), authController.refreshToken);

router.post('/forgot-password', validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
]), authController.forgotPassword);

router.post('/reset-password', validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').notEmpty().withMessage('OTP is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]), authController.resetPassword);

router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, validate([
    body('name').trim().optional().notEmpty().withMessage('Name cannot be empty'),
    body('mobile').trim().optional().isLength({ min: 10, max: 15 }).withMessage('Valid mobile number required')
]), authController.updateProfile);

router.put('/change-password', auth, validate([
    body('oldPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
]), authController.changePassword);

module.exports = router;
