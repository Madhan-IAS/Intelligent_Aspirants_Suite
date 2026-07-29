const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g. Polity, International Relations, Economy, Social Issues, Environment, Security, Ethics
  text: { type: String, required: true },
  index: { type: Number, required: true }
}, { timestamps: true });

quoteSchema.index({ category: 1 });
quoteSchema.index({ text: 'text' });

module.exports = mongoose.model('Quote', quoteSchema);
