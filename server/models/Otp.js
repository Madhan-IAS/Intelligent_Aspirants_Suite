const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // Document expires 5 minutes (300 seconds) after creation
    },
    verified: {
        type: Boolean,
        default: false,
    },
});

// Hash the OTP before saving
otpSchema.pre('save', async function (next) {
    if (!this.isModified('otp')) return next();

    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
});

// Method to verify OTP
otpSchema.methods.matchOTP = async function (enteredOtp) {
    return await bcrypt.compare(enteredOtp.toString(), this.otp);
};

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
