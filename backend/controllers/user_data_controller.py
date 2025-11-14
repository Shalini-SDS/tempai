# controllers/user_data_controller.py
from flask import Blueprint, request, jsonify
from models.user_model import User
from controllers.auth_controller import token_required
from bson.json_util import dumps
import datetime

user_data_bp = Blueprint('user_data_bp', __name__)

# Default data for new users or when no data exists
DEFAULT_TIMELINE = [
    { "time": "Today • 11:27 PM", "temperature": "38.5°C", "summary": "High fever with headache and fatigue." },
    { "time": "Yesterday • 08:10 PM", "temperature": "38.1°C", "summary": "Moderate fever with fatigue." },
    { "time": "Apr 28 • 09:15 PM", "temperature": "37.2°C", "summary": "Temperature stabilised, symptoms light." },
]

DEFAULT_INSIGHTS_HISTORY = [
    { "title": "Recovery Phase", "detail": "Temperature held steady for 24h. Continue rest." },
    { "title": "Hydration Reminder", "detail": "Water intake below recommended. Increase fluid consumption." },
    { "title": "Medication Log", "detail": "Paracetamol taken twice today. Maintain dosage intervals." },
]

DEFAULT_HISTORY_RECORDS = [
    { "date": "Feb 13, 2025", "cause": "Viral", "severity": "Moderate", "outcome": "Recovered in 4 days" },
    { "date": "Oct 02, 2024", "cause": "Seasonal Flu", "severity": "Mild", "outcome": "Recovered in 3 days" },
    { "date": "Jul 19, 2024", "cause": "Bacterial", "severity": "Critical", "outcome": "Hospitalised, recovered" },
]

@user_data_bp.route('/api/user/timeline', methods=['GET'])
@token_required
def get_user_timeline(current_user_id):
    """Get user's health timeline"""
    try:
        # For now, return default data. In a real app, this would be stored in user document
        # You could extend the user model to store timeline data
        return jsonify(DEFAULT_TIMELINE), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch timeline", "details": str(e)}), 500

@user_data_bp.route('/api/user/insights-history', methods=['GET'])
@token_required
def get_user_insights_history(current_user_id):
    """Get user's insights history"""
    try:
        # For now, return default data. In a real app, this would be stored in user document
        return jsonify(DEFAULT_INSIGHTS_HISTORY), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch insights history", "details": str(e)}), 500

@user_data_bp.route('/api/user/history-records', methods=['GET'])
@token_required
def get_user_history_records(current_user_id):
    """Get user's fever episode history"""
    try:
        # For now, return default data. In a real app, this would be stored in user document
        return jsonify(DEFAULT_HISTORY_RECORDS), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch history records", "details": str(e)}), 500

@user_data_bp.route('/api/user/health-summary', methods=['GET'])
@token_required
def get_user_health_summary(current_user_id):
    """Get user's health summary data"""
    try:
        user = User.get_user_by_id(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get latest readings from sensor data (could be filtered by user if needed)
        from config.db_config import db
        latest_reading = db.sensor_data.find().sort("timestamp", -1).limit(1)
        readings = list(latest_reading)

        summary = {
            "user_name": user.get('name', ''),
            "latest_temperature": readings[0]['temperature'] if readings else None,
            "total_readings": len(user.get('readings', [])),
            "last_updated": readings[0]['timestamp'].isoformat() if readings else None
        }

        return jsonify(summary), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch health summary", "details": str(e)}), 500