const User = require('../models/User');
const TimetableSlot = require('../models/TimetableSlot');
const ChecklistItem = require('../models/ChecklistItem');
const WeeklySchedule = require('../models/WeeklySchedule');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Master Seeding Arrays to initialize new registered users with the exact same data
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

// Dev auto-login helper: Automatically create/return the dev user
exports.devLogin = async (req, res) => {
  try {
    let user = await User.findOne({ email: 'madhan@upsc.kms' });
    if (!user) {
      const passwordHash = await bcrypt.hash('password123', 10);
      user = await User.create({
        name: 'Madhan Mohan',
        email: 'madhan@upsc.kms',
        passwordHash,
        targetAttempt: 2027,
        dailyTargetHours: 14,
        optionalSubject: 'Sociology'
      });
      
      // Seed data for dev user too if they were just created
      const slotsWithUser = MASTER_TIMETABLE.map((s, i) => ({ ...s, userId: user._id, order: i }));
      await TimetableSlot.insertMany(slotsWithUser);

      const allChecklist = [...DAILY_TARGETS, ...END_OF_DAY_CHECKLIST].map((item, i) => ({
        ...item, userId: user._id, order: i
      }));
      await ChecklistItem.insertMany(allChecklist);

      const weeklyWithUser = WEEKLY_SCHEDULE.map((w, i) => ({ ...w, userId: user._id, order: i }));
      await WeeklySchedule.insertMany(weeklyWithUser);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create new user with identical starting values
    user = new User({ 
      name, 
      email, 
      passwordHash,
      targetAttempt: 2027,
      dailyTargetHours: 14,
      optionalSubject: 'Sociology'
    });
    await user.save();

    // Auto-seed all user-specific timetable, targets, and weekly structures
    const slotsWithUser = MASTER_TIMETABLE.map((s, i) => ({ ...s, userId: user._id, order: i }));
    await TimetableSlot.insertMany(slotsWithUser);

    const allChecklist = [...DAILY_TARGETS, ...END_OF_DAY_CHECKLIST].map((item, i) => ({
      ...item, userId: user._id, order: i
    }));
    await ChecklistItem.insertMany(allChecklist);

    const weeklyWithUser = WEEKLY_SCHEDULE.map((w, i) => ({ ...w, userId: user._id, order: i }));
    await WeeklySchedule.insertMany(weeklyWithUser);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { 
      name, bio, targetAttempt, optionalSubject, 
      dailyTargetHours, preferredRevisionPattern, 
      examStage, theme, studyPreferences 
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          name, bio, targetAttempt, optionalSubject, 
          dailyTargetHours, preferredRevisionPattern, 
          examStage, theme, studyPreferences 
        }
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
