const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    user = new User({ name, email, passwordHash });
    await user.save();

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
    // Only allow updating certain fields
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
