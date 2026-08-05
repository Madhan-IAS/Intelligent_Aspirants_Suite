const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/', notificationController.getAllNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
