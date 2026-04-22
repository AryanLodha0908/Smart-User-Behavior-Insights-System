const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve tracking script
app.use(express.static(path.join(__dirname, '../tracking-script'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'max-age=3600'); // Cache for 1 hour
    }
  }
}));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI environment variable is not set!');
}
console.log('🔄 Attempting to connect to MongoDB...');
console.log('📍 Connection String:', mongoUri ? mongoUri.substring(0, 50) + '...' : 'NOT SET');

mongoose.connect(mongoUri || 'mongodb://localhost:27017/behavior_insights', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log('📊 Database:', mongoose.connection.db?.databaseName);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('❌ Full Error:', err);
});

// Routes
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/admin', require('./routes/admin'));

// Health Check
app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: mongoState === 1 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    database: {
      connected: mongoState === 1,
      state: states[mongoState],
      connectionString: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      name: mongoose.connection.db?.databaseName || 'N/A'
    }
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
