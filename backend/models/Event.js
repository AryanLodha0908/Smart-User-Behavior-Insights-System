const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
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
  eventType: {
    type: String,
    enum: ['pageview', 'click', 'scroll', 'mousemove', 'custom'],
    required: true,
    index: true
  },
  page: String,
  pageTitle: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  // For click events
  element: String,
  elementClass: String,
  elementId: String,
  // For scroll events
  scrollDepth: Number, // percentage
  scrollPosition: Number, // pixels
  // For mousemove events
  mouseX: Number,
  mouseY: Number,
  // Custom event data
  data: mongoose.Schema.Types.Mixed,
  // Device info
  deviceType: String,
  userAgent: String
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
