const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function promote() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'madhan@upsc.kms' });
        if (user) {
            user.role = 'admin';
            user.subscriptionTier = 'topper';
            await user.save();
            console.log('Promoted madhan@upsc.kms to admin!');
        } else {
            console.log('User not found.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

promote();
