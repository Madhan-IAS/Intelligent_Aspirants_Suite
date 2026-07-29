const Revision = require('../models/Revision');
const Topic = require('../models/Topic');

const intervals = [1, 3, 7, 15, 30, 90];

exports.getPendingRevisions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const revisions = await Revision.find({
      status: 'Pending',
      scheduledDate: { $lte: today }
    }).populate('topicId');
    
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
    const revision = await Revision.findById(req.params.id);
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
