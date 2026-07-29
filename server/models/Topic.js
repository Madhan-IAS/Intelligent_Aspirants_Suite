const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  topicCode: { type: String, default: '' },
  paper: { type: String, default: 'GS I' },
  subjectName: { type: String, default: 'General' },
  chapter: { type: String, default: 'General' },
  heading: { type: String, default: 'General Topics' },
  title: { type: String, required: true },
  tags: [{ type: String }],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  completed: { type: Boolean, default: false },
  revisionDates: [{ type: Date }],
  relatedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  hubData: {
    knowledge: { type: String, default: '' },
    pyqs: { type: String, default: '' },
    mcqs: { type: String, default: '' },
    notes: { type: String, default: '' },
    mindMaps: { type: String, default: '' },
    revision: { type: String, default: '' },
    tests: { type: String, default: '' },
    currentAffairs: { type: String, default: '' },
    analytics: { type: String, default: '' }
  },
  notes: {
    theory: { type: String, default: '' },
    definitions: { type: String, default: '' },
    examples: { type: String, default: '' },
    caseStudies: { type: String, default: '' },
    statistics: { type: String, default: '' },
    committeeReports: { type: String, default: '' },
    supremeCourtCases: { type: String, default: '' },
    governmentSchemes: { type: String, default: '' },
    wayForward: { type: String, default: '' },
    diagrams: { type: String, default: '' },
    mindMaps: { type: String, default: '' },
    currentAffairs: { type: String, default: '' },
    pyqs: { type: String, default: '' },
    valueAddition: { type: String, default: '' }
  }
}, { timestamps: true });

topicSchema.index({ 
  title: 'text', 
  tags: 'text',
  paper: 'text',
  subjectName: 'text',
  chapter: 'text',
  heading: 'text'
});

module.exports = mongoose.model('Topic', topicSchema);
