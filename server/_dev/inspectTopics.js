const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const Subject = require('./models/Subject');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms');
  
  const subjects = await Subject.find({});
  console.log('Subjects:', subjects.map(s => ({ _id: s._id, name: s.name })));
  
  const gs2 = subjects.find(s => s.name === 'GS II');
  if (gs2) {
    const sample = await Topic.findOne({ subjectId: gs2._id });
    console.log('Sample GS II topic:', sample);
    
    const count = await Topic.countDocuments({ subjectId: gs2._id });
    console.log('Total GS II topics:', count);
    
    const polityCount = await Topic.countDocuments({ subjectId: gs2._id, tags: 'Polity' });
    console.log('Polity tag count:', polityCount);

    const govCount = await Topic.countDocuments({ subjectId: gs2._id, tags: 'Governance' });
    console.log('Governance tag count:', govCount);

    const sjCount = await Topic.countDocuments({ subjectId: gs2._id, tags: 'Social Justice' });
    console.log('Social Justice tag count:', sjCount);
    
    // Inspect distinct tags
    const tags = await Topic.distinct('tags', { subjectId: gs2._id });
    console.log('GS II unique tags:', tags);
  }
  
  process.exit(0);
}

main();
