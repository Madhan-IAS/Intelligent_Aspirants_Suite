const mongoose = require('mongoose');

const currentAffairSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  link: { type: String },
  relatedTopicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  tags: [{ type: String }],
  source: { type: String }, // e.g. "The Hindu", "Indian Express"
  isSaved: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

currentAffairSchema.index({ 
  title: 'text', 
  content: 'text',
  tags: 'text',
  source: 'text'
});

module.exports = mongoose.model('CurrentAffair', currentAffairSchema);
