"""
Bounce Prediction Model Training
Trains a Logistic Regression model to predict user bounce probability
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import pymongo
import json
from datetime import datetime, timedelta

# MongoDB connection
MONGO_URI = "mongodb://localhost:27017/behavior_insights"
client = pymongo.MongoClient(MONGO_URI)
db = client['behavior_insights']

class BouncePredictor:
    def __init__(self, model_type='logistic'):
        """
        Initialize the bounce prediction model
        model_type: 'logistic' or 'random_forest'
        """
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'duration',
            'scroll_depth',
            'clicks',
            'pages_visited'
        ]

    def fetch_training_data(self, days=30):
        """
        Fetch sessions from MongoDB for training
        """
        cutoff_date = datetime.now() - timedelta(days=days)

        sessions = list(db.sessions.find({
            'startTime': {'$gte': cutoff_date},
            'endTime': {'$exists': True}
        }))

        print(f"Fetched {len(sessions)} sessions for training")
        return sessions

    def prepare_features(self, sessions):
        """
        Prepare features from session data
        """
        features = []
        labels = []

        for session in sessions:
            try:
                # Extract features
                duration = session.get('duration', 0)
                scroll_depth = session.get('avgScrollDepth', 0)
                clicks = session.get('totalClicks', 0)
                pages_visited = len(session.get('pages', []))

                # Define bounce (low engagement + short session)
                engagement_score = session.get('engagementScore', 0)
                bounced = int(engagement_score < 3 and duration < 30)

                features.append([duration, scroll_depth, clicks, pages_visited])
                labels.append(bounced)
            except Exception as e:
                print(f"Error processing session: {e}")
                continue

        return np.array(features), np.array(labels)

    def train(self, features, labels):
        """
        Train the bounce prediction model
        """
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            features, labels, test_size=0.2, random_state=42
        )

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Train model
        if self.model_type == 'random_forest':
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
        else:  # logistic regression
            self.model = LogisticRegression(
                max_iter=1000,
                random_state=42
            )

        self.model.fit(X_train_scaled, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test_scaled)

        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1': f1_score(y_test, y_pred, zero_division=0),
            'samples_trained': len(X_train),
            'samples_tested': len(X_test)
        }

        return metrics

    def predict(self, features):
        """
        Predict bounce probability
        features: [duration, scroll_depth, clicks, pages_visited]
        """
        if self.model is None:
            raise Exception("Model not trained yet")

        # Scale features
        features_scaled = self.scaler.transform([features])
        probability = self.model.predict_proba(features_scaled)[0][1]

        return probability

    def save_model(self, filepath='models/bounce_model.pkl'):
        """
        Save model to disk
        """
        joblib.dump(self.model, filepath)
        joblib.dump(self.scaler, filepath.replace('.pkl', '_scaler.pkl'))
        print(f"✅ Model saved to {filepath}")

    def load_model(self, filepath='models/bounce_model.pkl'):
        """
        Load model from disk
        """
        self.model = joblib.load(filepath)
        self.scaler = joblib.load(filepath.replace('.pkl', '_scaler.pkl'))
        print(f"✅ Model loaded from {filepath}")

    def update_predictions(self):
        """
        Update bounce predictions for all sessions in database
        """
        sessions = list(db.sessions.find({'bounceProb': {'$exists': False}}))

        print(f"Updating {len(sessions)} sessions with predictions...")

        for session in sessions:
            try:
                features = [
                    session.get('duration', 0),
                    session.get('avgScrollDepth', 0),
                    session.get('totalClicks', 0),
                    len(session.get('pages', []))
                ]

                bounce_prob = self.predict(features)

                db.sessions.update_one(
                    {'_id': session['_id']},
                    {'$set': {'bounceProb': float(bounce_prob)}}
                )
            except Exception as e:
                print(f"Error updating session {session.get('sessionId')}: {e}")

        print("✅ Predictions updated")


def main():
    """
    Main training pipeline
    """
    print("🚀 Starting Bounce Prediction Model Training")

    # Initialize predictor
    predictor = BouncePredictor(model_type='logistic')

    # Fetch training data
    sessions = predictor.fetch_training_data(days=30)

    if len(sessions) < 10:
        print("⚠️ Not enough training data. Generating sample data...")
        # This would be handled by generate_sample_data.py
        return

    # Prepare features
    features, labels = predictor.prepare_features(sessions)

    print(f"Features shape: {features.shape}")
    print(f"Positive samples (bounced): {np.sum(labels)}")
    print(f"Negative samples (engaged): {len(labels) - np.sum(labels)}")

    # Train model
    print("\n📚 Training model...")
    metrics = predictor.train(features, labels)

    print("\n📊 Model Performance:")
    print(f"  Accuracy:  {metrics['accuracy']:.4f}")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall:    {metrics['recall']:.4f}")
    print(f"  F1-Score:  {metrics['f1']:.4f}")

    # Save model
    predictor.save_model()

    # Update predictions
    predictor.update_predictions()

    print("\n✅ Training complete!")

    return metrics


if __name__ == '__main__':
    main()
