const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    index: true
  },
  startTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  endTime: Date,
  duration: Number, // in seconds
  pages: [{
    url: String,
    title: String,
    timeOnPage: Number,
    scrollDepth: Number, // percentage
    clicks: Number,
    timestamp: Date
  }],
  totalClicks: Number,
  totalScrollDepth: Number,
  avgScrollDepth: Number,
  engagementScore: Number, // 0-10
  bounced: Boolean, // rule-based detection
  bounceProb: Number, // ML prediction probability
  deviceType: String,
  userAgent: String,
  location: {
    country: String,
    city: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
