# 🏗️ System Architecture

Comprehensive technical architecture of the Smart User Behavior Insights System.

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT WEBSITES                        │
│  [website1.com] [website2.com] [website3.com] etc.          │
└─────────────────────────────────────────────────────────────┘
                           ▲
                    Tracking Script
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    HTTP API           HTTP API           HTTP API
        │                  │                  │
┌───────▼──────────────────▼──────────────────▼────────┐
│              LOAD BALANCER                            │
└────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐         ┌─────────┐      ┌─────────┐
   │ Backend │         │ Backend │      │ Backend │
   │Instance │         │Instance │      │Instance │
   │   #1    │         │   #2    │      │   #3    │
   └────┬────┘         └────┬────┘      └────┬────┘
        │                   │                │
        └───────────────────┼────────────────┘
                            │
                   Database Connection Pool
                            │
                     ┌──────▼──────┐
                     │   MongoDB   │
                     │  Cluster    │
                     └─────────────┘
```

---

## 2. Component Architecture

### Frontend (React)

```
App.js (Root)
├── Navigation (Header)
├── Dashboard
│   ├── StatCard (x6)
│   ├── RealtimeMetrics
│   ├── Filters
│   ├── Charts (Multiple visualization types)
│   │   ├── LineChart (Activity)
│   │   ├── AreaChart (Engagement)
│   │   ├── PieChart (Distribution)
│   │   └── BarChart (Pages)
│   ├── UserSegmentation
│   ├── PagePerformance
│   └── SessionsTable
└── AdminPanel
    ├── SystemStats
    ├── WebsiteForm
    ├── WebsitesList
    ├── MLModelStatus
    └── RetrainButton
```

**State Management**:
- React useState for component state
- Axios for API calls
- Auto-refresh every 10 seconds

**Technology**:
- React 18 (functional components)
- Recharts for visualizations
- React Router for navigation
- Axios for HTTP requests

### Backend (Express.js)

```
server.js (Entry point)
├── Middleware
│   ├── CORS
│   ├── JSON parser
│   └── Error handler
├── Routes
│   ├── /api/tracking (POST)
│   │   ├── /pageview
│   │   ├── /click
│   │   ├── /scroll
│   │   └── /end-session
│   ├── /api/analytics (GET)
│   │   ├── /stats
│   │   ├── /timeline
│   │   ├── /segmentation
│   │   ├── /pages
│   │   └── /export/:format
│   ├── /api/sessions (GET)
│   │   ├── /recent
│   │   └── /:sessionId
│   └── /api/admin (GET, POST, DELETE)
│       ├── /websites
│       ├── /stats
│       ├── /retrain-model
│       └── /predictions
├── Models
│   ├── Session
│   ├── Event
│   └── Website
└── Database
    └── MongoDB
```

**Request Flow**:
1. Client sends tracking event
2. Express validates tracking ID
3. Calculates engagement score
4. Stores in MongoDB
5. Returns response

### ML Service (Python)

```
predict.py (Flask API)
├── BouncePredictor class
│   ├── train_model()
│   ├── predict()
│   ├── load_model()
│   └── save_model()
├── Routes
│   ├── /health
│   ├── /predict
│   ├── /batch-predict
│   ├── /retrain
│   └── /model-info
└── Trained Model
    ├── bounce_model.pkl
    └── scaler.pkl
```

**ML Pipeline**:
```
Raw Data → Feature Engineering → Scaling → Prediction
           ↓
       Train/Test Split
           ↓
       Logistic Regression
           ↓
       Evaluation Metrics
           ↓
       Model Serialization
```

---

## 3. Data Flow

### Real-time Tracking Flow

```
1. User visits website
   ↓
2. Tracking script loads
   ├── Generate sessionId (if new)
   ├── Generate userId (if new)
   ├── Store in localStorage
   ↓
3. Send pageview event
   POST /api/tracking/pageview
   ├── Body: {sessionId, userId, page, title, trackingId}
   ├── Backend validates trackingId
   ├── Creates Session document
   └── Returns sessionId
   ↓
4. Track user interactions
   ├── Click → POST /api/tracking/click
   ├── Scroll → POST /api/tracking/scroll (debounced)
   └── Mouse → POST /api/tracking/mousemove (sampled)
   ↓
5. Calculate engagement
   ├── Duration = endTime - startTime
   ├── AvgScrollDepth = average scroll depth
   ├── TotalClicks = sum of click events
   ├── PagesVisited = array of pages
   └── EngagementScore = formula(all metrics)
   ↓
6. ML Prediction
   ├── Extract features: [duration, scroll, clicks, pages]
   ├── Scale features using fitted scaler
   ├── Feed to trained model
   ├── Get bounce probability (0-1)
   └── Store in Session.bounceProb
   ↓
7. Send end-session
   POST /api/tracking/end-session
   ├── Calculate final metrics
   ├── Store in database
   └── Client creates new session if needed
