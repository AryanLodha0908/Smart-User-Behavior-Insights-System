/**
 * Smart User Behavior Insights Tracking Script
 *
 * Usage: Add this to your website
 * <script>
 *   window.BehaviorTracking = {
 *     trackingId: 'YOUR_TRACKING_ID_HERE'
 *   };
 * </script>
 * <script src="https://your-domain.com/tracker.js"></script>
 */

(function() {
  'use strict';

  // Configuration
  const config = window.BehaviorTracking || {};
  const trackingId = config.trackingId;
  
  // Auto-detect API URL - smart fallback strategy
  let apiUrl = config.apiUrl;
  if (!apiUrl) {
    // If not explicitly set, try to detect from environment
    // Priority: config.apiUrl > same domain > localhost:5000
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    
    // If running on Vercel or any domain
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      // Use same domain, same protocol
      apiUrl = `${currentProtocol}//${currentHost}/api`;
    } else {
      // Local development: try localhost:5000
      apiUrl = 'http://localhost:5000/api';
    }
  }

  if (!trackingId) {
    console.error('Behavior Tracker: trackingId not configured');
    console.warn('Usage: window.BehaviorTracking = { trackingId: "YOUR_ID_HERE" };');
    return;
  }
  
  console.log('✅ Behavior Tracker initialized');
  console.log('📍 Tracking ID:', trackingId);
  console.log('🔗 API URL:', apiUrl);

  // Session management
  let sessionData = {
    sessionId: localStorage.getItem('behavior_session_id') || generateUUID(),
    userId: localStorage.getItem('behavior_user_id') || generateUUID(),
    trackingId: trackingId,
    startTime: Date.now(),
    lastActivityTime: Date.now(),
    pageEnterTime: Date.now()
  };

  localStorage.setItem('behavior_session_id', sessionData.sessionId);
  localStorage.setItem('behavior_user_id', sessionData.userId);

  // Helper functions
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile|android|iphone|ipad|phone/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function getScrollDepth() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    return Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
  }

  function sendEvent(eventType, data = {}) {
    const payload = {
      trackingId: trackingId,
      sessionId: sessionData.sessionId,
      userId: sessionData.userId,
      eventType: eventType,
      page: window.location.pathname,
      pageTitle: document.title,
      deviceType: getDeviceType(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...data
    };

    const endpoint = `${apiUrl}/tracking/${eventType}`;
    
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    })
    .then(response => {
      if (!response.ok) {
        console.warn(`⚠️ Tracking event failed: ${eventType} - Status ${response.status}`);
      }
    })
    .catch(err => {
      console.debug('📌 Tracking debug:', { endpoint, error: err.message, eventType });
    });

    sessionData.lastActivityTime = Date.now();
  }

  // Track initial page view
  function trackPageView() {
    sendEvent('pageview', {
      referrer: document.referrer || 'direct'
    });
  }

  // Track clicks
  function trackClick(event) {
    const element = event.target;
    sendEvent('click', {
      element: element.tagName,
      elementClass: element.className,
      elementId: element.id
    });
  }

  // Track scroll depth
  let scrollTimeout;
  function trackScroll() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const depth = getScrollDepth();
      sendEvent('scroll', {
        scrollDepth: depth,
        scrollPosition: window.scrollY
      });
    }, 1000); // Debounce scroll events
  }

  // Track mouse movement (optional, for heatmap)
  let mouseTrackingCounter = 0;
  function trackMouseMove(event) {
    mouseTrackingCounter++;
    // Sample 1 in 100 mouse movements to reduce data
    if (mouseTrackingCounter % 100 === 0) {
      sendEvent('mousemove', {
        mouseX: event.clientX,
        mouseY: event.clientY
      });
    }
  }

  // Track time on page when leaving
  function trackSessionEnd() {
    const timeOnPage = Math.round((Date.now() - sessionData.startTime) / 1000);

    fetch(`${apiUrl}/tracking/end-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackingId: trackingId,
        sessionId: sessionData.sessionId,
        userId: sessionData.userId,
        duration: timeOnPage
      }),
      keepalive: true
    }).catch(err => console.debug('Session end tracking failed:', err));
  }

  // Initialize tracking
  function init() {
    console.log('🚀 Initializing Behavior Tracker...');
    
    // Page view
    trackPageView();
    console.log('📊 Page view tracked');

    // Click tracking
    document.addEventListener('click', trackClick);

    // Scroll tracking
    window.addEventListener('scroll', trackScroll);

    // Mouse movement tracking (optional)
    if (config.trackMouse !== false) {
      document.addEventListener('mousemove', trackMouseMove);
    }

    // Session end tracking
    window.addEventListener('beforeunload', trackSessionEnd);

    // Inactivity logout (30 minutes)
    const inactivityTimeout = config.inactivityTimeout || 30 * 60 * 1000;
    setInterval(() => {
      const inactiveTime = Date.now() - sessionData.lastActivityTime;
      if (inactiveTime > inactivityTimeout) {
        trackSessionEnd();
        sessionData.sessionId = generateUUID();
        localStorage.setItem('behavior_session_id', sessionData.sessionId);
        sessionData.startTime = Date.now();
      }
    }, 60000); // Check every minute

    console.log('✅ Behavior Tracking initialized');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for testing
  window.BehaviorTracker = {
    sendEvent,
    getScrollDepth,
    getDeviceType
  };
})();
