const express = require('express');
const Session = require('../models/Session');
const Website = require('../models/Website');
const { Parser } = require('json2csv');

const router = express.Router();

// Parse date filter
const parseFilters = async (req) => {
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

  return query;
};

// Get overall statistics
router.get('/stats', async (req, res) => {
  try {
    const query = await parseFilters(req);

    const sessions = await Session.find(query);

    const stats = {
      totalUsers: new Set(sessions.map(s => s.userId)).size,
      activeSessions: sessions.filter(s => !s.endTime).length,
      avgSessionDuration: sessions.length > 0
        ? sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length
        : 0,
      bounceRate: sessions.length > 0
        ? (sessions.filter(s => s.bounced).length / sessions.length) * 100
        : 0,
      engagementScore: sessions.length > 0
        ? sessions.reduce((acc, s) => acc + (s.engagementScore || 0), 0) / sessions.length
        : 0,
      totalPageViews: sessions.reduce((acc, s) => acc + s.pages.length, 0)
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get timeline data for charts
router.get('/timeline', async (req, res) => {
  try {
    const query = await parseFilters(req);

    const sessions = await Session.find(query).sort({ startTime: 1 });

    // Group by date
    const timelineMap = {};
    sessions.forEach(session => {
      const dateKey = session.startTime.toISOString().split('T')[0];

      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = {
          timestamp: dateKey,
          users: new Set(),
          pageViews: 0,
          avgEngagementScore: 0,
          bounceRate: 0,
          engagementScores: [],
          bounceCount: 0,
          sessionCount: 0
        };
      }

      timelineMap[dateKey].users.add(session.userId);
      timelineMap[dateKey].pageViews += session.pages.length;
      timelineMap[dateKey].engagementScores.push(session.engagementScore);
      timelineMap[dateKey].bounceCount += session.bounced ? 1 : 0;
      timelineMap[dateKey].sessionCount += 1;
    });

    // Calculate averages
    const timeline = Object.values(timelineMap).map(day => ({
      timestamp: day.timestamp,
      users: day.users.size,
      pageViews: day.pageViews,
      avgEngagementScore: day.engagementScores.length > 0
        ? day.engagementScores.reduce((a, b) => a + b) / day.engagementScores.length
        : 0,
      bounceRate: day.sessionCount > 0 ? (day.bounceCount / day.sessionCount) * 100 : 0
    }));

    res.json(timeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user segmentation
router.get('/segmentation', async (req, res) => {
  try {
    const query = await parseFilters(req);

    const sessions = await Session.find(query);

    const segments = {
      highEngagement: 0,
      mediumEngagement: 0,
      lowEngagement: 0
    };

    sessions.forEach(session => {
      if (session.engagementScore > 6) segments.highEngagement++;
      else if (session.engagementScore > 3) segments.mediumEngagement++;
      else segments.lowEngagement++;
    });

    const data = [
      { name: 'Highly Engaged', value: segments.highEngagement },
      { name: 'Medium Engagement', value: segments.mediumEngagement },
      { name: 'Low Engagement', value: segments.lowEngagement }
    ];

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get page performance
router.get('/pages', async (req, res) => {
  try {
    const query = await parseFilters(req);

    const sessions = await Session.find(query);

    const pageMap = {};

    sessions.forEach(session => {
      session.pages.forEach(page => {
        if (!pageMap[page.url]) {
          pageMap[page.url] = {
            page: page.url,
            visits: 0,
            totalTimeOnPage: 0,
            totalScrollDepth: 0,
            totalClicks: 0,
            engagementScores: []
          };
        }

        pageMap[page.url].visits++;
        pageMap[page.url].totalTimeOnPage += page.timeOnPage || 0;
        pageMap[page.url].totalScrollDepth += page.scrollDepth || 0;
        pageMap[page.url].totalClicks += page.clicks || 0;
        pageMap[page.url].engagementScores.push(session.engagementScore);
      });
    });

    const pages = Object.values(pageMap).map(page => ({
      page: page.page,
      visits: page.visits,
      avgTimeOnPage: page.visits > 0 ? Math.round(page.totalTimeOnPage / page.visits) : 0,
      avgScrollDepth: page.visits > 0 ? Math.round(page.totalScrollDepth / page.visits) : 0,
      avgEngagementScore: page.engagementScores.length > 0
        ? (page.engagementScores.reduce((a, b) => a + b) / page.engagementScores.length)
        : 0,
      totalClicks: page.totalClicks
    }));

    res.json(pages.sort((a, b) => b.visits - a.visits));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export data as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const query = await parseFilters(req);
    const sessions = await Session.find(query).lean();

    // Flatten session data for CSV
    const csv_data = sessions.map(s => ({
      sessionId: s.sessionId,
      userId: s.userId,
      duration: s.duration,
      engagementScore: s.engagementScore,
      bounced: s.bounced,
      bounceProb: s.bounceProb,
      pageCount: s.pages.length,
      totalClicks: s.totalClicks,
      avgScrollDepth: s.avgScrollDepth,
      createdAt: s.createdAt
    }));

    const parser = new Parser();
    const csv = parser.parse(csv_data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export data as PDF (simplified)
router.get('/export/pdf', async (req, res) => {
  try {
    const query = await parseFilters(req);
    const stats = await Session.find(query);

    const summary = {
      generated: new Date().toISOString(),
      totalSessions: stats.length,
      avgEngagement: stats.reduce((a, b) => a + (b.engagementScore || 0), 0) / stats.length
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
