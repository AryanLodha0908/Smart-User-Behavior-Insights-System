# 🔗 Integration & Tracking Guide

Complete guide to integrate the Smart User Behavior Insights tracking script into your websites.

## Quick Integration (2 Steps)

### Step 1: Get Your Tracking ID

1. Open Admin Panel: http://localhost:3000/admin
2. Click "Add New Website"
3. Enter your domain (e.g., `example.com`) and website name
4. Click "Add Website"
5. Copy the **Tracking ID** from the list

### Step 2: Add Script to Your Website

Add this to your website's HTML (in `<head>` or before `</body>`):

```html
<script>
  window.BehaviorTracking = {
    trackingId: 'YOUR_TRACKING_ID_HERE'
  };
</script>
<script src="http://localhost:5000/tracker.js"></script>
```

Replace `YOUR_TRACKING_ID_HERE` with your actual tracking ID.

**Done!** Your website is now tracked.

---

## ✅ Verify Installation

After adding the script:

1. Open browser DevTools (F12) → Console
2. Should see: `✅ Behavior Tracking initialized`
3. Visit Admin Panel
4. Your website should show session count increasing

---

## 🎛️ Advanced Configuration

### Configuration Options

```javascript
window.BehaviorTracking = {
  // Required
  trackingId: 'your-tracking-id',
  
  // Optional
  apiUrl: 'http://localhost:5000/api',      // Default
  trackMouse: true,                          // Enable mouse tracking
  inactivityTimeout: 30 * 60 * 1000         // 30 minutes inactivity
};
```

### Disable Mouse Tracking (Save Bandwidth)

```javascript
window.BehaviorTracking = {
  trackingId: 'your-id',
  trackMouse: false
};
```

### Custom Inactivity Timeout

```javascript
window.BehaviorTracking = {
  trackingId: 'your-id',
  inactivityTimeout: 15 * 60 * 1000  // 15 minutes
};
```

PS C:\Users\HP\Desktop\Project\Smart User Behavior Insights System> curl http://localhost:5000/tracker.js                        
                                                                                                                                 
Security Warning: Script Execution Risk                                                                                          
Invoke-WebRequest parses the content of the web page. Script code in the web page might be run when the page is parsed.          
      RECOMMENDED ACTION:
      Use the -UseBasicParsing switch to avoid script code execution.

      Do you want to continue?
    
[Y] Yes  [A] Yes to All  [N] No  [L] No to All  [S] Suspend  [?] Help (default is "N"): y


