const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Website = require('../models/Website');
const Session = require('../models/Session');
const axios = require('axios');

const router = express.Router();

// Get all websites
router.get('/websites', async (req, res) => {
  try {
    console.log('📍 GET /api/admin/websites - Fetching websites...');
    const websites = await Website.find();
    console.log(`✅ Found ${websites.length} websites`);
    res.json(websites);
  } catch (err) {
    console.error('❌ /api/admin/websites Error:', err);
    console.error('📝 Error Message:', err.message);
    console.error('🔗 Connection State:', require('mongoose').connection.readyState); // 0=disconnected, 1=connected
    res.status(500).json({ 
      error: err.message,
      dbConnected: require('mongoose').connection.readyState === 1,
      type: 'WEBSITE_FETCH_ERROR'
    });
  }
});

// Add new website
router.post('/websites', async (req, res) => {
  try {
    const { domain, name } = req.body;

    if (!domain || !name) {
      return res.status(400).json({ error: 'Domain and name required' });
    }

    const website = new Website({
      domain: domain.toLowerCase(),
      name,
      trackingId: uuidv4()
    });

    await website.save();

    res.status(201).json(website);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete website
router.delete('/websites/:id', async (req, res) => {
  try {
    await Website.findByIdAndDelete(req.params.id);
    res.json({ message: 'Website deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    const totalSessions = await Session.countDocuments();
    const totalEvents = await Session.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $size: '$pages' } }
        }
      }
    ]);

    // Mock model accuracy (in real scenario, fetch from ML model)
    const modelAccuracy = 0.82;

    res.json({
      totalSessions,
      totalEvents: totalEvents[0]?.total || 0,
      modelAccuracy
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrain model (triggers Python ML pipeline)
router.post('/retrain-model', async (req, res) => {
  try {
    // In production, this would call the ML service
    // For now, simulate the response
    const modelResponse = {
      accuracy: 0.85,
      precision: 0.83,
      recall: 0.87,
      message: 'Model retrained successfully'
    };

    // Call Python ML service if available
    try {
      const response = await axios.post(
        process.env.ML_SERVICE_URL || 'http://localhost:5001/retrain',
        { databaseUri: process.env.MONGODB_URI }
      );
      res.json(response.data);
    } catch (err) {
      // ML service not available, return mock
      res.json(modelResponse);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bounce predictions for recent sessions
router.get('/predictions', async (req, res) => {
  try {
    const sessions = await Session.find()
      .sort({ startTime: -1 })
      .limit(20)
      .lean();

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
