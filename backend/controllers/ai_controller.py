# controllers/ai_controller.py
from flask import Blueprint, jsonify, request
from services.ai_services import predict_temp, detect_anomaly_from_recent, analyze_symptoms
from config.db_config import db
import datetime
from bson.json_util import dumps

ai_bp = Blueprint('ai_bp', __name__)

# Simple GET predict endpoint: uses latest N readings to predict next temp
@ai_bp.route('/api/predict', methods=['GET'])
def predict():
    try:
        # optional query param: window (how many past records to use)
        window = int(request.args.get('window', 10))
        prediction = predict_temp(window=window)
        return jsonify({"predicted_temperature": prediction}), 200
    except Exception as e:
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500


# Check for anomalies in recent window and return list of flagged records
@ai_bp.route('/api/anomaly_check', methods=['GET'])
def anomaly_check():
    try:
        window = int(request.args.get('window', 50))
        threshold = float(request.args.get('z_threshold', 2.5))  # default z-score threshold
        anomalies = detect_anomaly_from_recent(window=window, z_threshold=threshold)
        return dumps(anomalies), 200
    except Exception as e:
        return jsonify({"error": "Anomaly check failed", "details": str(e)}), 500


# POST endpoint for AI prediction based on symptoms
@ai_bp.route('/api/ai/predict', methods=['POST'])
def ai_predict():
    try:
        data = request.get_json()
        result = analyze_symptoms(
            temperature=data.get('temperature'),
            age=data.get('age'),
            days_since_onset=data.get('days_since_onset'),
            symptoms=data.get('symptoms', [])
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": "AI prediction failed", "details": str(e)}), 500


# Optional: endpoint to get aggregated stats (min/max/avg)
@ai_bp.route('/api/stats', methods=['GET'])
def stats():
    try:
        pipeline = [
            {"$group": {
                "_id": None,
                "minTemp": {"$min": "$temperature"},
                "maxTemp": {"$max": "$temperature"},
                "avgTemp": {"$avg": "$temperature"},
                "count": {"$sum": 1}
            }}
        ]
        agg = list(db.sensor_data.aggregate(pipeline))
        return dumps(agg[0] if agg else {}), 200
    except Exception as e:
        return jsonify({"error": "Failed to compute stats", "details": str(e)}), 500
