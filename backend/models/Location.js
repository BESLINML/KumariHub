const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  locationName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('location', locationSchema);