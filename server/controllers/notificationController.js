const Notification = require('../models/Notification');

// GET /api/notifications — fetch all notifications (newest first)
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: req.user.id }, { isBroadcast: true }]
    }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/notifications/unread-count — get count of unread notifications
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      $or: [
        { userId: req.user.id, read: false },
        { isBroadcast: true, readBy: { $ne: req.user.id } }
      ]
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/notifications/:id/read — mark a single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (!notification.isBroadcast && notification.userId && notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (notification.isBroadcast) {
      if (!notification.readBy.includes(req.user.id)) {
        notification.readBy.push(req.user.id);
        await notification.save();
      }
    } else {
      notification.read = true;
      await notification.save();
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/notifications/mark-all-read — mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    await Notification.updateMany(
      { isBroadcast: true, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/notifications/:id — delete a single notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (notification.isBroadcast) {
      if (!notification.readBy.includes(req.user.id)) {
        notification.readBy.push(req.user.id);
        await notification.save();
      }
      return res.json({ message: 'Broadcast dismissed' });
    }

    if (notification.userId && notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
