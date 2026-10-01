const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.get('/', auth, notificationController.getAllNotifications);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.patch('/mark-all-read', auth, notificationController.markAllAsRead);
router.patch('/:id/read', auth, notificationController.markAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
