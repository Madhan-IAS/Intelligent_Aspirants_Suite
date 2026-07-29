const mongoose = require('mongoose');

const directiveSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  definition: { type: String, required: true },
  depth: { type: String, required: true },
  structure: {
    intro: { type: String, default: '' },
    body: { type: String, default: '' },
    conclusion: { type: String, default: '' },
    tip: { type: String, default: '' }
  },
  smartAddon: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Directive', directiveSchema);
