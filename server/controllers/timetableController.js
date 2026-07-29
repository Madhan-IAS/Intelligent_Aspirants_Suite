const TimetableSlot = require('../models/TimetableSlot');
const DailyProgress = require('../models/DailyProgress');
const ChecklistItem = require('../models/ChecklistItem');
const WeeklySchedule = require('../models/WeeklySchedule');

// Helper to get YYYY-MM-DD date string in Indian Standard Time (IST)
const getTodayDateString = () => {
  const date = new Date();
  const utcOffset = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istTime = new Date(utcOffset + (3600000 * 5.5));
  const yyyy = istTime.getFullYear();
  const mm = String(istTime.getMonth() + 1).padStart(2, '0');
  const dd = String(istTime.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Master Seeding Arrays to initialize users on-the-fly
const MASTER_TIMETABLE = [
  { time: '05:00 – 05:20 AM', duration: '20 min', session: 'Morning Routine', activity: 'Wake Up, Freshen Up', category: 'Morning Routine', objective: 'Prepare for the day', expectedOutput: 'Fresh & Ready', isStudyBlock: false },
  { time: '05:20 – 05:40 AM', duration: '20 min', session: 'Health & Planning', activity: 'Exercise, Meditation, Daily Planning', category: 'Health & Planning', objective: 'Physical & Mental Preparation', expectedOutput: 'Daily Goals Set', isStudyBlock: false },
  { time: '05:40 – 08:10 AM', duration: '2 hr 30 min', session: 'Study Session – I', activity: 'Sociology Optional (Paper I / II)', category: 'Study', objective: 'Read new topics, make notes, understand concepts', expectedOutput: 'Notes + Value Addition', isStudyBlock: true },
  { time: '08:10 – 08:40 AM', duration: '30 min', session: 'Breakfast', activity: 'Breakfast & Short Break', category: 'Break', objective: 'Refresh', expectedOutput: '—', isStudyBlock: false },
  { time: '08:40 – 11:10 AM', duration: '2 hr 30 min', session: 'Study Session – II', activity: 'General Studies (GS-I / GS-II / GS-III / GS-IV)', category: 'Study', objective: 'Complete major topic', expectedOutput: 'Complete Static Portion', isStudyBlock: true },
  { time: '11:10 – 11:25 AM', duration: '15 min', session: 'Break', activity: 'Walk / Tea / Stretching', category: 'Break', objective: 'Relax', expectedOutput: 'Fresh Mind', isStudyBlock: false },
  { time: '11:25 AM – 01:25 PM', duration: '2 hr', session: 'Study Session – III', activity: 'Continue GS Topic + Notes + Diagrams + Flowcharts', category: 'Study', objective: 'Finish complete topic', expectedOutput: 'Topic Ready for Revision', isStudyBlock: true },
  { time: '01:25 – 02:10 PM', duration: '45 min', session: 'Lunch', activity: 'Lunch & Relaxation', category: 'Break', objective: 'Recovery', expectedOutput: '—', isStudyBlock: false },
  { time: '02:10 – 03:10 PM', duration: '1 hr', session: 'Current Affairs', activity: 'Newspaper, PIB, PRS, Monthly Magazine', category: 'Current Affairs', objective: 'Link Dynamic & Static', expectedOutput: 'Current Affairs Notes', isStudyBlock: true },
  { time: '03:10 – 04:10 PM', duration: '1 hr', session: 'PYQ Practice', activity: 'GS PYQs + Sociology PYQs', category: 'PYQ Practice', objective: 'Pattern Analysis', expectedOutput: 'PYQ Analysis Completed', isStudyBlock: true },
  { time: '04:10 – 04:25 PM', duration: '15 min', session: 'Break', activity: 'Tea & Refresh', category: 'Break', objective: 'Relax', expectedOutput: '—', isStudyBlock: false },
  { time: '04:25 – 06:00 PM', duration: '1 hr 35 min', session: 'Answer Writing', activity: '1 GS Answer + 1 Sociology Answer', category: 'Answer Writing', objective: 'Improve Writing Skills', expectedOutput: 'Daily Writing Practice', isStudyBlock: true },
  { time: '06:00 – 07:30 PM', duration: '1 hr 30 min', session: 'Revision', activity: '3-5-7 Revision (Only Due Topics)', category: 'Revision', objective: 'Long-Term Retention', expectedOutput: 'Revision Completed', isStudyBlock: true },
  { time: '07:30 – 08:00 PM', duration: '30 min', session: 'Dinner', activity: 'Dinner & Relax', category: 'Break', objective: 'Refresh', expectedOutput: '—', isStudyBlock: false },
  { time: '08:00 – 09:00 PM', duration: '1 hr', session: 'KMS Development', activity: 'Update Notes, Link Current Affairs, Add PYQs, Mind Maps', category: 'KMS Development', objective: 'Build Knowledge Base', expectedOutput: 'KMS Updated', isStudyBlock: true },
  { time: '09:00 – 09:30 PM', duration: '30 min', session: 'KMS Development', activity: 'Create Mind Maps, Flowcharts & Revision Sheets', category: 'KMS Development', objective: 'Revision-Ready Material', expectedOutput: 'Quick Revision Sheets', isStudyBlock: true },
  { time: '09:30 – 10:30 PM', duration: '1 hr', session: 'Value Addition', activity: 'Economic Survey, Budget, ARC Reports, Committee Reports, SC Judgments, Statistics, Govt Schemes', category: 'Value Addition', objective: 'Improve Answer Quality', expectedOutput: 'High-Value Content Added', isStudyBlock: true },
  { time: '10:30 – 11:00 PM', duration: '30 min', session: 'Daily Review', activity: 'Review Targets, Update Progress, Schedule Tomorrow, Organize Revision Queue', category: 'Daily Review', objective: 'Planning & Reflection', expectedOutput: 'Next Day Ready', isStudyBlock: false },
  { time: '11:00 PM', duration: '—', session: 'Sleep', activity: 'Sleep & Recovery', category: 'Sleep', objective: 'Memory Consolidation', expectedOutput: 'Ready for Next Day', isStudyBlock: false },
];

const DAILY_TARGETS = [
  { label: 'Sociology Optional — 2–3 Subtopics', icon: '📖', category: 'daily_target' },
  { label: 'General Studies — 1–2 Major Topics', icon: '📚', category: 'daily_target' },
  { label: 'Current Affairs — 8–10 Important Articles', icon: '📰', category: 'daily_target' },
  { label: 'GS PYQs — 5 Questions', icon: '❓', category: 'daily_target' },
  { label: 'Sociology PYQs — 3–5 Questions', icon: '❓', category: 'daily_target' },
  { label: 'GS Answer Writing — 1 Answer (GS-IV Days: 2 Ethics Case Studies)', icon: '✍️', category: 'daily_target' },
  { label: 'Sociology Answer Writing — 1 Answer', icon: '✍️', category: 'daily_target' },
  { label: '3-5-7 Revision — Complete All Due Revisions', icon: '🔄', category: 'daily_target' },
  { label: 'KMS — Update Notes, Tags, Links & Progress', icon: '💾', category: 'daily_target' },
];

const END_OF_DAY_CHECKLIST = [
  { label: 'Sociology Topic Completed', icon: '✅', category: 'end_of_day' },
  { label: 'GS Topic Completed', icon: '✅', category: 'end_of_day' },
  { label: 'Current Affairs Updated', icon: '✅', category: 'end_of_day' },
  { label: 'GS PYQs Solved', icon: '✅', category: 'end_of_day' },
  { label: 'Sociology PYQs Solved', icon: '✅', category: 'end_of_day' },
  { label: 'GS Answer Written', icon: '✅', category: 'end_of_day' },
  { label: 'Sociology Answer Written', icon: '✅', category: 'end_of_day' },
  { label: '3-5-7 Revision Completed', icon: '✅', category: 'end_of_day' },
  { label: 'KMS Updated', icon: '✅', category: 'end_of_day' },
  { label: "Tomorrow's Plan Prepared", icon: '✅', category: 'end_of_day' },
];

const WEEKLY_SCHEDULE = [
  { day: 'Monday', task: 'Regular Study', duration: 'Full Day', isSpecial: false },
  { day: 'Tuesday', task: 'Regular Study', duration: 'Full Day', isSpecial: false },
  { day: 'Wednesday', task: 'Regular Study', duration: 'Full Day', isSpecial: false },
  { day: 'Thursday', task: 'Regular Study', duration: 'Full Day', isSpecial: false },
  { day: 'Friday', task: 'Regular Study', duration: 'Full Day', isSpecial: false },
  { day: 'Saturday', task: 'Subject-wise Mini Mock Test + Analysis', duration: '2–3 Hours', isSpecial: true },
  { day: 'Sunday Morning', task: 'Full-Length GS Mock Test (Rotating GS-I → GS-IV)', duration: '3 Hours', isSpecial: true },
  { day: 'Sunday Afternoon', task: 'Essay Writing (1 Essay)', duration: '2 Hours', isSpecial: true },
  { day: 'Sunday Evening', task: 'Mock Analysis, Mistake Book Update, Weekly KMS Cleanup & Planning', duration: '2 Hours', isSpecial: true },
];

// Helper to ensure user is seeded
const ensureUserSeeded = async (userId) => {
  const slotCount = await TimetableSlot.countDocuments({ userId });
  if (slotCount === 0) {
    const slotsWithUser = MASTER_TIMETABLE.map((s, i) => ({ ...s, userId, order: i }));
    await TimetableSlot.insertMany(slotsWithUser);
  }

  const checklistCount = await ChecklistItem.countDocuments({ userId });
  if (checklistCount === 0) {
    const allChecklist = [...DAILY_TARGETS, ...END_OF_DAY_CHECKLIST].map((item, i) => ({
      ...item, userId, order: i
    }));
    await ChecklistItem.insertMany(allChecklist);
  }

  const weeklyCount = await WeeklySchedule.countDocuments({ userId });
  if (weeklyCount === 0) {
    const weeklyWithUser = WEEKLY_SCHEDULE.map((w, i) => ({ ...w, userId, order: i }));
    await WeeklySchedule.insertMany(weeklyWithUser);
  }
};

// Get timetable template for user
exports.getTimetable = async (req, res) => {
  try {
    await ensureUserSeeded(req.user.id);
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
    const today = getTodayDateString();
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
    const today = getTodayDateString();
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
    await ensureUserSeeded(req.user.id);
    const items = await ChecklistItem.find({ userId: req.user.id }).sort({ order: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get today's checklist progress (uses DailyProgress with checklist item IDs)
exports.getChecklistProgress = async (req, res) => {
  try {
    const today = getTodayDateString();
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
    const today = getTodayDateString();
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
    await ensureUserSeeded(req.user.id);
    const schedule = await WeeklySchedule.find({ userId: req.user.id }).sort({ order: 1 });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
