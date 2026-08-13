require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const Subject = require('./models/Subject');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);

    // List all subjects
    const subjects = await Subject.find();
    console.log('=== Subjects in DB ===');
    subjects.forEach(s => console.log(`  ${s.name} (${s._id})`));

    // For each subject, count how many topics reference it
    console.log('\n=== Topics per Subject (via subjectId FK) ===');
    let accounted = 0;
    for (const s of subjects) {
        const count = await Topic.countDocuments({ subjectId: s._id });
        console.log(`  ${s.name}: ${count}`);
        accounted += count;
    }

    const total = await Topic.countDocuments();
    const orphaned = await Topic.countDocuments({ subjectId: { $exists: false } });
    const nullSubject = await Topic.countDocuments({ subjectId: null });

    console.log(`\nTotal Topics: ${total}`);
    console.log(`Accounted (via subjectId): ${accounted}`);
    console.log(`Orphaned (no subjectId field): ${orphaned}`);
    console.log(`Null subjectId: ${nullSubject}`);
    console.log(`Unaccounted: ${total - accounted}`);

    // Check topics with subjectId not matching any Subject
    const validSubjectIds = subjects.map(s => s._id);
    const badRef = await Topic.countDocuments({
        subjectId: { $nin: validSubjectIds, $ne: null, $exists: true }
    });
    console.log(`Topics with invalid subjectId reference: ${badRef}`);

    await mongoose.disconnect();
}

run().catch(console.error);
