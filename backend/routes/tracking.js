const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');
const Event = require('../models/Event');
const Website = require('../models/Website');

const router = express.Router();

// Middleware to validate tracking ID
const validateTrackingId = async (req, res, next) => {
  const { trackingId } = req.body;
  if (!trackingId) {
    return res.status(400).json({ error: 'Tracking ID required' });
  }

  try {
    const website = await Website.findOne({ trackingId });
    if (!website) {
      return res.status(404).json({ error: 'Invalid tracking ID' });
    }
    req.website = website;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Track page view
router.post('/pageview', validateTrackingId, async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      page,
      pageTitle,
      referrer,
      deviceType,
      userAgent
    } = req.body;

    // Create or get session
    let session = await Session.findOne({ sessionId });

    if (!session) {
      session = new Session({
        sessionId: sessionId || uuidv4(),
        userId: userId || uuidv4(),
        websiteId: req.website._id,
        deviceType,
        userAgent,
        pages: [{
          url: page,
          title: pageTitle,
          timestamp: new Date(),
          timeOnPage: 0,
          clicks: 0,
          scrollDepth: 0
        }]
      });
    } else {
      // Add page to existing session
      session.pages.push({
        url: page,
        title: pageTitle,
        timestamp: new Date(),
        timeOnPage: 0,
        clicks: 0,
        scrollDepth: 0
      });
    }

    await session.save();

    // Create event record
    const event = new Event({
      sessionId: session.sessionId,
      userId: session.userId,
      websiteId: req.website._id,
      eventType: 'pageview',
      page,
      pageTitle,
      deviceType,
      userAgent
    });

    await event.save();

    // Update website stats
    await Website.updateOne(
      { _id: req.website._id },
      { $inc: { events: 1 } }
    );

    res.json({
      sessionId: session.sessionId,
      userId: session.userId,
      message: 'Page view tracked'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track click event
router.post('/click', validateTrackingId, async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      page,
      element,
      elementClass,
      elementId
    } = req.body;

    const event = new Event({
      sessionId,
      userId,
      websiteId: req.website._id,
      eventType: 'click',
      page,
      element,
      elementClass,
      elementId
    });

    await event.save();

    // Update session click count
    await Session.updateOne(
      { sessionId, 'pages.url': page },
      { $inc: { 'pages.$.clicks': 1, totalClicks: 1 } }
    );

    await Website.updateOne(
      { _id: req.website._id },
      { $inc: { events: 1 } }
    );

    res.json({ message: 'Click tracked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track scroll depth
router.post('/scroll', validateTrackingId, async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      page,
      scrollDepth
    } = req.body;

    const event = new Event({
      sessionId,
      userId,
      websiteId: req.website._id,
      eventType: 'scroll',
      page,
      scrollDepth
    });

    await event.save();

    // Update session scroll depth (keep max value)
    const session = await Session.findOne({ sessionId });
    if (session) {
      const pageIndex = session.pages.findIndex(p => p.url === page);
      if (pageIndex !== -1) {
        if (scrollDepth > (session.pages[pageIndex].scrollDepth || 0)) {
          session.pages[pageIndex].scrollDepth = scrollDepth;
          await session.save();
        }
      }
    }

    await Website.updateOne(
      { _id: req.website._id },
      { $inc: { events: 1 } }
    );

    res.json({ message: 'Scroll tracked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// End session
router.post('/end-session', validateTrackingId, async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.endTime = new Date();
    session.duration = Math.round((session.endTime - session.startTime) / 1000); // in seconds

    // Calculate engagement score
    const avgScrollDepth = session.pages.reduce((acc, p) => acc + (p.scrollDepth || 0), 0) / session.pages.length;
    const totalInteractions = session.pages.reduce((acc, p) => acc + (p.clicks || 0), 0);

    // Simple engagement formula: (scroll% + clicks_normalized + pages_normalized) / 3
    const scrollScore = avgScrollDepth / 100 * 10; // 0-10
    const clickScore = Math.min(totalInteractions / 5, 1) * 10; // normalized to 0-10
    const pageScore = Math.min(session.pages.length / 10, 1) * 10; // normalized to 0-10

    session.engagementScore = (scrollScore + clickScore + pageScore) / 3;
    session.avgScrollDepth = avgScrollDepth;
    session.totalClicks = totalInteractions;

    // Rule-based bounce detection: low engagement + short session
    session.bounced = session.engagementScore < 3 && session.duration < 30;

    await session.save();

    // Update website session count
    await Website.updateOne(
      { _id: req.website._id },
      { $inc: { sessions: 1 } }
    );

    res.json({
      sessionId,
      engagementScore: session.engagementScore,
      bounced: session.bounced,
      duration: session.duration
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
