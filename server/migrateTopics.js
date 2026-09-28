const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Topic = require('./models/Topic');
const User = require('./models/User');
const UserTopicProgress = require('./models/UserTopicProgress');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // Find admin by email
        const adminUser = await User.findOne({ email: 'madhan@upsc.kms' });
        if (!adminUser) {
            console.log('No user with email madhan@upsc.kms found.');
            process.exit(1);
        }
        console.log(`Found admin user: ${adminUser.name} (${adminUser._id})`);

        const completedTopics = await Topic.find({ $or: [{ completed: true }, { status: 'Completed' }] });
        console.log(`Found ${completedTopics.length} previously completed topics. Migrating...`);

        let count = 0;
        for (const topic of completedTopics) {
            await UserTopicProgress.updateOne(
                { userId: adminUser._id, topicId: topic._id },
                {
                    $set: {
                        status: topic.status || 'Completed',
                        completed: topic.completed || true,
                        completedAt: topic.completedAt || new Date()
                    }
                },
                { upsert: true }
            );
            count++;
        }

        console.log(`Successfully migrated ${count} topics! The application is now Multi-User ready.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
