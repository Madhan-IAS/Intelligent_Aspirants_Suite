const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true
    }, // Format YYYY-MM-DD
    count: {
        type: Number,
        default: 0
    },
    hourlyMap: {
        type: Map,
        of: Number,
        default: {} // Stores traffic by hour e.g., '0' to '23'
    }
}, { timestamps: true });

module.exports = mongoose.model('Visit', visitSchema);
