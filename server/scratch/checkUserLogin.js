const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms');
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await User.findOneAndUpdate(
      { email: 'madhan@upsc.kms' },
      { $set: { passwordHash: passwordHash } },
      { new: true, upsert: true }
    );
    console.log("=== USER PASSWORD RESET SUCCESSFUL ===");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Password:", "password123");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPassword();
