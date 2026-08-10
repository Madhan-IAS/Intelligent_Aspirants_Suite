require('dotenv').config();
const mongoose = require('mongoose');
const FocusSession = require('./models/FocusSession');

async function testPost() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for FocusSession verification');

        // Create a mock user ID for testing
        const testUserId = new mongoose.Types.ObjectId();
        const testTopicId = new mongoose.Types.ObjectId();

        const mockSession = new FocusSession({
            userId: testUserId,
            subject: 'Sociology',
            durationMinutes: 120,
            type: 'NightOwl',
            startTime: new Date('2026-08-10T23:30:00Z'),
            endTime: new Date('2026-08-11T01:30:00Z'),
            topicId: testTopicId,
            subtopicTitle: 'Test Subtopic A.R. Desai indology notes'
        });

        const saved = await mockSession.save();
        console.log('✅ Mock FocusSession successfully saved:', saved._id);

        // Retrieve from database
        const retrieved = await FocusSession.findById(saved._id);
        if (!retrieved) {
            throw new Error('Could not retrieve focus session from database!');
        }

        // Verify all fields
        const checks = [
            retrieved.type === 'NightOwl',
            retrieved.startTime.toISOString() === '2026-08-10T23:30:00.000Z',
            retrieved.endTime.toISOString() === '2026-08-11T01:30:00.000Z',
            retrieved.topicId.toString() === testTopicId.toString(),
            retrieved.subtopicTitle === 'Test Subtopic A.R. Desai indology notes'
        ];

        if (checks.every(Boolean)) {
            console.log('🎉 SCHEMA VERIFICATION SUCCESS: All custom deep work attributes saved and retrieved correctly!');
        } else {
            console.error('❌ SCHEMA VERIFICATION FAILED: Attributes do not match saved value!');
            console.log('Retrieved record details:', retrieved);
        }

        // Cleanup
        await FocusSession.findByIdAndDelete(saved._id);
        console.log('🧹 Cleaned up mock FocusSession document.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Verification failed with error:', error);
        process.exit(1);
    }
}

testPost();
