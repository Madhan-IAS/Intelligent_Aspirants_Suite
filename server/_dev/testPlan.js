require('dotenv').config();
const mongoose = require('mongoose');
const DailyPlan = require('./models/DailyPlan');
const Topic = require('./models/Topic');

async function testQuery() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Simulate IST today
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const ist = new Date(utc + (3600000 * 5.5));
        const today = `${ist.getFullYear()}-${String(ist.getMonth() + 1).padStart(2, '0')}-${String(ist.getDate()).padStart(2, '0')}`;

        // Just find any daily plan to see if we can parse topics
        const dailyPlan = await DailyPlan.findOne({ date: today }).populate('gsTopicIds', 'title subjectName chapter notes').sort({ createdAt: -1 });

        if (!dailyPlan) {
            console.log('No daily plan found for', today);
            return;
        }

        const gsTopics = dailyPlan.gsTopicIds;
        let context = `Today's GS Paper: ${dailyPlan.gsPaper}\n\n`;
        gsTopics.forEach((topic, idx) => {
            // simulate the loop mapping
            context += `--- Topic ${idx + 1}: ${topic.title} (${topic.subjectName}) ---\n`;
        });
        console.log(context);
        console.log("Success compiling context!");

    } catch (error) {
        console.error("Local Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}
testQuery();
