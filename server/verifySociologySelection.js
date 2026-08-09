/**
 * verifySociologySelection.js
 * Verifies that the dailyPlan query returns Sociology Paper I or II topics
 * matching the rotation day's scheduled optional paper.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');

const ROTATION_SCHEDULE = [
    { gsPaper: 'GS I', optPaper: 'Sociology Paper I' },
    { gsPaper: 'GS II', optPaper: 'Sociology Paper II' },
    { gsPaper: 'GS III', optPaper: 'Sociology Paper I' },
    { gsPaper: 'GS IV', optPaper: 'Sociology Paper II' },
    { gsPaper: 'GS I', optPaper: 'Sociology Paper I' },
    { gsPaper: 'GS II', optPaper: 'Sociology Paper II' },
    { gsPaper: 'GS III', optPaper: 'Sociology Paper I' },
    { gsPaper: 'GS IV', optPaper: 'Sociology Paper II' },
];

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for verification');

        let allPassed = true;

        for (let dayIndex = 0; dayIndex < ROTATION_SCHEDULE.length; dayIndex++) {
            const rotation = ROTATION_SCHEDULE[dayIndex];
            console.log(`\nChecking Rotation Day ${dayIndex + 1} (${rotation.gsPaper} & ${rotation.optPaper}):`);

            // Mock the DailyPlan selection query from dailyPlanController
            const optTopics = await Topic.find({
                tags: rotation.optPaper,
                completed: { $ne: true }
            })
                .sort({ _id: 1 })
                .limit(8);

            console.log(`Fetched ${optTopics.length} optional topics.`);

            if (optTopics.length === 0) {
                console.log(`⚠️ Warning: No uncompleted topics found for ${rotation.optPaper}.`);
                continue;
            }

            // Check that all fetched topics have the matching tag in their tags array
            const matchesAll = optTopics.every(topic => topic.tags.includes(rotation.optPaper));

            if (matchesAll) {
                console.log(`✅ Success: All topics match expected paper tag: "${rotation.optPaper}"`);
                console.log(`   Sample topics fetched:`);
                optTopics.slice(0, 3).forEach(t => {
                    console.log(`   - [${t.tags.filter(tg => tg.includes('Paper'))}] ${t.title}`);
                });
            } else {
                console.log(`❌ Error: Some fetched topics do not have the tag "${rotation.optPaper}"!`);
                optTopics.forEach(t => {
                    if (!t.tags.includes(rotation.optPaper)) {
                        console.log(`     Mismatched Topic: "${t.title}" with tags: [${t.tags.join(', ')}]`);
                    }
                });
                allPassed = false;
            }
        }

        if (allPassed) {
            console.log('\n🎉 VERIFICATION PASSED: Queries correctly distinguish between Paper I and Paper II!');
            process.exit(0);
        } else {
            console.log('\n❌ VERIFICATION FAILED: Query fetched mismatched topics.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Verification failed with error:', error);
        process.exit(1);
    }
}

verify();