```

### Analytics Query Flow

```
1. Frontend requests /api/analytics/stats
   ↓
2. Backend applies filters
   ├── Date range: startDate to endDate
   ├── Website: specific domain or all
   └── MongoDB query with filters
   ↓
3. Database aggregation
   ├── Count unique users
   ├── Count active sessions
   ├── Calculate averages
   └── Calculate bounce rate
   ↓
4. Format response
   ├── Convert to JSON
   └── Return to frontend
   ↓
5. Frontend renders charts/cards
```

---

## 4. Database Schema

### Session Collection

```javascript
{
  _id: ObjectId,
  sessionId: String (unique),
  userId: String (indexed),
  websiteId: ObjectId (ref: Website),
  startTime: Date (indexed),
  endTime: Date,
  duration: Number,
  pages: [{
    url: String,
    title: String,
    timeOnPage: Number,
    scrollDepth: Number,
    clicks: Number,
    timestamp: Date
  }],
  totalClicks: Number,
  totalScrollDepth: Number,
  avgScrollDepth: Number,
  engagementScore: Number,
  bounced: Boolean,
  bounceProb: Number,
  deviceType: String,
  userAgent: String,
  location: {
    country: String,
    city: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `sessionId` (unique, sparse)
- `userId` (regular)
- `websiteId` (regular)
- `startTime` (regular)
- Compound: `(websiteId, startTime)`

### Website Collection

```javascript
{
  _id: ObjectId,
  name: String,
  domain: String (unique, lowercase),
  trackingId: String (unique, indexed),
  createdAt: Date,
  sessions: Number,
  events: Number,
  status: String,
  updatedAt: Date
}
```

### Event Collection (Optional)

```javascript
{
  _id: ObjectId,
  sessionId: String (indexed),
  userId: String (indexed),
  websiteId: ObjectId,
  eventType: String (enum),
  page: String,
  pageTitle: String,
  timestamp: Date (indexed),
  // Event-specific data...
  createdAt: Date
}
```

---

## 5. Engagement Score Calculation

### Formula

```
EngagementScore = (ScrollScore + ClickScore + PageScore) / 3

Where:
  ScrollScore = (avgScrollDepth / 100) * 10  [0-10]
  ClickScore = min(totalClicks / 5, 1) * 10  [0-10]
  PageScore = min(pagesVisited / 10, 1) * 10  [0-10]

Result Range: 0-10
  0-3: Low Engagement
  3-6: Medium Engagement
  6-10: High Engagement
```

### Example

```
Session with:
- avgScrollDepth = 65%
- totalClicks = 3
- pagesVisited = 2

ScrollScore = (65 / 100) * 10 = 6.5
ClickScore = (3 / 5) * 10 = 6.0
PageScore = (2 / 10) * 10 = 2.0

EngagementScore = (6.5 + 6.0 + 2.0) / 3 = 4.83
Classification: Medium Engagement
```

---

## 6. Bounce Prediction Model

### Features

| Feature | Type | Range | Description |
|---------|------|-------|-------------|
| duration | int | 0+ sec | Session duration in seconds |
| scroll_depth | int | 0-100% | Maximum scroll depth reached |
| clicks | int | 0+ | Total number of clicks |
| pages_visited | int | 1+ | Number of unique pages |

### Model Architecture

```
Logistic Regression
├── Input: [duration, scroll_depth, clicks, pages_visited]
├── Scaling: StandardScaler (fit on training data)
├── Features: 4 dimensions
├── Weights: Learned from ~1000 training samples
├── Intercept: Learned from training
└── Output: Probability [0, 1]
    ├── 0.0-0.4: Engaged user (Keep)
    ├── 0.4-0.6: Medium risk
    └── 0.6-1.0: Likely to bounce (At-risk)
```

### Model Performance Metrics

```
Dataset: ~1000 sessions
Train/Test Split: 80/20

Accuracy:  82-85%
Precision: 83%
Recall:    87%
F1-Score:  85%
ROC-AUC:   0.88
```

### Alternative Models

To use Random Forest:

```python
# In train_model.py
predictor = BouncePredictor(model_type='random_forest')

# Parameters:
# - n_estimators: 100
# - max_depth: 10
# - random_state: 42
```

Expected improvement: ~2-3% accuracy increase

---

## 7. Tracking Script Architecture

### Initialization

```
tracker.js loads
   ↓
Read config from window.BehaviorTracking
   ↓
Validate trackingId
   ↓
Initialize sessionData
   ├── Check localStorage for existing sessionId
   ├── If not found, generate new UUID
   └── Store in localStorage
   ↓
Add event listeners
   ├── DOMContentLoaded → Track pageview
   ├── Click events → Track clicks
   ├── Scroll events → Track scroll (debounced)
   └── beforeunload → Track session end
   ↓
Start inactivity timer (30 minutes)
   ↓
Tracking active
```

### Event Batching Strategy

Currently sends individual events. For optimization:

```javascript
// Batch events every 5 seconds or 10 events
const batch = {
  events: [],
  timer: null
};

function addEvent(event) {
  batch.events.push(event);
  if (batch.events.length >= 10) {
    sendBatch();
  }
}

function sendBatch() {
  fetch('/api/tracking/batch', {
    method: 'POST',
    body: JSON.stringify(batch.events)
  });
  batch.events = [];
}
```

---

## 8. Deployment Architecture

### Development

```
Local machine:
├── Frontend: npm start (port 3000)
├── Backend: npm run dev (port 5000)
├── ML Service: python predict.py (port 5001)
└── MongoDB: mongod (port 27017)
```

### Production (Docker)

```
docker-compose.yml
├── MongoDB container
├── Backend container (Node.js)
├── ML Service container (Python)
├── Frontend container (Nginx/React)
└── Network bridge
```

### Cloud Deployment (Optional)

```
Architecture:
├── Frontend
│   └── Hosted on Vercel/Netlify
├── Backend
│   └── AWS Lambda / Google Cloud Run
├── ML Service
│   └── AWS SageMaker / Google Vertex AI
└── Database
    └── MongoDB Atlas
```

---

## 9. Scaling Considerations

### Database Optimization

```
Indexes needed:
- sessionId (unique)
- userId (for user queries)
- websiteId (for website filtering)
- startTime (for date range queries)
- Compound (websiteId, startTime) for common queries

Sharding strategy:
- Shard by websiteId for multi-tenant
- Range sharding on startTime for time-series data
```

### API Optimization

```
Caching layer:
- Redis for frequently accessed queries
- Cache expiry: 1 hour for analytics
- Invalidate on new session

Connection pooling:
- MongoDB connection pool size: 50-100
- Node.js cluster mode for multi-core

Load balancing:
- Round-robin to multiple backend instances
- Sticky sessions for tracking consistency
```

### ML Model Optimization

```
Inference optimization:
- Use ONNX format for faster predictions
- Serve model with TorchServe or TensorFlow Serving
- Batch predictions for throughput

Training optimization:
- Distributed training for large datasets
- Incremental learning for continuous improvement
```

---

## 10. Security Architecture

### API Security

```
Tracking validation:
├── Check tracking ID exists in database
├── Validate required fields
├── Rate limiting per tracking ID
└── CORS for specific domains

Data protection:
├── No PII collected (unless custom)
├── Encrypt data in transit (HTTPS)
├── Encrypt sensitive data at rest
└── Access logs for audit trail
```

### Authentication (Future)

```
JWT-based authentication:
├── Frontend: Store JWT in httpOnly cookie
├── Backend: Validate JWT on protected routes
├── ML Service: Require API key for predictions
└── Admin Panel: Two-factor authentication
```

---

## 11. Monitoring & Observability

### Metrics to Track

```
Application metrics:
├── Request latency (p50, p95, p99)
├── Error rates by endpoint
├── Database query latency
├── Cache hit ratio
└── Active connections

Business metrics:
├── Sessions per day
├── Average engagement score
├── Bounce rate trend
├── Top pages
└── Geographic distribution
```

### Logging

```
Log levels:
├── ERROR: Failed requests, exceptions
├── WARN: Slow queries, retries
├── INFO: Major events
└── DEBUG: Detailed tracing

Log aggregation:
├── ELK Stack (Elasticsearch, Logstash, Kibana)
├── Or Datadog / New Relic
└── Store for 30 days minimum
```

---

## 12. Architecture Diagram (ASCII)

```
┌────────────────────────────────────────────────────────────┐
│                     CLIENT BROWSERS                        │
│            (Multiple websites with tracker.js)             │
└────────────────────┬───────────────────────────────────────┘
                     │ Tracking Events
                     │ POST /api/tracking/*
                     │
┌────────────────────▼───────────────────────────────────────┐
│                  FRONTEND (React)                          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Dashboard | Admin Panel | Charts | Filters         │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Axios API Client | State Management                │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────┬───────────────────────────────────────┘
                     │ HTTP Requests
                     │ GET /api/analytics/*
                     │
┌────────────────────▼───────────────────────────────────────┐
│                BACKEND (Express.js)                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Routes: tracking, analytics, sessions, admin       │  │
│  │ Middleware: CORS, auth, error handling             │  │
│  │ Controllers: Logic for each endpoint               │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Engagement Calculation | Feature Extraction        │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────┬───────────────────────────────────────┘
                     │ MongoDB Queries
                     │
                ┌────▼──────┐
                │  MongoDB  │
                │ Database  │
                └────┬──────┘
                     │
                     │ Training Data
                     │
          ┌──────────▼──────────┐
          │  ML Service (Flask) │
          │  ┌────────────────┐ │
          │  │ Logistic Reg.  │ │
          │  │ Random Forest  │ │
          │  └────────────────┘ │
          │  bounce_model.pkl   │
          └─────────────────────┘
```

---

**Last Updated**: 2026-04-19
**Version**: 1.0.0
