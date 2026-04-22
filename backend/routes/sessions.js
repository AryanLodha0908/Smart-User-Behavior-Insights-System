const express = require('express');
const Session = require('../models/Session');
const Website = require('../models/Website');

const router = express.Router();

// Get recent sessions
router.get('/recent', async (req, res) => {
  try {
    let query = {};

    if (req.query.startDate && req.query.endDate) {
      query.startTime = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    if (req.query.website && req.query.website !== 'all') {
      const website = await Website.findOne({ domain: req.query.website });
      if (website) query.websiteId = website._id;
    }

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .limit(50)
      .lean();

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get session details
router.get('/:sessionId', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
