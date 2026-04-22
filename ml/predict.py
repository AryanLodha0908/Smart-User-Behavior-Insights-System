"""
Bounce Prediction API Service
Provides API endpoint for real-time bounce probability predictions
"""

from flask import Flask, request, jsonify
from train_model import BouncePredictor
import os
from datetime import datetime

app = Flask(__name__)

# Initialize model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models/bounce_model.pkl')
predictor = BouncePredictor()

# Load model if exists
if os.path.exists(MODEL_PATH):
    predictor.load_model(MODEL_PATH)
    print("✅ Loaded pre-trained model")
else:
    print("⚠️ Pre-trained model not found. Train model first with: python train_model.py")


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': predictor.model is not None,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict bounce probability
    Expected JSON:
    {
        "duration": 45,
        "scroll_depth": 65,
        "clicks": 3,
        "pages_visited": 2
    }
    """
    try:
        data = request.json

        # Validate input
        required_fields = ['duration', 'scroll_depth', 'clicks', 'pages_visited']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Extract features
        features = [
            data['duration'],
            data['scroll_depth'],
            data['clicks'],
            data['pages_visited']
        ]

        # Make prediction
        bounce_prob = predictor.predict(features)

        return jsonify({
            'bounce_probability': float(bounce_prob),
            'prediction': 'likely_to_bounce' if bounce_prob > 0.6 else 'engaged',
            'confidence': float(max(bounce_prob, 1 - bounce_prob))
        })

    except Exception as err:
        return jsonify({'error': str(err)}), 500


@app.route('/retrain', methods=['POST'])
def retrain():
    """
    Retrain the model with new data from MongoDB
    """
    try:
        from train_model import main
        metrics = main()

        return jsonify({
            'message': 'Model retrained successfully',
            'metrics': metrics,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as err:
        return jsonify({'error': str(err)}), 500


@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """
    Predict bounce probability for multiple users
    Expected JSON:
    [
        {"duration": 45, "scroll_depth": 65, "clicks": 3, "pages_visited": 2},
        ...
    ]
    """
    try:
        data = request.json

        if not isinstance(data, list):
            return jsonify({'error': 'Expected array of predictions'}), 400

        predictions = []
        for item in data:
            features = [
                item.get('duration', 0),
                item.get('scroll_depth', 0),
                item.get('clicks', 0),
                item.get('pages_visited', 0)
            ]

            bounce_prob = predictor.predict(features)
            predictions.append({
                'bounce_probability': float(bounce_prob),
                'prediction': 'likely_to_bounce' if bounce_prob > 0.6 else 'engaged'
            })

        return jsonify({'predictions': predictions})

    except Exception as err:
        return jsonify({'error': str(err)}), 500


@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the current model"""
    return jsonify({
        'model_type': predictor.model_type,
        'features': predictor.feature_names,
        'model_loaded': predictor.model is not None,
        'scaler_loaded': predictor.scaler is not None
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
