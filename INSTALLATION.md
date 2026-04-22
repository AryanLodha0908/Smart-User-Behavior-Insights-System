# 🛠️ Installation Guide

Complete step-by-step setup instructions for the Smart User Behavior Insights System.

## Prerequisites

- **Docker & Docker Compose** (Recommended)
  - [Install Docker](https://docs.docker.com/get-docker/)
  - [Install Docker Compose](https://docs.docker.com/compose/install/)

OR

- **Manual Setup**:
  - Node.js 16+ and npm
  - Python 3.8+ and pip
  - MongoDB 5.0+

## Option 1: Docker Setup (Recommended) ⭐

### 1. Clone/Download Project

```bash
cd "Smart User Behavior Insights System"
```

### 2. Build and Start Services

```bash
# Build all services
docker-compose build

# Start all services in background
docker-compose up -d

# Verify all services are running
docker ps
```

Expected output:
```
CONTAINER ID  IMAGE                          PORTS
abc123       mongodb:latest                  27017->27017
def456       backend-image                   5000->5000
ghi789       ml-service-image                5001->5001
jkl012       frontend-image                  3000->3000
```

### 3. Verify Services

```bash
# Check backend API
curl http://localhost:5000/api/health

# Check ML service
curl http://localhost:5001/health

# Check MongoDB
mongosh mongodb://localhost:27017 -u root -p root
```

### 4. Access Applications

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:5001/health
- **MongoDB**: mongodb://localhost:27017

### 5. Generate Sample Data

```bash
# Enter backend container
docker-compose exec backend sh

# Install dependencies
npm install

# Exit container
exit

# Run sample data generator (from host)
docker-compose exec backend python ../data/generate_sample_data.py
```

### 6. Train ML Model

```bash
docker-compose exec ml-service python train_model.py
```

### 7. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

### 1. Install MongoDB

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu/Linux
sudo apt-get install -y mongodb-org

# Windows
# Download from https://www.mongodb.com/try/download/community

# Start MongoDB
mongod

# Create the MongoDB data directory
mkdir C:\data\db

# Start MongoDB with the correct path
mongod --dbpath "C:\data\db"
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings
# MONGODB_URI=mongodb://localhost:27017/behavior_insights
# PORT=5000

# Start backend
npm start
# or for development with auto-reload
npm run dev
```

Backend runs on: http://localhost:5000

### 3. Setup ML Service

```bash
cd ml

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Generate initial sample data
python sample_data.py

# Train model (Real Data)
python train_model.py

# Start ML service # 
python predict.py
```

ML Service runs on: http://localhost:5001

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on: http://localhost:3000

---

## Configuration

### Backend (.env)

```env
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/behavior_insights

# Server configuration
PORT=5000
NODE_ENV=development

# ML Service URL
ML_SERVICE_URL=http://localhost:5001
```

### Frontend

Environment variables in `frontend/src/` (auto-detected from proxy in package.json):
```json
"proxy": "http://localhost:5000"
```

### ML Service

Uses MongoDB URI from environment. Set:
```bash
export MONGODB_URI=mongodb://localhost:27017/behavior_insights
```

---

## Generate Sample Data

The system includes a script to generate realistic sample data:

```bash
# Using Docker
docker-compose exec backend python ../data/generate_sample_data.py

# Or manually
cd data
python generate_sample_data.py
```

This creates:
- 150 sample sessions
- 3 test websites
- Various engagement patterns
- CSV export

---

## Train ML Model

### Initial Training

```bash
cd ml

# Train model (requires sample data)
python train_model.py

# Output shows:
# - Training accuracy
# - Precision, recall, F1 scores
# - Model saved to models/bounce_model.pkl
```

### Automatic Retraining

The model can be retrained via API:

```bash
# Using curl
curl -X POST http://localhost:5001/retrain

# Using Python
import requests
response = requests.post('http://localhost:5001/retrain')
print(response.json())
```

---

## Verify Installation

### 1. Test Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Should return:
# {"status":"healthy","timestamp":"2026-04-19T..."}
```

### 2. Test ML Service

```bash
# Prediction
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 120,
    "scroll_depth": 75,
    "clicks": 5,
    "pages_visited": 3
  }'

# Should return:
# {"bounce_probability": 0.12, "prediction": "engaged", ...}
```

### 3. Check MongoDB

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017

# List databases
show dbs

# Use behavior_insights database
use behavior_insights

# Count sessions
db.sessions.countDocuments()
```

### 4. Access Dashboard

Visit http://localhost:3000 and verify:
- Dashboard loads without errors
- Statistics cards display data
- Charts render properly
- Navigation works

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5000    # Backend
lsof -i :5001    # ML Service
lsof -i :3000    # Frontend
lsof -i :27017   # MongoDB

# Kill process (replace PID)
kill -9 <PID>
```

### MongoDB Connection Error

```bash
# Check MongoDB is running
ps aux | grep mongod

# Check connection string
mongosh mongodb://localhost:27017

# If auth fails, check credentials
mongosh "mongodb://root:root@localhost:27017"
```

### Docker Container Not Starting

```bash
# Check logs
docker logs <container_name>

# Rebuild container
docker-compose build --no-cache

# Start with verbose output
docker-compose up (without -d)
```

### ML Model Not Found

```bash
# Retrain model
docker-compose exec ml python train_model.py

# Or manually:
cd ml
python train_model.py
```

### Port Conflicts in Docker

Edit `docker-compose.yml`:
```yaml
backend:
  ports:
    - "5002:5000"  # Map to different host port
```

Then update frontend proxy or API URL accordingly.

---

## Development Workflow

### 1. Start Services

```bash
docker-compose up -d
```

### 2. Make Code Changes

- Frontend: Changes auto-reload via React dev server
- Backend: Restart container after changes
  ```bash
  docker-compose restart backend
  ```
- ML: Restart container after changes
  ```bash
  docker-compose restart ml-service
  ```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### 4. Access Container Shell

```bash
# Backend
docker-compose exec backend sh

# ML
docker-compose exec ml-service bash
```

---

---

## Deployment to Vercel

### Prerequisites
- MongoDB Atlas account (free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- Vercel account
- GitHub account with your project repository

### Step 1: Set Up MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new project and cluster (free tier)
3. Create a database user with credentials
4. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connection string"
   - Copy the string: `mongodb+srv://username:password@cluster.mongodb.net/behavior_insights?retryWrites=true&w=majority`

### Step 2: Deploy Backend to Vercel

1. Push your backend to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Select your repository
4. Configure project:
   - **Framework Preset**: Node.js
   - **Root Directory**: `backend`
5. Add environment variables:
   - Click "Environment Variables"
   - Add:
     - **Key**: `MONGODB_URI`
     - **Value**: Your MongoDB Atlas connection string
6. Click "Deploy"

### Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → Select your repository
3. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
4. Update API endpoint in frontend:
   - Edit `frontend/src/api.js` or where API calls are made
   - Change API URL from `http://localhost:5000` to your Vercel backend URL
5. Click "Deploy"

### Step 4: Verify Deployment

Test backend health:
```bash
curl https://your-backend.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "state": "connected"
  }
}
```

### ⚠️ Important: MongoDB Atlas IP Whitelist

Your MongoDB Atlas cluster needs to allow Vercel IPs:
1. Go to MongoDB Atlas console
2. Navigate to **Security → Network Access**
3. Add IP whitelist entry: `0.0.0.0/0` (allows all IPs)
   - ⚠️ Note: This is for testing. For production, use Vercel's IP range or VPC peering

### Troubleshooting Vercel Deployment

**500 Errors on API endpoints?**
- Check if `MONGODB_URI` environment variable is set in Vercel
- Verify MongoDB Atlas connection string is correct
- Check Vercel deployment logs for connection errors
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**Frontend can't reach backend?**
- Update API URL in frontend to match your Vercel backend deployment
- Ensure CORS is enabled on backend (it is by default)

**View deployment logs:**
```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs <deployment-url>
```

---

## Next Steps

1. **Generate Sample Data**: Create realistic test data
2. **Train Model**: Build bounce prediction model
3. **Integrate Tracking**: Add tracking script to websites
4. **View Dashboard**: Explore analytics on frontend
5. **Test APIs**: Use provided curl examples
6. **Deploy**: Follow Vercel deployment instructions above

---

## Performance Tips

- Use Docker for production deployment
- Configure MongoDB with authentication
- Set up proper indexing for large datasets
- Implement caching for analytics queries
- Use load balancing for scaling
- Enable MongoDB backups in Atlas

---

## Support

For issues:
1. Check service logs: `docker logs <container>` (local) or Vercel logs (cloud)
2. Verify all ports are free
3. Ensure MongoDB is running or Atlas is connected
4. Check environment variables
5. Review API documentation
6. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for 500 error fixes

---

**Last Updated**: 2026-04-22
**Version**: 1.1.0