StatusCode        : 200
StatusDescription : OK
Content           : /**
                     * Smart User Behavior Insights Tracking Script
                     *
                     * Usage: Add this to your website
                     * <script>
                     *   window.BehaviorTracking = {
                     *     trackingId: 'YOUR_TRACKING_ID_HERE'
                     *   };
                     * </script>
                     ...
RawContent        : HTTP/1.1 200 OK
                    Access-Control-Allow-Origin: *
                    Connection: keep-alive
                    Keep-Alive: timeout=5
                    Accept-Ranges: bytes
                    Content-Length: 5371
                    Cache-Control: max-age=3600
                    Content-Type: application/javas...
Forms             : {}
Headers           : {[Access-Control-Allow-Origin, *], [Connection, keep-alive], [Keep-Alive, timeout=5], [Accept-Ranges, 
                    bytes]...}
Images            : {}
InputFields       : {}
Links             : {}
ParsedHtml        : mshtml.HTMLDocumentClass
RawContentLength  : 5371

---

## 📊 What Gets Tracked

### Automatically Captured
✅ Page views (URL, title, referrer)  
✅ Click events (element, class, ID)  
✅ Scroll depth (percentage)  
✅ Time on page  
✅ Device type (mobile/desktop)  
✅ Geographic location  
✅ Session duration  

### NOT Tracked
❌ Form input values  
❌ Passwords  
❌ Personal data  
❌ Sensitive information  

---

## 🔄 Session Lifecycle

```
1. User visits site
   ↓
2. Script loads, generates sessionId
   ↓
3. Pageview event sent
   ↓
4. User interactions tracked (clicks, scroll)
   ↓
5. Engagement score calculated
   ↓
6. User leaves → Session end event
   ↓
7. Backend predicts bounce probability
   ↓
8. Analytics updated on dashboard
```

---

## 🛠️ Framework Integration Examples

### WordPress

Add to `wp-content/themes/your-theme/header.php`:

```php
<?php if (!is_admin()): ?>
<script>
  window.BehaviorTracking = {
    trackingId: '<?php echo get_option("tracking_id"); ?>'
  };
</script>
<script src="http://localhost:5000/tracker.js"></script>
<?php endif; ?>
```

### React / Next.js

Add to `public/index.html`:

```html
<script>
  window.BehaviorTracking = {
    trackingId: 'YOUR_TRACKING_ID'
  };
</script>
<script src="http://localhost:5000/tracker.js"></script>
```

### Vue.js

Add to `public/index.html`:

```html
<script>
  window.BehaviorTracking = {
    trackingId: 'YOUR_TRACKING_ID'
  };
</script>
<script src="http://localhost:5000/tracker.js"></script>
```

### Static HTML Site

Add to every HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Your other scripts -->
  
  <script>
    window.BehaviorTracking = { trackingId: 'YOUR_ID' };
  </script>
  <script src="http://localhost:5000/tracker.js"></script>
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

---

## 🧪 Testing & Debugging

### Check Script Loading

```javascript
// In browser console
console.log(window.BehaviorTracking);  // Should show config
console.log(window.BehaviorTracker);   // Should exist
```

### View Session Data

```javascript
localStorage.getItem('behavior_session_id');  // Session ID
localStorage.getItem('behavior_user_id');     // User ID
```

### Monitor Network Requests

1. Open DevTools → Network tab
2. Filter for `api/tracking`
3. Should see requests for:
   - pageview (when page loads)
   - click (when you click)
   - scroll (when you scroll)
   - end-session (when leaving)

### Check Dashboard

1. Visit http://localhost:3000
2. Check stats are updating
3. Recent sessions table should show new sessions
4. Engagement score should appear

---

## 🚨 Troubleshooting

### Script Not Loading

**Error**: Console shows errors or no "Tracking initialized" message

```javascript
// Check 1: Config exists
console.log(window.BehaviorTracking);

// Check 2: API reachable
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('API OK:', d))
  .catch(e => console.error('API Error:', e));
```

**Solutions**:
- Verify tracking ID is correct (copy from Admin Panel)
- Check backend is running: `docker-compose ps`
- Verify API URL in config
- Check browser console for errors

### CORS Error

**Error**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**: Backend already has CORS enabled. If error persists:
1. Check backend container logs: `docker-compose logs backend`
2. Verify CORS middleware in `backend/server.js`

### API Returns 404

**Error**: "Tracking ID not found"

**Solution**:
1. Check website exists in Admin Panel
2. Get correct tracking ID from Admin Panel
3. Update script with correct ID

### Sessions Not Appearing

**Symptom**: No sessions in dashboard table

**Debug**:
```bash
# Check MongoDB
docker-compose exec mongodb mongosh -u root -p root

# View sessions
use behavior_insights
db.sessions.find().limit(1)
```

**Solutions**:
1. Verify backend is running
2. Check MongoDB is running
3. Wait 10 seconds for dashboard refresh
4. Check browser console for errors

---

## 📱 Mobile Tracking

The script works automatically on mobile devices.

```javascript
// For mobile, disable mouse tracking (optional)
window.BehaviorTracking = {
  trackingId: 'your-id',
  trackMouse: false
};
```

### Automatically Detected
- Device type (mobile/desktop)
- Screen resolution
- Touch events (as clicks)
- Mobile browser info

---

## 🔐 Privacy & Compliance

### GDPR Compliance

The script captures **no PII** (personally identifiable information).

To add consent banner:

```html
<script>
  // Only load if user consents
  if (userConsentsToTracking()) {
    window.BehaviorTracking = { trackingId: 'your-id' };
    var script = document.createElement('script');
    script.src = 'http://localhost:5000/tracker.js';
    document.head.appendChild(script);
  }
</script>
```

### What NOT to Track

Never add to `window.BehaviorTracking.data`:
- Personal names
- Email addresses
- Phone numbers
- Credit card numbers
- Social security numbers
- Passwords
- Form values

---

## ⚡ Performance

### Lightweight

- Script size: ~10KB gzipped
- Non-blocking async loading
- No page render delay
- Minimal bandwidth usage

### Optimized Events

- Scroll: Debounced every 1 second
- Mouse: Sampled (1 per 100 movements)
- Reduces data collection and server load

### Best Practices

1. **Disable mouse tracking for high-traffic sites**:
   ```javascript
   trackMouse: false
   ```

2. **Adjust inactivity timeout for your use case**:
   ```javascript
   inactivityTimeout: 20 * 60 * 1000  // 20 minutes
   ```

3. **Use CDN in production**:
   ```html
   <script src="https://cdn.yourdomain.com/tracker.js"></script>
   ```

---

## 🎯 Custom Event Tracking

Send custom events from your website:

```javascript
// After tracker is loaded
if (window.BehaviorTracker) {
  window.BehaviorTracker.sendEvent('custom-action', {
    actionName: 'button-click',
    buttonId: 'subscribe-btn'
  });
}
```

---

## 📞 FAQ

**Q: Does tracking slow down my website?**  
A: No. The script loads asynchronously and doesn't block page rendering.

**Q: Can I track multiple websites?**  
A: Yes! Add each website from Admin Panel, get its tracking ID, and use that ID.

**Q: What data is collected?**  
A: Behavior only (pages, clicks, scroll). No personal data unless you add it custom.

**Q: Is HTTPS required?**  
A: Recommended for production. HTTP works for development.

**Q: Can users opt-out?**  
A: Implement consent check before loading script (see Privacy section).

**Q: How long is data stored?**  
A: Depends on your MongoDB retention policy (configurable).

---

## 🚀 Next Steps

1. ✅ Get tracking ID from Admin Panel
2. ✅ Add script to your website
3. ✅ Test using browser console
4. ✅ Verify in dashboard
5. ✅ Monitor analytics
6. ✅ Optimize based on insights

---

## 📚 See Also

- [README.md](./README.md) - Project overview
- [INSTALLATION.md](./INSTALLATION.md) - Setup guide
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical design

---

**Last Updated**: 2026-04-19  
**Version**: 1.0.0
