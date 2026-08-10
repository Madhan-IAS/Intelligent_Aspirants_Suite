require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const Interlinkage = require('./models/Interlinkage');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const total = await Interlinkage.countDocuments();
    console.log('Total interlinkages:', total);

    const sample = await Interlinkage.findOne({ strength: 'Strong' })
        .populate('sourceTopicId', 'title paper')
        .populate('targetTopicId', 'title paper');

    if (sample) {
        console.log('Sample Strong Link:');
        console.log('  Source:', sample.sourceTopicId.title, '(' + sample.sourceTopicId.paper + ')');
        console.log('  Target:', sample.targetTopicId.title, '(' + sample.targetTopicId.paper + ')');
        console.log('  Dimension:', sample.dimension);
        console.log('  Note:', sample.note);
    }

    const dimStats = await Interlinkage.aggregate([
        { $group: { _id: '$dimension', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    console.log('\nDimension breakdown:');
    dimStats.forEach(d => console.log('  ' + d._id + ': ' + d.count));
    process.exit(0);
});
