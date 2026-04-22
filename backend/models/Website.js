const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const websiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  trackingId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sessions: {
    type: Number,
    default: 0
  },
  events: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Website', websiteSchema);
