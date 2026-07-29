const TimetableSlot = require('../models/TimetableSlot');
const DailyProgress = require('../models/DailyProgress');
const ChecklistItem = require('../models/ChecklistItem');
const WeeklySchedule = require('../models/WeeklySchedule');

// Get timetable template for user
exports.getTimetable = async (req, res) => {
  try {
    const slots = await TimetableSlot.find({ userId: req.user.id }).sort({ order: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a timetable slot
exports.createSlot = async (req, res) => {
  try {
    const slot = new TimetableSlot({ ...req.body, userId: req.user.id });
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Bulk create timetable slots (for seeding)
exports.bulkCreateSlots = async (req, res) => {
  try {
    const { slots } = req.body;
    // Clear existing slots for this user
    await TimetableSlot.deleteMany({ userId: req.user.id });
    
    const slotsWithUser = slots.map((s, i) => ({ ...s, userId: req.user.id, order: i }));
    const created = await TimetableSlot.insertMany(slotsWithUser);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a timetable slot
exports.deleteSlot = async (req, res) => {
  try {
    await TimetableSlot.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get today's progress
exports.getDailyProgress = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const progress = await DailyProgress.find({ userId: req.user.id, date: today });
    // Return as a map: slotId -> completed
    const progressMap = {};
    progress.forEach(p => { progressMap[p.slotId.toString()] = p.completed; });
    res.json(progressMap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle a slot's completion for today
exports.toggleProgress = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { slotId } = req.params;
    
    let progress = await DailyProgress.findOne({ userId: req.user.id, date: today, slotId });
    
    if (progress) {
      progress.completed = !progress.completed;
      await progress.save();
    } else {
      progress = await DailyProgress.create({
        userId: req.user.id,
        date: today,
        slotId,
        completed: true
      });
    }
    
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Checklist Items ---

// Get all checklist items for user
exports.getChecklistItems = async (req, res) => {
  try {
    const items = await ChecklistItem.find({ userId: req.user.id }).sort({ order: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get today's checklist progress (uses DailyProgress with checklist item IDs)
exports.getChecklistProgress = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const progress = await DailyProgress.find({ userId: req.user.id, date: today });
    const progressMap = {};
    progress.forEach(p => { progressMap[p.slotId.toString()] = p.completed; });
    res.json(progressMap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle checklist item completion (reuses DailyProgress model)
exports.toggleChecklistProgress = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { itemId } = req.params;

    let progress = await DailyProgress.findOne({ userId: req.user.id, date: today, slotId: itemId });

    if (progress) {
      progress.completed = !progress.completed;
      await progress.save();
    } else {
      progress = await DailyProgress.create({
        userId: req.user.id,
        date: today,
        slotId: itemId,
        completed: true
      });
    }

    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Weekly Schedule ---

// Get weekly schedule for user
exports.getWeeklySchedule = async (req, res) => {
  try {
    const schedule = await WeeklySchedule.find({ userId: req.user.id }).sort({ order: 1 });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
