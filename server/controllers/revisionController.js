const Revision = require('../models/Revision');
const Topic = require('../models/Topic');

const intervals = [1, 3, 7, 15, 30, 90];

exports.getPendingRevisions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const query = {
      userId: req.user.id,
      status: 'Pending',
      scheduledDate: { $lte: today }
    };

    const total = await Revision.countDocuments(query);
    const revisions = await Revision.find(query)
      .populate('topicId')
      .skip(skip)
      .limit(limit);

    // Return array to maintain backward compatibility, but ideally should return object with pagination
    res.json(revisions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.scheduleInitialRevision = async (req, res) => {
  try {
    const { topicId } = req.body;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1); // First revision is 1 day later

    const revision = new Revision({
      userId: req.user.id,
      topicId,
      interval: 1,
      scheduledDate: nextDate
    });

    await revision.save();
    res.status(201).json(revision);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.completeRevision = async (req, res) => {
  try {
    const revision = await Revision.findOne({ _id: req.params.id, userId: req.user.id });
    if (!revision) return res.status(404).json({ message: 'Revision not found' });

    // Mark current as completed
    revision.status = 'Completed';
    revision.completedDate = new Date();
    await revision.save();

    // Schedule next interval
    const currentIndex = intervals.indexOf(revision.interval);
    if (currentIndex !== -1 && currentIndex < intervals.length - 1) {
      const nextInterval = intervals[currentIndex + 1];
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + nextInterval);

      const nextRevision = new Revision({
        userId: req.user.id,
        topicId: revision.topicId,
        interval: nextInterval,
        scheduledDate: nextDate
      });
      await nextRevision.save();
    }

    res.json({ message: 'Revision completed and next scheduled', completed: revision });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.skipRevision = async (req, res) => {
  try {
    const revision = await Revision.findOne({ _id: req.params.id, userId: req.user.id });
    if (!revision) return res.status(404).json({ message: 'Revision not found' });

    revision.status = 'Skipped';
    await revision.save();

    res.json({ message: 'Revision skipped', skipped: revision });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.rescheduleRevision = async (req, res) => {
  try {
    const { newDate } = req.body;
    if (!newDate) return res.status(400).json({ message: 'newDate is required' });

    const revision = await Revision.findOne({ _id: req.params.id, userId: req.user.id });
    if (!revision) return res.status(404).json({ message: 'Revision not found' });

    revision.scheduledDate = new Date(newDate);
    await revision.save();

    res.json({ message: 'Revision rescheduled', rescheduled: revision });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
