const User = require('../models/User');
const TimetableSlot = require('../models/TimetableSlot');
const ChecklistItem = require('../models/ChecklistItem');
const WeeklySchedule = require('../models/WeeklySchedule');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'refresh_fallback_secret', { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const getSecureTransporter = async () => {
  const nodemailer = require('nodemailer');

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_HOST ? (parseInt(process.env.SMTP_PORT) || 587) : 587,
    secure: process.env.SMTP_HOST ? (parseInt(process.env.SMTP_PORT) === 465) : false,
    auth: {
      user: process.env.SMTP_HOST ? process.env.SMTP_USER : process.env.EMAIL_USER,
      pass: process.env.SMTP_HOST ? process.env.SMTP_PASS : process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
    family: 4, // 🛡️ Force IPv4 natively without statically hacking process DNS
    pool: true, // ♻️ Reuse the same TLS connection (fixes second-OTP hanging)
    maxConnections: 1, // Only open one connection to Gmail at a time
    maxMessages: 100
  });
};

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



exports.register = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number' });
    }

    // Require OTP Verification before allowing signup
    const verifiedOtp = await Otp.findOne({ email, verified: true });
    if (!verifiedOtp) {
      return res.status(400).json({ message: 'Email not verified or OTP expired. Please verify your email first.' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user with 1-Day Free Trial (Topper Access)
    const expiry24h = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    user = new User({
      name,
      email,
      mobile,
      passwordHash,
      // Grant 24-hour Free Trial
      subscriptionStatus: 'active',
      subscriptionTier: 'topper',
      subscriptionExpiry: expiry24h,
      isTrial: true,
      onboardingComplete: false
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

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    // Consume the OTP so it cannot be reused
    await Otp.deleteOne({ _id: verifiedOtp._id });

    res.status(201).json({ token: accessToken, refreshToken, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, mobile } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // --- LEGACY DB HOTFIX --- 
    // Early beta accounts had corrupted examStage enums (e.g., 'Foundation') which crashes user.save()
    const validStages = ['Beginner', 'First Reading', 'Revision', 'Test Phase', 'Interview'];
    if (user.examStage && !validStages.includes(user.examStage)) {
      user.examStage = 'Beginner';
    }
    // ------------------------

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Verify mobile number matches for security
    if (user.mobile && mobile !== user.mobile) {
      return res.status(400).json({ message: 'Invalid credentials — mobile number does not match' });
    }

    // Check if subscription has expired
    if (user.subscriptionStatus === 'active' && user.subscriptionExpiry && new Date() > user.subscriptionExpiry) {
      user.subscriptionStatus = 'expired';
      await user.save();
    }

    // Auto-seed user profile values if missing
    if (!user.targetAttempt || !user.dailyTargetHours || !user.optionalSubject) {
      user.targetAttempt = user.targetAttempt || 2027;
      user.dailyTargetHours = user.dailyTargetHours || 14;
      user.optionalSubject = user.optionalSubject || 'Sociology';
      await user.save();
    }

    // Auto-seed user-specific timetable/checklists if missing (for older accounts like shashi@upsc.kms)
    const slotCount = await TimetableSlot.countDocuments({ userId: user._id });
    if (slotCount === 0) {
      const slotsWithUser = MASTER_TIMETABLE.map((s, i) => ({ ...s, userId: user._id, order: i }));
      await TimetableSlot.insertMany(slotsWithUser);
    }

    const checklistCount = await ChecklistItem.countDocuments({ userId: user._id });
    if (checklistCount === 0) {
      const allChecklist = [...DAILY_TARGETS, ...END_OF_DAY_CHECKLIST].map((item, i) => ({
        ...item, userId: user._id, order: i
      }));
      await ChecklistItem.insertMany(allChecklist);
    }

    const weeklyCount = await WeeklySchedule.countDocuments({ userId: user._id });
    if (weeklyCount === 0) {
      const weeklyWithUser = WEEKLY_SCHEDULE.map((w, i) => ({ ...w, userId: user._id, order: i }));
      await WeeklySchedule.insertMany(weeklyWithUser);
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ token: accessToken, refreshToken, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_fallback_secret');
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (error) {
    res.status(403).json({ message: 'Refresh token expired or invalid' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if subscription has expired since last login
    if (user.subscriptionStatus === 'active' && user.subscriptionExpiry && new Date() > user.subscriptionExpiry) {
      user.subscriptionStatus = 'expired';
      await user.save();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNetwork = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('followers', 'name role')
      .populate('following', 'name role')
      .select('followers following'); // Only send back network data

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name, email, bio, mobile, targetAttempt, attemptNumber, optionalSubject,
      dailyTargetHours, preferredRevisionPattern,
      examStage, theme, studyPreferences, onboardingComplete, expoPushToken
    } = req.body;

    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number' });
    }

    const userToUpdate = await User.findById(req.user.id);
    if (!userToUpdate) return res.status(404).json({ message: 'User not found' });

    if (email && email !== userToUpdate.email) {
      // Security Enforcement: Ensure they verified this new email via OTP
      const verifiedOtp = await Otp.findOne({ email, verified: true });
      if (!verifiedOtp) {
        return res.status(403).json({ message: 'Unauthorized email modification. You must verify the new email first.' });
      }
      // Consume OTP so it cannot be reused
      await Otp.deleteOne({ _id: verifiedOtp._id });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          name, email, bio, mobile, targetAttempt, attemptNumber, optionalSubject,
          dailyTargetHours, preferredRevisionPattern,
          examStage, theme, studyPreferences, onboardingComplete, expoPushToken
        }
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // We need bcrypt to hash the password
    const bcrypt = require('bcryptjs');

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6 digit mock OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    // Since this is MVP without email service, we return the OTP in response
    // In production, NEVER return OTP in API response. Send via Email/SMS.
    res.json({
      message: 'OTP generated. Check your email (Simulated).',
      devOtp: otp // Simulated for dev
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetOtp !== otp || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // We need bcrypt to hash the password
    const bcrypt = require('bcryptjs');

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleFollow = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/forgot-password
// Generates a 6-digit OTP mapping to the email address with a strict 15-minute expiration
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email address is required' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'If this email exists, an OTP will be sent' }); // Generic security warning
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);

    user.resetOtp = otp;
    user.otpExpiry = expiry;
    await user.save();

    // 🚀 Authentic Nodemailer Email Gateway 
    if (process.env.SMTP_HOST || (process.env.EMAIL_USER && process.env.EMAIL_PASS)) {
      const transporter = await getSecureTransporter();

      const senderEmail = process.env.SMTP_HOST ? process.env.SMTP_USER : process.env.EMAIL_USER;
      const mailOptions = {
        from: `"IASuite Security" <${senderEmail}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
            <h2 style="color: #ef4444;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your IASuite password. Your 6-digit Reset OTP is:</p>
            <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ef4444;">${otp}</span>
            </div>
            <p>This code will explicitly expire in 15 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `,
      };

      // Send asynchronously so the API responds instantly
      transporter.sendMail(mailOptions)
        .then(() => console.log(`[SECURE MAIL] -> Dispatching Password Reset OTP [ ${otp} ] to -> ${email}`))
        .catch((mailError) => console.error('[EMAIL] Failed to send Reset OTP', mailError));
    } else {
      console.log(`[DEVELOPMENT MOCK EMAIL] -> Dispatching Password Reset OTP [ ${otp} ] to -> ${email}`);
    }

    res.json({
      message: `Reset OTP sent successfully to ${email}`,
      devOtp: !(process.env.EMAIL_USER && process.env.EMAIL_PASS) ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/reset-password
// Unlocks the user's DB via valid OTP token and overrides the hashed password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and New Password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.resetOtp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or Expired OTP provided' });
    }

    // Re-Hash new credentials safely 
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    // Wipe the compromised tokens instantly
    user.resetOtp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/send-otp
// Generates and sends a 6-digit OTP to the user's email
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing unverified OTP for this email to prevent clutter
    await Otp.deleteMany({ email, verified: false });

    // Save to database
    const otpDoc = new Otp({
      email,
      otp: otpCode, // Will be hashed via schema pre-save hook
    });
    await otpDoc.save();

    // 🚀 Nodemailer Email Transport
    if (process.env.SMTP_HOST || (process.env.EMAIL_USER && process.env.EMAIL_PASS)) {
      const transporter = await getSecureTransporter();

      const senderEmail = process.env.SMTP_HOST ? process.env.SMTP_USER : process.env.EMAIL_USER;
      const mailOptions = {
        from: `"IASuite Security" <${senderEmail}>`,
        to: email,
        subject: 'Your IASuite Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
            <h2 style="color: #2563eb;">Intelligent Aspirant's Suite</h2>
            <p>Hello,</p>
            <p>Your OTP securely generated for IAS Registration is:</p>
            <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otpCode}</span>
            </div>
            <p>This code will expire securely in 5 minutes. Do not share it with anyone.</p>
            <p style="font-size: 12px; color: #6b7280; margin-top: 32px;">This is an automated security email. Please do not reply.</p>
          </div>
        `,
      };

      // Send asynchronously so the API responds instantly
      transporter.sendMail(mailOptions)
        .then(() => console.log(`[EMAIL] OTP Sent securely to ${email}. The Code is: [ ${otpCode} ]`))
        .catch((mailError) => console.error('[EMAIL] Failed to send via Nodemailer', mailError));
    } else {
      console.log(`[DEVELOPMENT MOCK EMAIL] -> Sent Setup OTP [ ${otpCode} ] to -> ${email}`);
    }

    res.json({
      message: 'OTP sent successfully',
      devOtp: !(process.env.EMAIL_USER && process.env.EMAIL_PASS) ? otpCode : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP server-side', error: error.message });
  }
};

// POST /api/auth/verify-otp
// Verifies the provided 6-digit OTP matches our database
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find the OTP document for this email (most recent first if multiple exist)
    const otpRecords = await Otp.find({ email }).sort({ createdAt: -1 });
    if (!otpRecords || otpRecords.length === 0) {
      return res.status(400).json({ message: 'No OTP found for this email or it has expired. Please resend.' });
    }

    // Take the most recent one
    const latestOtpRecord = otpRecords[0];

    // Check if it's already verified (edge case)
    if (latestOtpRecord.verified) {
      return res.json({ message: 'Email already verified successfully.' });
    }

    // Check if the OTP matches
    const isMatch = await latestOtpRecord.matchOTP(otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP provided.' });
    }

    // Mark as verified
    latestOtpRecord.verified = true;
    await latestOtpRecord.save();

    res.json({ message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
